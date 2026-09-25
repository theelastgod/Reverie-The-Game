import {
  applyBury,
  applyDodge,
  applyCare,
  applyGoingUnder,
  applyLink,
  applyM3,
  applyWatch,
  applyForge,
  applyDesk,
  applyRestore,
  applyInsure,
  applyRepair,
  applyClockOut,
  applyClearing,
  applyAnnounce,
  applyBlitz,
  applyRuinBack,
  applyParty,
  applyTruce,
  applyFlag,
  applyCyber,
  applyDwell,
  applyOperator,
  applyRead,
  applyStrike,
  applyHeavy,
  applyTalk,
  applyUse,
  DT,
  emptyWorld,
  Intent,
  snapshot,
  inOpening,
  spawnGuest,
  tickWorld,
  WorldState,
  Player,
} from "../../src/sim/world.ts";

type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  WORLD: DurableObjectNamespace;
};

const SESSION_COOKIE = "reverie_session";
const WORLD_KEY = "world:v1";
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

type Session = { id: string; token: string };
const idle: Intent = { up: false, down: false, left: false, right: false };

export class ReverieWorld {
  private w: WorldState;
  private sessions = new Map<WebSocket, Session>();
  private checkpointAt = 0;
  private intentAt = new Map<string, number>();
  private ticking = false;

  constructor(private readonly ctx: DurableObjectState, _env: Env) {
    this.w = emptyWorld();
    this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<WorldState>(WORLD_KEY);
      if (saved) this.w = { ...emptyWorld(), ...saved, intents: new Map() };
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
      for (const id of this.w.players.keys()) {
        if (!connected.has(id)) this.w.players.delete(id);
      }
      this.checkpointAt = this.w.now;
      if (connected.size) await this.ensureTick();
    });
  }

  private async checkpoint(extra: Record<string, unknown> = {}) {
    const records: Record<string, unknown> = { [WORLD_KEY]: this.w, ...extra };
    for (const session of this.sessions.values()) {
      const player = this.w.players.get(session.id);
      if (player) records[`player:${session.token}`] = player;
    }
    await this.ctx.storage.put(records);
    this.checkpointAt = this.w.now;
  }

  async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("world", { status: 200 });
    }
    const token = sessionToken(req);
    if (!token || !sameOrigin(req)) return new Response("Session required", { status: 403 });
    return this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<Player>(`player:${token}`);
      const active = [...this.sessions.entries()].find(([, session]) => session.token === token);
      const player = (active && this.w.players.get(active[1].id)) ?? saved ?? spawnGuest(crypto.randomUUID());
      // One active body per browser session. An old socket cannot evict its replacement.
      if (active) {
        this.sessions.delete(active[0]);
        active[0].close(4001, "This Angel is active in another tab");
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      const id = player.id;
      this.w.players.set(id, player);
      this.w.intents.set(id, { ...idle });
      const session = { id, token };
      this.sessions.set(server, session);
      server.serializeAttachment(session);
      await this.checkpoint();
      server.send(JSON.stringify({ t: "hello", id, guest: player.guest, you: player }));
      this.broadcast();
      await this.ensureTick();
      return new Response(null, { status: 101, webSocket: client });
    });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    const id = this.sessions.get(ws)?.id;
    if (!id || typeof msg !== "string" || msg.length > 2048) return;
    let data: {
      t?: string;
      intent?: Intent;
      dx?: number;
      dy?: number;
      nodeId?: string;
      npcId?: string;
      signId?: string;
      serial?: number;
      sig?: string;
      choice?: "extract" | "keep" | "hear" | "take" | "refuse" | "spot" | "sell" | "pass" | "file" | "bank";
    };
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return;
    if (data.t === "intent" && data.intent) {
      this.intentAt.set(id, Date.now());
      this.w.intents.set(id, {
        up: !!data.intent.up,
        down: !!data.intent.down,
        left: !!data.intent.left,
        right: !!data.intent.right,
      });
    } else if (data.t === "dodge" && typeof data.dx === "number" && typeof data.dy === "number") {
      this.w = applyDodge(this.w, id, data.dx, data.dy);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "strike") {
      this.w = applyStrike(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "heavy") {
      this.w = applyHeavy(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "use" && data.nodeId && (data.choice === "extract" || data.choice === "keep")) {
      this.w = applyUse(this.w, id, data.nodeId, data.choice);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "talk" && data.npcId) {
      this.w = applyTalk(this.w, id, data.npcId);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "bury") {
      this.w = applyBury(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "under") {
      this.w = applyGoingUnder(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "read" && data.signId) {
      this.w = applyRead(this.w, id, data.signId);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "link" && typeof data.serial === "number") {
      this.w = applyLink(this.w, id, data.serial, typeof data.sig === "string" ? data.sig : "");
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "care") {
      this.w = applyCare(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "operator") {
      const choice = data.choice === "take" || data.choice === "refuse" || data.choice === "hear" ? data.choice : "hear";
      this.w = applyOperator(this.w, id, choice);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "m3") {
      this.w = applyM3(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "watch") {
      this.w = applyWatch(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "forge") {
      const choice = data.choice === "spot" || data.choice === "sell" || data.choice === "hear" ? data.choice : "hear";
      this.w = applyForge(this.w, id, choice);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "clearing") {
      const choice = data.choice === "extract" || data.choice === "pass" || data.choice === "keep" ? data.choice : "keep";
      this.w = applyClearing(this.w, id, choice);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "announce" && data.nodeId) {
      this.w = applyAnnounce(this.w, id, data.nodeId);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "blitz") {
      this.w = applyBlitz(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "ruinBack") {
      this.w = applyRuinBack(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "party") {
      this.w = applyParty(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "flag") {
      this.w = applyFlag(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "truce") {
      this.w = applyTruce(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "cyber" && data.nodeId) {
      this.w = applyCyber(this.w, id, data.nodeId);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "dwell" && data.nodeId) {
      this.w = applyDwell(this.w, id, data.nodeId);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "desk") {
      this.w = applyDesk(this.w, id, data.choice === "take" ? "take" : data.choice === "bank" ? "bank" : "file");
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "restore") {
      this.w = applyRestore(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "insure") {
      this.w = applyInsure(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "repair") {
      this.w = applyRepair(this.w, id);
      await this.checkpoint();
      this.broadcast();
    } else if (data.t === "clock") {
      this.w = applyClockOut(this.w, id);
      await this.checkpoint();
      this.broadcast();
    }
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
    await this.checkpoint(player ? { [`player:${session.token}`]: player } : {});
    this.broadcast();
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  private async ensureTick() {
    if (this.ticking) return;
    this.ticking = true;
    await this.ctx.storage.setAlarm(Date.now() + 50);
  }

  async alarm() {
    for (const id of this.w.players.keys()) {
      if (Date.now() - (this.intentAt.get(id) ?? 0) > 1000) this.w.intents.set(id, { ...idle });
    }
    this.w = tickWorld(this.w, DT);
    if (this.w.now - this.checkpointAt >= 1) await this.checkpoint();
    this.broadcast();
    if (this.w.players.size > 0) await this.ctx.storage.setAlarm(Date.now() + 50);
    else this.ticking = false;
  }

  private broadcast() {
    const raw = JSON.stringify(snapshot(this.w));
    let openingRaw: string | undefined;
    for (const [ws, session] of this.sessions) {
      try {
        const p = this.w.players.get(session.id);
        if (p && inOpening(p)) {
          openingRaw ??= JSON.stringify(snapshot(this.w, session.id));
          ws.send(openingRaw);
        } else ws.send(raw);
      } catch {
        this.ctx.waitUntil(this.webSocketClose(ws));
      }
    }
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/session") {
      if (req.method !== "POST") return new Response("POST required", { status: 405 });
      if (!sameOrigin(req)) return new Response("Same origin required", { status: 403 });
      const token = sessionToken(req) ?? crypto.randomUUID();
      return new Response(null, { status: 204, headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${url.protocol === "https:" ? "; Secure" : ""}`,
      } });
    }
    if (url.pathname === "/ws" || url.pathname === "/world") {
      const id = env.WORLD.idFromName("nave");
      return env.WORLD.get(id).fetch(req);
    }
    return env.ASSETS.fetch(req);
  },
};
