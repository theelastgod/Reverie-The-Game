import { DT, Intent, Player, spawnGuest, stepPlayer } from "../../src/sim/world.ts";

export { spawnGuest, stepPlayer, guestCanClaim } from "../../src/sim/world.ts";

type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  WORLD: DurableObjectNamespace;
};

export class ReverieWorld {
  private players = new Map<string, Player>();
  private intents = new Map<string, Intent>();
  private sessions = new Set<WebSocket>();
  private ticking = false;

  constructor(
    private readonly ctx: DurableObjectState,
    _env: Env,
  ) {}

  async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("world", { status: 200 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    this.sessions.add(server);
    const id = crypto.randomUUID();
    const guest = spawnGuest(id);
    this.players.set(id, guest);
    this.intents.set(id, { up: false, down: false, left: false, right: false });
    server.serializeAttachment({ id });
    server.send(JSON.stringify({ t: "hello", id, guest: true, you: guest }));
    this.ensureTick();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    const att = ws.deserializeAttachment() as { id: string } | null;
    if (!att) return;
    if (typeof msg !== "string") return;
    let data: { t?: string; intent?: Intent };
    try {
      data = JSON.parse(msg) as { t?: string; intent?: Intent };
    } catch {
      return;
    }
    if (data.t === "intent" && data.intent) {
      this.intents.set(att.id, {
        up: !!data.intent.up,
        down: !!data.intent.down,
        left: !!data.intent.left,
        right: !!data.intent.right,
      });
    }
  }

  async webSocketClose(ws: WebSocket) {
    const att = ws.deserializeAttachment() as { id: string } | null;
    this.sessions.delete(ws);
    if (att) {
      this.players.delete(att.id);
      this.intents.delete(att.id);
    }
  }

  private ensureTick() {
    if (this.ticking) return;
    this.ticking = true;
    this.ctx.setAlarm(Date.now() + 50);
  }

  async alarm() {
    for (const [id, p] of this.players) {
      const intent = this.intents.get(id) ?? { up: false, down: false, left: false, right: false };
      this.players.set(id, stepPlayer(p, intent, DT));
    }
    const snap = { t: "snap", players: [...this.players.values()] };
    const raw = JSON.stringify(snap);
    for (const ws of this.sessions) {
      try {
        ws.send(raw);
      } catch {
        this.sessions.delete(ws);
      }
    }
    if (this.players.size > 0) this.ctx.setAlarm(Date.now() + 50);
    else this.ticking = false;
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
