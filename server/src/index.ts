/**
 * Reverie: The Game — the city Worker.
 *
 * One Durable Object (`ReverieWorld`) owns the whole shared sim: it restores
 * the checkpointed world, accepts cookie-bound WebSocket sessions, applies
 * every client message through `applyAction`, steps the world in fixed 20 Hz
 * ticks from an alarm, checkpoints before it broadcasts, and sends every
 * viewer their own `snapshotFor` view. The client never computes a number.
 */
import { emptyWorld, spawnGuest, tickWorld } from "../../src/sim/world.ts";
import { migratePlayer, migrateWorld, SHAPE } from "../../src/sim/migrate.ts";
import { DT } from "../../src/sim/constants.ts";
import { applyAction, applyLink, applyWallet } from "../../src/sim/actions.ts";
import { LINES } from "../../src/sim/content/index.ts";
import { CHALLENGE_TTL_MS, challengeMessage, isAddress, normalizeAddress, parseHolders, recoverAddress } from "./wallet.ts";
import { snapshotFor } from "../../src/sim/snapshot.ts";
import { isClientMsg, PROTOCOL_VERSION } from "../../src/sim/protocol.ts";
import type { Hello } from "../../src/sim/protocol.ts";
import type { Intent, Player, WorldState } from "../../src/sim/types.ts";
import { SimulationClock, STEP_MS } from "./clock";

type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  WORLD: DurableObjectNamespace;
  MOCK_LINK?: string; // "1" accepts the test link (serial + mock signature); unset or "0" refuses it
  ANGEL_HOLDERS?: string; // JSON { "0xaddress": serial } until the contract exists
};

// workerd accepts only functions and handlers as named exports of the entry module, so these stay module-private.
const SESSION_COOKIE = "reverie_session";
const WORLD_KEY = "world:v2";
const PLAYER_PREFIX = "player:v2:";
const WORLD_NAME = "city-v2";
const MAX_MESSAGE = 4096;
const CHALLENGE_PREFIX = "challenge:v1:";
const INTENT_TTL_MS = 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

/** A WebSocket as this object uses it; narrow so tests can hand in doubles. */
type Socket = Pick<WebSocket, "send" | "close" | "serializeAttachment" | "deserializeAttachment">;

export class ReverieWorld {
  private w: WorldState;
  private sessions = new Map<Socket, Session>();
  private checkpointAt = 0;
  private intentAt = new Map<string, number>();
  private ticking = false;
  private clock = new SimulationClock();

  constructor(private readonly ctx: DurableObjectState, private readonly env: Env) {
    this.w = emptyWorld();
    this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<SavedWorld>(WORLD_KEY);
      this.w = restoreWorld(saved);
      const connected = new Set<string>();
      for (const ws of this.ctx.getWebSockets()) {
        const session = ws.deserializeAttachment() as Session | null;
        if (!session?.token || !this.w.players.has(session.id)) {
          ws.close(1012, "Reconnect to restore your place");
          continue;
        }
        this.sessions.set(ws, session);
        connected.add(session.id);
        this.w.intents.set(session.id, { ...idle });
      }
      for (const id of [...this.w.players.keys()]) {
        if (!connected.has(id)) this.w.players.delete(id);
      }
      this.checkpointAt = this.w.now;
      if (connected.size) await this.ensureTick();
    });
  }

  private async checkpoint(extra: Record<string, unknown> = {}) {
    const records: Record<string, unknown> = { [WORLD_KEY]: serializeWorld(this.w), ...extra };
    for (const session of this.sessions.values()) {
      const player = this.w.players.get(session.id);
      if (player) records[playerKey(session.token)] = player;
    }
    await this.ctx.storage.put(records);
    this.checkpointAt = this.w.now;
  }

  /** The test link is a development convenience: on only when the environment says so. */
  private get mockLink(): boolean {
    return (this.env?.MOCK_LINK ?? "0") === "1";
  }

  /**
   * Wallet login, disarmed. POST /wallet/challenge issues a nonce to this
   * session; POST /wallet/link takes { address, signature } over that nonce,
   * recovers the signer, and seals the live body with the serial the holders
   * map assigns, or binds the address to the guest when it holds no Angel.
   * The nonce is spent on first use and expires on its own.
   */
  private async wallet(req: Request, path: string): Promise<Response> {
    const headers = { "Cache-Control": "no-store" };
    const refuse = (status: number, reason: string) => Response.json({ ok: false, reason }, { status, headers });
    if (req.method !== "POST") return refuse(405, "post-required");
    if (!sameOrigin(req)) return refuse(403, "same-origin");
    const token = sessionToken(req);
    const live = token ? [...this.sessions.values()].find(s => s.token === token) : undefined;
    if (!token || !live || !this.w.players.has(live.id)) return refuse(409, "no-session");
    const key = `${CHALLENGE_PREFIX}${token}`;
    if (path === "/wallet/challenge") {
      const nonce = crypto.randomUUID();
      const at = Date.now();
      await this.ctx.storage.put({ [key]: { nonce, at } });
      return Response.json({ ok: true, message: challengeMessage(nonce, at) }, { headers });
    }
    let body: { address?: unknown; signature?: unknown } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return refuse(400, "bad-json");
    }
    const challenge = await this.ctx.storage.get<{ nonce: string; at: number }>(key);
    await this.ctx.storage.delete(key);
    if (!challenge || Date.now() - challenge.at > CHALLENGE_TTL_MS) return refuse(409, "no-challenge");
    if (!isAddress(body.address)) return refuse(400, "bad-address");
    const address = normalizeAddress(body.address);
    const signer = recoverAddress(challengeMessage(challenge.nonce, challenge.at), body.signature);
    if (!signer || signer !== address) return refuse(403, "bad-signature");
    const serial = parseHolders(this.env?.ANGEL_HOLDERS).get(address) ?? null;
    this.advanceWorld(Date.now());
    this.w = serial === null
      ? applyWallet(this.w, live.id, address, LINES.LINK_NO_ANGEL)
      : applyLink(applyWallet(this.w, live.id, address), live.id, serial, { kind: "wallet", address });
    await this.checkpoint();
    this.broadcast();
    const me = this.w.players.get(live.id);
    return Response.json({ ok: true, address, serial: me && !me.guest ? me.serial : null }, { headers });
  }

  async fetch(req: Request): Promise<Response> {
    const path = new URL(req.url).pathname;
    if (path === "/wallet/challenge" || path === "/wallet/link") return this.wallet(req, path);
    if (req.headers.get("Upgrade") !== "websocket") {
      return Response.json({ ok: true, v: PROTOCOL_VERSION, players: this.w.players.size });
    }
    const token = sessionToken(req);
    if (!token || !sameOrigin(req)) return new Response("Session required", { status: 403 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    await this.join(token, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Bind a browser session to a body. One active body per session cookie:
   * a newer socket takes over and the older one is closed with 4001.
   */
  async join(token: string, server: Socket): Promise<Hello> {
    return this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<Player>(playerKey(token));
      const active = [...this.sessions.entries()].find(([, session]) => session.token === token);
      const player = (active && this.w.players.get(active[1].id)) ?? saved ?? spawnGuest(crypto.randomUUID(), this.w.now);
      if (active) {
        this.sessions.delete(active[0]);
        try { active[0].close(4001, "This Angel is active in another tab"); } catch { /* already gone */ }
      }
      this.ctx.acceptWebSocket(server as WebSocket);
      const id = player.id;
      this.w.players.set(id, player);
      this.w.intents.set(id, { ...idle });
      const session: Session = { id, token };
      this.sessions.set(server, session);
      server.serializeAttachment(session);
      await this.checkpoint();
      const hello: Hello = { t: "hello", v: PROTOCOL_VERSION, id, guest: player.guest, mockLink: this.mockLink, you: snapshotFor(this.w, id).you };
      server.send(JSON.stringify(hello));
      this.broadcast();
      await this.ensureTick();
      return hello;
    });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    const id = this.sessions.get(ws)?.id;
    if (!id || typeof msg !== "string" || msg.length > MAX_MESSAGE) return;
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
    this.advanceWorld(Date.now());
    this.w = applyAction(this.w, id, data);
    if (data.t === "intent") {
      this.intentAt.set(id, Date.now());
      return;
    }
    await this.checkpoint();
    this.broadcast();
  }

  async webSocketClose(ws: WebSocket, code = 1000, reason = "") {
    // Complete the close handshake, including replaced sockets.
    try { ws.close(code === 1005 || code === 1006 ? 1000 : code, reason); } catch { /* already closed */ }
    const session = this.sessions.get(ws);
    if (!session) return;
    const player = this.w.players.get(session.id);
    this.sessions.delete(ws);
    this.w.players.delete(session.id);
    this.w.intents.delete(session.id);
    this.intentAt.delete(session.id);
    await this.checkpoint(player ? { [playerKey(session.token)]: player } : {});
    this.broadcast();
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  private async ensureTick() {
    if (this.ticking) return;
    this.ticking = true;
    this.clock.start(Date.now());
    // A hibernated object's constructor must not replace its pending alarm.
    if (await this.ctx.storage.getAlarm() === null) await this.ctx.storage.setAlarm(Date.now() + STEP_MS);
  }

  private advanceWorld(now: number) {
    for (const id of this.w.players.keys()) {
      if (now - (this.intentAt.get(id) ?? 0) > INTENT_TTL_MS) this.w.intents.set(id, { ...idle });
    }
    // Advance by elapsed server time rather than counting callbacks; keep fixed physics steps.
    const steps = this.clock.advance(now);
    for (let i = 0; i < steps; i++) this.w = tickWorld(this.w, DT);
  }

  async alarm() {
    if (this.w.players.size === 0) {
      this.ticking = false;
      this.clock.stop();
      return;
    }
    const now = Date.now();
    this.advanceWorld(now);
    if (this.w.now - this.checkpointAt >= 1) await this.checkpoint();
    this.broadcast();
    if (this.w.players.size > 0) await this.ctx.storage.setAlarm(Math.max(now + STEP_MS, Date.now() + 1));
    else { this.ticking = false; this.clock.stop(); }
  }

  /** Every viewer gets their own snapshot: Winke, purse, claims and marks are never shared. */
  private broadcast() {
    for (const [ws, session] of this.sessions) {
      try {
        if (!this.w.players.has(session.id)) continue;
        ws.send(JSON.stringify(snapshotFor(this.w, session.id)));
      } catch {
        this.ctx.waitUntil(this.webSocketClose(ws as WebSocket));
      }
    }
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, v: PROTOCOL_VERSION }, { headers: { "Cache-Control": "no-store" } });
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
