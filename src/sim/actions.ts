/**
 * Actions: every client message passes through here. Validation first, then
 * one call into the module that owns the verb. Nothing a client sends is a
 * number the server keeps; intents are booleans, a dodge is a direction, the
 * rest are ids.
 */
import { CLIENT_MSG_TYPES, type ClientMsg } from "./protocol";
import type { Intent, Player, WorldState } from "./types";
import { F } from "./content/ids";
import { LINES } from "./content";
import { auraSeed, formatSerial, houseFor, messengerFor, serialHistoryMark, validLink, winkSchoolFor } from "./identity";
import { say } from "./world";
import { applyDodge, applyFlag, applyHeavy, applyKit, applyStance, applyStrike, applyTruce } from "./combat";
import { applyMarket, applyUse } from "./economy";
import { applyChoose, applyClose, applyTalk } from "./dialogue";
import { applyInteract } from "./interact";

const MAX_STRING = 64;
const POLLUTION = new Set(["__proto__", "constructor", "prototype"]);
const MARKET_OPS = new Set(["list", "buy", "cancel"]);

// ---------------------------------------------------------------- validation

type Raw = Record<string, unknown>;

function plain(v: unknown): v is Raw {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  for (const k of Object.keys(v as object)) if (POLLUTION.has(k)) return false;
  return true;
}

const str = (v: unknown): v is string => typeof v === "string" && v.length <= MAX_STRING;
const optStr = (v: unknown): v is string | undefined => v === undefined || str(v);
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const optNum = (v: unknown): v is number | undefined => v === undefined || num(v);

/** Coerces an intent with !! so nothing but four booleans survives. */
function intentOf(v: unknown): Intent | null {
  if (!plain(v)) return null;
  return { up: !!v.up, down: !!v.down, left: !!v.left, right: !!v.right };
}

/** Rebuilds the message from its checked fields; unknown shapes and unknown keys are refused. */
function validate(msg: unknown): ClientMsg | null {
  if (!plain(msg)) return null;
  const t = msg.t;
  if (typeof t !== "string" || !(CLIENT_MSG_TYPES as ReadonlyArray<string>).includes(t)) return null;
  switch (t as ClientMsg["t"]) {
    case "intent": {
      const intent = intentOf(msg.intent);
      return intent ? { t: "intent", intent } : null;
    }
    case "dodge":
      return num(msg.dx) && num(msg.dy) ? { t: "dodge", dx: msg.dx, dy: msg.dy } : null;
    case "strike":
    case "heavy":
    case "stance":
    case "close":
    case "flag":
    case "truce":
      return { t: t as "strike" | "heavy" | "stance" | "close" | "flag" | "truce" };
    case "kit":
      return optStr(msg.targetId) ? (msg.targetId === undefined ? { t: "kit" } : { t: "kit", targetId: msg.targetId }) : null;
    case "interact":
      return str(msg.targetId) && str(msg.choice) ? { t: "interact", targetId: msg.targetId, choice: msg.choice } : null;
    case "talk":
      return str(msg.npcId) ? { t: "talk", npcId: msg.npcId } : null;
    case "choose":
      return str(msg.choiceId) ? { t: "choose", choiceId: msg.choiceId } : null;
    case "link":
      return num(msg.serial) && str(msg.sig) ? { t: "link", serial: msg.serial, sig: msg.sig } : null;
    case "use":
      return str(msg.itemId) ? { t: "use", itemId: msg.itemId } : null;
    case "market": {
      if (typeof msg.op !== "string" || !MARKET_OPS.has(msg.op)) return null;
      if (!optStr(msg.itemId) || !optStr(msg.listingId) || !optNum(msg.price)) return null;
      const out: ClientMsg = { t: "market", op: msg.op as "list" | "buy" | "cancel" };
      if (msg.itemId !== undefined) out.itemId = msg.itemId;
      if (msg.listingId !== undefined) out.listingId = msg.listingId;
      if (msg.price !== undefined) out.price = msg.price;
      return out;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------- the link

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

/**
 * The disarmed link: a serial and the mock signature seal a guest body as an
 * Angel. A serial held by another connected body is refused. A body locked at
 * the threshold is unlocked but not sent under; it uses the threshold again.
 */
export function applyLink(w: WorldState, id: string, serial: number, sig: string): WorldState {
  const p = w.players.get(id);
  if (!p) return w;
  if (!validLink(serial, sig)) return w;
  if (!p.guest && p.serial === serial) return w;
  if (!p.guest) return w; // one body, one serial
  for (const o of w.players.values()) {
    if (o.id !== id && !o.guest && o.serial === serial) return setPlayer(w, say(p, LINES.LINK_ELSEWHERE, w.now));
  }
  const house = houseFor(serial);
  const messenger = messengerFor(serial);
  const seed = auraSeed(serial);
  const houses = p.history.houses.includes(house) ? p.history.houses : [...p.history.houses, house];
  const me: Player = {
    ...p,
    guest: false,
    serial,
    name: formatSerial(serial),
    house,
    messenger,
    winkSchool: winkSchoolFor(serial),
    auraSeed: seed,
    aura: Math.max(p.aura, seed),
    flags: { ...p.flags, [F.ANGEL]: 1 },
    locked: false,
    linkedAt: w.now,
    history: { ...p.history, houses },
  };
  let cur = setPlayer(w, say(me, LINES.LINK_COPY(serial, house, messenger), w.now));
  const mark = serialHistoryMark(serial);
  if (mark && !cur.history.some(m => m.id === mark.id)) cur = { ...cur, history: [...cur.history, mark] };
  return cur;
}

// ---------------------------------------------------------------- the switch

export function applyAction(w: WorldState, id: string, msg: ClientMsg): WorldState {
  const m = validate(msg);
  if (!m || !w.players.has(id)) return w;
  switch (m.t) {
    case "intent": {
      const intents = new Map(w.intents);
      intents.set(id, { up: !!m.intent.up, down: !!m.intent.down, left: !!m.intent.left, right: !!m.intent.right });
      return { ...w, intents };
    }
    case "dodge":
      return applyDodge(w, id, m.dx, m.dy);
    case "strike":
      return applyStrike(w, id);
    case "heavy":
      return applyHeavy(w, id);
    case "stance":
      return applyStance(w, id);
    case "kit":
      return applyKit(w, id, m.targetId);
    case "interact":
      return applyInteract(w, id, m.targetId, m.choice);
    case "talk":
      return applyTalk(w, id, m.npcId);
    case "choose":
      return applyChoose(w, id, m.choiceId);
    case "close":
      return applyClose(w, id);
    case "link":
      return applyLink(w, id, m.serial, m.sig);
    case "flag":
      return applyFlag(w, id);
    case "truce":
      return applyTruce(w, id);
    case "use":
      return applyUse(w, id, m.itemId);
    case "market":
      return applyMarket(w, id, m.op, { itemId: m.itemId, listingId: m.listingId, price: m.price });
    default:
      return w;
  }
}
