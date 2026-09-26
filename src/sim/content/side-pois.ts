/**
 * Verbs the side hours add to existing POIs. They are appended to the base
 * configuration; none of them reuses a base choice string. Every verb is gated
 * on its quest's step so the prompt only offers it while the hour is live, and
 * verbs that share a key on one POI hide behind the earlier one until it is
 * done. Verbs report; quests change the world.
 */
import { FUNERAL_COST, LISTING_FEE, FORGE_COST, TITHE_COST, UPKEEP_COST } from "../constants";
import { weatherBand, WEATHER_LABEL } from "../protocol";
import { F } from "./ids";
import type { Ctx, PoiVerb } from "../types";
import { COPY_ITEM_ID, SC, SF, SQ, has, hasCopy, stepOf } from "./side";

const atStep = (questId: string, step: number) => ({ p }: Ctx): boolean => stepOf(p, questId) === step;
const notAtStep = (questId: string, step: number) => ({ p }: Ctx): boolean => stepOf(p, questId) !== step;
const both = (...fs: ((ctx: Ctx) => boolean)[]) => (ctx: Ctx): boolean => fs.every(f => f(ctx));
const either = (...fs: ((ctx: Ctx) => boolean)[]) => (ctx: Ctx): boolean => fs.some(f => f(ctx));

const live = (ctx: Ctx, v: PoiVerb): boolean => !(v.once && (ctx.p.flags[v.once] ?? 0) > 0) && (!v.when || v.when(ctx));

/** The spine decides this hour's tithe at the tax window on E and Q; the hours' verbs there wait for that. */
const tithed = ({ p }: Ctx): boolean => has(p, F.TITHE);

/** Same-key verbs on one POI show one at a time, in the order written. */
function exclusive(verbs: PoiVerb[]): PoiVerb[] {
  return verbs.map((v, i) => {
    const earlier = verbs.slice(0, i).filter(e => e.key === v.key);
    if (earlier.length === 0) return v;
    const own = v.when;
    return { ...v, when: (ctx: Ctx) => (own ? own(ctx) : true) && !earlier.some(e => live(ctx, e)) };
  });
}

const taxPercent = (gestell: number): number => Math.floor(Math.max(0, Math.min(100, gestell)) / 4);

export const SIDE_POI_VERBS: Record<string, PoiVerb[]> = {
  // ---------------------------------------------------------------- Nave
  "crt-altar-1": exclusive([
    {
      key: "E", label: "Count the altars", choice: "side:altar:count",
      when: atStep(SQ.THIRD_ALTAR, 0), guest: "allow", once: SF.ALTAR_COUNTED,
      say: "Two altars, says the plaque. This one is lit. Its twin across the aisle is not. Safety counted two. Safety did not count the dark one.",
    },
    {
      key: "E", label: "Put your hand on the glass", choice: "side:unspent:touch",
      when: atStep(SQ.UNSPENT, 1), guest: "allow", once: SF.UNSPENT_TOUCHED,
      say: "The glass is warm where nothing is playing. Two nodes behind you still have their charges. The screen takes that as a signal.",
    },
  ]),
  "crt-altar-2": [
    {
      key: "E", label: "Light it", choice: "side:altar:light",
      when: atStep(SQ.THIRD_ALTAR, 1), guest: "allow", once: SF.ALTAR_LIT,
      say: "The screen comes up white, then the colour of the Nave. No picture. Just on. The third altar is lit. The plaque still says two.",
    },
  ],
  "memorial-recorder": exclusive([
    {
      key: "E", label: "Sit with the voice", choice: "side:night:sit",
      when: atStep(SQ.ANOTHER_NIGHT, 0), guest: "deny", once: SF.NIGHT_SAT,
      say: "The voice runs its length and starts again. Between the last word and the first there is a gap you did not notice the first time. You notice it now.",
    },
    {
      key: "E", label: "Listen again", choice: "side:night:listen",
      when: both(atStep(SQ.ANOTHER_NIGHT, 1), ({ p }) => has(p, F.UNDER)), guest: "deny", once: SF.NIGHT_HEARD,
      say: "From this side the words are the same. The gap is longer. You went under and came back and the silence kept your place.",
    },
  ]),
  "safety-plaque": [
    {
      key: "E", label: "Strike the clerks' names in", choice: "side:job:names",
      when: both(atStep(SQ.DOING_A_JOB, 1), ({ p }) => has(p, F.WEATHER_NAMED)), guest: "deny", once: SF.JOB_NAMES,
      say: "Under 'civic duty' you cut two desk numbers and the word 'buried'. The plaque takes it. Safety will repaint it. The cut stays under the paint.",
    },
  ],

  // ---------------------------------------------------------------- Wet Grid
  "stall-1": [
    {
      key: "Q", label: "Pay the fee in your House's name", choice: "side:fee:pay",
      when: atStep(SQ.LISTING_FEE, 0), guest: "deny", once: SF.FEE_1, cost: { bestand: LISTING_FEE, sink: "listing" },
      say: "Surfaces. The stallholder writes your House on the fee slip and does not look up.",
    },
  ],
  "stall-2": [
    {
      key: "Q", label: "Pay the fee in your House's name", choice: "side:fee:pay",
      when: atStep(SQ.LISTING_FEE, 0), guest: "deny", once: SF.FEE_2, cost: { bestand: LISTING_FEE, sink: "listing" },
      say: "Copies. The fee goes in a tin. The tin has four Houses scratched on it. Yours was already there.",
    },
  ],
  "stall-3": [
    {
      key: "Q", label: "Pay the fee in your House's name", choice: "side:fee:pay",
      when: atStep(SQ.LISTING_FEE, 1), guest: "deny", once: SF.FEE_3, cost: { bestand: LISTING_FEE, sink: "listing" },
      say: "Plants. Real ones, under a lamp that is not. The fee buys them another night under it.",
    },
  ],
  "stall-4": exclusive([
    {
      key: "Q", label: "Ask about the van", choice: "side:van:ask",
      when: atStep(SQ.VAN, 0), guest: "allow", once: SF.VAN_ASKED,
      say: "Armored. For moving Bestand between desks, the clerk says. The clerk is lying. They are for moving Bestand out of a street before it goes hot. This one wants the south end.",
    },
    {
      key: "Q", label: "Pay the fee in your House's name", choice: "side:fee:pay",
      when: both(atStep(SQ.LISTING_FEE, 1), notAtStep(SQ.VAN, 0)), guest: "deny", once: SF.FEE_4, cost: { bestand: LISTING_FEE, sink: "listing" },
      say: "Vans. The fee is the same as for plants. The stallholder finds that funny and does not say why.",
    },
  ]),
  "hot-street": [
    {
      key: "E", label: "Wave the van through", choice: "side:van:wave",
      when: atStep(SQ.VAN, 1), guest: "allow", once: SF.VAN_WAVED,
      say: "You step aside. The van takes the corner and parks across the mouth of the street. Doors stay shut. The street is a different temperature now.",
    },
  ],
  "listing-board": exclusive([
    {
      key: "E", label: "Read the copy's price", choice: "side:copy:read",
      when: atStep(SQ.COPY, 0), guest: "allow", once: SF.COPY_READ,
      say: "Forty Bestand. Exhibition copy of a Clearing. The hole itself is not for sale. The copy is. Seller: Quill. Fee paid.",
    },
    {
      key: "E", label: "Take it down", choice: "side:copy:down",
      when: atStep(SQ.COPY, 1), guest: "allow", once: SF.COPY_DOWN, cost: { bestand: LISTING_FEE, sink: "listing" },
      say: "You pay the fee the seller paid and the board goes quiet where the hole was priced. Somewhere on the Grid, Quill feels the space.",
    },
  ]),
  "forge-tray": exclusive([
    {
      key: "Q", label: "Bank the coals", choice: "side:tray:bank",
      when: atStep(SQ.TRAY, 0), guest: "deny", once: SF.TRAY_BANKED, cost: { bestand: FORGE_COST, sink: "forge" },
      say: "You rake the coals to the back of the tray and cover them. The print that was not a print stays warm. It has nowhere else to go.",
    },
    {
      key: "Q", label: "Take the spotted hint", choice: "side:tray:take",
      when: atStep(SQ.TRAY, 1), guest: "deny", once: SF.TRAY_TAKEN,
      say: "Paper with a hint on it that no press made. You spotted it. It is yours the way a grave is yours.",
    },
  ]),
  "operator-desk": exclusive([
    {
      key: "E", label: "Read the empty desk", choice: "side:desk:read",
      when: atStep(SQ.DESK, 0), guest: "spectate", once: SF.DESK_READ,
      say: "The desk is empty. The ledger is open at a page with your hour on it. Private yield still wants a body.",
    },
    {
      key: "E", label: "Close the ledger", choice: "side:desk:close",
      when: atStep(SQ.DESK, 1), guest: "spectate", once: SF.DESK_CLOSED,
      say: "You close it. The desk stops asking. It will not start again for you.",
    },
  ]),

  // ---------------------------------------------------------------- the Care
  "funeral-desk": exclusive([
    {
      key: "E", label: "Ask for plate twelve", choice: "side:twelve:plate",
      when: atStep(SQ.TWELVE, 0), guest: "spectate", once: SF.TWELVE_PLATE,
      say: "A brass plate. A number. No name. The desk says it was never claimed and the sexton would not bury a number.",
    },
    {
      key: "E", label: "Light the lamp for the buried", choice: "side:lamp:light",
      when: both(atStep(SQ.LAMP, 0), notAtStep(SQ.TWELVE, 0)), guest: "spectate", once: SF.LAMP_LIT, cost: { bestand: TITHE_COST, sink: "tithe" },
      say: "Pim's oil, the desk's wick, your tithe. The lamp in the Mortals hall comes up across the district. Not your House. Your dead.",
    },
    {
      key: "Q", label: "Pay for the unnamed", choice: "side:standing:funeral",
      when: atStep(SQ.STANDING, 0), guest: "spectate", once: SF.STANDING_FUNERAL, cost: { bestand: FUNERAL_COST, sink: "funeral" },
      say: "You pay for a funeral nobody claimed. The desk writes 'paid' where the name would go.",
    },
  ]),
  "care-shrine": [
    {
      key: "Q", label: "Enter the burial in the book", choice: "side:standing:enter",
      when: atStep(SQ.STANDING, 1), guest: "spectate", once: SF.STANDING_ENTERED,
      say: "The shrine keeps the Mortals book. You write 'paid' and a number. The House will count it.",
    },
  ],
  "wreckage-garden": exclusive([
    {
      key: "E", label: "Look for the frozen name", choice: "side:honest:look",
      when: atStep(SQ.HONEST, 0), guest: "spectate", once: SF.HONEST_FOUND,
      say: ({ p }) => (has(p, SF.TWELVE_NAMED)
        ? "The plot you buried under a name. The number under the name is twelve. Went under during a freeze. The Passing that season failed. It was Corvin Slate's brother."
        : "A plot with a number. Twelve. Went under during a freeze. The Passing that season failed. No plate. No name. That is his brother."),
    },
    {
      key: "E", label: "Bury twelve under a name", choice: "side:twelve:bury",
      when: atStep(SQ.TWELVE, 1), guest: "spectate", once: SF.TWELVE_BURIED, cost: { bestand: FUNERAL_COST, sink: "funeral" },
      say: "You put the plate in the ground with the number turned down. The earth closes. A number is not a grave. This is.",
    },
    {
      key: "E", label: "Take a handful of the garden", choice: "side:seed:take",
      when: atStep(SQ.SEED, 0), guest: "spectate", once: SF.SEED_EARTH,
      say: "Garden earth. It was a hole in the first hour. It was wreckage in the third. It is dirt now. Dirt is the good outcome.",
    },
  ]),

  // ---------------------------------------------------------------- Safety Annex
  "tax-window": exclusive([
    {
      key: "E", label: "File Form 9", choice: "side:form9:file",
      when: both(atStep(SQ.FORM9, 1), tithed), guest: "spectate", once: SF.FORM9_FILED, cost: { bestand: 5, sink: "freeze" },
      effects: [{ kind: "choice", key: SC.FORM9, value: "filed" }],
      say: "Five Bestand. Stamped. The freeze you signed is on paper now. Paper holds longer than weather.",
    },
    {
      key: "Q", label: "Refuse Form 9", choice: "side:form9:refuse",
      when: both(atStep(SQ.FORM9, 1), tithed), guest: "spectate", once: SF.FORM9_FILED,
      effects: [{ kind: "choice", key: SC.FORM9, value: "refused" }],
      say: "You do not pay for it twice. The freeze holds on the ground. On paper it lapses. The clerk writes 'lapsed' with no expression.",
    },
    {
      key: "E", label: "Read who pays", choice: "side:tax:read",
      when: atStep(SQ.TAX, 0), guest: "spectate", once: SF.TAX_READ,
      say: ({ w }) => `Gestell tax: ${taxPercent(w.gestell)} percent on every yield. Payers: nobody, by name. The rate is the weather. The weather is everyone, added up.`,
    },
    {
      key: "E", label: "Pay your House's share", choice: "side:tax:pay",
      when: atStep(SQ.TAX, 1), guest: "spectate", once: SF.TAX_PAID, cost: { bestand: TITHE_COST, sink: "tax" },
      say: "You pay a share under a House's name. The clerk has a column for that. It has never had anything in it.",
    },
  ]),

  // ---------------------------------------------------------------- Kerb of Hours
  "omen-terrace": [
    {
      key: "E", label: "Buy an hour", choice: "side:hours:buy",
      when: atStep(SQ.HOURS, 0), guest: "allow", once: SF.HOURS_BOUGHT, cost: { bestand: 3, sink: "upkeep" },
      say: "Three Bestand. Halla Voss writes a time on a slip and says the bell will strike for you then. She does not look at the glass while she writes it.",
    },
  ],
  "hour-bell": exclusive([
    {
      key: "E", label: "Wait under the bell", choice: "side:hour:wait",
      when: atStep(SQ.HOUR, 0), guest: "allow",
      effects: [{ kind: "count", key: SF.HOUR_WAITED, delta: 1 }],
      say: ({ p }) => {
        const n = (p.flags[SF.HOUR_WAITED] ?? 0) + 1;
        if (n <= 1) return "You wait. The bell does not strike. The terrace goes on selling hours behind you.";
        if (n === 2) return "You wait. Someone on the terrace stops talking to watch you. The bell does not strike.";
        return "You wait. The bell strikes. Once. Nobody signed for it. The terrace has gone quiet.";
      },
    },
    {
      key: "E", label: "Wait for the bought hour", choice: "side:hours:wait",
      when: atStep(SQ.HOURS, 1), guest: "allow", once: SF.HOURS_WAITED,
      say: "The time on the slip comes and goes. The bell is on a schedule. The schedule is Safety's. So, it turns out, is the slip.",
    },
  ]),
  "forecast-glass": exclusive([
    {
      key: "E", label: "Read the front", choice: "side:front:read",
      when: either(atStep(SQ.FRONT, 0), atStep(SQ.SKY_GLASS, 0)), guest: "spectate", once: SF.FRONT_READ,
      say: ({ w, p }) => {
        const band = WEATHER_LABEL[weatherBand(w.gestell)];
        const drift = w.gestell > 40 ? "The drift is up." : w.gestell < 40 ? "The drift is down." : "The drift is flat.";
        return p.house === "sky" ? `${band} ${drift} Behind the band, a front. You can see its edge. Nobody else on the Kerb can.` : `${band} ${drift} Behind the band, a front. You cannot see its edge. You can see that it has one.`;
      },
    },
    {
      key: "Q", label: "Take the omen glass", choice: "side:skyhall:take",
      when: atStep(SQ.SKY_GLASS, 1), guest: "spectate", once: SF.GLASS_TAKEN,
      say: "A sliver of the forecast glass comes away in your hand. It shows the drift. It will never show the hour.",
    },
  ]),

  // ---------------------------------------------------------------- Gold Ring
  "shrine-1": exclusive([
    {
      key: "E", label: "Count the bell", choice: "side:census:first",
      when: atStep(SQ.CENSUS, 0), guest: "allow", once: SF.CENSUS_FIRST,
      say: "One bell. Tongue present. It has not rung in your hearing. You write 'one' for Safety.",
    },
    {
      key: "E", label: "Sweep the step", choice: "side:step:sweep",
      when: atStep(SQ.STEP, 0), guest: "allow", once: SF.STEP_SWEPT,
      say: "You sweep the step. Grit, a shrine cloth thread, a fee slip somebody dropped. The step is clean. Nothing else has changed.",
    },
    {
      key: "Q", label: "Sweep the shrine", choice: "side:sweep:first",
      when: atStep(SQ.UPKEEP, 0), guest: "spectate", once: SF.SWEEP_1, cost: { bestand: UPKEEP_COST, sink: "upkeep" },
      say: "Upkeep. Bestand into the ground. The Gestell thins by an amount you will not feel.",
    },
  ]),
  "shrine-2": exclusive([
    {
      key: "E", label: "Look under the altar", choice: "side:mute:look",
      when: atStep(SQ.MUTE, 0), guest: "spectate", once: SF.MUTE_TONGUE,
      say: "Under the altar, in shrine cloth: a bell's tongue. The cut is clean. Not cast without one. Cut. The keeper's story is a story.",
    },
    {
      key: "Q", label: "Sweep the shrine", choice: "side:sweep:second",
      when: atStep(SQ.UPKEEP, 0), guest: "spectate", once: SF.SWEEP_2, cost: { bestand: UPKEEP_COST, sink: "upkeep" },
      say: "Upkeep for the shrine of a bell that does not ring. The cloth on the altar has something wrapped in it. You leave it.",
    },
  ]),
  "shrine-3": exclusive([
    {
      key: "E", label: "Count the bell", choice: "side:census:last",
      when: atStep(SQ.CENSUS, 1), guest: "allow", once: SF.CENSUS_LAST,
      say: "One bell. Tongue present. Dust on it. No keeper comes here. You write 'two, and one without' for Safety.",
    },
    {
      key: "Q", label: "Sweep the shrine", choice: "side:sweep:last",
      when: atStep(SQ.UPKEEP, 1), guest: "spectate", once: SF.SWEEP_3, cost: { bestand: UPKEEP_COST, sink: "upkeep" },
      say: "Nobody keeps the last bell. You pay its upkeep anyway. The dust comes off the tongue in one piece.",
    },
  ]),
  "mute-bell": [
    {
      key: "E", label: "Hang the tongue", choice: "side:mute:hang",
      when: atStep(SQ.MUTE, 1), guest: "spectate", once: SF.MUTE_HUNG,
      say: "You hang it. The bell swings on its own weight and rings once. Then the keeper is beside you with his hand out. Then it is mute again.",
    },
  ],
  "cult-vault": [
    {
      key: "E", label: "Leave the copy", choice: "side:vault:leave",
      when: both(atStep(SQ.VAULT, 0), ({ p }) => hasCopy(p)), guest: "spectate", once: SF.VAULT_LEFT,
      effects: [{ kind: "item", remove: COPY_ITEM_ID, qty: 1 }, { kind: "fakeWinke", delta: -1 }],
      say: "The copy goes through the slot. It was worth nine. It is worth nothing now. It is the only thing in the vault that was ever for sale.",
    },
  ],

  // ---------------------------------------------------------------- the Organs
  "cold-desk": exclusive([
    {
      key: "E", label: "Pay the Strait toll", choice: "side:toll:pay",
      when: atStep(SQ.TOLL, 0), guest: "spectate", once: SF.TOLL_DECIDED, cost: { bestand: 6, sink: "tax" },
      effects: [{ kind: "choice", key: SC.TOLL, value: "paid" }],
      say: "Six Bestand into the House of Earth. Renn Coil writes it in the column without comment. That is his comment.",
    },
    {
      key: "Q", label: "Refuse the Strait toll", choice: "side:toll:refuse",
      when: atStep(SQ.TOLL, 0), guest: "spectate", once: SF.TOLL_DECIDED,
      effects: [{ kind: "choice", key: SC.TOLL, value: "refused" }],
      say: "You refuse. Renn Coil writes a minus in the Earth column and does not tell you it is there.",
    },
  ]),
  "organ-strait": exclusive([
    {
      key: "Q", label: "Read the toll plaque", choice: "side:toll:read",
      when: atStep(SQ.TOLL, 1), guest: "spectate", once: SF.TOLL_TOLD,
      say: ({ p }) => (p.choices[SC.TOLL] === "paid"
        ? "Toll paid. The bridge does not remember who. The House of Earth does."
        : "Toll refused. The bridge stayed open. Somebody's standing paid for that. You did not pretty it."),
    },
    {
      key: "Q", label: "Read the second column", choice: "side:column:strait",
      when: atStep(SQ.COLUMN, 0), guest: "spectate", once: SF.COLUMN_STRAIT,
      say: "Back of the plaque, in a hand that is not Safety's: 'A river. Boats with names on them. A ferry that ran on hours, not yield.'",
    },
  ]),
  "organ-foundry": exclusive([
    {
      key: "E", label: "Rake the coals out", choice: "side:foundry:rake",
      when: atStep(SQ.FOUNDRY, 0), guest: "spectate", once: SF.FOUNDRY_RAKED,
      say: "You rake it out. Heat without a nation, ended. The Cable hums a note lower. Somewhere a number becomes zero.",
    },
    {
      key: "E", label: "Read the second column", choice: "side:column:foundry",
      when: atStep(SQ.COLUMN, 1), guest: "spectate", once: SF.COLUMN_FOUNDRY,
      say: "Back of the plaque: 'A hill. Cold. People climbed it to see the Strait. There was nothing to extract and nobody tried.'",
    },
  ]),
  "organ-cable": [
    {
      key: "E", label: "Read the second column", choice: "side:column:cable",
      when: atStep(SQ.COLUMN, 2), guest: "spectate", once: SF.COLUMN_CABLE,
      say: "Back of the plaque: 'A street. Lamps that went out at night because people slept. Signal was a voice at a window.' The last line is not signed.",
    },
  ],

  // ---------------------------------------------------------------- the Clearing
  "seed-1": [
    {
      key: "E", label: "Turn the earth in", choice: "side:seed:turn",
      when: atStep(SQ.SEED, 1), guest: "spectate", once: SF.SEED_TURNED,
      say: "Garden earth into seed ground. It was a hole, then wreckage, then dirt. Now it is a place someone could stand. That is all a seed is.",
    },
  ],
  "seed-2": [
    {
      key: "E", label: "Stand for your House", choice: "side:contest:stand",
      when: atStep(SQ.CONTEST, 0), guest: "spectate",
      effects: [{ kind: "count", key: SF.CONTEST_HELD, delta: 1 }],
      say: ({ p }) => {
        const n = (p.flags[SF.CONTEST_HELD] ?? 0) + 1;
        return n >= 3 ? "The ring asks whose you are a third time. You say it. The ring writes it. Tithe and omen. Never a bigger stick." : "The ring asks whose you are. You say it. The ring wants to hear it again.";
      },
    },
  ],
  "seed-3": [
    {
      key: "E", label: "Read the ring's ledger", choice: "side:contest:read",
      when: atStep(SQ.CONTEST, 1), guest: "spectate", once: SF.CONTEST_READ,
      say: "Four columns. Who stood, and how long. It does not write who won. The ring does not think that is its job.",
    },
  ],
  "seed-4": [
    {
      key: "E", label: "Face last season", choice: "side:season:face",
      when: atStep(SQ.SEASON, 0), guest: "spectate", once: SF.SEASON_FACED,
      say: "South-east of the seed ground the asphalt is a different colour. Last season's Passing failed here. The hour went by. The city kept the weather. You do not loot it.",
    },
  ],
};
