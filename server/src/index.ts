/**
 * Reverie: The Game — the city Worker.
 *
 * One Durable Object (`ReverieWorld`) owns the whole shared sim: it restores
 * the checkpointed world, accepts cookie-bound WebSocket sessions, applies
 * every client message through `applyAction`, steps the world in fixed 20 Hz
 * ticks from an alarm, checkpoints before it broadcasts, and sends every
 * viewer their own `snapshotFor` view. The client never computes a number.
 */
import { emptyWorld, rebindBody, say, spawnGuest, tickWorld } from "../../src/sim/world.ts";
import { migratePlayer, migrateWorld, SHAPE } from "../../src/sim/migrate.ts";
import { DT } from "../../src/sim/constants.ts";
import { applyAction, applyLink, applyWallet, unsealBody } from "../../src/sim/actions.ts";
import { LINES } from "../../src/sim/content/index.ts";
import { CHALLENGE_TTL_MS, challengeMessage, isAddress, normalizeAddress, recoverAddress } from "./wallet.ts";
import { serialFor, type HolderCache } from "./holders.ts";
import { logEventsFor, PUBLIC_LOG_KINDS } from "./log.ts";
import { LogSink } from "./logSink.ts";
import { LoadMeter } from "./load.ts";
import { framesFor, snapshotFor, stepViews } from "../../src/sim/snapshot.ts";
import { encodeFast, SlowTracker } from "../../src/sim/frames.ts";
import { isClientMsg, PROTOCOL_VERSION, SLOW_EVERY_TICKS } from "../../src/sim/protocol.ts";
import type { Hello } from "../../src/sim/protocol.ts";
import type { Intent, Player, WorldState } from "../../src/sim/types.ts";
import { SimulationClock, STEP_MS } from "./clock";

type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  WORLD: DurableObjectNamespace;
  MOCK_LINK?: string; // "1" accepts the test link (serial + mock signature); unset or "0" refuses it
  ANGEL_HOLDERS?: string; // JSON { "0xaddress": serial }: test serials, and the only source until the contract exists
  ANGEL_CONTRACT?: string; // the ERC-721's address; with the RPC below, /wallet/link reads ownership from the chain
  ANGEL_RPC_URL?: string; // a JSON-RPC endpoint the Worker may call (eth_call only; never a transaction)
  ANGEL_TOKEN_OFFSET?: string; // serial = tokenId + offset
  LOG?: D1Database; // the writeback log; absent, nothing is written
};

// workerd accepts only functions and handlers as named exports of the entry module, so these stay module-private.
const SESSION_COOKIE = "reverie_session";
const WORLD_KEY = "world:v2";
const PLAYER_PREFIX = "player:v2:";
/** `serial:v2:<serial>` → the session token whose body holds that Angel: the newest body checkpointed with it, so the newest proven link. */
const SERIAL_PREFIX = "serial:v2:";
const serialKey = (serial: number): string => `${SERIAL_PREFIX}${serial}`;
const WORLD_NAME = "city-v2";
const MAX_MESSAGE = 4096;
const CHALLENGE_PREFIX = "challenge:v1:";
const INTENT_TTL_MS = 1000;
/** Beside every saved body, when it was last saved: `seen:v2:<token>` → wall clock ms. */
const SEEN_PREFIX = "seen:v2:";
/** A saved guest body that bound no wallet and was not seen this long is swept; an Angel's body and a bound wallet's are kept for good. */
const SAVED_TTL_MS = 30 * 24 * 3_600_000;
/** The sweep reads one page of saved bodies at most this often, after the next step is armed, so it never weighs on a step. */
const SWEEP_EVERY_MS = 3_600_000;
/**
 * While pages are deleting stale guests the sweep reads the next page this soon, not an hour on: at 64 bodies a page it
 * clears faster than the city's join budget can mint sessions (CITY_JOINS_PER_SECOND), so a loop of sessions cannot
 * outgrow it. A page that deletes nothing puts the sweep back on the hour.
 */
const SWEEP_BUSY_MS = 2_000;
const SWEEP_PAGE = 64; // bodies per page: with their stamps, 128 keys per delete at most
/** The sweep's clock and cursor outlive the instance: `sweep:v2` → { at, after? }. A new city waits an hour before its first. */
const SWEEP_KEY = "sweep:v2";
/**
 * Joins are budgeted: each costs a checkpoint, a forced broadcast to every
 * viewer and a hello, and a session cookie is minted for free, so a bucket
 * per socket alone would be bypassed by reconnecting. A bucket per address
 * (CF-Connecting-IP; "local" without it) is drawn first, so one script
 * starves only itself; then the city's own bucket, the backstop on what the
 * object computes for joins in all. Past either the upgrade is refused with
 * 429 and counted. Address buckets that are full again are forgotten once
 * the map is past JOIN_ADDRESSES_MAX.
 */
/**
 * The key an address's join bucket is drawn under: an IPv4 address as it is; an IPv6 address by its /64, the block one
 * host is handed, so a host rotating through its own block draws one bucket and starves only itself.
 */
export function joinKey(address: string): string {
  if (!address.includes(":")) return address;
  const [head, tail] = address.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail === undefined ? [] : tail ? tail.split(":") : [];
  const groups = tail === undefined ? left : [...left, ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  return `${groups.slice(0, 4).map(g => g.replace(/^0+(?=.)/, "") || "0").join(":")}::/64`;
}
/**
 * The wallet routes are budgeted like a socket's messages: a bucket per session token, drawn before any storage work,
 * small because a holder links once (a challenge, a signature, a link); past it the request is refused with 429.
 */
const WALLET_BURST = 6;
const WALLET_PER_SECOND = 0.5;
const JOINS_PER_SECOND = 10;
const JOIN_BURST = 30;
const CITY_JOINS_PER_SECOND = 30;
const CITY_JOIN_BURST = 60;
const JOIN_ADDRESSES_MAX = 1024;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** A body's id rides every frame for every viewer in range: twelve hex characters (2.8e14) instead of a 36-character uuid. Saved bodies keep the id they were given. */
const bodyId = (): string => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

export function sessionToken(req: Request): string | null {
  const value = req.headers.get("Cookie")?.split(";").map(s => s.trim())
    .find(s => s.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return value && uuid.test(value) ? value : null;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (!origin) return false;
  const url = new URL(req.url);
  if (origin === url.origin) return true;
  // Vite's local reverse proxy runs on a different port from the local Worker.
  return url.hostname === "127.0.0.1" && origin === "http://127.0.0.1:5175";
}

/** The checkpointed form of the world: Maps become arrays, intents are never saved, the shape is stamped. */
export type SavedWorld = Omit<WorldState, "players" | "intents"> & { players: [string, Player][]; shape: number };

export function serializeWorld(w: WorldState): SavedWorld {
  const { players, intents: _intents, ...rest } = w;
  return { ...rest, players: [...players], shape: SHAPE };
}

/**
 * The world as the object checkpoints it: without the bodies. Each live body
 * has its own record (`player:v2:<token>`), written only when it changed, and
 * the constructor restores the bodies of hibernated sockets from those, so the
 * world record stays the size of the city and not of its population. A world
 * saved before this (bodies embedded) still restores: see the constructor.
 */
export function serializeCity(w: WorldState): SavedWorld {
  return serializeWorld({ ...w, players: new Map() });
}

/**
 * A checkpoint from any earlier build restores through the shape migration:
 * level and content collections come from the current defaults with the saved
 * progress merged back, players are normalized, transient state is dropped.
 */
export function restoreWorld(saved: unknown): WorldState {
  return migrateWorld(saved);
}

type Session = { id: string; token: string };
const idle: Intent = { up: false, down: false, left: false, right: false };
const playerKey = (token: string) => `${PLAYER_PREFIX}${token}`;
const seenKey = (token: string) => `${SEEN_PREFIX}${token}`;

/**
 * What one socket may send: a token bucket, `MESSAGE_BURST` deep, refilled
 * at `MESSAGES_PER_SECOND`. A client's honest rate is an intent on every
 * key change and a strike or two a second; anything past the bucket is a
 * flood, dropped unread and counted on `/world`. And an action's checkpoint
 * and forced broadcast, the dear part of a message, happen at most once per
 * `ACTION_BROADCAST_MIN_MS` for the object: a second action inside that
 * window of the last one's rides the next alarm, which checkpoints first
 * and broadcasts forced, so nothing is lost and nothing is later than a
 * step. A join's or a close's broadcast opens no window: the first action
 * after either is immediate.
 */
const MESSAGES_PER_SECOND = 60;
const MESSAGE_BURST = 120;
const ACTION_BROADCAST_MIN_MS = 20;
type Budget = { tokens: number; at: number };
/** Refill `budget` to `now` at `rate` a second, up to `burst`, and take one token; false when it has none. */
function draw(budget: Budget, burst: number, rate: number, now: number): boolean {
  budget.tokens = Math.min(burst, budget.tokens + Math.max(0, now - budget.at) / 1000 * rate);
  budget.at = now;
  if (budget.tokens < 1) return false;
  budget.tokens -= 1;
  return true;
}

/** A WebSocket as this object uses it; narrow so tests can hand in doubles. */
type Socket = Pick<WebSocket, "send" | "close" | "serializeAttachment" | "deserializeAttachment">;

export class ReverieWorld {
  private w: WorldState;
  private sessions = new Map<Socket, Session>();
  private checkpointAt = 0;
  private intentAt = new Map<string, number>();
  private ticking = false;
  private clock = new SimulationClock();
  private readonly sink = new LogSink();
  private readonly load = new LoadMeter();
  private readonly slow = new SlowTracker(); // per viewer, which slow sections they already hold
  private alarmDue = 0; // when the pending alarm was asked for, to read its lateness
  private logged: WorldState; // the world as of the last log diff
  private readonly budgets = new Map<Socket, Budget>(); // what each socket may still send
  private readonly joins = new Map<string, Budget>(); // what each address may still join
  private readonly cityJoins: Budget = { tokens: CITY_JOIN_BURST, at: 0 }; // what the object still admits in joins from everyone
  private pending = false; // an action since the last broadcast: the next alarm checkpoints first, then broadcasts forced
  private actionAt = -Infinity; // wall clock of the last broadcast an action forced (a join's or a close's does not count)
  private readonly stamped = new Set<string>(); // tokens whose seen stamp this instance wrote; the close writes it again
  private readonly saved = new Map<string, Player>(); // by body id, the object last written to its record: the same one needs no write
  private readonly wallets = new Map<string, Budget>(); // the wallet routes' bucket per session token
  private readonly serialOwners = new Map<number, string>(); // serial → the token the index names, as this instance last wrote or read it
  private sweptAt = 0; // wall clock of the last sweep of saved bodies (from storage; a new city waits an hour)
  private sweepEvery = SWEEP_EVERY_MS; // the hour, or SWEEP_BUSY_MS while pages are deleting
  private sweepAfter: string | undefined; // the sweep's cursor: the last saved-body key it read; undefined starts over

  constructor(private readonly ctx: DurableObjectState, private readonly env: Env) {
    this.w = emptyWorld();
    this.logged = this.w;
    this.ctx.blockConcurrencyWhile(async () => {
      // One read for the world, the sweep's clock and every hibernated socket's body record. A body comes from its
      // record, through the shape migration like anything saved; a world saved before the records stood alone still
      // carries its bodies, so that is the fallback.
      const sockets = this.ctx.getWebSockets().map(ws => [ws, ws.deserializeAttachment() as Session | null] as const);
      const keys = sockets.flatMap(([, s]) => (s?.token ? [playerKey(s.token)] : []));
      const stored = await this.ctx.storage.get<unknown>([WORLD_KEY, SWEEP_KEY, ...keys]);
      this.w = restoreWorld(stored.get(WORLD_KEY));
      this.logged = this.w;
      const sweep = stored.get(SWEEP_KEY) as { at: number; after?: string } | undefined;
      this.sweptAt = sweep?.at ?? Date.now();
      this.sweepAfter = sweep?.after;
      const players = new Map<string, Player>();
      const intents = new Map(this.w.intents);
      for (const [ws, session] of sockets) {
        const key = session?.token ? playerKey(session.token) : "";
        const record = key ? stored.get(key) : undefined;
        const body = record !== undefined ? migratePlayer(record, session!.id, this.w.now) : session ? this.w.players.get(session.id) : undefined;
        if (!session?.token || !body) {
          ws.close(1012, "Reconnect to restore your place");
          continue;
        }
        players.set(body.id, body);
        // A body from its record is as its record has it (the migration is the same on every read); one from the old
        // world's embedding has no record yet, so the next checkpoint writes it.
        if (record !== undefined) this.saved.set(body.id, body);
        this.sessions.set(ws, { id: body.id, token: session.token });
        intents.set(body.id, { ...idle });
      }
      this.w = { ...this.w, players, intents };
      this.checkpointAt = this.w.now;
      if (players.size) await this.ensureTick();
    });
  }

  private async checkpoint(extra: Record<string, unknown> = {}) {
    const records: Record<string, unknown> = { [WORLD_KEY]: serializeCity(this.w), ...extra };
    const seen = Date.now();
    const written: [string, Player][] = [];
    const stamping: string[] = [];
    const claimed: [number, string][] = [];
    for (const session of this.sessions.values()) {
      const player = this.w.players.get(session.id);
      if (!player) continue;
      // One body per Angel: a live body with a serial holds it (a link elsewhere is refused while it walks), so it is the index's.
      if (!player.guest && player.serial !== null && this.serialOwners.get(player.serial) !== session.token) {
        records[serialKey(player.serial)] = session.token;
        claimed.push([player.serial, session.token]);
      }
      if (this.saved.get(session.id) !== player) { // the sim replaces a body's object when it changes: the same one stands
        records[playerKey(session.token)] = player;
        written.push([session.id, player]);
      }
      if (!this.stamped.has(session.token)) { // the stamp needs no better than the session: once here, again at the close
        records[seenKey(session.token)] = seen;
        stamping.push(session.token);
      }
    }
    const began = Date.now();
    await this.ctx.storage.put(records);
    // Only a write that landed counts: a put that threw leaves every body owed to the next checkpoint.
    for (const [id, player] of written) this.saved.set(id, player);
    for (const token of stamping) this.stamped.add(token);
    for (const [serial, token] of claimed) this.serialOwners.set(serial, token);
    this.load.checkpointed(Date.now() - began, Date.now());
    this.checkpointAt = this.w.now;
    // The log reads the difference since the last checkpoint, never per tick; a flush never holds the tick.
    const events = logEventsFor(this.logged, this.w, Date.now());
    this.logged = this.w;
    if (events.length) {
      this.sink.push(events);
      if (this.env?.LOG) this.ctx.waitUntil(this.sink.flush(this.env.LOG));
    }
  }

  /** The test link is a development convenience: on only when the environment says so. */
  private get mockLink(): boolean {
    return (this.env?.MOCK_LINK ?? "0") === "1";
  }

  /** Chain answers remembered per address for a few minutes, for the life of this object. */
  private readonly holders: HolderCache = new Map();

  /**
   * Wallet login, disarmed. POST /wallet/challenge { address } issues a
   * nonce to this session, bound to that address and to this city's domain
   * in the message (EIP-4361 shape); POST /wallet/link { address, signature }
   * rebuilds the message from the stored challenge and the request's own
   * origin, recovers the signer, requires it to be the address the
   * challenge was issued for, and seals the live body with the serial the
   * holders map assigns (or, with a contract configured, the one the chain
   * says it holds), or binds the address to the guest when it holds no
   * Angel. When the chain cannot be read the link is refused with 503 and
   * nothing changes. The nonce is spent on first use and expires on its own.
   */
  private async wallet(req: Request, path: string): Promise<Response> {
    const headers = { "Cache-Control": "no-store" };
    const refuse = (status: number, reason: string) => Response.json({ ok: false, reason }, { status, headers });
    if (req.method !== "POST") return refuse(405, "post-required");
    if (!sameOrigin(req)) return refuse(403, "same-origin");
    const token = sessionToken(req);
    const live = token ? [...this.sessions.values()].find(s => s.token === token) : undefined;
    if (!token || !live || !this.w.players.has(live.id)) return refuse(409, "no-session");
    // A request past the session's wallet budget does no storage work at all (the player-defect sweep, round four).
    let budget = this.wallets.get(token);
    if (!budget) {
      budget = { tokens: WALLET_BURST, at: Date.now() };
      this.wallets.set(token, budget);
    }
    if (!draw(budget, WALLET_BURST, WALLET_PER_SECOND, Date.now())) {
      this.load.dropped();
      return Response.json({ ok: false, reason: "too-many" }, { status: 429, headers: { ...headers, "Retry-After": "2" } });
    }
    const key = `${CHALLENGE_PREFIX}${token}`;
    let body: { address?: unknown; signature?: unknown } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return refuse(400, "bad-json");
    }
    if (!isAddress(body.address)) return refuse(400, "bad-address");
    const address = normalizeAddress(body.address);
    const url = new URL(req.url);
    const bind = { domain: url.host, uri: url.origin, address };
    if (path === "/wallet/challenge") {
      const nonce = crypto.randomUUID();
      const at = Date.now();
      await this.ctx.storage.put({ [key]: { nonce, at, address } });
      return Response.json({ ok: true, message: challengeMessage(nonce, at, bind) }, { headers });
    }
    const challenge = await this.ctx.storage.get<{ nonce: string; at: number; address?: string }>(key);
    await this.ctx.storage.delete(key);
    if (!challenge || Date.now() - challenge.at > CHALLENGE_TTL_MS) return refuse(409, "no-challenge");
    // The signature must be over the challenge issued for this very address: a nonce asked for one address seals no other.
    if (challenge.address !== address) return refuse(403, "bad-signature");
    const signer = recoverAddress(challengeMessage(challenge.nonce, challenge.at, bind), body.signature);
    if (!signer || signer !== address) return refuse(403, "bad-signature");
    const serial = await serialFor(address, this.env ?? {}, (input, init) => fetch(input, init), Date.now(), this.holders);
    if (serial === undefined) return refuse(503, "chain");
    // Wallet is login (PROMPT.md §0): the Angel this wallet sealed, saved under a session no longer at hand (another
    // device, cleared cookies, a cookie past its month), comes back into this session rather than a new body taking the seal.
    // Only a body never sealed gives way: one that was an Angel keeps its own progress and is resealed as before.
    const fresh = this.w.players.get(live.id);
    const kept = serial === null || !fresh?.guest || fresh.history.houses.length > 0 ? null : await this.sealedElsewhere(serial, address, token);
    if (!this.w.players.has(live.id)) return refuse(409, "no-session"); // the body left while the chain answered
    // The restore is taken before the world steps: a step replaces a changing body's object (a guest's restraint still
    // filling, for one), and the restore must not wait on a body standing still. Only storage reads, under the input
    // gate, came between reading `fresh` and here, so the guard holds the body as the request found it.
    const restored = !!kept && this.w.players.get(live.id) === fresh;
    if (kept && restored) {
      const record = migratePlayer(kept.record, live.id, this.w.now);
      const back = { ...record, id: live.id }; // the session's body id, not the record's
      this.withBody(live.id, say({ ...back, dialogue: null }, LINES.LINK_COPY(back.serial ?? serial!, back.house, back.messenger), this.w.now));
      // what the city holds of the Angel under its old id (its listings, its keeps, its wreckage) follows it to this one
      this.w = rebindBody(this.w, record.id, live.id);
      this.slow.forget(live.id); // the whole record changed under the session: its next frame is a full one
    }
    this.advanceWorld(Date.now());
    this.w = serial === null
      ? applyWallet(this.w, live.id, address, LINES.LINK_NO_ANGEL)
      : applyLink(applyWallet(this.w, live.id, address), live.id, serial, { kind: "wallet", address });
    // As for a socket's action: checkpointed before its frame is sent, and inside ACTION_BROADCAST_MIN_MS of the last
    // action the checkpoint and the forced broadcast ride the next alarm. A restored Angel is written at once, and its
    // old record is deleted only after the new one landed (the serial's index moves with the checkpoint).
    this.pending = true;
    const now = Date.now();
    if (restored || now - this.actionAt >= ACTION_BROADCAST_MIN_MS) {
      this.actionAt = now;
      await this.checkpoint();
      this.broadcast(true);
    }
    // Only a record that came back is deleted: one the restore passed over stays, and returns unsealed under its own cookie.
    if (kept && restored) await this.ctx.storage.delete([playerKey(kept.token), seenKey(kept.token), `${CHALLENGE_PREFIX}${kept.token}`]);
    const me = this.w.players.get(live.id);
    // a holder whose Angel already walks in another body is told that, not that the wallet holds none
    const walking = serial !== null && !!me && me.guest;
    return Response.json({ ok: true, address, serial: me && !me.guest ? me.serial : null, ...(walking ? { walking: true } : {}) }, { headers });
  }

  /**
   * The saved record of the Angel `serial`, sealed to `address`, when the serial's index names a session other than
   * `token` that has no socket here: the body a wallet link restores. Null when the serial's body is this session's,
   * walks now, was relinked to another wallet (a sold Angel: the buyer never inherits the seller's body), or is not saved.
   */
  private async sealedElsewhere(serial: number, address: string, token: string): Promise<{ token: string; record: unknown } | null> {
    const owner = this.serialOwners.get(serial) ?? (await this.ctx.storage.get<string>(serialKey(serial)));
    if (owner === undefined || owner === token) return null;
    this.serialOwners.set(serial, owner);
    if ([...this.sessions.values()].some(s => s.token === owner)) return null;
    if ([...this.w.players.values()].some(o => !o.guest && o.serial === serial)) return null;
    const record = await this.ctx.storage.get<unknown>(playerKey(owner));
    if (record === undefined) return null;
    const body = migratePlayer(record, "probe", this.w.now);
    if (body.guest || body.serial !== serial || body.wallet !== address) return null;
    return { token: owner, record };
  }

  async fetch(req: Request): Promise<Response> {
    const path = new URL(req.url).pathname;
    if (path === "/wallet/challenge" || path === "/wallet/link") return this.wallet(req, path);
    if (req.headers.get("Upgrade") !== "websocket") {
      return Response.json(
        { ok: true, v: PROTOCOL_VERSION, players: this.w.players.size, load: this.load.report(this.sessions.size, this.w.players.size, Date.now()) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const token = sessionToken(req);
    if (!token || !sameOrigin(req)) return new Response("Session required", { status: 403 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const hello = await this.join(token, server, req.headers.get("CF-Connecting-IP") ?? "local");
    if (!hello) return new Response("Too many joins; try again in a moment", { status: 429, headers: { "Retry-After": "1" } });
    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Bind a browser session to a body. One active body per session cookie:
   * a newer socket takes over and the older one is closed with 4001.
   */
  async join(token: string, server: Socket, address = "local"): Promise<Hello | null> {
    if (!this.admitJoin(address, Date.now())) return null;
    return this.ctx.blockConcurrencyWhile(async () => {
      const record = await this.ctx.storage.get<unknown>(playerKey(token));
      const saved = record !== undefined ? migratePlayer(record, bodyId(), this.w.now) : undefined; // the shape migration, as on every read
      const active = [...this.sessions.entries()].find(([, session]) => session.token === token);
      let player = (active && this.w.players.get(active[1].id)) ?? saved ?? spawnGuest(bodyId(), this.w.now);
      // A saved Angel whose serial another body now holds (walking now, or the index's since a newer link) comes back unsealed.
      if (player === saved && !saved.guest && saved.serial !== null) {
        const serial = saved.serial;
        const walking = [...this.w.players.values()].some(o => o.id !== saved.id && !o.guest && o.serial === serial);
        const owner = this.serialOwners.get(serial) ?? (await this.ctx.storage.get<string>(serialKey(serial)));
        if (owner !== undefined) this.serialOwners.set(serial, owner);
        if (walking || (owner !== undefined && owner !== token)) player = unsealBody(saved, this.w.now);
      }
      // A body back from its record is as its record has it: the join's checkpoint need not write it again.
      if (player === saved) this.saved.set(player.id, player);
      if (active) {
        this.sessions.delete(active[0]);
        this.budgets.delete(active[0]);
        this.slow.forget(active[1].id); // the new socket starts with a full slow frame
        try { active[0].close(4001, "This Angel is active in another tab"); } catch { /* already gone */ }
      }
      this.ctx.acceptWebSocket(server as WebSocket);
      const id = player.id;
      this.withBody(id, player);
      const session: Session = { id, token };
      this.sessions.set(server, session);
      server.serializeAttachment(session);
      await this.checkpoint();
      const hello: Hello = { t: "hello", v: PROTOCOL_VERSION, id, guest: player.guest, mockLink: this.mockLink, you: snapshotFor(this.w, id).you };
      server.send(JSON.stringify(hello));
      this.broadcast(true);
      await this.ensureTick();
      return hello;
    });
  }

  /** True when the socket's bucket has a token for this message; a flood past it is dropped unread and counted. */
  private admit(ws: Socket, now: number): boolean {
    let budget = this.budgets.get(ws);
    if (!budget) {
      budget = { tokens: MESSAGE_BURST, at: now };
      this.budgets.set(ws, budget);
    }
    if (draw(budget, MESSAGE_BURST, MESSAGES_PER_SECOND, now)) return true;
    this.load.dropped();
    return false;
  }

  /** True when the address's bucket and then the city's have a token for this join; past either it is refused and counted. */
  private admitJoin(ip: string, now: number): boolean {
    const address = joinKey(ip);
    let budget = this.joins.get(address);
    if (!budget) {
      if (this.joins.size >= JOIN_ADDRESSES_MAX) { // forget the addresses whose buckets are full again
        const full = JOIN_BURST / JOINS_PER_SECOND * 1000;
        for (const [key, b] of this.joins) if (now - b.at >= full) this.joins.delete(key);
      }
      budget = { tokens: JOIN_BURST, at: now };
      this.joins.set(address, budget);
    }
    if (draw(budget, JOIN_BURST, JOINS_PER_SECOND, now) && draw(this.cityJoins, CITY_JOIN_BURST, CITY_JOINS_PER_SECOND, now)) return true;
    this.load.refused();
    return false;
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    const id = this.sessions.get(ws)?.id;
    if (!id) return;
    const now = Date.now();
    if (!this.admit(ws, now)) return;
    if (typeof msg !== "string" || msg.length > MAX_MESSAGE) { // oversize: its token spent, dropped unread and counted
      this.load.dropped();
      return;
    }
    let data: unknown;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }
    if (!isClientMsg(data)) return;
    if (!this.w.players.has(id)) return;
    if (data.t === "link" && !this.mockLink) return; // the test link is off; wallets go through /wallet
    // Settle elapsed time before a new input; it must not act retroactively during catch-up.
    this.advanceWorld(now);
    const before = this.w;
    this.w = applyAction(this.w, id, data);
    if (data.t === "intent") {
      this.intentAt.set(id, now);
      return;
    }
    if (this.w === before) return; // a message that changed nothing (a strike on cooldown, a refused packet) costs nothing more
    // An action is checkpointed before its snapshot is sent. The checkpoint and the forced broadcast are the dear part
    // of a message, so a second action inside ACTION_BROADCAST_MIN_MS of the last one's rides the next alarm instead.
    this.pending = true;
    if (now - this.actionAt < ACTION_BROADCAST_MIN_MS) return;
    this.actionAt = now;
    await this.checkpoint();
    this.broadcast(true);
  }

  async webSocketClose(ws: WebSocket, code = 1000, reason = "") {
    // Complete the close handshake, including replaced sockets.
    try { ws.close(code === 1005 || code === 1006 ? 1000 : code, reason); } catch { /* already closed */ }
    this.budgets.delete(ws); // a replaced socket's too
    const session = this.sessions.get(ws);
    if (!session) return;
    const player = this.w.players.get(session.id);
    // The leaving body is written when it changed since its last write, and its stamp always.
    const leaving: Record<string, unknown> = player ? { [seenKey(session.token)]: Date.now() } : {};
    if (player && this.saved.get(session.id) !== player) leaving[playerKey(session.token)] = player;
    // A seal its last checkpoint had not yet claimed (a link coalesced into the next alarm) is claimed as it leaves, as a
    // live body's would have been: the serial's index names the newest proven link.
    const claim = player && !player.guest && player.serial !== null && this.serialOwners.get(player.serial) !== session.token ? player.serial : null;
    if (claim !== null) leaving[serialKey(claim)] = session.token;
    // The writeback log reads the city while the body is still in it: what it did since the last diff (a coalesced link,
    // a burial) is logged, not lost with the body (the player-defect sweep, round five).
    const closing = logEventsFor(this.logged, this.w, Date.now());
    this.logged = this.w;
    this.sessions.delete(ws);
    this.stamped.delete(session.token);
    if (![...this.sessions.values()].some(s => s.token === session.token)) this.wallets.delete(session.token);
    this.saved.delete(session.id);
    this.slow.forget(session.id);
    this.withBody(session.id, null);
    this.intentAt.delete(session.id);
    await this.checkpoint(leaving);
    if (claim !== null) this.serialOwners.set(claim, session.token);
    if (closing.length) {
      this.sink.push(closing);
      if (this.env?.LOG) this.ctx.waitUntil(this.sink.flush(this.env.LOG));
    }
    this.broadcast(true);
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  /**
   * Saved bodies outlive their sockets so a guest can come back, and nothing
   * else ended them: every guest who opened the city once left a record for
   * good. Once an hour the object reads one page of saved bodies and deletes
   * the guests that bound no wallet and were not seen for SAVED_TTL_MS, with
   * their stamps; an Angel's body and a bound wallet's are kept for good, a
   * live body is never touched, and a record from before the stamps enters
   * the clock the first time the sweep reads it. The cursor walks the whole
   * set a page at a time and starts over at the end.
   */
  private async sweep(now: number): Promise<number> {
    const list = (startAfter?: string) => this.ctx.storage.list<Player>({ prefix: PLAYER_PREFIX, limit: SWEEP_PAGE, startAfter });
    let page = await list(this.sweepAfter);
    if (page.size === 0 && this.sweepAfter !== undefined) {
      this.sweepAfter = undefined;
      page = await list();
    }
    if (page.size === 0) {
      await this.rememberSweep(now);
      return 0;
    }
    const live = new Set([...this.sessions.values()].map(s => s.token));
    const tokens = [...page.keys()].map(key => key.slice(PLAYER_PREFIX.length));
    const seen = await this.ctx.storage.get<number>(tokens.map(seenKey));
    const stamps: Record<string, number> = {};
    const gone: string[] = [];
    let bodies = 0;
    for (const token of tokens) {
      if (live.has(token)) continue;
      const at = seen.get(seenKey(token));
      if (at === undefined) {
        stamps[seenKey(token)] = now;
        continue;
      }
      const player = page.get(playerKey(token));
      if (!player?.guest || player.wallet || now - at < SAVED_TTL_MS) continue;
      gone.push(playerKey(token), seenKey(token));
      bodies++;
    }
    if (Object.keys(stamps).length) await this.ctx.storage.put(stamps);
    if (gone.length) {
      await this.ctx.storage.delete(gone);
      this.load.swept(bodies);
    }
    this.sweepAfter = [...page.keys()].at(-1);
    await this.rememberSweep(now);
    return bodies;
  }

  /** The sweep's clock and cursor, kept across instances: an evicted object picks up the page after the last one read. */
  private rememberSweep(at: number): Promise<void> {
    return this.ctx.storage.put({ [SWEEP_KEY]: { at, ...(this.sweepAfter !== undefined ? { after: this.sweepAfter } : {}) } });
  }

  private async ensureTick() {
    if (this.ticking) return;
    this.ticking = true;
    this.clock.start(Date.now());
    // A hibernated object's constructor must not replace its pending alarm.
    if (await this.ctx.storage.getAlarm() === null) await this.setAlarm(Date.now() + STEP_MS);
  }

  private async setAlarm(at: number) {
    this.alarmDue = at;
    await this.ctx.storage.setAlarm(at);
  }

  /**
   * A body arrives or leaves. The world's collections are replaced, never
   * mutated in place: the snapshot keeps the views every viewer shares by the
   * world object's identity, so a world that changed must be a new object.
   */
  private withBody(id: string, player: Player | null) {
    const players = new Map(this.w.players);
    const intents = new Map(this.w.intents);
    if (player) {
      players.set(id, player);
      intents.set(id, { ...idle });
    } else {
      players.delete(id);
      intents.delete(id);
    }
    this.w = { ...this.w, players, intents };
  }

  /** Advances by elapsed server time in fixed steps; returns how many it ran. */
  private advanceWorld(now: number): number {
    const expired = [...this.w.players.keys()].filter(id => now - (this.intentAt.get(id) ?? 0) > INTENT_TTL_MS && Object.values(this.w.intents.get(id) ?? {}).some(Boolean));
    if (expired.length) {
      const intents = new Map(this.w.intents);
      for (const id of expired) intents.set(id, { ...idle });
      this.w = { ...this.w, intents };
    }
    // Advance by elapsed server time rather than counting callbacks; keep fixed physics steps.
    const steps = this.clock.advance(now);
    for (let i = 0; i < steps; i++) this.w = tickWorld(this.w, DT);
    return steps;
  }

  async alarm() {
    if (this.w.players.size === 0) {
      this.ticking = false;
      this.clock.stop();
      return;
    }
    const now = Date.now();
    const steps = this.advanceWorld(now);
    this.load.alarmed(this.alarmDue ? now - this.alarmDue : 0, steps, this.clock.lastCapped, now);
    // Passive simulation checkpoints about once a simulation second; an action that rode this alarm is checkpointed first.
    const owed = this.pending;
    if (owed || this.w.now - this.checkpointAt >= 1) await this.checkpoint();
    if (owed) this.actionAt = now;
    this.broadcast(owed);
    if (this.w.players.size > 0) await this.setAlarm(Math.max(now + STEP_MS, Date.now() + 1));
    else { this.ticking = false; this.clock.stop(); }
    // Housekeeping after the next step is armed: the tick never waits on it and never dies with it.
    if (now - this.sweptAt >= this.sweepEvery) {
      this.sweptAt = now;
      try {
        this.sweepEvery = (await this.sweep(now)) > 0 ? SWEEP_BUSY_MS : SWEEP_EVERY_MS;
      } catch (e) {
        this.sweepEvery = SWEEP_EVERY_MS;
        console.warn("sweep failed", e);
      }
    }
  }

  /**
   * Every viewer gets their own snapshot: Winke, purse, claims and marks are
   * never shared. The fast frame goes every time; the slow sections go when
   * they changed, checked every SLOW_EVERY_TICKS steps, at once for a viewer
   * who has none yet, at once when `force` (after an action), and at once
   * when the viewer's own record changed under them on a tick (a death
   * closing a dialogue) or the bodies in view changed. On the steps between,
   * a viewer's slow side is not even built.
   */
  private broadcast(force = false) {
    let chars = 0;
    let viewers = 0;
    this.pending = false;
    const slowDue = force || this.w.tick % SLOW_EVERY_TICKS === 0;
    const step = stepViews(this.w); // the views and encodings every viewer of this step shares
    for (const [ws, session] of this.sessions) {
      try {
        const player = this.w.players.get(session.id);
        if (!player) continue;
        const { fast, slow } = framesFor(this.w, session.id, step);
        // Both checks run every step so their memory stays current; the roster must cover every body the fast frame moves.
        const rosterDue = this.slow.rosterDue(session.id, fast);
        const youDue = this.slow.youDue(session.id, player);
        if (rosterDue || youDue || slowDue || this.slow.fresh(session.id)) {
          const changed = this.slow.diff(session.id, slow(), step.frames);
          if (changed) {
            const payload = JSON.stringify(changed);
            chars += payload.length;
            ws.send(payload);
          }
        }
        const payload = encodeFast(fast, step.frames); // each body's fragment is encoded once per step, not once per viewer
        chars += payload.length;
        viewers++;
        ws.send(payload);
      } catch {
        this.ctx.waitUntil(this.webSocketClose(ws as WebSocket));
      }
    }
    this.load.broadcasted(chars, viewers);
  }
}

const parseDetail = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
};

type LogRow = { at: number; world_now: number; kind: string; player: string; serial: number | null; detail: string };

/** The public log: Passings, news, burials and links, newest first. Claims and wallets never leave the table. */
async function logRecent(url: URL, env: Env): Promise<Response> {
  const noStore = { "Cache-Control": "no-store" };
  if (!env.LOG) return Response.json({ ok: false }, { status: 404, headers: noStore });
  const kind = url.searchParams.get("kind") ?? "passing";
  const limit = Number(url.searchParams.get("limit") ?? "20");
  if (!(PUBLIC_LOG_KINDS as readonly string[]).includes(kind) || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return Response.json({ ok: false, reason: "bad-query" }, { status: 400, headers: noStore });
  }
  try {
    const rows = await env.LOG
      // Ordered by the index's own columns (events_kind_at: kind, at, then the rowid), so the last few rows are read
      // from the index's end, not sorted out of every row of the kind; the wall clock is written in id order.
      .prepare("SELECT at, world_now, kind, player, serial, detail FROM events WHERE kind = ?1 ORDER BY at DESC, id DESC LIMIT ?2")
      .bind(kind, limit)
      .all<LogRow>();
    const events = (rows.results ?? []).map(r => ({ at: r.at, worldNow: r.world_now, kind: r.kind, player: r.player, serial: r.serial, detail: parseDetail(r.detail) }));
    return Response.json({ ok: true, events }, { headers: { "Cache-Control": "public, max-age=15" } });
  } catch {
    return Response.json({ ok: false, reason: "log" }, { status: 503, headers: noStore });
  }
}

type Release = { revision: string; builtAt: string };
/** The staged client's release per assets binding: a release, or null for none staged (as fixed as the isolate). */
const releases = new WeakMap<Env["ASSETS"], Release | null>();

/**
 * The release `scripts/stage-play.mjs` wrote beside the client (`/play/release.json`: the commit and the build time),
 * read through the assets binding so `/health` names the build that is live. Null when nothing is staged, the file
 * is malformed or the binding is absent. An isolate's assets never change (a deploy or a local reload is a new
 * isolate), so a 404 and a malformed file are remembered like a good read and a city with no staged client costs no
 * subrequest per health call; a binding that throws or answers 5xx is asked again next time. Should a runtime hand
 * over a new binding object per request, the memory misses and a health call costs one asset read, nothing worse.
 */
async function readRelease(env: Env, url: URL): Promise<Release | null> {
  const assets = env.ASSETS;
  if (!assets) return null;
  if (releases.has(assets)) return releases.get(assets) ?? null;
  try {
    const res = await assets.fetch(new Request(new URL("/play/release.json", url)));
    if (res.status === 404) {
      releases.set(assets, null);
      return null;
    }
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as Partial<Release> | null;
    const release = body && typeof body.revision === "string" && typeof body.builtAt === "string"
      ? { revision: body.revision, builtAt: body.builtAt }
      : null;
    releases.set(assets, release);
    return release;
  } catch {
    return null;
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/log/recent") return logRecent(url, env);
    if (url.pathname === "/health") {
      const release = await readRelease(env, url);
      return Response.json({ ok: true, v: PROTOCOL_VERSION, ...(release ? { release } : {}) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (url.pathname === "/session") {
      if (req.method !== "POST") return new Response("POST required", { status: 405 });
      if (!sameOrigin(req)) return new Response("Same origin required", { status: 403 });
      const token = sessionToken(req) ?? crypto.randomUUID();
      return new Response(null, { status: 204, headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${url.protocol === "https:" ? "; Secure" : ""}`,
      } });
    }
    if (url.pathname === "/ws" || url.pathname === "/world" || url.pathname === "/wallet/challenge" || url.pathname === "/wallet/link") {
      const id = env.WORLD.idFromName(WORLD_NAME);
      return env.WORLD.get(id).fetch(req);
    }
    return env.ASSETS.fetch(req);
  },
};
