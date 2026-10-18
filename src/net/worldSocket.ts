/**
 * Protocol client. POST /session for the cookie, then one WebSocket to /ws.
 * `hello` sets id/you, `snap` replaces the snapshot. Reconnects with backoff
 * (1 s doubling to 10 s); close code 4001 means the Angel is active in another
 * tab and this one stands down. Every sender emits the exact ClientMsg shape.
 */
import { PROTOCOL_VERSION, type ClientMsg, type FastFrame, type Hello, type ServerMsg, type Snap, type YouView } from "../sim/protocol";
import type { Intent } from "../sim/types";
import { applySlow, mergeFrames, type SlowState } from "../sim/frames";

export type SocketStatus = "connecting" | "online" | "reconnecting" | "elsewhere" | "nocookie" | "stale" | "closed";

export const INTENT_THROTTLE_MS = 250;
export const RECONNECT_MIN_MS = 1000;
export const RECONNECT_MAX_MS = 10000;
export const MOCK_LINK_SIG = "mock";
/** The city sends a frame every 50 ms step: this long with none is a socket gone quiet under an ONLINE chip (a faded
 *  phone signal, a dropped NAT entry), closed here and reconnected rather than left to the OS's TCP timeout. */
export const FRAME_SILENCE_MS = 5000;

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
  /** The slow sections last received (protocol v3); a fast frame merges over them into `snap`. */
  private slow: SlowState = {};
  private lastFast: FastFrame | null = null;
  private lastFrameAt = 0;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  /** The city has handed this page a session at least once. */
  private minted = false;
  /** /session answers in a row, after `minted`, that said the request carried no session: the browser kept none. */
  private unknownStreak = 0;

  /** Monotonic counter bumped on every snapshot, so the scene can tell a new one apart. */
  get seq(): number {
    return this.snapSeq;
  }

  get connected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN && this.status === "online";
  }

  async connect(): Promise<void> {
    if (this.stopped || this.ws) return;
    if (typeof navigator !== "undefined" && navigator.cookieEnabled === false) {
      this.standDownNoCookie();
      return;
    }
    this.setStatus(this.attempts ? "reconnecting" : "connecting");
    try {
      const session = await fetch("/session", { method: "POST", credentials: "same-origin" });
      if (!session.ok) throw new Error("session unavailable");
      if (this.stopped || this.ws) return;
      // Told "new" twice after a session was handed out: the browser is not keeping the cookie, and every socket will be
      // refused. Say so and stop, rather than RECONNECTING forever (round seventy-one). Once is a cleared cookie.
      const known = session.headers?.get?.("X-Session") !== "new";
      if (known) this.unknownStreak = 0;
      else if (this.minted) this.unknownStreak++;
      this.minted = true;
      if (this.unknownStreak >= 2) {
        this.standDownNoCookie();
        return;
      }
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      this.ws = ws;
      this.lastIntentKey = "";
      // A new socket gets a full slow frame after its hello; nothing from the old one is trusted.
      this.slow = {};
      this.lastFast = null;
      ws.onmessage = (ev: MessageEvent) => {
        if (this.ws !== ws) return;
        this.lastFrameAt = Date.now();
        let data: ServerMsg | null = null;
        try {
          data = JSON.parse(String(ev.data)) as ServerMsg;
        } catch {
          return;
        }
        if (!data || typeof data !== "object") return;
        if (data.t === "hello") {
          // A city that speaks another protocol (a deploy while this tab stood open) would be misread frame by frame:
          // this page stands down and asks for a reload instead (the player-defect sweep, round seventy-four).
          if ((data as { v?: unknown }).v !== PROTOCOL_VERSION) {
            this.standDown("stale");
            ws.close();
            return;
          }
          this.id = data.id;
          this.you = data.you;
          this.attempts = 0;
          this.setStatus("online");
          this.watch(ws);
          this.onHello?.(data);
        } else if (data.t === "snap") {
          this.slow = applySlow({}, { ...data, t: "slow" });
          this.publish(data);
        } else if (data.t === "slow") {
          // Held until the fast frame the city sends after it in the same step: published alone, it would merge this step's
          // slow half with the last step's fast half, a body that is neither (a wallet restore's Angel record beside the
          // guest's serial and flag, whose past would play as news; the player-defect sweep, round nine).
          this.slow = applySlow(this.slow, data, this.lastFast ? new Set(this.lastFast.players.map(m => m.id)) : undefined);
        } else if (data.t === "fast") {
          this.lastFast = data;
          this.publish(mergeFrames(this.slow, data));
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

  /** Closes and reconnects a socket the city has stopped hearing from; one interval per socket, cleared with it. */
  private watch(ws: WebSocket): void {
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = setInterval(() => {
      if (this.ws !== ws) {
        if (this.watchdog) clearInterval(this.watchdog);
        this.watchdog = null;
        return;
      }
      if (Date.now() - this.lastFrameAt < FRAME_SILENCE_MS) return;
      // detached first: a half-open socket's close can take as long as the silence did
      this.ws = null;
      this.lastIntentKey = "";
      if (this.watchdog) clearInterval(this.watchdog);
      this.watchdog = null;
      ws.close();
      if (!this.stopped) this.scheduleReconnect();
    }, 1000);
  }

  private publish(snap: Snap): void {
    this.snap = snap;
    this.you = snap.you;
    this.snapSeq++;
    this.onSnap?.(snap);
  }

  /** No cookie, no body: the page stands down with the reason, and reconnects no more until it is reloaded. */
  private standDownNoCookie(): void {
    this.standDown("nocookie");
  }

  /** Stands down for a reason only a reload can mend (no cookie, a city on another protocol): no more reconnects. */
  private standDown(status: "nocookie" | "stale"): void {
    this.stopped = true;
    if (this.retry) clearTimeout(this.retry);
    this.retry = null;
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
    this.setStatus(status);
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

  /**
   * The page shown again, or the network back: a reconnect waiting out its backoff (up to RECONNECT_MAX_MS after a
   * long time away) tries now instead. Nothing happens online, mid-connect, standing down elsewhere, or after disconnect.
   */
  wake(): boolean {
    if (this.stopped || !this.retry) return false;
    clearTimeout(this.retry);
    this.retry = null;
    void this.connect();
    return true;
  }

  /**
   * The player asks for the city back in a tab that stood down (4001): a fresh socket, which the city takes as the
   * newest and so closes the other tab's with 4001 in turn. Only from "elsewhere"; the backoff starts over.
   */
  reclaim(): boolean {
    if (this.stopped || this.status !== "elsewhere" || this.ws) return false;
    this.attempts = 0;
    void this.connect();
    return true;
  }

  disconnect(): void {
    this.stopped = true;
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
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
  /** `node`: the window the press was made against, so a second press after the server moved on picks nothing unseen. */
  choose(choiceId: string, node?: string): boolean {
    return this.send(node === undefined ? { t: "choose", choiceId } : { t: "choose", choiceId, node });
  }
  close(node?: string): boolean {
    return this.send(node === undefined ? { t: "close" } : { t: "close", node });
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
