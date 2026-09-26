/**
 * The level as the client draws it, built once at create() from src/sim/map.ts.
 * One TileSprite per district, one per floor patch, one Graphics of walls per
 * district plus one for the outer band, lavender fields on gates the viewer
 * cannot pass, and the static props. Nothing here moves per frame except
 * tints and overlay visibility, which change only when the snapshot says so.
 */
import Phaser from "phaser";
import {
  COLS, DISTRICTS, DISTRICT_BY_ID, FLOOR_FILES, GATES, NODE_LIST, PATCHES, POI_LIST, ROWS, TILE, WORLD_H, WORLD_W,
  gateOpenFor, isWall,
  type DistrictDef, type FloorKey, type GateDef, type Rect,
} from "../sim/map";
import type { PoiView, WeatherBand } from "../sim/protocol";
import type { DistrictId, Player } from "../sim/types";
import { PROP_SIZE, propTarget, staticPropSlots, type PropKind } from "../assets/slots";
import { genTex } from "../scenes/BootScene";

// ---------------------------------------------------------------- shared render tokens

/** Draw order. Bodies sit between props and labels, sorted by y. */
export const DEPTH = { floor: 0, patch: 1, wall: 2, prop: 3, ground: 4, body: 10, label: 20, fx: 30 } as const;
export const bodyDepth = (y: number): number => DEPTH.body + y / 1000;

/** World palette (never acid). */
export const COLOR = {
  void: 0x0a0a0a,
  paper: 0xffffff,
  muted: 0x5a5a5a,
  champagne: 0xc9a56a,
  champagneLight: 0xe8d5a3,
  sky: 0x7eb6ff,
  wine: 0x7a1028,
  hot: 0xff2d6b,
  lavender: 0xb9b0d8,
  wallBlock: 0x15141d,
  wallEdge: 0x2a2734,
  wallFace: 0x8a84a6,
} as const;

/** Texture keys registered by BootScene. */
export const TEX = {
  floor: (k: FloorKey) => `floor-${k}`,
  crt: "prop-crt",
  scanline: "scanline",
  rain: "rain",
  wingStar: "wing-star",
  history: "serial-wreckage",
  failed: "failed-passing",
  guest: "guest",
  angel: "angel",
  clerk: "clerk",
  aura: "fx-aura",
  strike: "fx-strike",
  wreckage: "fx-wreckage",
} as const;

/** Sprite keys the boot loads for NPCs (npc.sprite falls back to guest when unknown). */
export const NPC_SPRITES = ["nara", "quill", "ord", "ione", "vesper"] as const;

export const UI_FONT = '"Space Grotesk", system-ui, sans-serif';

export function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/** Makes the 4×4 scanline texture (one white line) if it does not exist yet. */
export function ensureScanlineTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEX.scanline)) return;
  const tex = scene.textures.createCanvas(TEX.scanline, 4, 4);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, 4, 4);
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(0, 0, 4, 1);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(0, 2, 4, 1);
  tex.refresh();
}

/** Makes the 2×14 rain streak texture (a vertical fade) if it does not exist yet. */
export function ensureRainTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEX.rain)) return;
  const tex = scene.textures.createCanvas(TEX.rain, 2, 14);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, 2, 14);
  const grad = ctx.createLinearGradient(0, 0, 0, 14);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 14);
  tex.refresh();
}

// ---------------------------------------------------------------- geometry helpers

const px = (tiles: number) => tiles * TILE;

/**
 * Greedy rectangle cover of the solid tiles inside an area: top-left first,
 * widen along the row, then deepen while every row below matches. Yields a
 * few dozen rects for the outer band instead of hundreds of row runs.
 */
function coverRects(area: Rect, solid: (tx: number, ty: number) => boolean): Rect[] {
  const used = new Uint8Array(COLS * ROWS);
  const free = (tx: number, ty: number) => solid(tx, ty) && used[ty * COLS + tx] === 0;
  const out: Rect[] = [];
  for (let ty = area.y; ty < area.y + area.h; ty++) {
    for (let tx = area.x; tx < area.x + area.w; tx++) {
      if (!free(tx, ty)) continue;
      let w = 1;
      while (tx + w < area.x + area.w && free(tx + w, ty)) w++;
      let h = 1;
      deepen: while (ty + h < area.y + area.h) {
        for (let i = 0; i < w; i++) if (!free(tx + i, ty + h)) break deepen;
        h++;
      }
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) used[(ty + j) * COLS + tx + i] = 1;
      out.push({ x: tx, y: ty, w, h });
    }
  }
  return out;
}

/** Texture scale so a floor texture covers about eight tiles. */
function floorScale(scene: Phaser.Scene, key: FloorKey): number {
  const src = scene.textures.get(TEX.floor(key)).getSourceImage() as { width?: number };
  const w = src && src.width ? src.width : 1024;
  const cover = w <= 256 ? px(4) : px(8);
  return cover / w;
}

const BAND_MIX: Record<WeatherBand, { color: number; amount: number }> = {
  clear: { color: COLOR.champagneLight, amount: 0.28 },
  mixed: { color: COLOR.paper, amount: 0 },
  fat: { color: COLOR.lavender, amount: 0.5 },
  meltdown: { color: COLOR.wine, amount: 0.4 },
};

function gateWord(g: GateDef): string {
  return g.requires === "under" ? "UNDER" : g.requires === "angel" ? "ANGEL" : g.requires === "m3" ? "III" : "";
}

// ---------------------------------------------------------------- Floors

type GateField = { gate: GateDef; field: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text };

export class Floors {
  private readonly scene: Phaser.Scene;
  private readonly districtSprites = new Map<DistrictId, Phaser.GameObjects.TileSprite>();
  private readonly patchSprites: { sprite: Phaser.GameObjects.TileSprite; district: DistrictId; id: string }[] = [];
  private readonly frozenOverlays = new Map<DistrictId, Phaser.GameObjects.TileSprite>();
  private readonly meltdownOverlay: Phaser.GameObjects.TileSprite;
  private readonly gateFields: GateField[] = [];
  private readonly hallLamps = new Map<string, Phaser.GameObjects.Arc>();
  private readonly altars = new Map<string, Phaser.GameObjects.Image>();
  private rain: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private hotStreet: Phaser.GameObjects.TileSprite | null = null;
  private band: WeatherBand = "mixed";
  private hot = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    ensureScanlineTexture(scene);
    ensureRainTexture(scene);
    this.buildFloors();
    this.buildWalls();
    this.buildGates();
    this.buildProps();
    this.buildRain();
    this.meltdownOverlay = scene.add
      .tileSprite(0, 0, WORLD_W, WORLD_H, TEX.scanline)
      .setOrigin(0, 0)
      .setDepth(DEPTH.ground)
      .setTint(COLOR.wine)
      .setAlpha(0.22)
      .setVisible(false);
    this.setWeather("mixed");
  }

  // -------------------------------------------------------------- build

  private buildFloors(): void {
    const s = this.scene;
    for (const d of DISTRICTS) {
      const r = d.rect;
      const sprite = s.add
        .tileSprite(px(r.x), px(r.y), px(r.w), px(r.h), TEX.floor(d.floor))
        .setOrigin(0, 0)
        .setDepth(DEPTH.floor);
      sprite.setTileScale(floorScale(s, d.floor));
      this.districtSprites.set(d.id, sprite);

      const frozen = s.add
        .tileSprite(px(r.x), px(r.y), px(r.w), px(r.h), TEX.scanline)
        .setOrigin(0, 0)
        .setDepth(DEPTH.ground)
        .setTint(COLOR.lavender)
        .setAlpha(0.3)
        .setVisible(false);
      this.frozenOverlays.set(d.id, frozen);
    }
    // Gates are floor too: give them the floor of district a so the band does not show through.
    for (const g of GATES) {
      const d = DISTRICT_BY_ID[g.a];
      const sprite = s.add
        .tileSprite(px(g.rect.x), px(g.rect.y), px(g.rect.w), px(g.rect.h), TEX.floor(d.floor))
        .setOrigin(0, 0)
        .setDepth(DEPTH.floor);
      sprite.setTileScale(floorScale(s, d.floor));
      this.patchSprites.push({ sprite, district: d.id, id: g.id });
    }
    for (const p of PATCHES) {
      const r = p.rect;
      const sprite = s.add
        .tileSprite(px(r.x), px(r.y), px(r.w), px(r.h), TEX.floor(p.floor))
        .setOrigin(0, 0)
        .setDepth(DEPTH.patch);
      sprite.setTileScale(floorScale(s, p.floor));
      this.patchSprites.push({ sprite, district: p.district, id: p.id });
      if (p.id === "patch-hot-street") this.hotStreet = sprite;
    }
  }

  private buildWalls(): void {
    const s = this.scene;
    // Interior walls: one wall-face TileSprite per covered rect and one seam Graphics per district.
    for (const d of DISTRICTS) {
      const rects = coverRects(d.rect, (tx, ty) => isWall(tx, ty));
      if (!rects.length) continue;
      this.wallFaces(rects, 0.9);
      const seams = s.add.graphics().setDepth(DEPTH.wall + 0.04);
      this.drawSeams(seams, rects);
    }
    // The outer band: every tile outside every district and gate.
    const floorArea = new Uint8Array(COLS * ROWS);
    const mark = (r: Rect) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x >= 0 && y >= 0 && x < COLS && y < ROWS) floorArea[y * COLS + x] = 1;
    };
    DISTRICTS.forEach((d) => mark(d.rect));
    GATES.forEach((g) => mark(g.rect));
    const bandRects = coverRects({ x: 0, y: 0, w: COLS, h: ROWS }, (tx, ty) => floorArea[ty * COLS + tx] === 0);
    this.wallFaces(bandRects, 0.72);
    // Champagne seam along the inner edge of the band (the lit edge of every district).
    const edge = s.add.graphics().setDepth(DEPTH.wall + 0.04);
    edge.lineStyle(2, COLOR.champagne, 0.45);
    for (const d of DISTRICTS) edge.strokeRect(px(d.rect.x) - 1, px(d.rect.y) - 1, px(d.rect.w) + 2, px(d.rect.h) + 2);
    edge.lineStyle(1, COLOR.champagne, 0.3);
    for (const g of GATES) edge.strokeRect(px(g.rect.x) - 0.5, px(g.rect.y) - 0.5, px(g.rect.w) + 1, px(g.rect.h) + 1);
  }

  /**
   * One wall-face TileSprite per rect over a dark block base. The texture is
   * offset by world position so the pattern runs continuously across rects.
   * Off-screen sprites are culled by the camera; nothing here is per frame.
   */
  private wallFaces(rects: Rect[], alpha: number): void {
    const s = this.scene;
    const scale = floorScale(s, "wall") * 0.5;
    const base = s.add.graphics().setDepth(DEPTH.wall);
    base.fillStyle(COLOR.wallBlock, 1);
    for (const r of rects) {
      base.fillRect(px(r.x), px(r.y), px(r.w), px(r.h));
      const face = s.add
        .tileSprite(px(r.x), px(r.y), px(r.w), px(r.h), TEX.floor("wall"))
        .setOrigin(0, 0)
        .setDepth(DEPTH.wall + 0.02)
        .setTint(COLOR.wallFace)
        .setAlpha(alpha);
      face.setTileScale(scale);
      face.setTilePosition(px(r.x), px(r.y));
    }
  }

  /** Volume for a block: a void lower edge and a champagne seam on the lit (top/left) edge. */
  private drawSeams(g: Phaser.GameObjects.Graphics, runs: Rect[]): void {
    g.fillStyle(COLOR.void, 0.55);
    for (const r of runs) g.fillRect(px(r.x), px(r.y + r.h) - 4, px(r.w), 4);
    g.fillStyle(COLOR.champagne, 0.42);
    for (const r of runs) {
      g.fillRect(px(r.x), px(r.y), px(r.w), 2);
      g.fillRect(px(r.x), px(r.y), 2, px(r.h));
    }
    g.fillStyle(COLOR.wallEdge, 1);
    for (const r of runs) g.fillRect(px(r.x) + 2, px(r.y) + 2, px(r.w) - 4, 1);
  }

  /** Rain over the Wet Grid, emitting only while the viewer is there. */
  private buildRain(): void {
    const r = DISTRICT_BY_ID.wet.rect;
    const zone = new Phaser.Geom.Rectangle(px(r.x) - 48, px(r.y) - 160, px(r.w) + 96, px(r.h) + 160);
    this.rain = this.scene.add
      .particles(0, 0, TEX.rain, {
        emitZone: { type: "random", source: zone, quantity: 1 },
        speedY: { min: 460, max: 640 },
        speedX: { min: -46, max: -18 },
        lifespan: 720,
        alpha: { start: 0.5, end: 0.04 },
        scaleY: { min: 0.9, max: 1.7 },
        scaleX: 1,
        quantity: 3,
        frequency: 14,
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      })
      .setDepth(DEPTH.fx - 1);
    this.rain.setParticleTint(0xcfe0ff);
  }

  private buildGates(): void {
    const s = this.scene;
    for (const gate of GATES) {
      if (!gate.requires) continue;
      const r = gate.rect;
      const field = s.add
        .rectangle(px(r.x) + px(r.w) / 2, px(r.y) + px(r.h) / 2, px(r.w) - 4, px(r.h) - 4, COLOR.lavender, 0.32)
        .setStrokeStyle(2, COLOR.lavender, 0.8)
        .setDepth(DEPTH.prop);
      const label = s.add
        .text(field.x, field.y, gateWord(gate), {
          fontFamily: UI_FONT,
          fontSize: "12px",
          fontStyle: "700",
          color: "#f2eefb",
          letterSpacing: 2,
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.prop + 0.1);
      this.gateFields.push({ gate, field, label });
    }
  }

  private buildProps(): void {
    const s = this.scene;
    // Generated props stand in for the drawn ones wherever the boot loaded their texture.
    const genKey = (kind: PropKind): string | null => (s.textures.exists(genTex(propTarget(kind))) ? genTex(propTarget(kind)) : null);
    const generated = new Set<PropKind>();
    for (const slot of staticPropSlots()) {
      const key = genKey(slot.kind);
      if (!key) continue;
      generated.add(slot.kind);
      const size = PROP_SIZE[slot.kind];
      const img = s.add.image(slot.x, slot.y, key).setDisplaySize(size.w, size.h).setOrigin(0.5, 0.7).setDepth(DEPTH.prop);
      if (slot.kind === "oval-light") img.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7).setOrigin(0.5, 0.5);
      if (slot.kind === "crt-altar") {
        img.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.85).setOrigin(0.5, 0.5);
        this.altars.set(slot.id, img);
      }
    }

    // CRT altars: at the crt-altar POIs and at every yield node.
    const altarAt = (id: string, x: number, y: number) => {
      if (generated.has("crt-altar")) return;
      const img = s.add
        .image(x, y - 10, TEX.crt)
        .setDisplaySize(46, 46)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.85)
        .setDepth(DEPTH.prop);
      this.altars.set(id, img);
    };
    for (const p of POI_LIST) if (p.id.startsWith("crt-altar")) altarAt(p.id, p.x, p.y);
    for (const n of NODE_LIST) altarAt(n.id, n.x, n.y);

    // Glows: oval light pools in the Kerb and the Ring, drawn additively; a pool at every shrine.
    const glow = s.add.graphics().setDepth(DEPTH.prop).setBlendMode(Phaser.BlendModes.ADD);
    for (const id of ["kerb", "ring"] as const) {
      const d = DISTRICT_BY_ID[id];
      this.drawOvals(glow, d);
    }
    for (const p of POI_LIST) {
      if (p.kind !== "shrine" || generated.has("oval-light")) continue;
      glow.fillStyle(COLOR.champagneLight, 0.14);
      glow.fillEllipse(p.x, p.y + 4, 116, 62);
      glow.fillStyle(COLOR.champagneLight, 0.12);
      glow.fillEllipse(p.x, p.y + 4, 64, 34);
      glow.lineStyle(1, COLOR.champagne, 0.3);
      glow.strokeEllipse(p.x, p.y + 4, 116, 62);
    }
    // Bell posts.
    const solid = s.add.graphics().setDepth(DEPTH.prop);
    for (const p of POI_LIST) {
      if (p.kind !== "bell" || generated.has("shrine-bell")) continue;
      solid.fillStyle(COLOR.wallBlock, 1);
      solid.fillRect(p.x - 3, p.y - 26, 6, 26);
      solid.fillStyle(COLOR.void, 0.35);
      solid.fillEllipse(p.x, p.y + 2, 22, 9);
      solid.fillStyle(COLOR.champagne, 1);
      solid.fillCircle(p.x, p.y - 28, 6);
      solid.fillStyle(COLOR.champagneLight, 1);
      solid.fillCircle(p.x - 1.5, p.y - 29.5, 2);
    }
    // Lamp glows at the House halls; brightness follows the hall state.
    for (const p of POI_LIST) {
      if (p.kind !== "hall") continue;
      const lamp = s.add
        .circle(p.x, p.y - 6, 44, COLOR.champagneLight, 0.08)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH.prop);
      this.hallLamps.set(p.id, lamp);
    }
  }

  private drawOvals(g: Phaser.GameObjects.Graphics, d: DistrictDef): void {
    const r = d.rect;
    const cols = 3, rows = 2;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = px(r.x) + px(r.w) * ((i + 0.5) / cols);
        const cy = px(r.y) + px(r.h) * ((j + 0.5) / rows) + (i % 2 ? 24 : -24);
        g.fillStyle(COLOR.champagneLight, 0.1);
        g.fillEllipse(cx, cy, 150, 84);
        g.fillStyle(COLOR.champagneLight, 0.12);
        g.fillEllipse(cx, cy, 96, 52);
        g.lineStyle(1.5, COLOR.champagne, 0.35);
        g.strokeEllipse(cx, cy, 150, 84);
      }
    }
  }

  // -------------------------------------------------------------- state

  /** Hide fields on gates the viewer can pass now. */
  updateGates(you: Pick<Player, "guest" | "flags"> | null | undefined): void {
    for (const f of this.gateFields) {
      const open = gateOpenFor(you, f.gate);
      f.field.setVisible(!open);
      f.label.setVisible(!open);
    }
  }

  /** Tints every floor by the climate band; meltdown adds a wine scanline overlay. */
  setWeather(band: WeatherBand): void {
    this.band = band;
    const mix = BAND_MIX[band];
    for (const d of DISTRICTS) {
      const tint = this.tintFor(d, mix);
      this.districtSprites.get(d.id)?.setTint(tint);
    }
    for (const p of this.patchSprites) {
      const d = DISTRICT_BY_ID[p.district];
      p.sprite.setTint(this.tintFor(d, mix));
    }
    this.applyHot();
    this.meltdownOverlay.setVisible(band === "meltdown");
  }

  private tintFor(d: DistrictDef, mix: { color: number; amount: number }): number {
    const base = mixColor(d.tint, COLOR.paper, 0.6);
    return mixColor(base, mix.color, mix.amount);
  }

  /** Lavender scanlines over every frozen district. */
  setFrozen(ids: readonly string[]): void {
    for (const [id, overlay] of this.frozenOverlays) overlay.setVisible(ids.includes(id));
  }

  /** Rain falls on the Wet Grid while you are in it; heavier and wine-lit in meltdown weather. */
  setRain(district: DistrictId, band: WeatherBand): void {
    const rain = this.rain;
    if (!rain) return;
    const on = district === "wet";
    rain.emitting = on;
    if (!on) return;
    rain.frequency = band === "meltdown" ? 6 : band === "clear" ? 36 : 14;
    rain.setParticleTint(band === "meltdown" ? 0xffb3c6 : band === "fat" ? 0xd9d0f2 : 0xcfe0ff);
  }

  /** POI-driven props: hall lamps, altar brightness, the hot street. */
  setPois(pois: readonly PoiView[]): void {
    let hot = false;
    for (const p of pois) {
      const lamp = this.hallLamps.get(p.id);
      if (lamp) lamp.setFillStyle(COLOR.champagneLight, p.state === "lit" ? 0.3 : 0.07);
      const altar = this.altars.get(p.id);
      if (altar) altar.setAlpha(p.state === "lit" ? 1 : 0.7);
      if (p.id === "hot-street") hot = p.state === "hot";
    }
    if (hot !== this.hot) {
      this.hot = hot;
      this.applyHot();
    }
  }

  private applyHot(): void {
    if (!this.hotStreet) return;
    if (this.hot) {
      const d = DISTRICT_BY_ID.wet;
      const base = this.tintFor(d, BAND_MIX[this.band]);
      this.hotStreet.setTint(mixColor(base, COLOR.hot, 0.45));
    }
  }

  get weather(): WeatherBand {
    return this.band;
  }
}
