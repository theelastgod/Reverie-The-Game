// The player-defect sweep, round twenty-two: a seeded session-level fuzzer over the ReverieWorld Durable Object. 1–5 clients join (new or
// saved tokens, another tab on the same token), send valid and malformed messages, close and reconnect, link (mock and
// wallet), let alarms run, sweep, and are restored by a new object over the same storage (an eviction). Invariants are
// checked after every step. R22_RUNS / R22_STEPS (env) size it. Violations are printed by kind with a seed to replay.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { ReverieWorld, serializeWorld } from "./index";
import { addressOfPublicKey, personalMessageHash, recoverAddress } from "./wallet";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { migratePlayer } from "../../src/sim/migrate";
import { POSITIONS, districtAt } from "../../src/sim/map";
import { F } from "../../src/sim/content/ids";
import { NPCS } from "../../src/sim/content";
import { applySlow, mergeFrames, type SlowState } from "../../src/sim/frames";
import type { FastFrame } from "../../src/sim/protocol";
import type { Player } from "../../src/sim/types";

const RUNS = Number(process.env.R22_RUNS ?? 120);
const STEPS = Number(process.env.R22_STEPS ?? 60);
const FIGHT = process.env.R22_FIGHT === "1";
const WORLD_KEY = "world:v2";
const pk = (t: string) => `player:v2:${t}`;
const sk = (t: string) => `seen:v2:${t}`;
const serialKey = (s: number) => `serial:v2:${s}`;
const TOKENS = [0, 1, 2, 3, 4, 5, 6].map(i => `${i}2345678-1234-4123-8123-123456789abc`);
const ORIGIN = "https://game.example";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hexOf = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
const keyOf = (n: number): Uint8Array => { const k = new Uint8Array(32); k[31] = n; return k; };
const addressOf = (priv: Uint8Array) => addressOfPublicKey(secp256k1.getPublicKey(priv, false));
function ethSign(message: string, priv: Uint8Array): string {
  const compact = secp256k1.sign(personalMessageHash(message), priv, { prehash: false });
  for (const v of [27, 28]) {
    const sig = "0x" + hexOf(compact) + v.toString(16);
    if (recoverAddress(message, sig) === addressOf(priv)) return sig;
  }
  throw new Error("no recovery bit");
}
const HOLDER = keyOf(1);
const STRANGER = keyOf(9);
const ENV = { MOCK_LINK: "1", ANGEL_HOLDERS: JSON.stringify({ [addressOf(HOLDER)]: 42 }) };
const post = (path: string, t: string, body?: unknown) =>
  new Request(`${ORIGIN}${path}`, { method: "POST", headers: { Origin: ORIGIN, Cookie: `reverie_session=${t}`, "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });

export type Sock = {
  n: number; token: string; attachment: unknown; frames: string[]; closing: boolean; dead: boolean; closeCode?: number;
  serializeAttachment(a: unknown): void; deserializeAttachment(): unknown; send(s: string): void; close(code?: number, reason?: string): void;
};

export function makeEnv() {
  const data = new Map<string, unknown>();
  const open = new Set<Sock>();
  const closeEvents: Sock[] = []; // closes the runtime will deliver: a socket the server closed
  let alarmAt: number | null = null;
  const deleted: string[] = [];
  const gone: [string, unknown, number | undefined][] = [];
  const storage = {
    get: async (key: string | string[]) =>
      Array.isArray(key) ? new Map(key.filter(k => data.has(k)).map(k => [k, structuredClone(data.get(k))])) : structuredClone(data.get(key)),
    put: async (values: Record<string, unknown>) => { for (const [k, v] of Object.entries(values)) data.set(k, structuredClone(v)); },
    delete: async (key: string | string[]) => { const ks = Array.isArray(key) ? key : [key]; deleted.push(...ks); for (const k of ks) if (k.startsWith("player:v2:") && data.has(k)) gone.push([k, structuredClone(data.get(k)), (data.get("seen:v2:" + k.slice(10)) as number | undefined)]); return ks.filter(k => data.delete(k)).length; },
    list: async ({ prefix = "", limit = Infinity, startAfter = "" }: { prefix?: string; limit?: number; startAfter?: string }) =>
      new Map([...data.keys()].filter(k => k.startsWith(prefix) && k > startAfter).sort().slice(0, limit).map(k => [k, structuredClone(data.get(k))])),
    setAlarm: async (at: number) => { alarmAt = at; },
    getAlarm: async () => alarmAt,
  };
  let n = 0;
  const sock = (token: string): Sock => {
    const s: Sock = {
      n: n++, token, attachment: null, frames: [], closing: false, dead: false,
      serializeAttachment(a) { s.attachment = structuredClone(a); },
      deserializeAttachment() { return s.attachment; },
      send(x) { if (s.dead || s.closing) throw new Error("socket closed"); s.frames.push(x); },
      close(code) {
        if (s.closing) return;
        s.closing = true; s.closeCode = code; open.delete(s); closeEvents.push(s);
      },
    };
    return s;
  };
  const waits: Promise<unknown>[] = [];
  async function make(): Promise<ReverieWorld> {
    let ready: Promise<unknown> | undefined;
    const ctx = {
      storage, getWebSockets: () => [...open], waitUntil: (p: Promise<unknown>) => { waits.push(p); },
      acceptWebSocket: (ws: Sock) => { open.add(ws); },
      blockConcurrencyWhile: (fn: () => Promise<unknown>) => (ready = fn()),
    };
    const o = new ReverieWorld(ctx as never, ENV as never);
    await ready;
    return o;
  }
  return { data, open, closeEvents, storage, sock, make, waits, deleted, gone, alarm: { get: () => alarmAt, clear: () => { alarmAt = null; } } };
}

export const priv = (o: ReverieWorld) => o as unknown as {
  w: { players: Map<string, Player>; now: number; tick: number };
  sessions: Map<Sock, { id: string; token: string }>;
  lingering: Map<string, string>;
  saved: Map<string, Player>;
  serialOwners: Map<number, string>;
  load: { dropped: () => void; checkpointed: unknown };
};

export function inFight(p: Player, now: number): boolean {
  if (p.dead) return false;
  return (p.flagged && (p.flagHeldUntil ?? 0) > now) || (!!p.duel && p.duel.accepted && p.duel.until > now);
}

/** A saved Angel near the stall, flagged, facing in, to start fights. */
function angelRecord(id: string, serial: number, dx: number, extra: Partial<Player> = {}): Player {
  const pos = POSITIONS["stall-3"];
  return {
    ...spawnGuest(id), guest: false, serial, name: `#${serial}`, house: "earth", flags: { [F.ANGEL]: 1 },
    x: pos.x + dx, y: pos.y, district: districtAt(pos.x + dx, pos.y), flagged: true, facing: { dx: dx > 0 ? -1 : 1, dy: 0 }, bestand: 50, ...extra,
  };
}

const NPC_IDS = Object.keys(NPCS as Record<string, unknown>);
const POIS = ["claims-desk", "stall-3", "memorial-recorder", "plaque", "shrine", "nope"];

function randomMsg(r: () => number): string | ArrayBuffer {
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const k = r();
  if (FIGHT && k < 0.6) return JSON.stringify(r() < 0.85 ? { t: "strike" } : { t: pick(["heavy", "flag", "truce"]) });
  if (k < 0.08) return pick(["not json", "{}", '{"t":"nope"}', "[]", "null", '{"t":"intent"}', '{"t":"link","serial":"42","sig":"mock"}', '{"t":"dodge","dx":"x"}', '{"t":"market","op":"buy"}', '{"t":"choose"}']);
  if (k < 0.1) return r() < 0.5 ? "x".repeat(5000) : new ArrayBuffer(8);
  const msgs = [
    () => ({ t: "intent", intent: { up: r() < 0.3, down: r() < 0.3, left: r() < 0.3, right: r() < 0.3 } }),
    () => ({ t: "dodge", dx: Math.round(r() * 2 - 1), dy: Math.round(r() * 2 - 1) }),
    () => ({ t: "strike" }), () => ({ t: "strike" }), () => ({ t: "strike" }),
    () => ({ t: "heavy" }), () => ({ t: "stance" }), () => ({ t: "kit" }),
    () => ({ t: "interact", targetId: pick(POIS), choice: pick(["file", "take", "bank", "read", "e"]) }),
    () => ({ t: "talk", npcId: pick([...NPC_IDS, "nobody"]) }),
    () => ({ t: "choose", choiceId: pick(["who", "help", "leave", "voice", "copper", "look", "yes", "no"]) }),
    () => ({ t: "close" }),
    () => ({ t: "link", serial: pick([41, 42, 43, 7777, 0, 9999]), sig: pick(["mock", "mock", "bad"]) }),
    () => ({ t: "flag" }), () => ({ t: "truce" }),
    () => ({ t: "use", itemId: pick(["copy:wink", "nope"]) }),
    () => ({ t: "market", op: pick(["list", "buy", "cancel"]), itemId: "copy:wink", price: 10 }),
  ];
  return JSON.stringify(pick(msgs)());
}

export const cov = { lingering: 0, closesInFight: 0, walletRestore: 0, unsealed: 0, sweptKeys: 0, restores: 0, joins: 0, refused: 0, alarms: 0, x: 0 };
type Violation = { seed: number; step: number; kind: string; detail: string; trace: string[] };

export async function runSeed(seed: number, steps: number): Promise<{ violations: Violation[]; ops: number; trace: string[] }> {
  const r = mulberry32(seed);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const env = makeEnv();
  const violations: Violation[] = [];
  const trace: string[] = [];
  let step = 0;
  const report = (kind: string, detail: string) => violations.push({ seed, step, kind, detail, trace: trace.slice(-12) });

  // the city before the run: some tokens have saved bodies
  const clients = 1 + Math.floor(r() * 5);
  const tokens = TOKENS.slice(0, clients + 1);
  const w0 = emptyWorld();
  env.data.set(WORLD_KEY, serializeWorld(w0));
  const now0 = 1_000_000;
  vi.setSystemTime(now0);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const k = r();
    if (k < 0.45) {
      const serial = pick([41, 42, 43, 7777]);
      const extra: Partial<Player> = r() < 0.4 ? { claims: [{ id: "claim:x:1", label: "Claim 1", amount: 10, filedAt: 0, readyAt: 99999, settled: false }], claimsFiled: 1 } : {};
      if (serial === 42 && r() < 0.6) extra.wallet = addressOf(HOLDER);
      env.data.set(pk(t), angelRecord(`b${i}`, serial, pick([-24, 0, 24, 12]), extra));
      env.data.set(sk(t), now0 - Math.floor(r() * 40 * 86_400_000));
      if (r() < 0.5) env.data.set(serialKey(serial), t);
    } else if (k < 0.7) {
      env.data.set(pk(t), { ...spawnGuest(`b${i}`), ...(r() < 0.2 ? { wallet: addressOf(STRANGER) } : {}) });
      if (r() < 0.8) env.data.set(sk(t), now0 - Math.floor(r() * 40 * 86_400_000));
    }
  }

  let o = await env.make();
  let now = now0;
  // per socket: the id it was handed, and a model of its message bucket
  const model = new Map<Sock, { tokens: number; at: number }>();
  const handed = new Map<Sock, string>();
  const checked = new Map<Sock, number>();
  let dropped = 0;
  const hook = () => { const load = priv(o).load; const orig = load.dropped.bind(load); load.dropped = () => { dropped++; orig(); }; };
  hook();

  const drain = async () => {
    while (env.waits.length) await env.waits.shift();
    while (env.closeEvents.length) {
      const s = env.closeEvents.shift()!;
      trace.push(`runtime-close #${s.n} code=${s.closeCode}`);
      await o.webSocketClose(s as never, s.closeCode ?? 1000, "");
      while (env.waits.length) await env.waits.shift();
    }
  };

  const check = (afterAlarm: boolean) => {
    const p = priv(o);
    if (p.lingering.size) cov.lingering++;
    while (env.gone.length) {
      const [k, v, seen] = env.gone.shift()!;
      const t = k.slice(10);
      const b = v as Player;
      const liveTok = [...p.sessions.values()].some(s => s.token === t) || [...p.lingering.values()].includes(t);
      if (liveTok) report("deleted-live", t.slice(0, 2));
      const sweepOk = b.guest && !b.wallet && seen !== undefined && Date.now() - seen >= 30 * 86_400_000;
      const restoreOk = !b.guest && !!b.wallet; // a wallet restore takes an Angel's record into another session
      if (!sweepOk && !restoreOk) report("deleted-wrong", `${t.slice(0, 2)} guest=${b.guest} wallet=${b.wallet} seen=${seen}`);
    }
    for (const b of p.w.players.values()) if (b.heard === "__") cov.x++;
    const w = p.w;
    const owners = new Map<string, Sock>();
    const tokensLive = new Map<string, Sock>();
    for (const [ws, s] of p.sessions) {
      if (ws.closing) report("session-on-closed-socket", `#${ws.n} ${s.token.slice(0, 2)} id=${s.id}`);
      if (!w.players.has(s.id)) report("session-without-body", `#${ws.n} ${s.token.slice(0, 2)} id=${s.id}`);
      if (owners.has(s.id)) report("two-sockets-one-body", `${s.id} #${owners.get(s.id)!.n} #${ws.n}`);
      owners.set(s.id, ws);
      if (tokensLive.has(s.token)) report("two-sockets-one-token", `${s.token.slice(0, 2)}`);
      tokensLive.set(s.token, ws);
      if (p.lingering.has(s.id)) report("live-and-lingering", s.id);
    }
    for (const [id, t] of p.lingering) {
      const b = w.players.get(id);
      if (!b) report("lingering-without-body", id);
      else if (afterAlarm && !inFight(b, w.now)) report("lingering-out-of-fight", `${id} flagged=${b.flagged} hold=${b.flagHeldUntil} now=${w.now}`);
      if (tokensLive.has(t)) report("lingering-token-live", t.slice(0, 2));
    }
    for (const id of w.players.keys()) if (!owners.has(id) && !p.lingering.has(id)) report("orphan-body", id);
    const serials = new Map<number, string>();
    for (const b of w.players.values()) {
      if (b.guest) {
        if (b.claims.length) report("guest-claims", `${b.id} ${b.claims.length}`);
        if (b.flagged) report("guest-flagged", b.id);
        if (b.serial !== null) report("guest-serial", `${b.id} ${b.serial}`);
      } else if (b.serial !== null) {
        if (serials.has(b.serial)) report("serial-twice", `${b.serial} ${serials.get(b.serial)} ${b.id}`);
        serials.set(b.serial, b.id);
      }
    }
    // round trip: a body the object believes written restores to itself
    const pairs: [string, string][] = [...[...p.sessions.values()].map(s => [s.id, s.token] as [string, string]), ...p.lingering];
    for (const [id, t] of pairs) {
      const b = w.players.get(id);
      if (!b || p.saved.get(id) !== b) continue;
      const rec = env.data.get(pk(t));
      if (rec === undefined) { report("written-but-absent", `${t.slice(0, 2)} ${id}`); continue; }
      const back = migratePlayer(rec, "fallback", w.now);
      for (const f of ["id", "guest", "serial", "hp", "bestand", "banked", "movement", "wallet", "winke", "dead"] as const) {
        if (JSON.stringify(back[f]) !== JSON.stringify(b[f])) report("roundtrip", `${t.slice(0, 2)} ${id} ${f}: ${JSON.stringify(back[f])} vs ${JSON.stringify(b[f])}`);
      }
      if (!b.guest && b.serial !== null && afterAlarm && env.data.get(serialKey(b.serial)) !== t) report("serial-index", `${b.serial} -> ${String(env.data.get(serialKey(b.serial))).slice(0, 2)} but body under ${t.slice(0, 2)}`);
    }
    // frames: parse, and a fast frame's you is the socket's body
    for (const ws of [...p.sessions.keys(), ...handed.keys()]) {
      const from = checked.get(ws) ?? 0;
      for (let i = from; i < ws.frames.length; i++) {
        let f: { t?: string; you?: { id?: string }; id?: string };
        try { f = JSON.parse(ws.frames[i]); } catch { report("frame-unparsable", `#${ws.n}`); continue; }
        if (!["hello", "fast", "slow", "snap"].includes(f.t ?? "")) report("frame-kind", `#${ws.n} ${f.t}`);
        const want = p.sessions.get(ws)?.id ?? handed.get(ws);
        if (f.t === "hello" && f.you?.id !== f.id) report("hello-you", `#${ws.n}`);
        if (f.t === "fast" && want && f.you?.id !== want) report("fast-you", `#${ws.n} ${f.you?.id} vs ${want}`);
      }
      checked.set(ws, ws.frames.length);
    }
    if (afterAlarm) {
      for (const [ws, s] of p.sessions) {
        const b = w.players.get(s.id);
        if (!b) continue;
        let slow: SlowState = {}; let fast: FastFrame | null = null;
        for (const x of ws.frames) { const d = JSON.parse(x); if (d.t === "slow") slow = applySlow(slow, d); else if (d.t === "fast") fast = d; }
        if (!fast) { report("no-frame", `#${ws.n}`); continue; }
        const you = mergeFrames(slow, fast).you as Player;
        for (const f of ["id", "guest", "serial", "hp", "wallet"] as const) if (JSON.stringify(you[f]) !== JSON.stringify(b[f])) report("view-you", `#${ws.n} ${f}: ${JSON.stringify(you[f])} vs ${JSON.stringify(b[f])}`);
      }
    }
  };

  const liveSocks = () => [...priv(o).sessions.keys()];
  let ops = 0;
  const stepsBefore = { swept: 0 };
  void stepsBefore;
  for (step = 0; step < steps; step++) {
    ops++;
    const k = r();
    try {
      if (k < 0.16) {
        const t = pick(tokens);
        const ws = env.sock(t);
        const ip = pick(["1.1.1.1", "2.2.2.2", "local"]);
        trace.push(`join ${t.slice(0, 2)} #${ws.n}`);
        if (r() < 0.03) { // a flood of joins from one address: the budget refuses past the burst, and nothing breaks
          for (let i = 0; i < 40; i++) { const f = env.sock(t); const h = await o.join(t, f as never, ip); cov.joins++; if (!h) cov.refused++; else { handed.set(f, h.id); model.set(f, { tokens: 120, at: Date.now() }); } await drain(); }
        }
        const hello = await o.join(t, ws as never, ip);
        cov.joins++; if (!hello) cov.refused++;
        if (hello && hello.guest && env.data.get(pk(t)) && (env.data.get(pk(t)) as Player).locked && (env.data.get(pk(t)) as Player).heard) cov.unsealed++;
        if (hello) { handed.set(ws, hello.id); model.set(ws, { tokens: 120, at: Date.now() }); }
        else trace.push(`  refused`);
      } else if (k < 0.55) {
        const ws = pick(liveSocks());
        if (ws) {
          const burst = r() < 0.05 ? 100 + Math.floor(r() * 80) : 1 + Math.floor(r() * 4);
          trace.push(`msgs #${ws.n} x${burst}`);
          for (let i = 0; i < burst; i++) {
            const m = randomMsg(r);
            const mm = model.get(ws) ?? { tokens: 120, at: Date.now() };
            model.set(ws, mm);
            mm.tokens = Math.min(120, mm.tokens + Math.max(0, Date.now() - mm.at) / 1000 * 60);
            mm.at = Date.now();
            const has = mm.tokens >= 1;
            if (has) mm.tokens -= 1;
            const oversize = typeof m !== "string" || m.length > 4096;
            const before = dropped;
            const live = priv(o).sessions.has(ws);
            if (typeof m === "string" && i === 0) trace.push(`  ${m.slice(0, 80)}`);
            await o.webSocketMessage(ws as never, m as never);
            const d = dropped - before;
            if (live && has && !oversize && d > 0) report("budget-dropped-under", `#${ws.n} i=${i}`);
            if (live && !has && d === 0) report("budget-admitted-over", `#${ws.n} i=${i}`);
            if (!priv(o).sessions.has(ws)) break;
          }
        }
      } else if (k < 0.65) {
        const ws = pick(liveSocks());
        if (ws) {
          trace.push(`client-close #${ws.n}`);
          ws.closing = true; env.open.delete(ws);
          const sess = priv(o).sessions.get(ws)!;
          const body = priv(o).w.players.get(sess.id)!;
          const fight = inFight(body, priv(o).w.now);
          await o.webSocketClose(ws as never, pick([1000, 1001, 1005, 1006]), "");
          if (r() < 0.3) await o.webSocketError(ws as never); // a second delivery is harmless
          const rec = env.data.get(pk(sess.token));
          if (!rec) report("closed-not-written", `${sess.token.slice(0, 2)}`);
          else {
            const back = migratePlayer(rec, "x", priv(o).w.now);
            const now2 = priv(o).w.players.get(sess.id) ?? body;
            for (const f of ["serial", "hp", "bestand", "banked", "guest"] as const) if (JSON.stringify(back[f]) !== JSON.stringify(now2[f])) report("closed-record", `${f} ${JSON.stringify(back[f])} vs ${JSON.stringify(now2[f])}`);
          }
          if (!fight && priv(o).w.players.has(sess.id)) report("closed-not-in-fight-stays", sess.id);
          if (fight) cov.closesInFight++;
          if (fight && !priv(o).lingering.has(sess.id)) report("closed-in-fight-gone", sess.id);
        }
      } else if (k < 0.68) {
        const ws = pick(liveSocks());
        if (ws) { trace.push(`dead-peer #${ws.n}`); ws.dead = true; }
      } else if (k < 0.85) {
        const big = r() < 0.04;
        const dt = big ? pick([3_700_000, 31 * 86_400_000]) : Math.floor(r() * 2500);
        now += dt;
        vi.setSystemTime(now);
        trace.push(`advance ${dt}`);
        let fired = 0;
        while (env.alarm.get() !== null && env.alarm.get()! <= now && fired < 3) {
          env.alarm.clear();
          fired++;
          await o.alarm(); cov.alarms++;
          await drain();
          check(true);
        }
      } else if (k < 0.9) {
        // eviction: a new object over the same storage, the open sockets handed over
        await drain();
        trace.push(`restore (${env.open.size} open)`);
        o = await env.make(); cov.restores++;
        hook();
        model.clear(); // a new instance starts every socket's bucket full (more permissive, never a drop)
        for (const ws of [...env.open]) if (!priv(o).sessions.has(ws)) handed.delete(ws);
      } else {
        const ws = pick(liveSocks());
        if (ws) {
          const t = priv(o).sessions.get(ws)!.token;
          const key = r() < 0.8 ? HOLDER : STRANGER;
          trace.push(`wallet ${t.slice(0, 2)} ${key === HOLDER ? "holder" : "stranger"}`);
          const res = await o.fetch(post("/wallet/challenge", t, { address: addressOf(key) }));
          const body = (await res.json()) as { ok: boolean; message?: string };
          if (body.ok && body.message) {
            const link = await o.fetch(post("/wallet/link", t, { address: addressOf(key), signature: ethSign(body.message, key) }));
            const d0 = env.deleted.length;
            void d0;
            if ((await link.clone().json() as { serial?: number }).serial === 42 && env.deleted.slice(-3).some(k => k.startsWith("challenge:v1:") && k !== `challenge:v1:${t}`)) cov.walletRestore++;
            trace.push(`  ${link.status} ${JSON.stringify(await link.json())}`);
          }
        }
      }
      await drain();
    } catch (e) {
      report("exception", `${(e as Error).stack?.slice(0, 500)}`);
    }
    check(false);
  }
  cov.sweptKeys += env.deleted.filter(k => k.startsWith("seen:v2:")).length;
  return { violations, ops, trace };
}

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); });
afterEach(() => { vi.useRealTimers(); });

// Opt-in: `npm run test:fuzz:server` (R22_RUNS, R22_STEPS, R22_FIGHT=1 for a fight-biased run). Off in `npm test`.
describe.skipIf(!process.env.R22_RUNS)("round twenty-two: the session fuzzer", () => {
  it(`runs ${RUNS} seeds of ${STEPS} steps and holds every invariant`, async () => {
    const all: Violation[] = [];
    let ops = 0;
    for (let seed = 1; seed <= RUNS; seed++) {
      const res = await runSeed(seed, STEPS);
      ops += res.ops;
      all.push(...res.violations);
    }
    const byKind = new Map<string, Violation[]>();
    for (const v of all) byKind.set(v.kind, [...(byKind.get(v.kind) ?? []), v]);
    console.log(`coverage ${JSON.stringify(cov)}`);
    console.log(`r22 fuzz: ${RUNS} runs, ${ops} steps, ${all.length} violations`);
    for (const [kind, vs] of byKind) {
      const seeds = [...new Set(vs.map(v => v.seed))];
      console.log(`  ${kind}: ${vs.length} in ${seeds.length} seeds (first seed ${vs[0].seed} step ${vs[0].step}): ${vs[0].detail}\n    ${vs[0].trace.join("\n    ")}`);
    }
    if (process.env.R22_STRICT !== "0") expect(all.map(v => `${v.kind} (seed ${v.seed} step ${v.step}): ${v.detail}`)).toEqual([]);
  }, 600_000);
});
