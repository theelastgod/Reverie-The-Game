/**
 * The DOM HUD over the canvas. Renders the Snap and reports clicks; it never
 * computes a number that matters. update() diffs against the last snapshot
 * and touches the DOM only on change.
 */
import type { Snap } from "../sim/protocol";
import { weatherBand } from "../sim/protocol";
import type { Notice, Prompt } from "../sim/types";
import { AURA_MAX, MAX_HP, NOTICE_KEEP, NOTICE_TTL, READINESS_MAX, RESTRAINT_MAX, RESTRAINT_WINK_MIN, STORM_RESTRAINT_BURN } from "../sim/constants";
import { F } from "../sim/content/ids";
import {
  auraTier, districtFourfold, districtName, dodgeLine, identityLine, joinNews, kitLine, ledgerLine, marqueeSeconds, num, pct,
  setClass, setText, show, stanceLine, statusLine, weatherLine,
} from "./format";
import { mountDialogue, type DialoguePanel } from "./dialogue";
import { mountJournal, type JournalPanel } from "./journal";
import { mountMinimap, type MinimapPanel } from "./minimap";
import { mountLock, type LockPanel } from "./lock";

export type HudCallbacks = {
  choose: (choiceId: string) => void; // dialogue choice clicked
  close: () => void; // dialogue closed / Esc
  link: (serial: number) => void; // mock Angel link from the lock panel or the title
  interact: (targetId: string, choice: string) => void; // prompt verb clicked (touch/mouse)
  stance: () => void; kit: () => void; flag: () => void; truce: () => void; use: () => void;
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
  private readonly dodge: HTMLElement | null;
  private readonly dodgeText: HTMLElement | null;
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
    this.dodge = q(root, "#hud-dodge");
    this.dodgeText = this.dodge ? q(this.dodge, ".chip-text") : null;
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
    this.loading = q(root, "#hud-loading");
    this.loadingText = this.loading ? q(this.loading, ".chip-text") : null;
    this.loadingPct = this.loading ? q(this.loading, ".loading-pct") : null;

    this.dialogue = mountDialogue(root, { choose: id => this.cb.choose(id), close: () => this.cb.close() });
    this.journal = mountJournal(root);
    this.minimap = mountMinimap(root);
    this.lock = mountLock(root, serial => this.cb.link(serial));

    this.stance?.addEventListener("click", this.onStance);
    this.kit?.addEventListener("click", this.onKit);
    this.promptVerbs?.addEventListener("click", this.onVerb);
    this.credits?.addEventListener("click", this.onCredits);

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
    this.updatePrompt(snap.prompt);
    this.updateHeard(snap);
    this.updateWink(snap);
    this.updateNotices(snap.notices);
    this.updateMarquee(snap.news);
    this.updateLock(snap);
    this.updateCredits(snap);
    this.dialogue.set(you.dialogue);
    this.journal.set(snap.objective, you);
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

  toggleJournal(): void { this.journal.toggle(); }
  toggleMinimap(): void { this.minimap.toggle(); }

  destroy(): void {
    window.clearTimeout(this.heardTimer);
    window.clearTimeout(this.heardFade);
    window.clearTimeout(this.winkTimer);
    window.clearTimeout(this.winkFade);
    window.clearTimeout(this.noticeTimer);
    window.clearTimeout(this.statusTimer);
    this.stance?.removeEventListener("click", this.onStance);
    this.kit?.removeEventListener("click", this.onKit);
    this.promptVerbs?.removeEventListener("click", this.onVerb);
    this.credits?.removeEventListener("click", this.onCredits);
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
  private readonly onCredits = () => { show(this.credits, false); };
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
    const gestell = Math.round(snap.gestell);
    const band = weatherBand(snap.gestell);
    const frozen = snap.frozen.includes(snap.district);
    const hot = snap.you.district === "wet" && band === "meltdown";
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
    const restraint = Math.round(you.restraint);
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

    this.setBar(b.restraint, restraint, RESTRAINT_MAX);
    setClass(b.restraint.row, "dark", restraint < RESTRAINT_WINK_MIN);
    setClass(b.restraint.row, "burning", burning);
    setText(b.restraint.label, burning ? "RESTRAINT · BURNING" : restraint < RESTRAINT_WINK_MIN ? "RESTRAINT · WINKE DARK" : "RESTRAINT");

    this.setBar(b.readiness, readiness, READINESS_MAX);
  }

  private setBar(bar: { fill: HTMLElement | null; value: HTMLElement | null }, value: number, max: number): void {
    const width = `${pct(value, max).toFixed(1)}%`;
    if (bar.fill && bar.fill.style.width !== width) bar.fill.style.width = width;
    setText(bar.value, num(value));
  }

  private updateStance(snap: Snap): void {
    const you = snap.you;
    const face = !!you.kit && you.kit.verb === "ruin" && you.kit.until > snap.now;
    const sig = [you.stance, face, you.guest].join("|");
    if (sig === this.stanceSig) return;
    this.stanceSig = sig;
    const line = stanceLine(you.stance, face, STORM_RESTRAINT_BURN);
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
    setClass(this.kit, "cooling", cd > 0 && !active);
    setClass(this.kit, "active", active);
    if (this.kit) this.kit.disabled = you.guest || !you.messenger;
  }

  private updateDodge(snap: Snap): void {
    const cd = Math.ceil(snap.you.dodgeCd * 10) / 10;
    const text = dodgeLine(cd);
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

  private updateHeard(snap: Snap): void {
    const you = snap.you;
    if (you.heardAt === this.heardAt) return;
    this.heardAt = you.heardAt;
    if (!you.heard || snap.now - you.heardAt > NOTICE_TTL) return;
    window.clearTimeout(this.heardTimer);
    window.clearTimeout(this.heardFade);
    setText(this.heard, you.heard);
    this.heard?.classList.remove("fading");
    show(this.heard, true);
    this.heardTimer = window.setTimeout(() => {
      this.heard?.classList.add("fading");
      this.heardFade = window.setTimeout(() => show(this.heard, false), FADE_MS);
    }, HEARD_MS);
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
    this.notices.replaceChildren();
    for (const r of shown) {
      const div = document.createElement("div");
      div.className = `notice ${r.tone}`;
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
    const locked = snap.you.locked;
    const wasLocked = this.last ? this.last.you.locked : false;
    if (locked && (!this.last || !wasLocked)) this.lock.show();
    else if (!locked && wasLocked) this.lock.hide();
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
    }
  }
}

function tag(text: string, tone: "acid" | "hot" | "ink" | "grid"): HTMLElement {
  const span = document.createElement("span");
  span.className = tone === "acid" ? "tag" : `tag ${tone}`;
  span.textContent = text;
  return span;
}
