import { describe, expect, it } from "vitest";
import { GUEST_LABEL_COLOR, NPC_LABEL_COLOR, npcLabel } from "./labels";

describe("npc labels", () => {
  it("names a person by their name, and says when they have an hour to hand over", () => {
    expect(npcLabel({ id: "nara", name: "Nara Vale" })).toEqual({ text: "Nara Vale", color: NPC_LABEL_COLOR });
    expect(npcLabel({ id: "omen", name: "Halla Voss", offers: true, party: "none" })).toEqual({ text: "Halla Voss · has an hour", color: NPC_LABEL_COLOR });
    expect(npcLabel({ id: "ord", name: "Ord", offers: true, party: "with" })).toEqual({ text: "Ord", color: NPC_LABEL_COLOR });
  });

  it("labels Anselm Caul as a guest: the guest's word in the guest's colour, never his name", () => {
    expect(npcLabel({ id: "caul", name: "Anselm Caul", offers: true, party: "none" })).toEqual({ text: "GUEST", color: GUEST_LABEL_COLOR });
  });
});
