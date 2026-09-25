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
} as const;

/** Texture keys registered by BootScene. */
export const TEX = {
  floor: (k: FloorKey) => `floor-${k}`,
  crt: "prop-crt",
  scanline: "scanline",
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

// ---------------------------------------------------------------- geometry helpers

const px = (tiles: number) => tiles * TILE;

/** Horizontal runs of solid tiles inside a rect, merged so the Graphics draws few rects. */
function runsIn(rect: Rect, solid: (tx: number, ty: number) => boolean): Rect[] {
  const out: Rect[] = [];
  for (let ty = rect.y; ty < rect.y + rect.h; ty++) {
    let start = -1;
    for (let tx = rect.x; tx <= rect.x + rect.w; tx++) {
      const s = tx < rect.x + rect.w && solid(tx, ty);
      if (s && start < 0) start = tx;
      if (!s && start >= 0) {
        out.push({ x: start, y: ty, w: tx - start, h: 1 });
        start = -1;
      }
    }
  }
  return out;
}

function inRect(r: Rect, tx: number, ty: number): boolean {
  return tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;
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
  private hotStreet: Phaser.GameObjects.TileSprite | null = null;
  private band: WeatherBand = "mixed";
  private hot = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    ensureScanlineTexture(scene);
    this.buildFloors();
    this.buildWalls();
    this.buildGates();
    this.buildProps();
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
    // Interior walls, one Graphics per district.
    for (const d of DISTRICTS) {
      const runs = runsIn(d.rect, (tx, ty) => isWall(tx, ty));
      if (!runs.length) continue;
      const g = s.add.graphics().setDepth(DEPTH.wall);
      this.drawBlocks(g, runs, true);
    }
    // The outer band: every tile outside every district and gate.
    const floorArea = new Uint8Array(COLS * ROWS);
    const mark = (r: Rect) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x >= 0 && y >= 0 && x < COLS && y < ROWS) floorArea[y * COLS + x] = 1;
    };
    DISTRICTS.forEach((d) => mark(d.rect));
    GATES.forEach((g) => mark(g.rect));
    const bandRuns = runsIn({ x: 0, y: 0, w: COLS, h: ROWS }, (tx, ty) => floorArea[ty * COLS + tx] === 0);
    const band = s.add.graphics().setDepth(DEPTH.wall);
    this.drawBlocks(band, bandRuns, false);
    // Champagne seam along the inner edge of the band (the lit edge of every district).
    band.lineStyle(2, COLOR.champagne, 0.45);
    for (const d of DISTRICTS) band.strokeRect(px(d.rect.x) - 1, px(d.rect.y) - 1, px(d.rect.w) + 2, px(d.rect.h) + 2);
    band.lineStyle(1, COLOR.champagne, 0.3);
    for (const g of GATES) band.strokeRect(px(g.rect.x) - 0.5, px(g.rect.y) - 0.5, px(g.rect.w) + 1, px(g.rect.h) + 1);
  }

  private drawBlocks(g: Phaser.GameObjects.Graphics, runs: Rect[], seams: boolean): void {
    g.fillStyle(COLOR.wallBlock, 1);
    for (const r of runs) g.fillRect(px(r.x), px(r.y), px(r.w), px(r.h));
    // A faint lower edge for volume.
    g.fillStyle(COLOR.void, 0.55);
    for (const r of runs) g.fillRect(px(r.x), px(r.y + r.h) - 4, px(r.w), 4);
    if (!seams) return;
    // Champagne seam on the lit (top/left) edge of every interior block.
    g.fillStyle(COLOR.champagne, 0.42);
    for (const r of runs) {
      g.fillRect(px(r.x), px(r.y), px(r.w), 2);
      g.fillRect(px(r.x), px(r.y), 2, px(r.h));
    }
    g.fillStyle(COLOR.wallEdge, 1);
    for (const r of runs) g.fillRect(px(r.x) + 2, px(r.y) + 2, px(r.w) - 4, 1);
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
    // CRT altars: at the crt-altar POIs and at every yield node.
    const altarAt = (id: string, x: number, y: number) => {
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

    // Glows: oval light pools in the Kerb and the Ring, drawn additively.
    const glow = s.add.graphics().setDepth(DEPTH.prop).setBlendMode(Phaser.BlendModes.ADD);
    for (const id of ["kerb", "ring"] as const) {
      const d = DISTRICT_BY_ID[id];
      this.drawOvals(glow, d);
    }
    // Bell posts.
    const solid = s.add.graphics().setDepth(DEPTH.prop);
    for (const p of POI_LIST) {
      if (p.kind !== "bell") continue;
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
