/**
 * A small module-level seam between main.ts (which owns the Hud) and the
 * CityScene (which owns the WorldSocket). Nothing here computes a number.
 */
import type { Hud } from "../ui/hud";
import type { WorldSocket } from "../net/worldSocket";

/** Verbs the HUD can ask the scene to perform. The scene registers them at create(). */
export type SceneActions = {
  choose: (choiceId: string) => void;
  close: () => void;
  link: (serial: number) => void;
  interact: (targetId: string, choice: string) => void;
  stance: () => void;
  kit: () => void;
  flag: () => void;
  truce: () => void;
  use: () => void;
  market: (op: "list" | "buy" | "cancel", args: { itemId?: string; listingId?: string; price?: number }) => void;
};

export const bus: {
  hud: Hud | null;
  net: WorldSocket | null;
  actions: SceneActions | null;
  /** A serial chosen on the title before the socket was online; sent on hello. */
  pendingSerial: number | null;
} = {
  hud: null,
  net: null,
  actions: null,
  pendingSerial: null,
};
