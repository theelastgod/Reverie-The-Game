import {
  applyBury,
  applyGoingUnder,
  applyRead,
  applyStrike,
  applyTalk,
  applyUse,
  DT,
  emptyWorld,
  Intent,
  snapshot,
  spawnGuest,
  tickWorld,
  WorldState,
} from "../../src/sim/world.ts";

type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  WORLD: DurableObjectNamespace;
};

const idle: Intent = { up: false, down: false, left: false, right: false };

export class ReverieWorld {
  private w: WorldState = emptyWorld();
  private sessions = new Map<WebSocket, string>();
  private ticking = false;

  constructor(private readonly ctx: DurableObjectState, _env: Env) {}

  async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("world", { status: 200 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const id = crypto.randomUUID();
    this.w.players.set(id, spawnGuest(id));
    this.w.intents.set(id, { ...idle });
    this.sessions.set(server, id);
    server.serializeAttachment({ id });
    server.send(JSON.stringify({ t: "hello", id, guest: true, you: this.w.players.get(id) }));
    this.broadcast();
    this.ensureTick();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    const id = this.sessions.get(ws) ?? (ws.deserializeAttachment() as { id?: string } | null)?.id;
    if (!id || typeof msg !== "string") return;
    let data: {
      t?: string;
      intent?: Intent;
      nodeId?: string;
      choice?: "extract" | "keep";
      npcId?: string;
      signId?: string;
    };
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }
    if (data.t === "intent" && data.intent) {
      this.w.intents.set(id, {
        up: !!data.intent.up,
        down: !!data.intent.down,
        left: !!data.intent.left,
        right: !!data.intent.right,
      });
    } else if (data.t === "strike") {
      this.w = applyStrike(this.w, id);
      this.broadcast();
    } else if (data.t === "use" && data.nodeId && (data.choice === "extract" || data.choice === "keep")) {
      this.w = applyUse(this.w, id, data.nodeId, data.choice);
      this.broadcast();
    } else if (data.t === "talk" && data.npcId) {
      this.w = applyTalk(this.w, id, data.npcId);
      this.broadcast();
    } else if (data.t === "bury") {
      this.w = applyBury(this.w, id);
      this.broadcast();
    } else if (data.t === "under") {
      this.w = applyGoingUnder(this.w, id);
      this.broadcast();
    } else if (data.t === "read" && data.signId) {
      this.w = applyRead(this.w, id, data.signId);
      this.broadcast();
    }
  }

  async webSocketClose(ws: WebSocket) {
    const id = this.sessions.get(ws);
    this.sessions.delete(ws);
    if (id) {
      this.w.players.delete(id);
      this.w.intents.delete(id);
    }
  }

  private ensureTick() {
    if (this.ticking) return;
    this.ticking = true;
    this.ctx.setAlarm(Date.now() + 50);
  }

  async alarm() {
    this.w = tickWorld(this.w, DT);
    this.broadcast();
    if (this.w.players.size > 0) this.ctx.setAlarm(Date.now() + 50);
    else this.ticking = false;
  }

  private broadcast() {
    const raw = JSON.stringify(snapshot(this.w));
    for (const ws of this.sessions.keys()) {
      try {
        ws.send(raw);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/ws" || url.pathname === "/world") {
      const id = env.WORLD.idFromName("nave");
      return env.WORLD.get(id).fetch(req);
    }
    return env.ASSETS.fetch(req);
  },
};
