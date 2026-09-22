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
  peopleHeld?: boolean;
  announced: string | null;
  war: HouseWar;
  stallDark?: boolean;
  wetCult?: boolean;
  vesperAtFoundry?: boolean;
  foundryDark?: boolean;
  annexHome?: boolean;
  straitRefused?: boolean;
  ordAtStrait?: boolean;
  straitBuried?: boolean;
  cableDark?: boolean;
  skyStanding?: boolean;
  earthStanding?: boolean;
  divStanding?: boolean;
  hallLamp?: boolean;
  fourfoldHeld?: boolean;
  lastGodNamed?: boolean;
  ordAtCare?: boolean;
  naraAtCare?: boolean;
  lastGodBuried?: boolean;
  quillNoPrint?: boolean;
  restraintHeld?: boolean;
  vesperNoGod?: boolean;
  deskVaulted?: boolean;
  appearSlow?: boolean;
  appearWorld?: boolean;
  creditsHeld?: boolean;
  seasonHeld?: boolean;
  winkBlindHeld?: boolean;
  naraAtClearing?: boolean;
  hijacked?: boolean;
  hijackBy?: "" | "safety" | "cold";
  ordAtHijack?: boolean;
  vesperAtHijack?: boolean;
  clearingFailed?: boolean;
  stormHeld?: boolean;
  blitzHeld?: boolean;
  ruinBackHeld?: boolean;
  arenaHeld?: boolean;
  screeningHeld?: boolean;
  participantHeld?: boolean;
  founderHeld?: boolean;
  logHeld?: boolean;
  stillHeld?: boolean;
  bracketHeld?: boolean;
  bountyHeld?: boolean;
  stormPressHeld?: boolean;
  winkSeedHeld?: boolean;
  blitzMarks?: { id: string; x: number; y: number; fromName: string }[];
  cyberHeld?: boolean;
  glamourHeld?: boolean;
  dwellHeld?: boolean;
  naraGone?: boolean;
  naraPersonHeld?: boolean;
  quillPersonHeld?: boolean;
  ordPersonHeld?: boolean;
  hitStopHeld?: boolean;
  addressedHeld?: boolean;
  partyHeld?: boolean;
  partedHeld?: boolean;
  heavyHeld?: boolean;
  truceHeld?: boolean;
  handoffHeld?: boolean;
  carePeopleHeld?: boolean;
  vesperPersonHeld?: boolean;
  ordGone?: boolean;
  quillGone?: boolean;
  vesperGone?: boolean;
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

  heavy() {
    this.send({ t: "heavy" });
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

  desk(choice: "file" | "take" | "bank") {
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

  blitz() {
    this.send({ t: "blitz" });
  }

  ruinBack() {
    this.send({ t: "ruinBack" });
  }

  party() {
    this.send({ t: "party" });
  }

  truce() {
    this.send({ t: "truce" });
  }

  cyber(nodeId: string) {
    this.send({ t: "cyber", nodeId });
  }

  dwell(nodeId: string) {
    this.send({ t: "dwell", nodeId });
  }

  private send(msg: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }
}
