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
  shrinePeopleHeld?: boolean;
  safetyPeopleHeld?: boolean;
  deskPeopleHeld?: boolean;
  hallPeopleHeld?: boolean;
  clearingPeopleHeld?: boolean;
  wetPeopleHeld?: boolean;
  stallPeopleHeld?: boolean;
  foundryPeopleHeld?: boolean;
  straitPeopleHeld?: boolean;
  cablePeopleHeld?: boolean;
  organsPeopleHeld?: boolean;
  vesperPeopleHeld?: boolean;
  m3PeopleHeld?: boolean;
  screeningPeopleHeld?: boolean;
  annexPeopleHeld?: boolean;
  arenaPeopleHeld?: boolean;
  underPeopleHeld?: boolean;
  gardenPeopleHeld?: boolean;
  burialPeopleHeld?: boolean;
  weatherPeopleHeld?: boolean;
  navePeopleHeld?: boolean;
  creditsPeopleHeld?: boolean;
  stillPeopleHeld?: boolean;
  seasonPeopleHeld?: boolean;
  bracketPeopleHeld?: boolean;
  logPeopleHeld?: boolean;
  founderPeopleHeld?: boolean;
  roomsPeopleHeld?: boolean;
  stormPeopleHeld?: boolean;
  bountyPeopleHeld?: boolean;
  flagPeopleHeld?: boolean;
  trucePeopleHeld?: boolean;
  handoffPeopleHeld?: boolean;
  vaultPeopleHeld?: boolean;
  insurancePeopleHeld?: boolean;
  funeralPeopleHeld?: boolean;
  restorePeopleHeld?: boolean;
  keepPeopleHeld?: boolean;
  tithePeopleHeld?: boolean;
  freezePeopleHeld?: boolean;
  repairPeopleHeld?: boolean;
  listingPeopleHeld?: boolean;
  marketPeopleHeld?: boolean;
  hangPeopleHeld?: boolean;
  restraintPeopleHeld?: boolean;
  dodgePeopleHeld?: boolean;
  heavyPeopleHeld?: boolean;
  hitStopPeopleHeld?: boolean;
  spectatePeopleHeld?: boolean;
  lastWordPeopleHeld?: boolean;
  duelPeopleHeld?: boolean;
  campPeopleHeld?: boolean;
  passingPeopleHeld?: boolean;
  claimsPeopleHeld?: boolean;
  filePeopleHeld?: boolean;
  takePeopleHeld?: boolean;
  bankPeopleHeld?: boolean;
  stormPressPeopleHeld?: boolean;
  fallenPeopleHeld?: boolean;
  spoilsPeopleHeld?: boolean;
  unflagPeopleHeld?: boolean;
  secondsPeopleHeld?: boolean;
  streetPeopleHeld?: boolean;
  griefPeopleHeld?: boolean;
  kitPeopleHeld?: boolean;
  practicePeopleHeld?: boolean;
  dummyPeopleHeld?: boolean;
  gearedPeopleHeld?: boolean;
  serialPeopleHeld?: boolean;
  bandPeopleHeld?: boolean;
  numberPeopleHeld?: boolean;
  skillPeopleHeld?: boolean;
  traitPeopleHeld?: boolean;
  tokenPeopleHeld?: boolean;
  fairPeopleHeld?: boolean;
  visiblePeopleHeld?: boolean;
  auraPeopleHeld?: boolean;
  presencePeopleHeld?: boolean;
  winkPeopleHeld?: boolean;
  bestandPeopleHeld?: boolean;
  cultPeopleHeld?: boolean;
  copyPeopleHeld?: boolean;
  bankedPeopleHeld?: boolean;
  unbankedPeopleHeld?: boolean;
  sinkPeopleHeld?: boolean;
  yieldPeopleHeld?: boolean;
  taxPeopleHeld?: boolean;
  gestellPeopleHeld?: boolean;
  climatePeopleHeld?: boolean;
  extractPeopleHeld?: boolean;
  maxPeopleHeld?: boolean;
  heatPeopleHeld?: boolean;
  fatPeopleHeld?: boolean;
  poorPeopleHeld?: boolean;
  blockPeopleHeld?: boolean;
  soloPeopleHeld?: boolean;
  dwellPeopleHeld?: boolean;
  tracePeopleHeld?: boolean;
  failPeopleHeld?: boolean;
  holePeopleHeld?: boolean;
  stipendPeopleHeld?: boolean;
  hijackPeopleHeld?: boolean;
  absencePeopleHeld?: boolean;
  waitPeopleHeld?: boolean;
  stayPeopleHeld?: boolean;
  willingPeopleHeld?: boolean;
  emptyPeopleHeld?: boolean;
  walkedPeopleHeld?: boolean;
  leavePeopleHeld?: boolean;
  keptPeopleHeld?: boolean;
  holdPeopleHeld?: boolean;
  cappedPeopleHeld?: boolean;
  prayerPeopleHeld?: boolean;
  soldPeopleHeld?: boolean;
  unlitPeopleHeld?: boolean;
  livePeopleHeld?: boolean;
  blindPeopleHeld?: boolean;
  hourPeopleHeld?: boolean;
  namesPeopleHeld?: boolean;
  residualPeopleHeld?: boolean;
  equalPeopleHeld?: boolean;
  addressedPeopleHeld?: boolean;
  backPeopleHeld?: boolean;
  seedPeopleHeld?: boolean;
  invitePeopleHeld?: boolean;
  partedPeopleHeld?: boolean;
  togetherPeopleHeld?: boolean;
  gatherPeopleHeld?: boolean;
  clinicPeopleHeld?: boolean;
  paperPeopleHeld?: boolean;
  framePeopleHeld?: boolean;
  observerPeopleHeld?: boolean;
  participantPeopleHeld?: boolean;
  proximityPeopleHeld?: boolean;
  enterPeopleHeld?: boolean;
  refusePeopleHeld?: boolean;
  collectivePeopleHeld?: boolean;
  studiosPeopleHeld?: boolean;
  filmPeopleHeld?: boolean;
  directorPeopleHeld?: boolean;
  disarmedPeopleHeld?: boolean;
  guestPeopleHeld?: boolean;
  supplyPeopleHeld?: boolean;
  combatPeopleHeld?: boolean;
  earnPeopleHeld?: boolean;
  angelPeopleHeld?: boolean;
  messengerPeopleHeld?: boolean;
  linkPeopleHeld?: boolean;
  perceptionPeopleHeld?: boolean;
  verbPeopleHeld?: boolean;
  stylePeopleHeld?: boolean;
  schoolPeopleHeld?: boolean;
  optionalPeopleHeld?: boolean;
  personalPeopleHeld?: boolean;
  variantPeopleHeld?: boolean;
  objectivePeopleHeld?: boolean;
  questPeopleHeld?: boolean;
  spokenPeopleHeld?: boolean;
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
  status: "connecting" | "online" | "reconnecting" | "elsewhere" | "closed" = "connecting";
  private retry: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private stopped = false;
  private sentAt = 0;

  async connect() {
    if (this.stopped || this.ws) return;
    try {
      const session = await fetch("/session", { method: "POST", credentials: "same-origin" });
      if (!session.ok) throw new Error("Session unavailable");
      if (this.stopped) return;
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      this.ws = ws;
      this.lastIntent = "";
      ws.onmessage = (ev) => {
        if (this.ws !== ws) return;
        let data: Hello | Snap;
        try { data = JSON.parse(String(ev.data)); } catch { return; }
        if (!data) return;
        if (data.t === "hello") {
          this.id = data.id;
          this.you = data.you;
          this.status = "online";
          this.attempts = 0;
        } else if (data.t === "snap") {
          this.snap = data;
          if (this.id) this.you = data.players.find((p) => p.id === this.id) ?? this.you;
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = (event) => {
        if (this.ws !== ws) return;
        this.ws = null;
        this.lastIntent = "";
        if (event.code === 4001) {
          this.status = "elsewhere";
          return;
        }
        this.reconnect();
      };
    } catch {
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.stopped || this.retry) return;
    this.status = "reconnecting";
    const delay = Math.min(1000 * 2 ** this.attempts++, 10000);
    this.retry = setTimeout(() => {
      this.retry = null;
      void this.connect();
    }, delay);
  }

  disconnect() {
    this.stopped = true;
    this.status = "closed";
    if (this.retry) clearTimeout(this.retry);
    this.retry = null;
    this.ws?.close();
    this.ws = null;
  }

  sendIntent(intent: Intent) {
    const key = `${+intent.up}${+intent.down}${+intent.left}${+intent.right}`;
    const now = Date.now();
    if (key === this.lastIntent && now - this.sentAt < 250) return;
    if (this.send({ t: "intent", intent })) {
      this.lastIntent = key;
      this.sentAt = now;
    }
  }

  dodge(dx: number, dy: number) {
    this.send({ t: "dodge", dx, dy });
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

  flag() {
    this.send({ t: "flag" });
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
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.status !== "online") return false;
    this.ws.send(JSON.stringify(msg));
    return true;
  }
}
