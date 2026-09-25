/**
 * The city. Builds the level, follows you, turns keys into ClientMsg and
 * renders the latest Snap. It never computes a number that matters.
 */
import Phaser from "phaser";
import { WORLD_H, WORLD_W } from "../sim/map";
import { weatherBand, type Snap, type WeatherBand, type YouView } from "../sim/protocol";
import type { Intent } from "../sim/types";
import { WorldSocket, type SocketStatus } from "../net/worldSocket";
import { bus, type SceneActions } from "../render/bus";
import { Entities } from "../render/entities";
import { Floors, TEX } from "../render/floors";
import { Fx } from "../render/fx";

const IDLE: Intent = { up: false, down: false, left: false, right: false };
const MOVE_KEYS: Record<string, keyof Intent> = {
  KeyW: "up", ArrowUp: "up",
  KeyS: "down", ArrowDown: "down",
  KeyA: "left", ArrowLeft: "left",
  KeyD: "right", ArrowRight: "right",
};
const DIR: Record<keyof Intent, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
};

/** The fields of `you` whose changes drive fx. */
type YouDiff = {
  init: boolean;
  dodgeT: number;
  hitStop: number;
  heavyWindup: number;
  winkAt: number;
  deaths: number;
  under: number;
  passing: number;
  wink: string;
};

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
}

export class CityScene extends Phaser.Scene {
  net!: WorldSocket;
  floors!: Floors;
  entities!: Entities;
  fx!: Fx;

  private readonly held = new Set<keyof Intent>();
  private readonly intent: Intent = { up: false, down: false, left: false, right: false };
  private lastSeq = -1;
  private lastBand: WeatherBand | null = null;
  private lastRain = "";
  private lastFrozen = "";
  private lastPois = "";
  private lastGates = "";
  private following = false;
  private readonly prev: YouDiff = { init: false, dodgeT: 0, hitStop: 0, heavyWindup: 0, winkAt: 0, deaths: 0, under: 0, passing: 0, wink: "" };
  private readonly at = { x: 0, y: 0 };

  private onKeyDown = (e: KeyboardEvent) => this.keyDown(e);
  private onKeyUp = (e: KeyboardEvent) => this.keyUp(e);
  private onBlur = () => this.blur();

  constructor() {
    super("city");
  }

  create(): void {
    this.floors = new Floors(this);
    this.entities = new Entities(this);
    this.fx = new Fx(this);
    this.entities.events = {
      ledger: (x, y, text, tone) => this.fx.ledger(x, y, text, tone),
      interrupt: (x, y) => this.fx.interrupt(x, y),
    };

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setBackgroundColor("#0a0a0a");
    this.applyZoom(this.scale.width);
    this.scale.on(Phaser.Scale.Events.RESIZE, (size: { width: number }) => this.applyZoom(size.width));

    this.net = new WorldSocket();
    bus.net = this.net;
    bus.actions = this.actions();
    this.net.onStatus = (s: SocketStatus) => bus.hud?.setStatus(s);
    this.net.onHello = () => {
      if (bus.pendingSerial !== null) {
        this.net.link(bus.pendingSerial);
        bus.pendingSerial = null;
      }
    };
    bus.hud?.setStatus(this.net.status);
    void this.net.connect();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => this.pointerDown(p));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.teardown());
  }

  private teardown(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.net.disconnect();
    if (bus.net === this.net) bus.net = null;
    bus.actions = null;
    this.entities.destroy();
    this.fx.destroy();
  }

  private applyZoom(width: number): void {
    this.cameras.main.setZoom(width >= 1280 ? 1.15 : 1);
  }

  // ------------------------------------------------------------ hud seam

  private actions(): SceneActions {
    return {
      choose: (id) => this.net.choose(id),
      close: () => this.net.close(),
      link: (serial) => {
        if (!this.net.link(serial)) bus.pendingSerial = serial;
      },
      interact: (targetId, choice) => this.net.interact(targetId, choice),
      stance: () => this.net.stance(),
      kit: () => this.net.kit(),
      flag: () => this.net.flag(),
      truce: () => this.net.truce(),
      use: () => this.useFirstPaper(),
    };
  }

  /** I: use the first paper item (insurance / repair). */
  private useFirstPaper(): void {
    const you = this.net.you;
    if (!you) return;
    for (const item of you.items) {
      if (item.kind === "paper" && item.qty > 0) {
        this.net.use(item.id);
        return;
      }
    }
    bus.hud?.flash("No paper to use.", "ink");
  }

  /** F / E / Q: the prompt verb for that key; F talks when the target is an NPC. */
  private promptVerb(key: "F" | "E" | "Q"): void {
    const prompt = this.net.snap?.prompt;
    if (!prompt) return;
    if (key === "F" && prompt.targetKind === "npc") {
      this.net.talk(prompt.targetId);
      return;
    }
    for (const v of prompt.verbs) {
      if (v.key === key) {
        this.net.interact(prompt.targetId, v.choice);
        return;
      }
    }
  }

  // ------------------------------------------------------------ input

  private keyDown(e: KeyboardEvent): void {
    if (isTyping(e.target)) return;
    const you = this.net.you;
    const dialogue = !!you?.dialogue;
    const move = MOVE_KEYS[e.code];
    if (move) {
      e.preventDefault();
      if (e.repeat) return;
      this.held.add(move);
      if (e.shiftKey && !dialogue) this.dodgeToward(move);
      return;
    }
    if (e.repeat) return;
    switch (e.code) {
      case "Tab":
        e.preventDefault();
        if (!dialogue) this.net.stance();
        return;
      case "Escape":
        if (dialogue) this.net.close();
        return;
      case "Digit1": case "Digit2": case "Digit3": case "Digit4":
      case "Numpad1": case "Numpad2": case "Numpad3": case "Numpad4": {
        if (!dialogue || !you) return;
        const i = Number(e.code.slice(-1)) - 1;
        const choice = you.dialogue!.choices[i];
        if (choice) this.net.choose(choice.id);
        return;
      }
      case "ShiftLeft": case "ShiftRight":
        if (!dialogue && this.held.size) this.dodgeHeld();
        return;
    }
    if (dialogue) return;
    switch (e.code) {
      case "Space":
        e.preventDefault();
        this.strike(false);
        break;
      case "KeyR":
        this.strike(true);
        break;
      case "KeyK":
        this.net.kit();
        break;
      case "KeyF":
        this.promptVerb("F");
        break;
      case "KeyE":
        this.promptVerb("E");
        break;
      case "KeyQ":
        this.promptVerb("Q");
        break;
      case "KeyV":
        this.net.flag();
        break;
      case "KeyT":
        this.net.truce();
        break;
      case "KeyI":
        this.useFirstPaper();
        break;
      case "KeyJ":
        bus.hud?.toggleJournal();
        break;
      case "KeyM":
        bus.hud?.toggleMinimap();
        break;
    }
  }

  private keyUp(e: KeyboardEvent): void {
    const move = MOVE_KEYS[e.code];
    if (move) this.held.delete(move);
  }

  private blur(): void {
    this.held.clear();
    this.net.sendIntent(IDLE);
  }

  private pointerDown(p: Phaser.Input.Pointer): void {
    if (!document.hasFocus() || this.net.you?.dialogue) return;
    const ev = p.event as MouseEvent | undefined;
    this.strike(!!ev && ev.shiftKey);
  }

  private dodgeToward(dir: keyof Intent): void {
    const d = DIR[dir];
    if (this.net.dodge(d.dx, d.dy)) this.ghost(d.dx, d.dy);
  }

  private dodgeHeld(): void {
    let dx = 0, dy = 0;
    for (const k of this.held) {
      dx += DIR[k].dx;
      dy += DIR[k].dy;
    }
    if (!dx && !dy) return;
    if (this.net.dodge(dx, dy)) this.ghost(Math.sign(dx), Math.sign(dy));
  }

  private ghost(dx: number, dy: number): void {
    const you = this.net.you;
    if (!you) return;
    const at = this.entities.youAt(this.at);
    this.fx.dodge(at.x, at.y, dx, dy, you.guest ? TEX.guest : TEX.angel, you.facing.dx < 0);
  }

  private strike(heavy: boolean): void {
    const you = this.net.you;
    if (!you || you.dead) return;
    const sent = heavy ? this.net.heavy() : this.net.strike();
    if (!sent || heavy) return; // the heavy flash fires when its windup resolves
    const at = this.entities.youAt(this.at);
    const f = you.facing;
    const len = Math.hypot(f.dx, f.dy) || 1;
    this.fx.strike(at.x + (f.dx / len) * 36, at.y - 14 + (f.dy / len) * 28, false);
  }

  // ------------------------------------------------------------ frame

  update(_time: number, delta: number): void {
    this.sendIntent();
    const net = this.net;
    if (net.seq !== this.lastSeq && net.snap) {
      this.lastSeq = net.seq;
      this.render(net.snap);
    }
    this.entities.frame(delta);
    if (!this.following && this.entities.youSprite) {
      this.cameras.main.startFollow(this.entities.youSprite, true, 0.12, 0.12);
      this.following = true;
    }
  }

  private sendIntent(): void {
    if (!document.hasFocus()) return;
    const i = this.intent;
    const still = !!this.net.you?.dialogue;
    i.up = !still && this.held.has("up");
    i.down = !still && this.held.has("down");
    i.left = !still && this.held.has("left");
    i.right = !still && this.held.has("right");
    this.net.sendIntent(i);
  }

  private render(snap: Snap): void {
    this.entities.sync(snap);
    const you = snap.you;

    const band = weatherBand(snap.gestell);
    if (band !== this.lastBand) {
      this.lastBand = band;
      this.floors.setWeather(band);
    }
    const rainKey = `${snap.district}|${band}`;
    if (rainKey !== this.lastRain) {
      this.lastRain = rainKey;
      this.floors.setRain(snap.district, band);
    }
    const frozen = snap.frozen.join(",");
    if (frozen !== this.lastFrozen) {
      this.lastFrozen = frozen;
      this.floors.setFrozen(snap.frozen);
    }
    let poisKey = "";
    for (const p of snap.pois) poisKey += p.id + ":" + p.state + ";";
    if (poisKey !== this.lastPois) {
      this.lastPois = poisKey;
      this.floors.setPois(snap.pois);
    }
    const gates = `${you.guest ? "g" : "a"}|${you.flags.under ?? 0}|${you.flags.m3 ?? 0}`;
    if (gates !== this.lastGates) {
      this.lastGates = gates;
      this.floors.updateGates(you);
    }

    this.effects(you, snap);
    bus.hud?.update(snap);
  }

  private effects(you: YouView, snap: Snap): void {
    const prev = this.prev;
    const under = you.flags.under ?? 0;
    const passing = you.flags.passing ?? 0;
    if (prev.init) {
      const at = this.entities.youAt(this.at);
      if (you.dodgeT > 0 && prev.dodgeT <= 0) {
        // Server-confirmed dash (covers dodges sent from a touch HUD).
        this.fx.dodge(at.x, at.y, Math.sign(you.dodgeX), Math.sign(you.dodgeY), you.guest ? TEX.guest : TEX.angel, you.facing.dx < 0);
      }
      if (you.hitStop > 0 && prev.hitStop <= 0) this.fx.hitStop();
      if (prev.heavyWindup > 0 && you.heavyWindup <= 0) {
        const f = you.facing;
        const len = Math.hypot(f.dx, f.dy) || 1;
        this.fx.strike(at.x + (f.dx / len) * 44, at.y - 14 + (f.dy / len) * 32, true);
      }
      if (you.winkAt !== prev.winkAt && you.wink && !you.guest) this.fx.wink(at.x, at.y);
      if (you.deaths > prev.deaths) this.fx.death();
      if (under === 1 && prev.under === 0) this.fx.goingUnder();
      if (passing === 1 && prev.passing === 0) this.fx.passing(snap.passing.lastOutcome);
    }
    prev.init = true;
    prev.dodgeT = you.dodgeT;
    prev.hitStop = you.hitStop;
    prev.heavyWindup = you.heavyWindup;
    prev.winkAt = you.winkAt;
    prev.wink = you.wink;
    prev.deaths = you.deaths;
    prev.under = under;
    prev.passing = passing;
  }
}
