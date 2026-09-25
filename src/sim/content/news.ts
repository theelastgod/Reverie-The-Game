/**
 * Marquee lines, keyed by the event ids the engine and the content raise.
 * One line per key. `{subject}` is the body or the place the event is about;
 * `newsFor` fills it in. Cold, short, concrete noun first. Nobody lectures.
 */

export const NEWS: Record<string, string> = {
  extraction: "{subject} extracted. The number went up.",
  keep: "{subject} kept a node. The ground noticed.",
  burial: "{subject} put a body in the ground. The city stopped counting it.",
  flag: "{subject} raised a flag on the wet street. Spoils are unbanked and copies.",
  kill: "{subject} fell on a flagged street. Wreckage.",
  camp: "{subject} camped a grave. The Gestell fed. Their aura thinned.",
  "war-start": "The Houses are holding {subject}. Tithe and omen, never a bigger stick.",
  "war-won:earth": "The House of Earth held {subject}. Ore that will not strike.",
  "war-won:sky": "The House of Sky held {subject}. An omen, not a weapon.",
  "war-won:mortals": "The House of Mortals held {subject}. The garden is in the hall.",
  "war-won:divinities": "The House of Divinities held {subject}. A hint in the earth.",
  "clearing-open": "{subject} opened a Clearing. A hole in the weather. It needs people in it.",
  "clearing-kept": "The Clearing was kept. The hole holds. {subject} stood in it.",
  "clearing-extracted": "The Clearing was extracted. Cold is a current. The hole closes.",
  "passing-appearance": "A trace, not a face. The city is briefly world again. {subject} prepared the ground.",
  "passing-absence": "The hour went by. Absence is honest. {subject} stood in the hole anyway.",
  "passing-hijack": "{subject} claimed the rite. The world continues. Someone is marked.",
  "passing-failed": "The Passing failed. Gestell kept the weather. {subject} could not hold it alone.",
  freeze: "Safety froze {subject}. The nodes hold. The Passing goes hungry.",
  meltdown: "Meltdown weather. Passings fail unless a Clearing is held. The street flags itself.",
  clear: "Clear weather. Clearings last. Winke are dense. Yield is poor.",
  fat: "Fat weather. Yield is heavy. The sacred doors dim.",
  link: "{subject} linked. One body per Angel. Perception, not a stick.",
  under: "{subject} went under. Not as a cutscene. The Care is open.",
};

/** The line for an event, with `{subject}` filled in. An unknown key reads back as itself. */
export function newsFor(key: string, subject?: string): string {
  const line = NEWS[key] ?? key;
  return line.replace(/\{subject\}/g, subject ?? "Someone");
}
