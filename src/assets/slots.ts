/**
 * Where every generated asset goes, as pure data: which manifest target a
 * portrait, sprite, seal, badge, plate, loop or prop wants, and where the
 * static props stand. Positions come from the level, never from here. Every
 * slot has today's rendering as its fallback; a missing file changes nothing.
 */
import { NODE_LIST, PATCHES, POI_LIST, TILE } from "../sim/map";
import type { DistrictId, EnemyKind } from "../sim/types";

// ---------------------------------------------------------------- portraits, sprites, seals, badges

/** The secondary people whose portraits were generated (the pull writes portraits as jpeg). */
export const PORTRAIT_NPCS = ["officer", "omen", "keeper", "sexton", "desk"] as const;
export const portraitFor = (npcId: string): string | null => ((PORTRAIT_NPCS as readonly string[]).includes(npcId) ? `portraits/${npcId}.jpg` : null);

/** Enemy sprites: by kind for wardens and enforcers, by id for the Kerb's hour clerks. */
export function spriteFor(e: { kind: EnemyKind; id: string }): string | null {
  if (e.kind === "warden") return "sprites/warden.png";
  if (e.kind === "enforcer") return "sprites/enforcer.png";
  if (e.id.startsWith("hour-clerk")) return "sprites/hour-clerk.png";
  return null;
}

export const HOUSES = ["earth", "sky", "mortals", "divinities"] as const;
export const sealFor = (house: string): string | null => ((HOUSES as readonly string[]).includes(house) ? `seals/${house}.png` : null);

export const MESSENGERS = ["herald", "witness", "ruin", "dweller", "cybernetic", "iridescent"] as const;
export const badgeFor = (messenger: string): string | null => ((MESSENGERS as readonly string[]).includes(messenger) ? `badges/${messenger}.png` : null);

// ---------------------------------------------------------------- plates and loops

/** The journal plate for a district (the pull writes plates as jpeg); null keeps the objective's own plate. */
export function plateFor(district: DistrictId, hot = false): string | null {
  if (district === "kerb") return "plate-kerb.jpg";
  if (district === "nave") return "plate-nave.jpg";
  if (district === "wet" && hot) return "plate-hot-street.jpg";
  return null;
}
export const CREDITS_PLATE = "plate-credits.jpg";

export type LoopName =
  | "title-mark" | "guest-lock" | "going-under"
  | "passing-appearance" | "passing-absence" | "passing-hijack" | "passing-failed"
  | "ambient-strait" | "ambient-hall" | "ambient-wet";
export const loopFor = (name: LoopName): string => `video/${name}.mp4`;

/** The Passing outcome's overlay loop; null for an outcome that has none. */
export function passingLoopFor(outcome: string): string | null {
  return outcome === "appearance" || outcome === "absence" || outcome === "hijack" || outcome === "failed" ? loopFor(`passing-${outcome}`) : null;
}

/** The ambient loop in the journal header, by district. */
export function ambientFor(district: DistrictId): string | null {
  if (district === "organs") return loopFor("ambient-strait");
  if (district === "nave") return loopFor("ambient-hall");
  if (district === "wet") return loopFor("ambient-wet");
  return null;
}

// ---------------------------------------------------------------- props

export type PropKind =
  | "crt-altar" | "grave-slab" | "shrine-bell" | "market-stall" | "armored-van" | "office-desk" | "furnace"
  | "oval-light" | "wreckage" | "listing-board" | "yield-node" | "clearing-seed";
export const PROP_KINDS: readonly PropKind[] = [
  "crt-altar", "grave-slab", "shrine-bell", "market-stall", "armored-van", "office-desk", "furnace",
  "oval-light", "wreckage", "listing-board", "yield-node", "clearing-seed",
];
export const propTarget = (kind: PropKind): string => `props/${kind}.png`;

/** Display size on the world surface, in px, per prop. */
export const PROP_SIZE: Record<PropKind, { w: number; h: number }> = {
  "crt-altar": { w: 46, h: 46 },
  "grave-slab": { w: 40, h: 26 },
  "shrine-bell": { w: 40, h: 60 },
  "market-stall": { w: 92, h: 66 },
  "armored-van": { w: 104, h: 60 },
  "office-desk": { w: 76, h: 50 },
  "furnace": { w: 100, h: 84 },
  "oval-light": { w: 150, h: 84 },
  "wreckage": { w: 36, h: 44 },
  "listing-board": { w: 66, h: 74 },
  "yield-node": { w: 64, h: 40 },
  "clearing-seed": { w: 40, h: 40 },
};

/** A static prop: one image at a fixed world position, under bodies, never colliding. */
export type PropSlot = { kind: PropKind; id: string; x: number; y: number };

const centre = (tx: number, ty: number) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });

/**
 * Every static prop and where it stands, derived from the level: node bases
 * and altars at the yield nodes, bells at the Ring's shrines and the mute
 * bell, light pools at every shrine, stalls at the stalls, two vans on the
 * hot street, a desk at every desk, the furnace in the Foundry, the board at
 * the board. Wreckage, grave slabs and planted seeds are placed live.
 */
export function staticPropSlots(): PropSlot[] {
  const out: PropSlot[] = [];
  for (const n of NODE_LIST) {
    out.push({ kind: "yield-node", id: `${n.id}:base`, x: n.x, y: n.y + 6 });
    out.push({ kind: "crt-altar", id: n.id, x: n.x, y: n.y - 10 });
  }
  for (const p of POI_LIST) {
    if (p.id.startsWith("crt-altar")) out.push({ kind: "crt-altar", id: p.id, x: p.x, y: p.y - 10 });
    if (p.kind === "shrine") out.push({ kind: "oval-light", id: `${p.id}:light`, x: p.x, y: p.y + 4 });
    if ((p.kind === "shrine" && p.district === "ring") || p.kind === "bell") out.push({ kind: "shrine-bell", id: p.id, x: p.x, y: p.y - 14 });
    if (p.kind === "stall") out.push({ kind: "market-stall", id: p.id, x: p.x, y: p.y - 8 });
    if (p.kind === "desk") out.push({ kind: "office-desk", id: p.id, x: p.x, y: p.y - 4 });
    if (p.kind === "board") out.push({ kind: "listing-board", id: p.id, x: p.x, y: p.y - 18 });
    if (p.id === "organ-foundry") out.push({ kind: "furnace", id: p.id, x: p.x, y: p.y - 20 });
  }
  const hot = PATCHES.find(p => p.id === "patch-hot-street");
  if (hot) {
    const r = hot.rect;
    out.push({ kind: "armored-van", id: "van-1", ...centre(r.x + 2.5, r.y + 2) });
    out.push({ kind: "armored-van", id: "van-2", ...centre(r.x + r.w - 2.5, r.y + r.h - 2) });
  }
  return out;
}
