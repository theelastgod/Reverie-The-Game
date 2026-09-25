import { INTAKE } from "./encounters";
import { MEMORIAL } from "./memorial";
import { BURIAL_PLOT, GOING_UNDER, NAVE_NPCS, NAVE_SIGNS, CARE_DOOR, HOUSE_HALL, OPERATOR_DESK, WRECK_GARDEN, M3_DOOR } from "./campaign";
import type { Player } from "./world";

export type Objective = { id: string; title: string; detail: string; target?: { x: number; y: number } };
const person = (id: string) => NAVE_NPCS.find(n => n.id === id)!;

/** Guidance reads the server's state; it never awards or completes a beat. */
export function nextObjective(p: Player, npcs = NAVE_NPCS): Objective {
  const npc = (id: string) => npcs.find(n => n.id === id) ?? person(id);
  if (p.locked) return { id: "guest-lock", title: "The first threshold", detail: "Movement I is complete. Link the test Angel to go under, or remain in the Nave." };
  if (!p.beats.nara && !p.openingCombat && !p.beats.under) return { id: "intake-clerk", title: "Your name in the ledger", detail: "The intake clerk bars the southern aisle. Click to strike. Shift + move evades the red warning; R interrupts it. Each relief shift returns after a short pause.", target: INTAKE };
  if (!p.beats.nara) return { id: "meet-nara", title: "A name for the dead", detail: "Find Nara Vale in the southern funeral street. Press F to listen.", target: npc("nara") };
  if (!p.beats.burial && !p.openingChoice && !p.beats.under) return { id: "memorial-choice", title: "A voice or a vessel", detail: "At the recorder east of Nara: E dismantles it for coffin bindings. Q preserves the voice; Nara supplies cloth. The materials go to the burial. Neither choice pays Bestand.", target: MEMORIAL };
  if (!p.beats.burial) return { id: "first-burial", title: "Leave something unspent", detail: p.openingChoice === "extract" ? "Carry the copper bindings to Nara’s burial plot. Press F to close the earth." : "Return to Nara’s burial plot. The cloth is ready and the voice is still playing. Press F to close the earth.", target: BURIAL_PLOT };
  if (!p.weather.safety) return { id: "safety-weather", title: "The official weather", detail: "Read the Office of Safety plaque with F. Someone has called this stability.", target: NAVE_SIGNS[0] };
  if (!p.beats.ord || !p.weather.ord) return { id: "meet-ord", title: "Ask who owns the numbers", detail: "Find Ord in the northwestern aisle. Press F to hear the other account.", target: npc("ord") };
  if (!p.beats.quill) return { id: "meet-quill", title: "A copy of a hole", detail: "Find Quill at the eastern market. Press F to speak with the forger.", target: npc("quill") };
  if (!p.namedWeather) return { id: "name-weather", title: "Name the weather", detail: "Return to Nara. You have heard the numbers; listen to what they leave out.", target: npc("nara") };
  if (!p.beats.under) return { id: "going-under", title: "The going-under", detail: "Reach the northern shrine and press F. This is the end of the guest’s first movement.", target: GOING_UNDER };
  if (!p.beats.care) return { id: "enter-care", title: "What survives you", detail: "Go to the Care door. Press F to enter the next movement.", target: CARE_DOOR };
  if (!p.beats.hall) return { id: "house-hall", title: "The price of shelter", detail: "Read the House hall plaque with F. The city has owners even here.", target: HOUSE_HALL };
  if (!p.beats.yield) return { id: "operator-offer", title: "The private hour", detail: "Find Vesper Hale at the eastern desk. Press F to hear what she is offering.", target: OPERATOR_DESK };
  if (!p.beats.cold && !p.beats.refuse) return { id: "operator-choice", title: "What will you take?", detail: "At Vesper’s desk: E accepts private yield. Q refuses it and opens a path through care for the dead.", target: OPERATOR_DESK };
  if (!p.beats.garden) return { id: "wreckage-garden", title: "What the work destroyed", detail: "Return to the wreckage garden. Press F to bury it, or keep watch if someone came before you.", target: WRECK_GARDEN };
  if (!p.beats.m3) return { id: "third-movement", title: "The city has organs", detail: "Go to the Third Movement door and press F. Your choice has made a way through.", target: M3_DOOR };
  return { id: "open-city", title: "The city is listening", detail: "Follow the people and their changed places. F listens; E extracts; Q keeps. Each choice changes what remains." };
}

export function bearing(x: number, y: number, target: { x: number; y: number }): string {
  const distance = Math.hypot(target.x - x, target.y - y);
  if (distance <= 48) return "HERE · F TO INTERACT";
  const directions = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  const direction = directions[(Math.round(Math.atan2(target.y - y, target.x - x) / (Math.PI / 4)) + 8) % 8];
  return `${direction} · ${Math.ceil(distance / 48)} TILES`;
}
