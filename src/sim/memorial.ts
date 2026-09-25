import type { YieldNode } from "./nave";

export const MEMORIAL = { id: "nara-memorial", x: 336, y: 720 };
export const MEMORIAL_ASK = "A voice survived in that recorder. Its copper would close the coffin. Leave the voice running, or give its body to this one. I won't choose for you.";
export const MEMORIAL_NEED = "Nara holds the grave open. Speak with her, then choose what to keep at the recorder east of her.";
export const MEMORIAL_CHOICE = {
  extract: "You lift the coil from the recorder. The voice stops mid-breath. Nara folds the copper around the coffin. No part goes to market.",
  keep: "You leave the recorder running. Nara tears her coat into binding cloth. The voice has another night.",
};
export const MEMORIAL_BURIAL = {
  extract: "The copper holds. Under the earth, something that spoke has become something that carries. Nara waits until your hands are empty.",
  keep: "The cloth holds. The recorder carries a voice across the funeral street. Nara stays until you hear the silence between its words.",
};

/** Shared memorial display; each arrival decides once. It is never a currency node. */
export function memorialNode(kept?: boolean): YieldNode {
  return { ...MEMORIAL, depleted: kept !== undefined, kept: kept === true };
}
