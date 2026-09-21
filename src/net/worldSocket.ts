import type { Clerk, Npc, Poi, Rite, Sign } from "../sim/campaign";
import type { Intent, Player, Wreckage } from "../sim/world";
import type { YieldNode } from "../sim/nave";

export type Snap = {
  t: "snap";
  now: number;
  gestell: number;
  players: Player[];
  nodes: YieldNode[];
  wreckage: Wreckage[];
  rites: Rite[];
  clerks: Clerk[];
  npcs: Npc[];
  signs: Sign[];
  pois: Poi[];
  weatherNamed: boolean;
};

export type Hello = { t: "hello"; id: string; guest: boolean; you: Player };

export class WorldSocket {
  ws: WebSocket | null = null;
  id: string | null = null;
  snap: Snap | null = null;
  you: Player | null = null;
  lastIntent = "";

  connect() {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${location.host}/ws`;
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onmessage = (ev) => {
      const data = JSON.parse(String(ev.data)) as Hello | Snap;
      if (data.t === "hello") {
        this.id = data.id;
        this.you = data.you;
      } else if (data.t === "snap") {
        this.snap = data;
        if (this.id) this.you = data.players.find((p) => p.id === this.id) ?? this.you;
      }
    };
  }

  sendIntent(intent: Intent) {
    const key = `${+intent.up}${+intent.down}${+intent.left}${+intent.right}`;
    if (key === this.lastIntent) return;
    this.lastIntent = key;
    this.send({ t: "intent", intent });
  }

  strike() {
    this.send({ t: "strike" });
  }

  use(nodeId: string, choice: "extract" | "keep") {
    this.send({ t: "use", nodeId, choice });
  }

  talk(npcId: string) {
    this.send({ t: "talk", npcId });
  }

  bury() {
    this.send({ t: "bury" });
  }

  goingUnder() {
    this.send({ t: "under" });
  }

  read(signId: string) {
    this.send({ t: "read", signId });
  }

  link(serial: number) {
    this.send({ t: "link", serial, sig: "mock" });
  }

  private send(msg: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }
}
