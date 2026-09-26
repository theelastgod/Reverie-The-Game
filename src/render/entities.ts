/**
 * Everything that comes from the snapshot: players, enemies, NPCs, nodes,
 * wreckage, graves, history marks, failed Passings, POI markers and the
 * Clearing ring. Sprites are pooled by id and reused; rings, dots and slabs
 * are redrawn into one Graphics per frame; labels are pooled and shown only
 * within LABEL_RANGE of you. Positions lerp toward the snapshot.
 */
import Phaser from "phaser";
import { ENEMY, AURA_DIM, CLEARING_RADIUS, GESTELL_MELTDOWN, MAX_HP } from "../sim/constants";
import { DISTRICT_BY_ID, PATCHES, POIS, POI_LIST, TILE } from "../sim/map";
import type { EnemyView, NodeView, NpcView, PublicPlayer, Snap, WreckageView, YouView } from "../sim/protocol";
import type { Messenger, Stance } from "../sim/types";
import { COLOR, DEPTH, NPC_SPRITES, TEX, UI_FONT, bodyDepth } from "./floors";
import { propTarget, spriteFor } from "../assets/slots";
import { genTex } from "../scenes/BootScene";

export const LABEL_RANGE = 180;
export const LERP = 0.35;
export const SNAP_DISTANCE = 240;
const BODY_W = 56;
const BODY_H = 72;

/** The fields a body needs, shared by you and public players. Reused, never reallocated. */
export type PlayerLike = {
  id: string;
  name: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  guest: boolean;
  locked: boolean;
  hpFrac: number;
  dead: boolean;
  dodgeT: number;
  stance: Stance;
  flagged: boolean;
  truce: boolean;
  auraTier: 0 | 1 | 2 | 3;
  kit: Messenger | "";
  heavyWindup: number;
  hitStop: number;
};

type Body = {
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  tx: number;
  ty: number;
  seen: number;
  frozen: boolean;
  aura: Phaser.GameObjects.Image | null;
  /** Scale that fits the texture to BODY_W × BODY_H. */
  baseSX: number;
  baseSY: number;
  /** State-driven size (heavy wind-up, telegraph). */
  size: number;
  /** Walk cycle phase and the breath offset so bodies do not breathe in unison. */
  phase: number;
  seed: number;
  /** Smoothed speed in px/s from the lerp, for the walk bob. */
  speed: number;
  visible: boolean;
  /** Walk-cycle rate: wardens plod, enforcers hurry. */
  gait: number;
  /** Last known hp, for ledger ticks. */
  hp: number;
  /** Last enemy state, to catch a heavy interrupt. */
  state: string;
};

/** Enemy feel by kind: silhouette scale and gait. */
const ENEMY_FEEL: Record<EnemyView["kind"], { size: number; gait: number }> = {
  clerk: { size: 1, gait: 1 },
  intake: { size: 1.04, gait: 0.9 },
  warden: { size: 1.14, gait: 0.65 },
  enforcer: { size: 0.94, gait: 1.45 },
  dummy: { size: 1, gait: 0 },
  courier: { size: 0.9, gait: 1.7 },
};

/** Fx hooks Entities raises from snapshot diffs; the scene wires them to Fx. */
export type EntityEvents = {
  ledger: (x: number, y: number, text: string, tone: "hot" | "paper" | "sky" | "muted") => void;
  interrupt: (x: number, y: number) => void;
};

const WALK_SPEED_MIN = 14; // px/s; below this the body idles
const BOB_PX = 3;
const LEAN_DEG = 1.6;
const BREATH = 0.012;
const SQUASH_X = 1.08;
const SQUASH_Y = 0.92;

type Mark = { img: Phaser.GameObjects.Image; seen: number };

const ENEMY_TINT: Record<EnemyView["tint"], number> = {
  lavender: 0xcdc4ea,
  wine: 0xff7a9c,
  sky: 0xa6d0ff,
  paper: 0xffffff,
};
const AURA_SIZE = [0, 64, 80, 98] as const;
const HOT_STREET = PATCHES.find((p) => p.id === "patch-hot-street");
const LOW_HP = 0.35;
const LOW_HP_TINT = 0xff8fa8;

export function auraTierFor(guest: boolean, aura: number): 0 | 1 | 2 | 3 {
  if (guest) return 0;
  if (aura < AURA_DIM) return 1;
  if (aura < 50) return 2;
  return 3;
}

export class Entities {
  private readonly scene: Phaser.Scene;
  private readonly ground: Phaser.GameObjects.Graphics;
  private readonly players = new Map<string, Body>();
  private readonly enemies = new Map<string, Body>();
  private readonly npcs = new Map<string, Body>();
  private readonly wreckage = new Map<string, Mark>();
  private readonly history = new Map<string, Mark>();
  private readonly failed = new Map<string, Mark>();
  private readonly labelById = new Map<string, Phaser.GameObjects.Text>();
  private readonly labelFree: Phaser.GameObjects.Text[] = [];
  private readonly labelUsed = new Set<string>();
  private readonly youLike: PlayerLike = {
    id: "", name: "", x: 0, y: 0, dx: 0, dy: 1, guest: true, locked: false, hpFrac: 1, dead: false, dodgeT: 0,
    stance: "restraint", flagged: false, truce: false, auraTier: 0, kit: "", heavyWindup: 0, hitStop: 0,
  };
  private snap: Snap | null = null;
  private tick = 0;
  private time = 0;
  private youBody: Body | null = null;
  private youHp = -1;
  events: EntityEvents | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ground = scene.add.graphics().setDepth(DEPTH.ground);
  }

  /** The sprite the camera follows (null before the first snapshot). */
  get youSprite(): Phaser.GameObjects.Image | null {
    return this.youBody?.img ?? null;
  }

  /** Where you are drawn right now (lerped), for fx. */
  youAt(out: { x: number; y: number }): { x: number; y: number } {
    if (this.youBody) {
      out.x = this.youBody.x;
      out.y = this.youBody.y;
    }
    return out;
  }

  // ------------------------------------------------------------ sync (per snapshot)

  sync(snap: Snap): void {
    this.snap = snap;
    this.tick++;
    const you = snap.you;
    this.fillYou(you);
    this.syncPlayer(this.youLike, true);
    for (const p of snap.players) {
      if (p.id === you.id) continue;
      this.syncPlayer(this.asLike(p), false);
    }
    for (const e of snap.enemies) this.syncEnemy(e);
    for (const n of snap.npcs) this.syncNpc(n);
    for (const w of snap.wreckage) this.syncWreckage(w);
    for (const h of snap.history) this.syncMark(this.history, h.id, h.x, h.y, TEX.history, 48, 48, Phaser.BlendModes.ADD, 0.9, 0xffffff);
    for (const f of snap.failed) this.syncMark(this.failed, f.id, f.x, f.y, TEX.failed, 56, 32, Phaser.BlendModes.NORMAL, 0.92, 0xded6f4);
    this.sweep(this.players);
    this.sweep(this.enemies);
    this.sweep(this.npcs);
    this.sweepMarks(this.wreckage);
    this.sweepMarks(this.history);
    this.sweepMarks(this.failed);
  }

  private fillYou(you: YouView): void {
    // A cold ledger tick when your own hp drops (never on respawn's refill).
    if (this.youHp >= 0 && you.hp < this.youHp && !you.dead && this.youBody) {
      this.events?.ledger(this.youBody.x, this.youBody.y - 70, `−${Math.round(this.youHp - you.hp)}`, "hot");
    }
    this.youHp = you.hp;
    const y = this.youLike;
    y.id = you.id;
    y.name = you.name;
    y.x = you.x;
    y.y = you.y;
    y.dx = you.facing.dx;
    y.dy = you.facing.dy;
    y.guest = you.guest;
    y.locked = you.locked;
    y.hpFrac = Math.max(0, Math.min(1, you.hp / MAX_HP));
    y.dead = you.dead;
    y.dodgeT = you.dodgeT;
    y.stance = you.stance;
    y.flagged = you.flagged;
    y.truce = you.truceUntil > this.snap!.now;
    y.auraTier = auraTierFor(you.guest, you.aura);
    y.kit = you.kit ? you.kit.verb : "";
    y.heavyWindup = you.heavyWindup;
    y.hitStop = you.hitStop;
  }

  private readonly otherLike: PlayerLike = { ...this.youLike };
  private asLike(p: PublicPlayer): PlayerLike {
    const o = this.otherLike;
    o.id = p.id;
    o.name = p.name;
    o.x = p.x;
    o.y = p.y;
    o.dx = p.facing.dx;
    o.dy = p.facing.dy;
    o.guest = p.guest;
    o.locked = p.locked;
    o.hpFrac = p.hpFrac;
    o.dead = p.dead;
    o.dodgeT = p.dodgeT;
    o.stance = p.stance;
    o.flagged = p.flagged;
    o.truce = p.truce;
    o.auraTier = p.auraTier;
    o.kit = p.kit;
    o.heavyWindup = p.heavyWindup;
    o.hitStop = p.hitStop;
    return o;
  }

  private newBody(x: number, y: number, key: string): Body {
    const img = this.scene.add.image(x, y, key).setDisplaySize(BODY_W, BODY_H).setOrigin(0.5, 0.86);
    const b: Body = {
      img, x, y, tx: x, ty: y, seen: this.tick, frozen: false, aura: null,
      baseSX: img.scaleX, baseSY: img.scaleY, size: 1, phase: 0, seed: Math.random() * Math.PI * 2, speed: 0, visible: true,
      gait: 1, hp: -1, state: "",
    };
    return b;
  }

  /** Swap the texture and refit the base scale (guest → Angel, NPC sprite changes). */
  private retexture(b: Body, key: string): void {
    if (b.img.texture.key === key) return;
    b.img.setTexture(key).setDisplaySize(BODY_W, BODY_H);
    b.baseSX = b.img.scaleX;
    b.baseSY = b.img.scaleY;
  }

  private syncPlayer(p: PlayerLike, isYou: boolean): void {
    const key = p.guest ? TEX.guest : TEX.angel;
    let b = this.players.get(p.id);
    if (!b) {
      b = this.newBody(p.x, p.y, key);
      this.players.set(p.id, b);
    }
    b.seen = this.tick;
    this.retexture(b, key);
    b.frozen = p.hitStop > 0;
    if (!b.frozen) {
      b.tx = p.x;
      b.ty = p.y;
    }
    if (isYou) this.youBody = b;
    const img = b.img;
    img.setFlipX(p.dx < 0);
    img.setAlpha(p.dead ? 0.2 : p.dodgeT > 0 ? 0.4 : 1);
    img.setTint(p.hpFrac < LOW_HP ? LOW_HP_TINT : 0xffffff);
    b.size = p.heavyWindup > 0 ? 1.1 : 1;
    b.visible = !p.dead;
    // Aura ring under Angels, sized by tier.
    const size = AURA_SIZE[p.auraTier];
    if (size && !p.dead) {
      if (!b.aura) b.aura = this.scene.add.image(b.x, b.y, TEX.aura).setDepth(DEPTH.ground).setBlendMode(Phaser.BlendModes.ADD);
      b.aura.setDisplaySize(size, size * 0.6).setAlpha(p.auraTier === 3 ? 0.75 : 0.55).setVisible(true);
    } else if (b.aura) {
      b.aura.setVisible(false);
    }
  }

  /** A generated sprite for this enemy when the manifest had it and the boot loaded it; else the clerk silhouette. */
  private enemyTexture(e: EnemyView): string {
    const target = spriteFor(e);
    const key = target ? genTex(target) : "";
    return key && this.scene.textures.exists(key) ? key : TEX.clerk;
  }

  private syncEnemy(e: EnemyView): void {
    const key = this.enemyTexture(e);
    let b = this.enemies.get(e.id);
    if (!b) {
      b = this.newBody(e.x, e.y, key);
      b.img.setTint(ENEMY_TINT[e.tint]);
      this.enemies.set(e.id, b);
    }
    this.retexture(b, key);
    b.seen = this.tick;
    b.tx = e.x;
    b.ty = e.y;
    const dead = e.state === "dead";
    b.img.setVisible(!dead);
    b.visible = !dead;
    const feel = ENEMY_FEEL[e.kind];
    b.gait = feel.gait;
    // Ledger tick for damage dealt to it; interrupt burst when a heavy cuts its telegraph.
    if (b.hp >= 0 && e.hp < b.hp && !dead) this.events?.ledger(b.x, b.y - 64, `−${Math.round(b.hp - e.hp)}`, "paper");
    if (b.state === "telegraph" && e.state === "recover" && e.t > ENEMY[e.kind].recovery + 0.05) this.events?.interrupt(b.x, b.y);
    b.hp = dead ? -1 : e.hp;
    b.state = e.state;
    if (!dead) {
      b.img.setTint(e.hp / e.maxHp < LOW_HP ? 0xff9ab0 : ENEMY_TINT[e.tint]);
      b.size = feel.size * (e.state === "telegraph" ? 1.08 : 1);
      b.frozen = e.state === "recover" && e.t > ENEMY[e.kind].recovery * 0.8;
    }
  }

  private syncNpc(n: NpcView): void {
    const key = (NPC_SPRITES as readonly string[]).includes(n.sprite) && this.scene.textures.exists(n.sprite) ? n.sprite : TEX.guest;
    let b = this.npcs.get(n.id);
    if (!b) {
      b = this.newBody(n.x, n.y, key);
      this.npcs.set(n.id, b);
    }
    b.seen = this.tick;
    this.retexture(b, key);
    b.tx = n.x;
    b.ty = n.y;
    b.img.setVisible(n.present);
    b.visible = n.present;
  }

  private syncWreckage(w: WreckageView): void {
    let m = this.wreckage.get(w.id);
    if (!m) {
      const wreckKey = this.scene.textures.exists(genTex(propTarget("wreckage"))) ? genTex(propTarget("wreckage")) : TEX.wreckage;
      const img = this.scene.add.image(w.x, w.y, wreckKey).setDisplaySize(36, 44).setOrigin(0.5, 0.85).setDepth(DEPTH.ground + 0.5);
      m = { img, seen: this.tick };
      this.wreckage.set(w.id, m);
    }
    m.seen = this.tick;
    m.img.setPosition(w.x, w.y);
    m.img.setVisible(!w.buried);
    m.img.setAlpha(w.looted ? 0.45 : 1);
  }

  private syncMark(
    pool: Map<string, Mark>, id: string, x: number, y: number, key: string, w: number, h: number,
    blend: Phaser.BlendModes, alpha: number, tint: number,
  ): void {
    let m = pool.get(id);
    if (!m) {
      const img = this.scene.add.image(x, y, key).setDisplaySize(w, h).setDepth(DEPTH.ground + 0.4).setBlendMode(blend).setAlpha(alpha).setTint(tint);
      m = { img, seen: this.tick };
      pool.set(id, m);
    }
    m.seen = this.tick;
    m.img.setPosition(x, y);
  }

  private sweep(pool: Map<string, Body>): void {
    for (const [id, b] of pool) {
      if (b.seen === this.tick) continue;
      b.img.destroy();
      b.aura?.destroy();
      pool.delete(id);
      if (b === this.youBody) this.youBody = null;
    }
  }

  private sweepMarks(pool: Map<string, Mark>): void {
    for (const [id, m] of pool) {
      if (m.seen === this.tick) continue;
      m.img.destroy();
      pool.delete(id);
    }
  }

  // ------------------------------------------------------------ tick (per frame)

  /** Per frame: lerp bodies, redraw the ground marks, cull labels. */
  frame(dtMs: number): void {
    this.time += dtMs;
    const dt = Math.min(dtMs, 100);
    for (const b of this.players.values()) this.move(b, dt);
    for (const b of this.enemies.values()) this.move(b, dt);
    for (const b of this.npcs.values()) this.move(b, dt);
    this.drawGround();
    this.placeLabels();
  }

  /**
   * Lerp toward the snapshot, then dress the body: a walk bob and lean while
   * moving, a slow breath while idle, a squash during hit-stop, all cosmetic.
   */
  private move(b: Body, dtMs: number): void {
    const px = b.x;
    const py = b.y;
    if (!b.frozen) {
      const dx = b.tx - b.x;
      const dy = b.ty - b.y;
      if (dx * dx + dy * dy > SNAP_DISTANCE * SNAP_DISTANCE) {
        b.x = b.tx;
        b.y = b.ty;
      } else {
        b.x += dx * LERP;
        b.y += dy * LERP;
      }
    }
    const step = Math.hypot(b.x - px, b.y - py);
    const instant = dtMs > 0 ? (step / dtMs) * 1000 : 0;
    b.speed += (instant - b.speed) * 0.25;
    const moving = !b.frozen && b.speed > WALK_SPEED_MIN;

    let bob = 0;
    let lean = 0;
    let sx = 1;
    let sy = 1;
    if (moving) {
      const rate = Math.min(1.5, Math.max(0.6, b.speed / 170)) * (b.gait || 1);
      b.phase += dtMs * 0.0125 * rate;
      bob = Math.abs(Math.sin(b.phase)) * BOB_PX;
      lean = Math.sin(b.phase) * LEAN_DEG * (b.img.flipX ? -1 : 1);
    } else {
      // Settle the walk cycle so the next step starts from the ground.
      b.phase = 0;
      sy = 1 + BREATH * Math.sin(this.time * 0.0022 + b.seed);
    }
    if (b.frozen) {
      sx *= SQUASH_X;
      sy *= SQUASH_Y;
    }
    const img = b.img;
    img.setPosition(b.x, b.y - bob).setDepth(bodyDepth(b.y));
    img.setScale(b.baseSX * b.size * sx, b.baseSY * b.size * sy);
    img.setAngle(lean);
    if (b.aura) {
      b.aura.setPosition(b.x, b.y - 2);
      b.aura.angle = (this.time * 0.012) % 360;
    }
  }

  /** A soft shadow under a standing body. */
  private drawShadow(g: Phaser.GameObjects.Graphics, b: Body): void {
    if (!b.visible) return;
    g.fillStyle(COLOR.void, 0.36);
    g.fillEllipse(b.x, b.y + 3, 30, 11);
  }

  private drawGround(): void {
    const g = this.ground;
    g.clear();
    const snap = this.snap;
    if (!snap) return;
    const t = this.time / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.6);
    const you = this.youLike;

    // Shadows first, under everything else on the ground layer.
    for (const b of this.players.values()) this.drawShadow(g, b);
    for (const b of this.enemies.values()) this.drawShadow(g, b);
    for (const b of this.npcs.values()) this.drawShadow(g, b);

    // Nodes: a light under each altar. kept = sky, empty = dark, announced = gold pulse.
    for (const n of snap.nodes) this.drawNode(g, n, snap.now, pulse);

    // Players: storm ring, flag / truce dots, your own marks.
    for (const [id, b] of this.players) {
      const like = id === you.id ? you : this.findPublic(id);
      if (!like || like.dead) continue;
      if (like.stance === "storm") {
        g.lineStyle(1.5, COLOR.hot, 0.85);
        g.strokeEllipse(b.x, b.y - 2, 44, 26);
      }
      if (like.flagged) {
        g.fillStyle(COLOR.hot, 0.9);
        g.fillCircle(b.x + 18, b.y - 62, 3.5);
      } else if (like.truce) {
        g.fillStyle(COLOR.sky, 0.9);
        g.fillCircle(b.x + 18, b.y - 62, 3.5);
      }
    }

    // Enemies: a telegraph is a wedge toward its target that fills to the reach (red); recovery is a sky ring.
    for (const e of snap.enemies) {
      const b = this.enemies.get(e.id);
      if (!b || e.state === "dead") continue;
      const stats = ENEMY[e.kind];
      if (e.state === "telegraph" && stats.telegraph > 0) {
        const p = 1 - Math.max(0, Math.min(1, e.t / stats.telegraph));
        const r = 12 + (stats.reach - 12) * p;
        const target = e.targetId === you.id ? this.youBody : this.players.get(e.targetId) ?? null;
        const cx = b.x;
        const cy = b.y - 2;
        // Faint full reach so the danger's size is legible before the wedge commits.
        g.lineStyle(1, COLOR.wine, 0.5);
        g.strokeCircle(cx, cy, stats.reach);
        if (target) {
          const a = Math.atan2(target.y - cy, target.x - cx);
          const half = 0.62;
          g.fillStyle(COLOR.wine, 0.22 + 0.3 * p);
          g.slice(cx, cy, r, a - half, a + half, false);
          g.fillPath();
          g.lineStyle(2, COLOR.hot, 0.95);
          g.slice(cx, cy, r, a - half, a + half, false);
          g.strokePath();
        } else {
          g.lineStyle(2, COLOR.hot, 0.9);
          g.strokeCircle(cx, cy, r);
          g.fillStyle(COLOR.wine, 0.18 + 0.2 * p);
          g.fillCircle(cx, cy, r);
        }
      } else if (e.state === "recover") {
        const open = e.t > stats.recovery; // an interrupted swing: a longer, brighter window
        g.lineStyle(open ? 2.5 : 1.5, COLOR.sky, open ? 1 : 0.8);
        g.strokeCircle(b.x, b.y - 2, stats.reach * (open ? 0.75 : 0.6));
      }
    }

    // NPCs in the party get a gold dot above the head; one with an hour to hand you, a paper mark that breathes.
    for (const n of snap.npcs) {
      if (!n.present) continue;
      const b = this.npcs.get(n.id);
      if (!b) continue;
      if (n.party === "with") {
        g.fillStyle(COLOR.champagneLight, 1);
        g.fillCircle(b.x, b.y - 70, 4);
        g.lineStyle(1, COLOR.champagne, 1);
        g.strokeCircle(b.x, b.y - 70, 5.5);
      } else if (n.offers) {
        const y = b.y - 70 - 2 * pulse;
        g.lineStyle(1.5, COLOR.paper, 0.75 + 0.25 * pulse);
        g.beginPath();
        g.moveTo(b.x, y - 6);
        g.lineTo(b.x + 5, y);
        g.lineTo(b.x, y + 6);
        g.lineTo(b.x - 5, y);
        g.closePath();
        g.strokePath();
      }
    }

    // Buried wreckage and graves: small slabs.
    for (const w of snap.wreckage) {
      if (w.buried) this.drawSlab(g, w.x, w.y);
      else if (w.yours) {
        g.lineStyle(1.5, COLOR.champagne, 0.8);
        g.strokeEllipse(w.x, w.y, 48, 24);
      }
    }
    for (const gr of snap.graves) this.drawSlab(g, gr.x, gr.y);

    // The flag zone: the hot street when it is hot, the whole Wet Grid in meltdown weather.
    if (you.id && this.youBody && snap.district === "wet") {
      const meltdown = snap.gestell >= GESTELL_MELTDOWN;
      const hot = this.poiState("hot-street") === "hot";
      const rect = meltdown ? DISTRICT_BY_ID.wet.rect : hot ? HOT_STREET?.rect : undefined;
      if (rect) {
        g.lineStyle(2, COLOR.hot, 0.45 + 0.35 * pulse);
        g.strokeRect(rect.x * TILE + 3, rect.y * TILE + 3, rect.w * TILE - 6, rect.h * TILE - 6);
        // Corner ticks so the edge reads as a boundary, not a frame.
        const cx = rect.x * TILE, cy = rect.y * TILE, cw = rect.w * TILE, ch = rect.h * TILE;
        g.fillStyle(COLOR.hot, 0.8);
        for (const [x, y] of [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]] as const) g.fillCircle(x, y, 4);
      }
    }

    // The Clearing ring: gold when open, wine when failed, faint otherwise.
    const ring = POIS["clearing-ring"];
    if (ring) {
      const failed = this.poiState("clearing-ring") === "failed";
      if (snap.clearing.open) g.lineStyle(2.5, COLOR.champagneLight, 0.6 + 0.3 * pulse);
      else if (failed) g.lineStyle(2, COLOR.wine, 0.85);
      else g.lineStyle(1.5, COLOR.champagne, 0.18);
      g.strokeCircle(ring.x, ring.y, CLEARING_RADIUS);
      if (snap.clearing.open) {
        g.fillStyle(COLOR.champagneLight, 0.06);
        g.fillCircle(ring.x, ring.y, CLEARING_RADIUS);
      }
    }

    // The objective: a slow-pulsing gold ring.
    const target = snap.objective?.target;
    if (target) {
      g.lineStyle(2, COLOR.champagneLight, 0.55 + 0.4 * pulse);
      g.strokeCircle(target.x, target.y, 24 + 8 * pulse);
    }

    // Side hours: a thin paper ring at each step's target, quieter than the spine's gold.
    for (const so of snap.sideObjectives ?? []) {
      if (!so.target) continue;
      g.lineStyle(1.5, COLOR.paper, 0.35 + 0.25 * pulse);
      g.strokeCircle(so.target.x, so.target.y, 18 + 4 * pulse);
    }

    // The prompt target: a thin paper ring; a POI target also gets a gold one.
    const prompt = snap.prompt;
    if (prompt) {
      const at = this.promptPosition(prompt.targetId, prompt.targetKind);
      if (at) {
        if (prompt.targetKind === "poi" && prompt.verbs.length) {
          g.lineStyle(1.5, COLOR.champagne, 0.9);
          g.strokeCircle(at.x, at.y, 20);
        }
        g.lineStyle(1, COLOR.paper, 0.85);
        g.strokeCircle(at.x, at.y, 26);
      }
    }
  }

  private drawNode(g: Phaser.GameObjects.Graphics, n: NodeView, now: number, pulse: number): void {
    const announced = n.announcedUntil > now;
    if (announced) {
      g.fillStyle(COLOR.champagneLight, 0.35 + 0.25 * pulse);
      g.fillEllipse(n.x, n.y + 6, 56 + 10 * pulse, 26 + 5 * pulse);
      g.lineStyle(1.5, COLOR.champagneLight, 0.9);
      g.strokeEllipse(n.x, n.y + 6, 62 + 10 * pulse, 30 + 5 * pulse);
    } else if (n.kept) {
      g.fillStyle(COLOR.sky, 0.38);
      g.fillEllipse(n.x, n.y + 6, 52, 24);
      g.lineStyle(1, COLOR.sky, 0.8);
      g.strokeEllipse(n.x, n.y + 6, 52, 24);
    } else if (n.charges <= 0) {
      g.fillStyle(COLOR.void, 0.55);
      g.fillEllipse(n.x, n.y + 6, 48, 22);
    } else {
      g.fillStyle(COLOR.champagne, 0.22);
      g.fillEllipse(n.x, n.y + 6, 48, 22);
    }
    if (n.safe) {
      g.lineStyle(1, COLOR.champagneLight, 0.7);
      g.strokeEllipse(n.x, n.y + 6, 72, 36);
    }
    if (n.seed) {
      g.fillStyle(COLOR.champagneLight, 0.95);
      g.fillTriangle(n.x, n.y + 14, n.x - 5, n.y + 24, n.x + 5, n.y + 24);
    }
  }

  private drawSlab(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(COLOR.void, 0.35);
    g.fillEllipse(x, y + 4, 26, 10);
    g.fillStyle(COLOR.muted, 1);
    g.fillRect(x - 9, y - 12, 18, 14);
    g.fillStyle(COLOR.paper, 0.85);
    g.fillRect(x - 9, y - 12, 18, 2);
    g.fillStyle(COLOR.champagne, 0.8);
    g.fillRect(x - 5, y - 6, 10, 1.5);
  }

  private findPublic(id: string): PlayerLike | null {
    const snap = this.snap;
    if (!snap) return null;
    for (const p of snap.players) if (p.id === id) return this.asLike(p);
    return null;
  }

  private poiState(id: string): string {
    const snap = this.snap;
    if (!snap) return "";
    for (const p of snap.pois) if (p.id === id) return p.state;
    return "";
  }

  private readonly scratch = { x: 0, y: 0 };
  private promptPosition(id: string, kind: string): { x: number; y: number } | null {
    const s = this.scratch;
    if (kind === "poi") {
      const p = POIS[id];
      if (!p) return null;
      s.x = p.x;
      s.y = p.y;
      return s;
    }
    const b = kind === "npc" ? this.npcs.get(id) : kind === "enemy" ? this.enemies.get(id) : kind === "player" ? this.players.get(id) : null;
    if (b) {
      s.x = b.x;
      s.y = b.y - 2;
      return s;
    }
    const snap = this.snap!;
    if (kind === "node") {
      for (const n of snap.nodes) if (n.id === id) { s.x = n.x; s.y = n.y + 6; return s; }
    } else if (kind === "wreckage") {
      for (const w of snap.wreckage) if (w.id === id) { s.x = w.x; s.y = w.y; return s; }
    }
    return null;
  }

  // ------------------------------------------------------------ labels

  private placeLabels(): void {
    const snap = this.snap;
    const me = this.youBody;
    this.labelUsed.clear();
    if (snap && me) {
      const r2 = LABEL_RANGE * LABEL_RANGE;
      const near = (x: number, y: number) => {
        const dx = x - me.x;
        const dy = y - me.y;
        return dx * dx + dy * dy <= r2;
      };
      for (const p of snap.players) {
        const b = this.players.get(p.id);
        if (!b || p.id === snap.you.id || p.dead || !near(b.x, b.y)) continue;
        this.label(`p:${p.id}`, p.name, b.x, b.y - 74, p.guest ? "#e8e8e8" : "#e8d5a3");
      }
      for (const e of snap.enemies) {
        const b = this.enemies.get(e.id);
        if (!b || e.state === "dead" || !near(b.x, b.y)) continue;
        this.label(`e:${e.id}`, `${e.name} · ${Math.max(0, Math.ceil(e.hp))}`, b.x, b.y - 74, e.state === "telegraph" ? "#ff2d6b" : "#f2eefb");
      }
      for (const n of snap.npcs) {
        const b = this.npcs.get(n.id);
        if (!b || !n.present || !near(b.x, b.y)) continue;
        this.label(`n:${n.id}`, n.offers && n.party !== "with" ? `${n.name} · has an hour` : n.name, b.x, b.y - 74, "#e8d5a3");
      }
      for (const n of snap.nodes) {
        if (!near(n.x, n.y)) continue;
        const hint = n.chargesHint !== undefined || n.yieldHint !== undefined
          ? ` · ${n.chargesHint ?? n.charges}${n.yieldHint !== undefined ? ` × ${n.yieldHint}` : ""}`
          : "";
        this.label(`node:${n.id}`, `Yield node${hint}`, n.x, n.y - 44, n.kept ? "#7eb6ff" : "#c9a56a");
      }
      for (const p of POI_LIST) {
        if (!near(p.x, p.y)) continue;
        this.label(`poi:${p.id}`, p.name, p.x, p.y - 30, "#c9a56a");
      }
      for (const w of snap.wreckage) {
        if (w.buried || !near(w.x, w.y)) continue;
        this.label(`w:${w.id}`, `${w.fromName}${w.bestand ? ` · ${w.bestand}` : ""}`, w.x, w.y - 44, w.yours ? "#e8d5a3" : "#f2eefb");
      }
      for (const h of snap.history) if (near(h.x, h.y)) this.label(`h:${h.id}`, h.line, h.x, h.y - 32, "#e8d5a3");
      for (const f of snap.failed) if (near(f.x, f.y)) this.label(`f:${f.id}`, f.line, f.x, f.y - 26, "#cdc4ea");
    }
    for (const [id, text] of this.labelById) {
      if (this.labelUsed.has(id)) continue;
      text.setVisible(false);
      this.labelById.delete(id);
      this.labelFree.push(text);
    }
  }

  private label(id: string, str: string, x: number, y: number, color: string): void {
    this.labelUsed.add(id);
    let t = this.labelById.get(id);
    if (!t) {
      t = this.labelFree.pop() ?? this.scene.add
        .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "11px", fontStyle: "500", color: "#ffffff", backgroundColor: "rgba(10,10,10,0.72)", padding: { x: 5, y: 2 } })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.label)
        .setResolution(2);
      t.setVisible(true);
      this.labelById.set(id, t);
    }
    if (t.text !== str) t.setText(str);
    if (t.style.color !== color) t.setColor(color);
    t.setPosition(Math.round(x), Math.round(y));
  }

  destroy(): void {
    for (const b of this.players.values()) { b.img.destroy(); b.aura?.destroy(); }
    for (const b of this.enemies.values()) b.img.destroy();
    for (const b of this.npcs.values()) b.img.destroy();
    for (const m of this.wreckage.values()) m.img.destroy();
    for (const m of this.history.values()) m.img.destroy();
    for (const m of this.failed.values()) m.img.destroy();
    for (const t of this.labelById.values()) t.destroy();
    for (const t of this.labelFree) t.destroy();
    this.ground.destroy();
  }
}
