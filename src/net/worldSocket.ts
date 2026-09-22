import type { Clerk, FailedPassing, HistoryMark, HouseWar, Npc, Passing, Poi, Rite, Sign } from "../sim/campaign";
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
  careOpen: boolean;
  frozen: boolean;
  passing: Passing;
  tax: number;
  history: HistoryMark[];
  failed: FailedPassing[];
  clearingOpen: boolean;
  m3Open: boolean;
  forgedSold: boolean;
  ioneGone: boolean;
  announced: string | null;
  war: HouseWar;
  stallDark?: boolean;
  vesperAtFoundry?: boolean;
  foundryDark?: boolean;
  annexHome?: boolean;
  hallLamp?: boolean;
  standing?: { earth: number; sky: number; mortals: number; divinities: number };
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

  care() {
    this.send({ t: "care" });
  }

  desk(choice: "file" | "take") {
    this.send({ t: "desk", choice });
  }

  restore() {
    this.send({ t: "restore" });
  }

  insure() {
    this.send({ t: "insure" });
  }

  repair() {
    this.send({ t: "repair" });
  }

  clockOut() {
    this.send({ t: "clock" });
  }

  operator(choice: "hear" | "take" | "refuse") {
    this.send({ t: "operator", choice });
  }

  forge(choice: "hear" | "spot" | "sell") {
    this.send({ t: "forge", choice });
  }

  m3() {
    this.send({ t: "m3" });
  }

  watch() {
    this.send({ t: "watch" });
  }

  clearing(choice: "keep" | "extract" | "pass") {
    this.send({ t: "clearing", choice });
  }

  announce(nodeId: string) {
    this.send({ t: "announce", nodeId });
  }

  private send(msg: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }
}
