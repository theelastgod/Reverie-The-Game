/**
 * The city. One continuous top-down map; districts are organs of it.
 * This file is the level: every wall, gate, floor patch and named position
 * lives here so collision, reachability and content agree.
 *
 * Coordinates: tiles are TILE px. Rects are in tiles, inclusive of x..x+w-1.
 * Positions (POIs, homes, spawns) are in px at tile centres.
 */
import { TILE, BODY_R } from "./constants";
import type { DistrictId, EnemyKind, Player, Vec } from "./types";

export { TILE, BODY_R };
export const COLS = 104;
export const ROWS = 80;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export type Rect = { x: number; y: number; w: number; h: number };
const R = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

export type FloorKey =
  | "nave" | "wet" | "care" | "annex" | "kerb" | "shrine" | "strait" | "forge" | "cable" | "clearing"
  | "burial" | "arena" | "under" | "stall" | "claims" | "operator" | "garden" | "hall" | "wall";

/** Texture files under public/assets/tiles. */
export const FLOOR_FILES: Record<FloorKey, string> = {
  nave: "tiles/nave-v2.png",
  wet: "tiles/wet.jpg",
  care: "tiles/care.jpg",
  annex: "tiles/annex.jpg",
  kerb: "tiles/m3.jpg",
  shrine: "tiles/shrine.jpg",
  strait: "tiles/nave.jpg",
  forge: "tiles/forge.jpg",
  cable: "tiles/cable.jpg",
  clearing: "tiles/clearing.jpg",
  burial: "tiles/burial.jpg",
  arena: "tiles/arena.jpg",
  under: "tiles/under.jpg",
  stall: "tiles/stall.jpg",
  claims: "tiles/claims.jpg",
  operator: "tiles/operator.jpg",
  garden: "tiles/garden.jpg",
  hall: "tiles/hall.jpg",
  wall: "tiles/wall.jpg",
};

export type DistrictDef = {
  id: DistrictId;
  name: string; // HUD name
  fourfold: string; // "Gestell", "Sky", "Mortals", "Divinities", "Katechon", "Iridescent", "Earth", "Event"
  floor: FloorKey;
  rect: Rect;
  tint: number; // ambient light tint for the client (0xRRGGBB)
  flagLegal: boolean; // PvP flags may be raised here
};

export const DISTRICTS: DistrictDef[] = [
  { id: "annex", name: "Safety Annex", fourfold: "Katechon", floor: "annex", rect: R(2, 2, 32, 24), tint: 0xb9b0d8, flagLegal: false },
  { id: "kerb", name: "Kerb of Hours", fourfold: "Sky", floor: "kerb", rect: R(37, 2, 32, 24), tint: 0xe8d5a3, flagLegal: false },
  { id: "ring", name: "Gold Ring", fourfold: "Divinities", floor: "shrine", rect: R(72, 2, 30, 24), tint: 0xc9a56a, flagLegal: false },
  { id: "nave", name: "Nave of Tubes", fourfold: "Gestell", floor: "nave", rect: R(2, 29, 32, 26), tint: 0x9a8fc0, flagLegal: false },
  { id: "wet", name: "Wet Grid", fourfold: "Iridescent", floor: "wet", rect: R(37, 29, 32, 26), tint: 0x7eb6ff, flagLegal: true },
  { id: "organs", name: "The Organs", fourfold: "Earth", floor: "forge", rect: R(72, 29, 30, 26), tint: 0xc98a5a, flagLegal: true },
  { id: "care", name: "The Care", fourfold: "Mortals", floor: "care", rect: R(2, 58, 32, 20), tint: 0xe8e8e8, flagLegal: false },
  { id: "clearing", name: "The Clearing", fourfold: "Event", floor: "clearing", rect: R(37, 58, 32, 20), tint: 0xffffff, flagLegal: true },
];
export const DISTRICT_BY_ID: Record<DistrictId, DistrictDef> = Object.fromEntries(DISTRICTS.map(d => [d.id, d])) as Record<DistrictId, DistrictDef>;

export type GateRequirement = "" | "under" | "angel" | "m3";
export type GateDef = { id: string; a: DistrictId; b: DistrictId; rect: Rect; requires: GateRequirement };
export const GATES: GateDef[] = [
  { id: "gate-nave-annex", a: "nave", b: "annex", rect: R(16, 26, 3, 3), requires: "" },
  { id: "gate-nave-wet", a: "nave", b: "wet", rect: R(34, 40, 3, 3), requires: "" },
  { id: "gate-nave-care", a: "nave", b: "care", rect: R(16, 55, 3, 3), requires: "under" },
  { id: "gate-annex-kerb", a: "annex", b: "kerb", rect: R(34, 12, 3, 3), requires: "" },
  { id: "gate-wet-kerb", a: "wet", b: "kerb", rect: R(52, 26, 3, 3), requires: "" },
  { id: "gate-kerb-ring", a: "kerb", b: "ring", rect: R(69, 12, 3, 3), requires: "" },
  { id: "gate-wet-organs", a: "wet", b: "organs", rect: R(69, 40, 3, 3), requires: "m3" },
  { id: "gate-ring-organs", a: "ring", b: "organs", rect: R(86, 26, 3, 3), requires: "m3" },
  { id: "gate-wet-clearing", a: "wet", b: "clearing", rect: R(52, 55, 3, 3), requires: "angel" },
  { id: "gate-care-clearing", a: "care", b: "clearing", rect: R(34, 66, 3, 3), requires: "angel" },
];

/** A walled room with one door tile removed. */
export type BoxDef = { id: string; rect: Rect; door: { side: "n" | "s" | "e" | "w"; at: number }; district: DistrictId };
export const BOXES: BoxDef[] = [
  { id: "room-claims", rect: R(61, 30, 7, 6), door: { side: "s", at: 64 }, district: "wet" },
  { id: "room-operator", rect: R(61, 47, 7, 7), door: { side: "n", at: 64 }, district: "wet" },
  { id: "room-hall-mortals", rect: R(3, 68, 9, 8), door: { side: "e", at: 71 }, district: "care" },
  { id: "room-freeze", rect: R(14, 4, 7, 6), door: { side: "s", at: 17 }, district: "annex" },
  { id: "room-hall-sky", rect: R(60, 16, 8, 8), door: { side: "w", at: 19 }, district: "kerb" },
  { id: "room-shrine-1", rect: R(74, 5, 5, 5), door: { side: "s", at: 76 }, district: "ring" },
  { id: "room-shrine-2", rect: R(84, 5, 5, 5), door: { side: "s", at: 86 }, district: "ring" },
  { id: "room-shrine-3", rect: R(94, 5, 5, 5), door: { side: "s", at: 96 }, district: "ring" },
  { id: "room-hall-divinities", rect: R(92, 16, 8, 8), door: { side: "w", at: 19 }, district: "ring" },
  { id: "room-hall-earth", rect: R(83, 46, 8, 8), door: { side: "n", at: 86 }, district: "organs" },
];

/** Interior solid walls (pillars, blocks, canals, terraces). */
export const WALLS: Rect[] = [
  // Nave: three pillar aisles
  ...[9, 16, 23].flatMap(x => [32, 35, 38, 41, 44, 47].map(y => R(x, y, 1, 1))),
  R(13, 49, 1, 5), // low wall between the funeral street and the threshold
  R(24, 50, 1, 4), // east of the threshold
  // Wet Grid: shop blocks
  R(41, 33, 4, 3), R(48, 33, 4, 3), R(55, 33, 4, 3),
  R(41, 45, 4, 3), R(48, 45, 4, 3), R(55, 45, 4, 3),
  // Care: pillars and the garden's broken wall
  R(14, 65, 1, 1), R(14, 69, 1, 1), R(14, 73, 1, 1), R(19, 66, 1, 3), R(19, 72, 1, 3),
  // Annex: cubicle blocks either side of the central corridor
  ...[5, 9, 13, 21, 25, 29].flatMap(x => [12, 16, 20].map(y => R(x, y, 2, 1))),
  // Kerb: terraces (steps)
  R(39, 6, 10, 1), R(57, 6, 4, 1), R(39, 21, 10, 1), R(50, 21, 8, 1), R(45, 13, 1, 6),
  // Ring: bell pillars
  R(84, 13, 1, 1), R(88, 13, 1, 1), R(84, 20, 1, 1), R(88, 20, 1, 1),
  // Organs: the Strait canal (bridge at y 40..43), furnace blocks, cable trunks
  R(74, 29, 2, 11), R(74, 44, 2, 11), R(84, 32, 3, 3), R(88, 32, 3, 3), R(84, 41, 3, 2),
  R(94, 31, 1, 8), R(98, 31, 1, 8), R(94, 45, 1, 8), R(98, 45, 1, 8),
  // Clearing: a ring of pillars around the centre (52, 67)
  R(46, 63, 1, 1), R(52, 61, 1, 1), R(58, 63, 1, 1), R(60, 67, 1, 1), R(58, 71, 1, 1), R(52, 73, 1, 1), R(46, 71, 1, 1), R(44, 67, 1, 1),
];

export type PatchDef = { id: string; floor: FloorKey; rect: Rect; district: DistrictId };
export const PATCHES: PatchDef[] = [
  { id: "patch-arena", floor: "arena", rect: R(25, 30, 8, 7), district: "nave" },
  { id: "patch-burial", floor: "burial", rect: R(3, 48, 10, 6), district: "nave" },
  { id: "patch-under", floor: "under", rect: R(14, 50, 6, 4), district: "nave" },
  { id: "patch-hot-street", floor: "wet", rect: R(37, 48, 10, 7), district: "wet" },
  { id: "patch-stall-1", floor: "stall", rect: R(46, 38, 2, 2), district: "wet" },
  { id: "patch-stall-2", floor: "stall", rect: R(53, 38, 2, 2), district: "wet" },
  { id: "patch-stall-3", floor: "stall", rect: R(46, 42, 2, 2), district: "wet" },
  { id: "patch-stall-4", floor: "stall", rect: R(53, 42, 2, 2), district: "wet" },
  { id: "patch-forge", floor: "stall", rect: R(58, 42, 2, 2), district: "wet" },
  { id: "patch-claims", floor: "claims", rect: R(62, 31, 5, 4), district: "wet" },
  { id: "patch-operator", floor: "operator", rect: R(62, 48, 5, 5), district: "wet" },
  { id: "patch-care-shrine", floor: "shrine", rect: R(16, 60, 3, 3), district: "care" },
  { id: "patch-hall-mortals", floor: "hall", rect: R(4, 69, 7, 6), district: "care" },
  { id: "patch-garden", floor: "garden", rect: R(20, 66, 11, 9), district: "care" },
  { id: "patch-hall-sky", floor: "hall", rect: R(61, 17, 6, 6), district: "kerb" },
  { id: "patch-shrine-1", floor: "under", rect: R(75, 6, 3, 3), district: "ring" },
  { id: "patch-shrine-2", floor: "under", rect: R(85, 6, 3, 3), district: "ring" },
  { id: "patch-shrine-3", floor: "under", rect: R(95, 6, 3, 3), district: "ring" },
  { id: "patch-hall-divinities", floor: "hall", rect: R(93, 17, 6, 6), district: "ring" },
  { id: "patch-strait", floor: "strait", rect: R(72, 29, 10, 26), district: "organs" },
  { id: "patch-cable", floor: "cable", rect: R(92, 29, 10, 26), district: "organs" },
  { id: "patch-hall-earth", floor: "hall", rect: R(84, 47, 6, 6), district: "organs" },
];

export type PropKind = "crt" | "oval" | "bell" | "lamp" | "seam" | "pipe" | "statue";
export type PropDef = { id: string; kind: PropKind; x: number; y: number; district: DistrictId };

export type PoiKind =
  | "node" | "rite" | "plaque" | "desk" | "shrine" | "hall" | "stall" | "door" | "recorder" | "garden" | "ring" | "seed"
  | "office" | "bell" | "trace" | "vault" | "forecast" | "organ" | "clinic" | "board" | "arena" | "terrace" | "window" | "threshold";
export type PoiDef = { id: string; kind: PoiKind; district: DistrictId; x: number; y: number; name: string };

const at = (tx: number, ty: number): Vec => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
const poi = (id: string, kind: PoiKind, district: DistrictId, tx: number, ty: number, name: string): PoiDef => ({ id, kind, district, ...at(tx, ty), name });

export const POI_LIST: PoiDef[] = [
  // Nave of Tubes — Movement I
  poi("safety-plaque", "plaque", "nave", 16, 31, "Office of Safety plaque"),
  poi("memorial-recorder", "recorder", "nave", 10, 51, "Memorial recorder"),
  poi("nara-plot", "rite", "nave", 6, 51, "Burial plot"),
  poi("going-under", "threshold", "nave", 16, 52, "The threshold"),
  poi("guest-arena", "arena", "nave", 28, 33, "Practice ground"),
  poi("crt-altar-1", "door", "nave", 5, 31, "CRT altar"),
  poi("crt-altar-2", "door", "nave", 29, 45, "CRT altar"),
  // Wet Grid — market, desks, Vesper
  poi("stall-1", "stall", "wet", 46, 38, "Stall · surfaces"),
  poi("stall-2", "stall", "wet", 53, 38, "Stall · copies"),
  poi("stall-3", "stall", "wet", 46, 42, "Stall · plants"),
  poi("stall-4", "stall", "wet", 53, 42, "Stall · vans"),
  poi("forge-tray", "stall", "wet", 58, 43, "Forge tray"),
  poi("listing-board", "board", "wet", 58, 38, "Listing board"),
  poi("claims-desk", "desk", "wet", 64, 32, "Claims desk"),
  poi("operator-desk", "office", "wet", 64, 50, "Operator's desk"),
  poi("hot-street", "door", "wet", 41, 51, "Hot street"),
  // The Care — Movement II onward
  poi("care-shrine", "shrine", "care", 17, 61, "Care shrine"),
  poi("clinic", "clinic", "care", 10, 61, "Clinic"),
  poi("funeral-desk", "desk", "care", 24, 61, "Funeral desk"),
  poi("hall-mortals", "hall", "care", 7, 71, "House of Mortals hall"),
  poi("wreckage-garden", "garden", "care", 25, 70, "Wreckage garden"),
  // Safety Annex
  poi("safety-desk", "desk", "annex", 17, 6, "Freeze desk"),
  poi("tax-window", "window", "annex", 7, 22, "Tax window"),
  // Kerb of Hours
  poi("omen-terrace", "terrace", "kerb", 44, 10, "Omen terrace"),
  poi("hour-bell", "bell", "kerb", 52, 4, "Hour bell"),
  poi("forecast-glass", "forecast", "kerb", 60, 10, "Forecast glass"),
  poi("hall-sky", "hall", "kerb", 64, 19, "House of Sky hall"),
  // Gold Ring
  poi("shrine-1", "shrine", "ring", 76, 7, "Shrine of the first bell"),
  poi("shrine-2", "shrine", "ring", 86, 7, "Shrine of the mute bell"),
  poi("shrine-3", "shrine", "ring", 96, 7, "Shrine of the last bell"),
  poi("mute-bell", "bell", "ring", 86, 15, "Mute bell"),
  poi("last-god-trace", "trace", "ring", 86, 22, "A trace"),
  poi("cult-vault", "vault", "ring", 78, 20, "Cult vault"),
  poi("hall-divinities", "hall", "ring", 96, 19, "House of Divinities hall"),
  // The Organs — Movement III
  poi("organ-strait", "organ", "organs", 77, 41, "The Strait"),
  poi("organ-foundry", "organ", "organs", 86, 38, "The Foundry"),
  poi("organ-cable", "organ", "organs", 96, 41, "The Cable"),
  poi("hall-earth", "hall", "organs", 86, 49, "House of Earth hall"),
  poi("cold-desk", "desk", "organs", 92, 36, "Cold desk"),
  // The Clearing — Movement IV, contests, Passings
  poi("clearing-ring", "ring", "clearing", 52, 67, "The Clearing"),
  poi("seed-1", "seed", "clearing", 47, 64, "Seed ground"),
  poi("seed-2", "seed", "clearing", 57, 64, "Seed ground"),
  poi("seed-3", "seed", "clearing", 47, 70, "Seed ground"),
  poi("seed-4", "seed", "clearing", 57, 70, "Seed ground"),
];
export const POIS: Record<string, PoiDef> = Object.fromEntries(POI_LIST.map(p => [p.id, p]));

export type NodeDef = { id: string; district: DistrictId; x: number; y: number };
const node = (id: string, district: DistrictId, tx: number, ty: number): NodeDef => ({ id, district, ...at(tx, ty) });
export const NODE_LIST: NodeDef[] = [
  node("nave-node-1", "nave", 11, 36),
  node("nave-node-2", "nave", 21, 45),
  node("nave-node-3", "nave", 27, 47),
  node("nave-node-4", "nave", 6, 34),
  node("wet-node-1", "wet", 39, 31),
  node("wet-node-2", "wet", 66, 42),
  node("kerb-node-1", "kerb", 40, 3),
  node("kerb-node-2", "kerb", 66, 11),
  node("organ-node-strait", "organs", 79, 33),
  node("organ-node-foundry", "organs", 90, 40),
  node("organ-node-cable", "organs", 100, 52),
  node("annex-node-1", "annex", 31, 5),
];

export type NpcHome = { id: string; district: DistrictId; x: number; y: number };
const home = (id: string, district: DistrictId, tx: number, ty: number): NpcHome => ({ id, district, ...at(tx, ty) });
/** Home positions. Content moves NPCs from here with effects and personal overrides. */
export const NPC_HOMES: Record<string, NpcHome> = Object.fromEntries([
  home("nara", "nave", 8, 49),
  home("quill", "nave", 31, 41),
  home("ord", "nave", 19, 32),
  home("vesper", "wet", 65, 50),
  home("ione", "care", 31, 67),
  home("officer", "annex", 17, 13),
  home("omen", "kerb", 47, 13),
  home("keeper", "ring", 82, 12),
  home("sexton", "care", 18, 64),
  home("desk", "organs", 92, 35),
].map(h => [h.id, h]));

/** Where NPCs go when content moves them. Ids are stable. */
export const NPC_STATIONS: Record<string, NpcHome> = Object.fromEntries([
  home("quill-forge", "wet", 59, 44),
  home("quill-board", "wet", 57, 39),
  home("nara-garden", "care", 24, 68),
  home("nara-clearing", "clearing", 50, 66),
  home("nara-care", "care", 15, 61),
  home("ord-strait", "organs", 78, 40),
  home("ord-cable", "organs", 95, 40),
  home("ord-clearing", "clearing", 54, 66),
  home("ord-care", "care", 22, 62),
  home("vesper-foundry", "organs", 87, 36),
  home("vesper-clearing", "clearing", 52, 63),
  home("officer-clearing", "clearing", 52, 71),
  home("ione-clearing", "clearing", 52, 65),
].map(h => [h.id, h]));

export type EnemySpawn = { id: string; kind: EnemyKind; district: DistrictId; x: number; y: number; name: string; tint: "lavender" | "wine" | "sky" | "paper"; fallFlag?: string };
const spawn = (id: string, kind: EnemyKind, district: DistrictId, tx: number, ty: number, name: string, tint: EnemySpawn["tint"], fallFlag?: string): EnemySpawn =>
  ({ id, kind, district, ...at(tx, ty), name, tint, ...(fallFlag ? { fallFlag } : {}) });
export const ENEMY_SPAWNS: EnemySpawn[] = [
  spawn("intake-clerk", "intake", "nave", 13, 42, "Intake Clerk", "lavender"),
  spawn("desk-three", "clerk", "nave", 21, 38, "Desk Three", "lavender", "desk-three"), // F.DESK_THREE: the second fight of the opening
  spawn("annex-runner", "clerk", "nave", 26, 43, "Annex Runner", "lavender"),
  spawn("practice-dummy", "dummy", "nave", 28, 33, "Practice dummy", "paper"),
  spawn("enforcer-1", "enforcer", "wet", 40, 50, "Cold desk · one", "wine"),
  spawn("enforcer-2", "enforcer", "wet", 44, 52, "Cold desk · two", "wine"),
  spawn("warden-1", "warden", "annex", 10, 14, "Warden Pell", "sky"),
  spawn("warden-2", "warden", "annex", 24, 14, "Warden Ost", "sky"),
  spawn("hour-clerk-1", "clerk", "kerb", 50, 17, "Hour Clerk", "lavender"),
  spawn("hour-clerk-2", "clerk", "kerb", 55, 12, "Hour Clerk", "lavender"),
  spawn("foundry-clerk-1", "clerk", "organs", 88, 37, "Foundry Clerk", "lavender"),
  spawn("foundry-clerk-2", "clerk", "organs", 89, 42, "Foundry Clerk", "lavender"),
  spawn("cable-enforcer", "enforcer", "organs", 96, 50, "Cold desk · cable", "wine"),
  spawn("ring-warden", "warden", "ring", 80, 16, "Warden of the Ring", "sky"),
];

export const GUEST_SPAWN: Vec & { district: DistrictId } = { ...at(5, 42), district: "nave" };

/** Marks the Ruin-sight can see. */
export const FAILED_PASSING_MARKS: { id: string; district: DistrictId; x: number; y: number }[] = [
  { id: "failed-1", district: "clearing", ...at(62, 74) },
  { id: "failed-2", district: "ring", ...at(80, 23) },
];

/** Every named position in px, for effects, targets and tests. */
export const POSITIONS: Record<string, Vec & { district: DistrictId }> = {
  ...Object.fromEntries(POI_LIST.map(p => [p.id, { x: p.x, y: p.y, district: p.district }])),
  ...Object.fromEntries(NODE_LIST.map(n => [n.id, { x: n.x, y: n.y, district: n.district }])),
  ...Object.fromEntries(Object.values(NPC_HOMES).map(h => [`home:${h.id}`, { x: h.x, y: h.y, district: h.district }])),
  ...Object.fromEntries(Object.values(NPC_STATIONS).map(h => [`station:${h.id}`, { x: h.x, y: h.y, district: h.district }])),
  ...Object.fromEntries(ENEMY_SPAWNS.map(e => [`enemy:${e.id}`, { x: e.x, y: e.y, district: e.district }])),
  ...Object.fromEntries(FAILED_PASSING_MARKS.map(f => [f.id, { x: f.x, y: f.y, district: f.district }])),
  ...Object.fromEntries(GATES.map(g => [g.id, { ...at(g.rect.x + 1, g.rect.y + 1), district: g.a }])),
  "spawn:guest": GUEST_SPAWN,
  "history:7777": { ...at(12, 63), district: "care" },
  "history:mark": { ...at(12, 63), district: "care" }, // where any serial's prior hour stands; only its owner sees it
};

// ---------------------------------------------------------------- grid

const NONE = 255;
let wallGrid: Uint8Array | null = null; // 1 = wall
let districtGrid: Uint8Array | null = null; // index into DISTRICTS, or NONE
let gateGrid: Uint8Array | null = null; // index into GATES + 1, or 0
let patchGrid: Uint8Array | null = null; // index into PATCHES + 1, or 0

export const idx = (tx: number, ty: number) => ty * COLS + tx;
const inRect = (r: Rect, tx: number, ty: number) => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;

function fill(grid: Uint8Array, r: Rect, value: number) {
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[idx(x, y)] = value;
}

export function boxWalls(b: BoxDef): Rect[] {
  const { x, y, w, h } = b.rect;
  const rects: Rect[] = [];
  const skip = (side: "n" | "s" | "e" | "w", tx: number, ty: number) => b.door.side === side && (side === "n" || side === "s" ? tx === b.door.at : ty === b.door.at);
  for (let tx = x; tx < x + w; tx++) {
    if (!skip("n", tx, y)) rects.push(R(tx, y, 1, 1));
    if (!skip("s", tx, y + h - 1)) rects.push(R(tx, y + h - 1, 1, 1));
  }
  for (let ty = y + 1; ty < y + h - 1; ty++) {
    if (!skip("w", x, ty)) rects.push(R(x, ty, 1, 1));
    if (!skip("e", x + w - 1, ty)) rects.push(R(x + w - 1, ty, 1, 1));
  }
  return rects;
}

function build() {
  if (wallGrid) return;
  wallGrid = new Uint8Array(COLS * ROWS).fill(1);
  districtGrid = new Uint8Array(COLS * ROWS).fill(NONE);
  gateGrid = new Uint8Array(COLS * ROWS).fill(0);
  patchGrid = new Uint8Array(COLS * ROWS).fill(0);
  DISTRICTS.forEach((d, i) => { fill(wallGrid!, d.rect, 0); fill(districtGrid!, d.rect, i); });
  GATES.forEach((g, i) => { fill(wallGrid!, g.rect, 0); fill(gateGrid!, g.rect, i + 1); fill(districtGrid!, g.rect, DISTRICTS.findIndex(d => d.id === g.a)); });
  for (const r of WALLS) fill(wallGrid, r, 1);
  for (const b of BOXES) for (const r of boxWalls(b)) fill(wallGrid, r, 1);
  PATCHES.forEach((p, i) => fill(patchGrid!, p.rect, i + 1));
}

export function isWall(tx: number, ty: number): boolean {
  build();
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  return wallGrid![idx(tx, ty)] === 1;
}

export function gateAt(tx: number, ty: number): GateDef | null {
  build();
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return null;
  const g = gateGrid![idx(tx, ty)];
  return g ? GATES[g - 1] : null;
}

export function patchAt(tx: number, ty: number): PatchDef | null {
  build();
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return null;
  const p = patchGrid![idx(tx, ty)];
  return p ? PATCHES[p - 1] : null;
}

export function floorAt(tx: number, ty: number): FloorKey {
  if (isWall(tx, ty)) return "wall";
  const patch = patchAt(tx, ty);
  if (patch) return patch.floor;
  const d = districtGrid![idx(tx, ty)];
  return d === NONE ? "wall" : DISTRICTS[d].floor;
}

export function gateOpenFor(p: Pick<Player, "guest" | "flags"> | null | undefined, g: GateDef): boolean {
  if (!g.requires) return true;
  if (!p) return false;
  if (g.requires === "angel") return !p.guest;
  return (p.flags[g.requires] ?? 0) > 0;
}

/** True when the tile blocks this player: a wall, or a gate they may not pass. */
export function blockedFor(p: Pick<Player, "guest" | "flags"> | null | undefined, tx: number, ty: number): boolean {
  if (isWall(tx, ty)) return true;
  const g = gateAt(tx, ty);
  return !!g && !gateOpenFor(p, g);
}

export function circleHitsWalls(x: number, y: number, r = BODY_R, p?: Pick<Player, "guest" | "flags"> | null): boolean {
  const minTx = Math.floor((x - r) / TILE);
  const maxTx = Math.floor((x + r) / TILE);
  const minTy = Math.floor((y - r) / TILE);
  const maxTy = Math.floor((y + r) / TILE);
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      if (!blockedFor(p, tx, ty)) continue;
      const left = tx * TILE;
      const top = ty * TILE;
      const cx = Math.max(left, Math.min(x, left + TILE));
      const cy = Math.max(top, Math.min(y, top + TILE));
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < r * r) return true;
    }
  }
  return false;
}

export function tileOf(px: number): number {
  return Math.floor(px / TILE);
}

export function districtAt(x: number, y: number): DistrictId {
  build();
  const tx = Math.max(0, Math.min(COLS - 1, tileOf(x)));
  const ty = Math.max(0, Math.min(ROWS - 1, tileOf(y)));
  const d = districtGrid![idx(tx, ty)];
  if (d !== NONE) return DISTRICTS[d].id;
  // In a wall band: nearest district by rect distance.
  let best: DistrictDef = DISTRICTS[0];
  let bestDist = Infinity;
  for (const dd of DISTRICTS) {
    const r = dd.rect;
    const ddx = Math.max(r.x - tx, 0, tx - (r.x + r.w - 1));
    const ddy = Math.max(r.y - ty, 0, ty - (r.y + r.h - 1));
    const dist = ddx * ddx + ddy * ddy;
    if (dist < bestDist) { bestDist = dist; best = dd; }
  }
  return best.id;
}

export function inPatch(id: string, x: number, y: number): boolean {
  const p = PATCHES.find(pp => pp.id === id);
  return !!p && inRect(p.rect, tileOf(x), tileOf(y));
}

export function nearPoint(px: number, py: number, x: number, y: number, reach = 56): boolean {
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= reach * reach;
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Tiles reachable on foot from a start tile for a given blocking rule. For tests and pathing hints. */
export function reachableTiles(startTx: number, startTy: number, blocked: (tx: number, ty: number) => boolean): Set<number> {
  const seen = new Set<number>();
  if (blocked(startTx, startTy)) return seen;
  const queue: number[] = [idx(startTx, startTy)];
  seen.add(queue[0]);
  while (queue.length) {
    const cur = queue.shift()!;
    const tx = cur % COLS;
    const ty = Math.floor(cur / COLS);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = tx + dx;
      const ny = ty + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const n = idx(nx, ny);
      if (seen.has(n) || blocked(nx, ny)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return seen;
}

export function bearing(from: Vec, to: Vec): string {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  if (distance <= 56) return "HERE";
  const directions = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  const direction = directions[(Math.round(Math.atan2(to.y - from.y, to.x - from.x) / (Math.PI / 4)) + 8) % 8];
  return `${direction} · ${Math.ceil(distance / TILE)} TILES`;
}
