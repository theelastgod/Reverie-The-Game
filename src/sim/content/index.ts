/**
 * Authored content, merged. The party roster and the secondary cast become one
 * NPC table; the base POI verbs and the side-quest verbs become one POI table;
 * the spine and the side quests become one quest list. Nothing here mutates
 * state; effects.ts applies what content returns.
 */
import type { NpcDef, PoiConfig, PoiVerb, Quest } from "../types";
import { POIS } from "../map";
import { NPCS as PARTY_NPCS } from "./npcs";
import { SIDE_NPCS } from "./side-npcs";
import { POI_CONFIGS as BASE_POI_CONFIGS } from "./pois";
import { SIDE_POI_VERBS } from "./side-pois";
import { SPINE } from "./spine";
import { SIDE } from "./side";

export * as LINES from "./lines";
export { NEWS } from "./news";

/** The party first; a secondary NPC never overrides a party member's id. */
export const NPCS: Record<string, NpcDef> = { ...SIDE_NPCS, ...PARTY_NPCS };

function mergePois(base: Record<string, PoiConfig>, extra: Record<string, PoiVerb[]>): Record<string, PoiConfig> {
  const out: Record<string, PoiConfig> = { ...base };
  for (const [id, verbs] of Object.entries(extra)) {
    const cfg = out[id];
    if (cfg) {
      out[id] = { ...cfg, verbs: [...cfg.verbs, ...verbs] };
    } else {
      // A side verb on a POI the spine did not configure: the map still names it.
      out[id] = { id, label: POIS[id]?.name ?? id, verbs: [...verbs] };
    }
  }
  return out;
}

export const POI_CONFIGS: Record<string, PoiConfig> = mergePois(BASE_POI_CONFIGS, SIDE_POI_VERBS);

export const QUESTS: Quest[] = [...SPINE, ...SIDE];
