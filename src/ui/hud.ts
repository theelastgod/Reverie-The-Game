/**
 * The DOM HUD over the canvas. Renders the Snap and reports clicks; it never
 * computes a number that matters. update() diffs against the last snapshot
 * and touches the DOM only on change.
 */
import type { Snap } from "../sim/protocol";
import { weatherBand } from "../sim/protocol";
import type { Notice, Prompt } from "../sim/types";
import { AURA_MAX, GESTELL_MELTDOWN, MAX_HP, NOTICE_KEEP, NOTICE_TTL, READINESS_MAX, RESTRAINT_MAX, STORM_RESTRAINT_BURN } from "../sim/constants";
import { F } from "../sim/content/ids";
import { CREDITS } from "../sim/content/lines";
import {
  auraTier, chipVerbs, districtFourfold, districtName, dodgeLine, heardStep, identityLine, joinNews, kitLine, ledgerLine, lockStep, marqueeSeconds, noticeDiff, num, pct,
  restraintBar, setAttr, setClass, setText, show, stanceLine, statusLine, weatherLine, creditRows,
} from "./format";
import { mountDialogue, type DialoguePanel } from "./dialogue";
import { mountJournal, type JournalPanel } from "./journal";
import { mountMinimap, type MinimapPanel } from "./minimap";
import { mountLock, type LockPanel } from "./lock";
import { focusKeeper, type FocusKeeper } from "./focus";
import type { WalletOutcome } from "../net/wallet";
import { audio } from "../audio/bus";
import { eventRows, mountEvents, type EventsPanel } from "./events";
import { ledgerModel, mountLedger, type LedgerPanel } from "./ledger";
import { gen } from "../assets/gen";
import { badgeFor, sealFor } from "../assets/slots";
import { paperToUse, pointerReleasesFocus } from "./keys";

export type HudCallbacks = {
  choose: (choiceId: string) => void; // dialogue choice clicked
  close: () => void; // dialogue closed / Esc
  link: (serial: number) => void; // mock Angel link from the lock panel or the title
  wallet: () => Promise<WalletOutcome>; // the wallet handshake; the lock panel shows the outcome line
  interact: (targetId: string, choice: string) => void; // prompt verb clicked (touch/mouse)
  stance: () => void; kit: () => void; flag: () => void; truce: () => void; use: () => void;
  dodge: () => void; // the dodge chip pressed (a finger has no Shift): the way the stick points, else the facing
  market: (op: "list" | "buy" | "cancel", args: { itemId?: string; listingId?: string; price?: number }) => void;
};

export type HudStatus = "connecting" | "online" | "reconnecting" | "elsewhere" | "closed";
export type NoticeTone = Notice["tone"];

const HEARD_MS = 6000;
const WINK_MS = 8000;
const FADE_MS = 900;
const STATUSES: HudStatus[] = ["connecting", "online", "reconnecting", "elsewhere", "closed"];

type LocalNotice = { text: string; tone: NoticeTone; expires: number };

function q<T extends HTMLElement>(root: ParentNode, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export class Hud {
  private readonly root: HTMLElement;
  private readonly cb: HudCallbacks;
  private last: Snap | null = null;

  // panels
  private readonly dialogue: DialoguePanel;
  private readonly journal: JournalPanel;
  private readonly minimap: MinimapPanel;
  private readonly lock: LockPanel;
  private readonly events: EventsPanel;
  private readonly ledger: LedgerPanel;
  private ledgerAuto = false;
  private ledgerDismissed = ""; // the desk or board the ledger was closed at by hand
  /** A pointer press on a HUD button gives the keys back to the game (keys.ts pointerReleasesFocus). */
  private readonly onPointerClick = (ev: MouseEvent): void => {
    if (!pointerReleasesFocus(ev.detail)) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== this.root && this.root.contains(active) && active.matches("button")) active.blur();
  };

  // elements
  private readonly identity: HTMLElement | null;
  private readonly identityText: HTMLElement | null;
  private readonly identityTags: HTMLElement | null;
  private readonly district: HTMLElement | null;
  private readonly districtText: HTMLElement | null;
  private readonly districtSmall: HTMLElement | null;
  private readonly weather: HTMLElement | null;
  private readonly weatherText: HTMLElement | null;
  private readonly weatherGestell: HTMLElement | null;
  private readonly weatherTags: HTMLElement | null;
  private readonly ledgerText: HTMLElement | null;
  private readonly bars: Record<"hp" | "aura" | "restraint" | "readiness", { row: HTMLElement | null; fill: HTMLElement | null; value: HTMLElement | null; label: HTMLElement | null }>;
  private readonly stance: HTMLButtonElement | null;
  private readonly stanceText: HTMLElement | null;
  private readonly stanceHint: HTMLElement;
  private readonly kit: HTMLButtonElement | null;
  private readonly kitText: HTMLElement | null;
  /** Generated House seal and messenger badge; hidden until the manifest has them. */
  private readonly identitySeal: HTMLImageElement;
  private readonly kitBadge: HTMLImageElement;
  private readonly dodge: HTMLElement | null;
  private readonly useChip: HTMLButtonElement | null;
  private readonly flagChip: HTMLButtonElement | null;
  private readonly dodgeText: HTMLElement | null;
  private readonly stick: HTMLElement | null;
  private readonly stickKnob: HTMLElement | null;
  /** A coarse pointer (a finger): the dodge chip is the button and says only what it does. */
  private readonly touch: boolean;
  private readonly prompt: HTMLElement | null;
  private readonly promptName: HTMLElement | null;
  private readonly promptVerbs: HTMLElement | null;
  private readonly heard: HTMLElement | null;
  private readonly wink: HTMLElement | null;
  private readonly winkText: HTMLElement | null;
  private readonly notices: HTMLElement | null;
  private readonly marquee: HTMLElement | null;
  private readonly marqueeTrack: HTMLElement | null;
  private readonly connection: HTMLElement | null;
  private readonly credits: HTMLElement | null;
  private readonly creditsFocus: FocusKeeper;
  private readonly audioChip: HTMLButtonElement | null;
  private readonly loading: HTMLElement | null;
  private readonly loadingText: HTMLElement | null;
  private readonly loadingPct: HTMLElement | null;

  // caches for diffing
  private identitySig = "";
  private districtSig = "";
  private weatherSig = "";
  private ledgerSig = "";
  private barSig = "";
  private stanceSig = "";
  private kitSig = "";
  private dodgeSig = "";
  private promptSig = "";
  private promptTarget = "";
  private heardAt = -1;
  private heardHeld = false;
  private winkAt = -1;
  private noticeSig = "";
  private marqueeText = "";
  private status: HudStatus | "" = "";
  private creditsSeen = false;
  private locals: LocalNotice[] = [];

  // timers
  private heardTimer = 0;
  private heardFade = 0;
  private winkTimer = 0;
  private winkFade = 0;
  private noticeTimer = 0;
  private statusTimer = 0;

  constructor(root: HTMLElement, callbacks: HudCallbacks) {
    this.root = root;
    this.cb = callbacks;
    root.addEventListener("click", this.onPointerClick);
    // A phone seats the minimap and the journal's tab under the top chips (hud.css, --below-top), and the chips wrap:
    // measure where they end, so a fourth row (a long name, a weather chip) moves everything under them down.
    const top = q(root, "#hud-top");
    if (top && typeof ResizeObserver !== "undefined") {
      const below = () => {
        const bottom = top.getBoundingClientRect().bottom;
        if (bottom > 0) root.style.setProperty("--below-top", `${Math.ceil(bottom) + 12}px`);
      };
      new ResizeObserver(below).observe(top);
    }

    this.identity = q(root, "#hud-identity");
    this.identityText = this.identity ? q(this.identity, ".chip-text") : null;
    this.identityTags = this.identity ? q(this.identity, ".chip-tags") : null;
    this.district = q(root, "#hud-district");
    this.districtText = this.district ? q(this.district, ".chip-text") : null;
    this.districtSmall = this.district ? q(this.district, ".chip-small") : null;
    this.weather = q(root, "#hud-weather");
    this.weatherText = this.weather ? q(this.weather, ".chip-text") : null;
    this.weatherGestell = this.weather ? q(this.weather, ".chip-gestell") : null;
    this.weatherTags = this.weather ? q(this.weather, ".chip-tags") : null;
    const ledger = q(root, "#hud-ledger");
    this.ledgerText = ledger ? q(ledger, ".chip-text") : null;

    const bar = (name: "hp" | "aura" | "restraint" | "readiness") => {
      const row = q<HTMLElement>(root, `#hud-bars .bar[data-bar="${name}"]`);
      return {
        row,
        fill: row ? q<HTMLElement>(row, ".bar-fill") : null,
        value: row ? q<HTMLElement>(row, ".bar-value") : null,
        label: row ? q<HTMLElement>(row, ".bar-label") : null,
      };
    };
    this.bars = { hp: bar("hp"), aura: bar("aura"), restraint: bar("restraint"), readiness: bar("readiness") };

    this.stance = q<HTMLButtonElement>(root, "#hud-stance");
    this.stanceText = this.stance ? q(this.stance, ".chip-text") : null;
    this.stanceHint = document.createElement("span");
    this.stanceHint.className = "chip-hint";
    this.stance?.append(this.stanceHint);
    this.kit = q<HTMLButtonElement>(root, "#hud-kit");
    this.kitText = this.kit ? q(this.kit, ".chip-text") : null;
    this.identitySeal = document.createElement("img");
    this.identitySeal.className = "chip-seal";
    this.identitySeal.alt = "";
    this.identitySeal.hidden = true;
    (this.identity?.querySelector(".chip-icon") ?? null)?.after(this.identitySeal);
    this.kitBadge = document.createElement("img");
    this.kitBadge.className = "chip-badge";
    this.kitBadge.alt = "";
    this.kitBadge.hidden = true;
    this.kitText?.before(this.kitBadge);
    this.useChip = q<HTMLButtonElement>(root, "#hud-use");
    this.flagChip = q<HTMLButtonElement>(root, "#hud-flag");
    this.dodge = q(root, "#hud-dodge");
    this.dodgeText = this.dodge ? q(this.dodge, ".chip-text") : null;
    this.stick = q(root, "#hud-stick");
    this.stickKnob = this.stick ? q(this.stick, ".stick-knob") : null;
    this.touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    this.prompt = q(root, "#hud-prompt");
    this.promptName = this.prompt ? q(this.prompt, ".prompt-name") : null;
    this.promptVerbs = this.prompt ? q(this.prompt, ".prompt-verbs") : null;
    this.heard = q(root, "#hud-heard");
    this.wink = q(root, "#hud-wink");
    this.winkText = this.wink ? q(this.wink, ".wink-text") : null;
    this.notices = q(root, "#hud-notices");
    this.marquee = q(root, "#hud-marquee");
    this.marqueeTrack = this.marquee ? q(this.marquee, ".marquee-track") : null;
    this.connection = q(root, "#hud-connection");
    this.credits = q(root, "#hud-credits");
    const roll = this.credits ? q(this.credits, ".credits-roll") : null;
    if (roll) {
      for (const row of creditRows(CREDITS)) {
        const line = document.createElement("div");
        line.className = row.title ? "credits-line" : "credits-line credits-prose";
        line.textContent = row.text;
        roll.append(line);
      }
    }
    this.creditsFocus = focusKeeper(this.credits, root);
    this.audioChip = q(root, "#hud-audio");
    this.loading = q(root, "#hud-loading");
    this.loadingText = this.loading ? q(this.loading, ".chip-text") : null;
    this.loadingPct = this.loading ? q(this.loading, ".loading-pct") : null;

    this.dialogue = mountDialogue(root, { choose: id => this.cb.choose(id), close: () => this.cb.close() });
    this.journal = mountJournal(root);
    this.minimap = mountMinimap(root);
    this.lock = mountLock(root, serial => this.cb.link(serial), () => this.cb.wallet());
    this.events = mountEvents(q(root, "#hud-events"));
    this.ledger = mountLedger(q(root, "#hud-ledger-panel"), { market: (op, args) => this.cb.market(op, args) });

    this.stance?.addEventListener("click", this.onStance);
    this.kit?.addEventListener("click", this.onKit);
    this.dodge?.addEventListener("click", this.onDodge);
    this.useChip?.addEventListener("click", this.onUse);
    this.flagChip?.addEventListener("click", this.onFlag);
    this.promptVerbs?.addEventListener("click", this.onVerb);
    this.credits?.addEventListener("click", this.onCredits);
    this.credits?.addEventListener("keydown", this.onCreditsKey);
    this.audioChip?.addEventListener("click", this.onAudio);
    audio.onChange = () => this.syncAudio();
    this.syncAudio();

    this.setStatus("connecting");
  }

  // ---------------------------------------------------------------- public

  setStatus(status: HudStatus): void {
    if (!this.connection || this.status === status) return;
    if (!STATUSES.includes(status)) return;
    for (const s of STATUSES) setClass(this.connection, s, s === status);
    this.status = status;
    setText(this.connection, statusLine(status));
    show(this.connection, true);
    window.clearTimeout(this.statusTimer);
    if (status === "online") {
      // "ONLINE" is shown, then fades; every other state stays.
      this.connection.classList.remove("online");
      this.statusTimer = window.setTimeout(() => { if (this.status === "online") this.connection?.classList.add("online"); }, 1500);
    }
  }

  setLoading(text: string, progress?: number): void {
    if (!this.loading) return;
    const done = progress !== undefined && progress >= 1;
    show(this.loading, !done);
    setText(this.loadingText, (text || "LOADING").toUpperCase());
    setText(this.loadingPct, progress === undefined ? "" : `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`);
  }

  update(snap: Snap): void {
    const you = snap.you;
    const last = this.last;
    if (!last) show(this.loading, false);

    this.updateIdentity(snap);
    this.updateDistrict(snap);
    this.updateWeather(snap);
    this.updateLedger(snap);
    this.updateBars(snap);
    this.updateStance(snap);
    this.updateKit(snap);
    this.updateDodge(snap);
    this.updateChipVerbs(snap);
    this.updatePrompt(snap.prompt);
    this.updateHeard(snap);
    this.updateWink(snap);
    this.updateNotices(snap.notices);
    this.updateMarquee(snap.news);
    this.updateLock(snap);
    this.updateCredits(snap);
    this.events.set(eventRows(snap));
    // the panel (the chip is updateLedger, above): it opens itself at the desk and the board, and fills whenever it is open
    this.updateLedgerPanel(snap);
    this.dialogue.set(you.dialogue);
    this.journal.set(snap.objective, you, snap.sideObjectives, snap.pois.some(p => p.id === "hot-street" && p.state === "hot"), snap.glass, snap.now);
    this.minimap.update(snap);

    this.last = snap;
  }

  flash(text: string, tone: NoticeTone = "ink"): void {
    if (!text) return;
    const expires = performance.now() + NOTICE_TTL * 1000;
    this.locals.push({ text, tone, expires });
    if (this.locals.length > NOTICE_KEEP) this.locals.splice(0, this.locals.length - NOTICE_KEEP);
    this.renderNotices(this.last ? this.last.notices : []);
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => this.pruneLocals(), NOTICE_TTL * 1000 + 20);
  }

  toggleJournal(): void { this.journal.toggle(); audio.play("page"); }
  toggleLedger(): void {
    this.ledgerAuto = false;
    this.ledger.toggle();
    // Closed by hand at the desk or the board, it stays closed there until the body walks to something else (the
    // player-defect sweep, round two: it reopened on the next frame, so L seemed to do nothing).
    this.ledgerDismissed = this.ledger.isOpen() ? "" : (this.last?.prompt?.targetId ?? "");
  }
  /** From hello: whether this city accepts the test link; the lock panel offers it only then. */
  setMockLink(on: boolean): void { this.lock.setMockLink(on); }

  /** The ledger opens itself at the claims desk and the listing board, and closes again when you walk away. */
  private updateLedgerPanel(snap: Snap): void {
    const target = snap.prompt?.targetId ?? "";
    if (target !== this.ledgerDismissed) this.ledgerDismissed = "";
    const atDesk = target === "claims-desk" || target === "listing-board";
    if (atDesk && !this.ledger.isOpen() && !this.ledgerDismissed) { this.ledger.open(true); this.ledgerAuto = true; }
    else if (!atDesk && this.ledgerAuto && this.ledger.isOpen()) { this.ledger.open(false); this.ledgerAuto = false; }
    if (this.ledger.isOpen()) this.ledger.set(ledgerModel(snap));
  }
  toggleMinimap(): void { this.minimap.toggle(); }

  destroy(): void {
    window.clearTimeout(this.heardTimer);
    window.clearTimeout(this.heardFade);
    window.clearTimeout(this.winkTimer);
    window.clearTimeout(this.winkFade);
    window.clearTimeout(this.noticeTimer);
    window.clearTimeout(this.statusTimer);
    this.root.removeEventListener("click", this.onPointerClick);
    this.stance?.removeEventListener("click", this.onStance);
    this.kit?.removeEventListener("click", this.onKit);
    this.dodge?.removeEventListener("click", this.onDodge);
    this.useChip?.removeEventListener("click", this.onUse);
    this.flagChip?.removeEventListener("click", this.onFlag);
    this.promptVerbs?.removeEventListener("click", this.onVerb);
    this.credits?.removeEventListener("click", this.onCredits);
    this.credits?.removeEventListener("keydown", this.onCreditsKey);
    this.audioChip?.removeEventListener("click", this.onAudio);
    if (audio.onChange) audio.onChange = null;
    this.dialogue.destroy();
    this.journal.destroy();
    this.minimap.destroy();
    this.lock.destroy();
    this.root.classList.remove("dialogue-open");
    this.last = null;
  }

  // ---------------------------------------------------------------- handlers

  private readonly onStance = (ev: Event) => { ev.preventDefault(); this.cb.stance(); };
  private readonly onKit = (ev: Event) => { ev.preventDefault(); this.cb.kit(); };
  private readonly onDodge = (ev: Event) => { ev.preventDefault(); this.cb.dodge(); };
  private readonly onUse = (ev: Event) => { ev.preventDefault(); this.cb.use(); };
  private readonly onFlag = (ev: Event) => { ev.preventDefault(); this.cb.flag(); };

  // ------------------------------------------------------------ the touch stick (drawn here, decided in the scene)

  /** Plants the stick's ring where a finger landed, in page pixels. */
  showStick(x: number, y: number): void {
    if (!this.stick) return;
    this.stick.style.left = `${x}px`;
    this.stick.style.top = `${y}px`;
    this.moveStick(0, 0);
    show(this.stick, true);
  }

  /** Moves the knob by an offset from the ring's centre (already clamped by the scene). */
  moveStick(dx: number, dy: number): void {
    this.stickKnob?.style.setProperty("--kx", `${dx}px`);
    this.stickKnob?.style.setProperty("--ky", `${dy}px`);
  }

  hideStick(): void {
    show(this.stick, false);
  }
  /** The credits close on a click, or on Enter, Space or Escape while they hold focus; focus goes back where it was. */
  private readonly onCredits = () => {
    this.creditsFocus.release(() => show(this.credits, false));
    audio.setScene("city");
  };
  private readonly onCreditsKey = (ev: KeyboardEvent) => {
    // The roll is modal: Tab stays in it (it has nothing to move to), so Enter, Space or Escape always reach it and close
    // it, whatever the keyboard did before (the player-defect sweep, round four).
    if (ev.code === "Tab") {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    if (ev.code !== "Enter" && ev.code !== "Space" && ev.code !== "Escape") return;
    ev.preventDefault();
    ev.stopPropagation();
    this.onCredits();
  };
  private readonly onAudio = () => { audio.toggleMuted(); };

  /** The chip reads the bus: AUDIO ON 80, or AUDIO OFF. */
  private syncAudio(): void {
    if (!this.audioChip) return;
    setText(q(this.audioChip, ".chip-text"), audio.muted ? "AUDIO OFF" : "AUDIO ON");
    setText(q(this.audioChip, ".chip-small"), `${Math.round(audio.volume * 100)}`);
    this.audioChip.setAttribute("aria-pressed", audio.muted ? "true" : "false");
  }
  private readonly onVerb = (ev: MouseEvent) => {
    const btn = (ev.target as HTMLElement | null)?.closest<HTMLButtonElement>("button.verb");
    if (!btn || !this.promptTarget) return;
    ev.preventDefault();
    const key = btn.dataset.key ?? "";
    const choice = btn.dataset.choice ?? "";
    switch (key) {
      case "V": this.cb.flag(); return;
      case "T": this.cb.truce(); return;
      case "I": this.cb.use(); return;
      default: this.cb.interact(this.promptTarget, choice);
    }
  };

  // ---------------------------------------------------------------- sections

  private updateIdentity(snap: Snap): void {
    const you = snap.you;
    const truce = you.truceUntil > snap.now;
    const sig = [you.guest, you.serial, you.house, you.messenger, you.flagged, truce, you.locked, you.dead].join("|");
    if (sig === this.identitySig) return;
    this.identitySig = sig;
    setText(this.identityText, identityLine(you));
    setClass(this.identity, "guest", you.guest);
    setClass(this.identity, "angel", !you.guest);
    const seal = you.guest ? null : sealFor(you.house);
    const sealUrl = seal && gen.has(seal) ? gen.url(seal, "") : "";
    if (sealUrl && this.identitySeal.getAttribute("src") !== sealUrl) this.identitySeal.src = sealUrl;
    show(this.identitySeal, !!sealUrl);
    if (this.identityTags) {
      this.identityTags.replaceChildren();
      if (you.dead) this.identityTags.append(tag("DOWN", "hot"));
      if (you.locked) this.identityTags.append(tag("LOCKED", "ink"));
      if (you.flagged) this.identityTags.append(tag("FLAGGED", "acid"));
      if (truce) this.identityTags.append(tag("TRUCE", "grid"));
    }
  }

  private updateDistrict(snap: Snap): void {
    if (snap.district === this.districtSig) return;
    this.districtSig = snap.district;
    setText(this.districtText, districtName(snap.district).toUpperCase());
    setText(this.districtSmall, districtFourfold(snap.district).toUpperCase());
  }

  private updateWeather(snap: Snap): void {
    const gestell = Math.floor(snap.gestell); // the band is the floored figure's (weatherBand): 90.5 reads 90, fat
    const band = weatherBand(snap.gestell);
    const frozen = snap.frozen.includes(snap.district);
    // the street flags itself at the rule's line (combat.ts weatherFlagged, GESTELL_MELTDOWN), not the band's (over 90)
    const hot = snap.you.district === "wet" && snap.gestell >= GESTELL_MELTDOWN;
    const sig = [snap.weather, gestell, band, frozen, snap.weatherNamed, hot].join("|");
    if (sig === this.weatherSig) return;
    this.weatherSig = sig;
    setText(this.weatherText, weatherLine(snap.weather));
    setText(this.weatherGestell, num(gestell));
    setClass(this.weather, "meltdown", band === "meltdown");
    if (this.weatherTags) {
      this.weatherTags.replaceChildren();
      if (!snap.weatherNamed) this.weatherTags.append(tag("UNNAMED", "grid"));
      if (frozen) this.weatherTags.append(tag("FROZEN", "ink"));
      if (hot) this.weatherTags.append(tag("HOT STREET", "hot"));
    }
  }

  private updateLedger(snap: Snap): void {
    const you = snap.you;
    const sig = [you.guest, Math.floor(you.bestand), Math.floor(you.banked), Math.floor(you.winke)].join("|");
    if (sig === this.ledgerSig) return;
    this.ledgerSig = sig;
    setText(this.ledgerText, ledgerLine(you));
  }

  private updateBars(snap: Snap): void {
    const you = snap.you;
    const hp = Math.round(you.hp);
    const aura = Math.round(you.aura);
    const restraint = restraintBar(you.restraint, false).value; // floored, at the server's line (round six)
    const readiness = Math.round(you.readiness);
    const tier = auraTier(you.aura, you.guest);
    const burning = you.stance === "storm" && !(you.kit && you.kit.verb === "ruin" && you.kit.until > snap.now);
    const sig = [hp, aura, restraint, readiness, tier, burning, you.guest].join("|");
    if (sig === this.barSig) return;
    this.barSig = sig;

    const b = this.bars;
    this.setBar(b.hp, hp, MAX_HP);
    setClass(b.hp.row, "low", hp <= MAX_HP * 0.3);

    this.setBar(b.aura, aura, AURA_MAX);
    for (let t = 0; t <= 3; t++) setClass(b.aura.row, `tier-${t}`, t === tier);
    setText(b.aura.label, you.guest ? "AURA · GUEST" : "AURA");

    const rb = restraintBar(you.restraint, burning);
    this.setBar(b.restraint, rb.value, RESTRAINT_MAX);
    setClass(b.restraint.row, "dark", rb.dark);
    setClass(b.restraint.row, "burning", burning);
    setText(b.restraint.label, rb.label);

    this.setBar(b.readiness, readiness, READINESS_MAX);
  }

  private setBar(bar: { row: HTMLElement | null; fill: HTMLElement | null; value: HTMLElement | null }, value: number, max: number): void {
    const width = `${pct(value, max).toFixed(1)}%`;
    if (bar.fill && bar.fill.style.width !== width) bar.fill.style.width = width;
    setText(bar.value, num(value));
    // The row is a meter for assistive tech: its value and ceiling follow the numbers shown.
    setAttr(bar.row, "aria-valuenow", String(value));
    setAttr(bar.row, "aria-valuemax", String(max));
  }

  private updateStance(snap: Snap): void {
    const you = snap.you;
    const face = !!you.kit && you.kit.verb === "ruin" && you.kit.until > snap.now;
    const sig = [you.stance, face, you.guest].join("|");
    if (sig === this.stanceSig) return;
    this.stanceSig = sig;
    const line = stanceLine(you.stance, face, STORM_RESTRAINT_BURN, you.guest);
    setText(this.stanceText, line.text);
    setText(this.stanceHint, line.hint);
    setClass(this.stance, "storm", you.stance === "storm");
  }

  private updateKit(snap: Snap): void {
    const you = snap.you;
    const cd = Math.ceil(you.kitCd);
    const active = !!you.kit && you.kit.until > snap.now;
    const sig = [you.messenger, cd, active, you.guest].join("|");
    if (sig === this.kitSig) return;
    this.kitSig = sig;
    setText(this.kitText, kitLine(you.messenger, cd, active));
    const badge = you.guest ? null : badgeFor(you.messenger);
    const badgeUrl = badge && gen.has(badge) ? gen.url(badge, "") : "";
    if (badgeUrl && this.kitBadge.getAttribute("src") !== badgeUrl) this.kitBadge.src = badgeUrl;
    show(this.kitBadge, !!badgeUrl);
    setClass(this.kit, "cooling", cd > 0 && !active);
    setClass(this.kit, "active", active);
    if (this.kit) this.kit.disabled = you.guest || !you.messenger;
  }

  /** The I and V chips: shown while they have something to do (format.ts chipVerbs), so a finger reaches every verb a key does. */
  private updateChipVerbs(snap: Snap): void {
    const you = snap.you;
    const verbs = chipVerbs(you, paperToUse(you, MAX_HP), snap.now);
    show(this.useChip, verbs.use);
    show(this.flagChip, verbs.flag !== null);
    if (verbs.flag && this.flagChip) setText(q(this.flagChip, ".chip-text"), verbs.flag);
  }

  private updateDodge(snap: Snap): void {
    const cd = Math.ceil(snap.you.dodgeCd * 10) / 10;
    const text = dodgeLine(cd, this.touch);
    if (text === this.dodgeSig) return;
    this.dodgeSig = text;
    setText(this.dodgeText, text);
    setClass(this.dodge, "cooling", cd > 0);
  }

  private updatePrompt(prompt: Prompt | null): void {
    const sig = prompt ? [prompt.targetId, prompt.targetKind, prompt.name, ...prompt.verbs.map(v => `${v.key}:${v.label}:${v.choice}`)].join("|") : "";
    if (sig === this.promptSig) return;
    this.promptSig = sig;
    this.promptTarget = prompt ? prompt.targetId : "";
    if (!prompt || prompt.verbs.length === 0) {
      show(this.prompt, false);
      return;
    }
    setText(this.promptName, prompt.name.toUpperCase());
    if (this.promptVerbs) {
      this.promptVerbs.replaceChildren();
      for (const v of prompt.verbs) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "verb";
        btn.dataset.key = v.key;
        btn.dataset.choice = v.choice;
        const cap = document.createElement("kbd");
        cap.className = "cap";
        cap.textContent = v.key;
        btn.append(cap, document.createTextNode(v.label.toUpperCase()));
        this.promptVerbs.append(btn);
      }
    }
    show(this.prompt, true);
  }

  /** A new line goes up at once; its fade waits while a dialogue window hides it (the bell's line under Caul's address) and starts when the window closes. */
  private updateHeard(snap: Snap): void {
    const step = heardStep({ at: this.heardAt, held: this.heardHeld }, snap.you, snap.now, NOTICE_TTL);
    this.heardAt = step.state.at;
    this.heardHeld = step.state.held;
    if (step.show !== null) {
      window.clearTimeout(this.heardTimer);
      window.clearTimeout(this.heardFade);
      setText(this.heard, step.show);
      this.heard?.classList.remove("fading");
      show(this.heard, true);
    }
    if (step.arm) {
      window.clearTimeout(this.heardTimer);
      window.clearTimeout(this.heardFade);
      this.heardTimer = window.setTimeout(() => {
        this.heard?.classList.add("fading");
        this.heardFade = window.setTimeout(() => show(this.heard, false), FADE_MS);
      }, HEARD_MS);
    }
  }

  private updateWink(snap: Snap): void {
    const you = snap.you;
    if (you.winkAt === this.winkAt) return;
    this.winkAt = you.winkAt;
    if (you.guest || !you.wink || snap.now - you.winkAt > WINK_MS / 1000) return;
    window.clearTimeout(this.winkTimer);
    window.clearTimeout(this.winkFade);
    setText(this.winkText, you.wink);
    this.wink?.classList.remove("fading");
    show(this.wink, true);
    this.winkTimer = window.setTimeout(() => {
      this.wink?.classList.add("fading");
      this.winkFade = window.setTimeout(() => show(this.wink, false), FADE_MS);
    }, WINK_MS);
  }

  private updateNotices(server: Notice[]): void {
    const sig = server.map(n => `${n.at}|${n.tone}|${n.text}`).join("\n");
    if (sig === this.noticeSig && this.locals.length === 0) return;
    this.noticeSig = sig;
    this.renderNotices(server);
  }

  private pruneLocals(): void {
    const now = performance.now();
    const before = this.locals.length;
    this.locals = this.locals.filter(n => n.expires > now);
    if (this.locals.length !== before) this.renderNotices(this.last ? this.last.notices : []);
    if (this.locals.length > 0) {
      const next = Math.min(...this.locals.map(n => n.expires)) - now + 20;
      this.noticeTimer = window.setTimeout(() => this.pruneLocals(), Math.max(50, next));
    }
  }

  private renderNotices(server: Notice[]): void {
    if (!this.notices) return;
    const rows: { text: string; tone: NoticeTone; key: string }[] = [];
    for (const n of server) rows.push({ text: n.text, tone: n.tone, key: `s:${n.at}:${n.text}` });
    for (const n of this.locals) rows.push({ text: n.text, tone: n.tone, key: `l:${n.expires}:${n.text}` });
    const shown = rows.slice(-NOTICE_KEEP);
    const key = shown.map(r => r.key).join("\n");
    if (this.notices.dataset.key === key) return;
    this.notices.dataset.key = key;
    // Rows that stay are left in place: the live region announces a notice when it arrives, and only then.
    const present = [...this.notices.children] as HTMLElement[];
    const diff = noticeDiff(present.map(el => el.dataset.key ?? ""), shown.map(r => r.key));
    for (const el of present) if (diff.remove.includes(el.dataset.key ?? "")) el.remove();
    for (const r of shown) {
      if (!diff.add.includes(r.key)) continue;
      const div = document.createElement("div");
      div.className = `notice ${r.tone}`;
      div.dataset.key = r.key;
      div.textContent = r.text;
      this.notices.append(div);
    }
  }

  private updateMarquee(news: string[]): void {
    const text = joinNews(news);
    if (text === this.marqueeText) return;
    this.marqueeText = text;
    if (!this.marquee || !this.marqueeTrack) return;
    if (!text) {
      show(this.marquee, false);
      return;
    }
    // Replace the node so the CSS animation restarts from the right edge.
    const span = document.createElement("span");
    span.className = "marquee-text";
    span.textContent = text;
    span.style.setProperty("--marquee-duration", `${marqueeSeconds(text)}s`);
    this.marqueeTrack.replaceChildren(span);
    show(this.marquee, true);
  }

  private updateLock(snap: Snap): void {
    const step = lockStep(this.last ? this.last.you : null, snap.you, snap.prompt?.targetId ?? null, this.lock.visible);
    if (step === "show") this.lock.show();
    else if (step === "hide") this.lock.hide();
  }

  private updateCredits(snap: Snap): void {
    const now = (snap.you.flags[F.CREDITS] ?? 0) >= 1;
    if (!this.last) {
      this.creditsSeen = now; // a returning player does not get the roll again
      return;
    }
    const before = (this.last.you.flags[F.CREDITS] ?? 0) >= 1;
    if (now && !before && !this.creditsSeen) {
      this.creditsSeen = true;
      show(this.credits, true);
      this.creditsFocus.take();
      audio.setScene("credits");
    }
  }
}

function tag(text: string, tone: "acid" | "hot" | "ink" | "grid"): HTMLElement {
  const span = document.createElement("span");
  span.className = tone === "acid" ? "tag" : `tag ${tone}`;
  span.textContent = text;
  return span;
}
