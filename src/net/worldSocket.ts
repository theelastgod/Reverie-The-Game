/**
 * Protocol client. POST /session for the cookie, then one WebSocket to /ws.
 * `hello` sets id/you, `snap` replaces the snapshot. Reconnects with backoff
 * (1 s doubling to 10 s); close code 4001 means the Angel is active in another
 * tab and this one stands down. Every sender emits the exact ClientMsg shape.
 */
import type { ClientMsg, Hello, ServerMsg, Snap, YouView } from "../sim/protocol";
import type { Intent } from "../sim/types";

export type SocketStatus = "connecting" | "online" | "reconnecting" | "elsewhere" | "closed";

export const INTENT_THROTTLE_MS = 250;
export const RECONNECT_MIN_MS = 1000;
export const RECONNECT_MAX_MS = 10000;
export const MOCK_LINK_SIG = "mock";

const IDLE: Intent = { up: false, down: false, left: false, right: false };

export class WorldSocket {
  id: string | null = null;
  you: YouView | null = null;
  snap: Snap | null = null;
  status: SocketStatus = "connecting";

  /** Hooks for the scene; all optional. */
  onHello: ((hello: Hello) => void) | null = null;
  onSnap: ((snap: Snap) => void) | null = null;
  onStatus: ((status: SocketStatus) => void) | null = null;

  private ws: WebSocket | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private stopped = false;
  private lastIntentKey = "";
  private lastIntentAt = -Infinity;
  private snapSeq = 0;

  /** Monotonic counter bumped on every snapshot, so the scene can tell a new one apart. */
  get seq(): number {
    return this.snapSeq;
  }

  get connected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN && this.status === "online";
  }

  async connect(): Promise<void> {
    if (this.stopped || this.ws) return;
    this.setStatus(this.attempts ? "reconnecting" : "connecting");
    try {
      const session = await fetch("/session", { method: "POST", credentials: "same-origin" });
      if (!session.ok) throw new Error("session unavailable");
      if (this.stopped || this.ws) return;
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      this.ws = ws;
      this.lastIntentKey = "";
      ws.onmessage = (ev: MessageEvent) => {
        if (this.ws !== ws) return;
        let data: ServerMsg | null = null;
        try {
          data = JSON.parse(String(ev.data)) as ServerMsg;
        } catch {
          return;
        }
        if (!data || typeof data !== "object") return;
        if (data.t === "hello") {
          this.id = data.id;
          this.you = data.you;
          this.attempts = 0;
          this.setStatus("online");
          this.onHello?.(data);
        } else if (data.t === "snap") {
          this.snap = data;
          this.you = data.you;
          this.snapSeq++;
          this.onSnap?.(data);
        }
      };
      ws.onerror = () => {
        if (this.ws === ws) ws.close();
      };
      ws.onclose = (event: CloseEvent) => {
        if (this.ws !== ws) return;
        this.ws = null;
        this.lastIntentKey = "";
        if (event.code === 4001) {
          this.setStatus("elsewhere");
          return;
        }
        if (this.stopped) return;
        this.scheduleReconnect();
      };
    } catch {
      if (!this.stopped) this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.retry) return;
    this.setStatus("reconnecting");
    const delay = Math.min(RECONNECT_MIN_MS * 2 ** this.attempts, RECONNECT_MAX_MS);
    this.attempts++;
    this.retry = setTimeout(() => {
      this.retry = null;
      void this.connect();
    }, delay);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.retry) clearTimeout(this.retry);
    this.retry = null;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.setStatus("closed");
  }

  private setStatus(status: SocketStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.onStatus?.(status);
  }

  // ------------------------------------------------------------ senders

  /** Throttled to INTENT_THROTTLE_MS unless the direction changed. */
  sendIntent(intent: Intent = IDLE, now: number = Date.now()): boolean {
    const key = (intent.up ? "u" : "") + (intent.down ? "d" : "") + (intent.left ? "l" : "") + (intent.right ? "r" : "");
    if (key === this.lastIntentKey && now - this.lastIntentAt < INTENT_THROTTLE_MS) return false;
    const sent = this.send({ t: "intent", intent: { up: !!intent.up, down: !!intent.down, left: !!intent.left, right: !!intent.right } });
    if (sent) {
      this.lastIntentKey = key;
      this.lastIntentAt = now;
    }
    return sent;
  }

  dodge(dx: number, dy: number): boolean {
    return this.send({ t: "dodge", dx: Math.sign(dx), dy: Math.sign(dy) });
  }
  strike(): boolean {
    return this.send({ t: "strike" });
  }
  heavy(): boolean {
    return this.send({ t: "heavy" });
  }
  stance(): boolean {
    return this.send({ t: "stance" });
  }
  kit(targetId?: string): boolean {
    return this.send(targetId ? { t: "kit", targetId } : { t: "kit" });
  }
  interact(targetId: string, choice: string): boolean {
    return this.send({ t: "interact", targetId, choice });
  }
  talk(npcId: string): boolean {
    return this.send({ t: "talk", npcId });
  }
  choose(choiceId: string): boolean {
    return this.send({ t: "choose", choiceId });
  }
  close(): boolean {
    return this.send({ t: "close" });
  }
  link(serial: number, sig: string = MOCK_LINK_SIG): boolean {
    return this.send({ t: "link", serial, sig });
  }
  flag(): boolean {
    return this.send({ t: "flag" });
  }
  truce(): boolean {
    return this.send({ t: "truce" });
  }
  use(itemId: string): boolean {
    return this.send({ t: "use", itemId });
  }
  market(op: "list" | "buy" | "cancel", args: { itemId?: string; listingId?: string; price?: number } = {}): boolean {
    const msg: ClientMsg = { t: "market", op };
    if (args.itemId !== undefined) msg.itemId = args.itemId;
    if (args.listingId !== undefined) msg.listingId = args.listingId;
    if (args.price !== undefined) msg.price = args.price;
    return this.send(msg);
  }

  private send(msg: ClientMsg): boolean {
    if (!this.connected || !this.ws) return false;
    this.ws.send(JSON.stringify(msg));
    return true;
  }
}
