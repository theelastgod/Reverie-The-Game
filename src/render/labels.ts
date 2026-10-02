/**
 * Over-the-head labels for named people the city reads differently from their names. Anselm Caul is a guest in every
 * rule, so his body carries the guest's label in the guest's colour; his name is in the prompt and the dialogue only.
 */
export const NPC_LABELS: Record<string, string> = { caul: "GUEST" };
export const GUEST_LABEL_COLOR = "#e8e8e8";
export const NPC_LABEL_COLOR = "#e8d5a3";

export function npcLabel(n: { id: string; name: string; offers?: boolean; party?: string }): { text: string; color: string } {
  const override = NPC_LABELS[n.id];
  if (override !== undefined) return { text: override, color: GUEST_LABEL_COLOR };
  return { text: n.offers && n.party !== "with" ? `${n.name} · has an hour` : n.name, color: NPC_LABEL_COLOR };
}
