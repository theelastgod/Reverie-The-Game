/**
 * The secondary cast. Five people with jobs and lies. Each hands out the side
 * hours of their district and closes them; none of them lectures. Their homes
 * are in map.ts; when an hour changes their schedule the quest's `npc` effect
 * moves the shared body and `personal` keeps the viewer's own version honest.
 */
import type { Ctx, DialogueChoice, DialogueNode, Effect, NpcDef, NpcState, Player } from "../types";
import { NPC_HOMES } from "../map";
import { F } from "./ids";
import { SF, SIDE_BY_ID, SIDE_PLACES, SQ, has, offerKey, offered, stepOf } from "./side";

// ---------------------------------------------------------------- helpers

const flag = (key: string): Effect => ({ kind: "flag", key });
const tally = (key: string): Effect => ({ kind: "count", key, delta: 1 });
const offer = (questId: string): Effect[] => [flag(offerKey(questId)), { kind: "quest", id: questId, op: "start" }];

const finished = (p: Player, questId: string): boolean => {
  const s = stepOf(p, questId);
  return s !== undefined && s >= (SIDE_BY_ID[questId]?.steps.length ?? Infinity);
};
const atStep = (p: Player, questId: string, step: number): boolean => stepOf(p, questId) === step;
const angel = (p: Player): boolean => !p.guest && !p.locked;

const place = (id: string): Partial<NpcState> => {
  const pos = SIDE_PLACES[id];
  return { x: pos.x, y: pos.y, district: pos.district, present: true };
};

const leave: DialogueChoice = { id: "leave", label: "Leave." };
const node = (n: DialogueNode): DialogueNode => n;

// ---------------------------------------------------------------- Corvin Slate, Officer of Safety

/**
 * Where the Officer stands for this viewer. The Clearing is behind an Angel
 * gate: when the shared body has walked there, an unsealed viewer keeps him at
 * the Annex desk, where their paper hours can still reach him.
 */
const officerState = (ctx: Ctx): string => {
  const { p, w } = ctx;
  if (finished(p, SQ.HONEST)) return "clearing";
  if (finished(p, SQ.CENSUS)) return "ring";
  const shared = w.npcs["officer"]?.state ?? "home";
  if (p.guest && shared === "clearing") return "home";
  return shared;
};

const officerHub = (ctx: Ctx): string => {
  const { p } = ctx;
  const state = officerState(ctx);
  if (state === "clearing") return "You are standing where the Passing failed. He does not turn around. \"The freeze held. I have the paperwork. Say what you came to say.\"";
  if (state === "ring") return "He is under the shrine of the mute bell with a form on a board. \"Two with tongues. One without. Your count was right. I wanted to see the one without.\"";
  if (p.guest) return "\"Unsealed. You can still carry paper. Safety has paper that needs carrying.\"";
  return "\"Officer of Safety. The district is stable. If you have come about the freeze, it holds. If you have come about something else, say it.\"";
};

const officer: NpcDef = {
  id: "officer",
  name: "Corvin Slate",
  role: "Officer of Safety",
  home: "home:officer",
  portrait: "safety-annex.jpg",
  sprite: "clerk",
  party: false,
  personal: (ctx, shared) => {
    if (finished(ctx.p, SQ.HONEST)) return { ...place("officer-clearing"), state: "clearing" };
    if (finished(ctx.p, SQ.CENSUS)) return { ...place("officer-ring"), state: "ring" };
    if (ctx.p.guest && shared.state === "clearing") {
      const home = NPC_HOMES.officer;
      return { x: home.x, y: home.y, district: home.district, present: true, state: "home" };
    }
    return null;
  },
  entry: ({ p }) => (has(p, SF.OFFICER_MET) ? "hub" : "greet"),
  nodes: {
    greet: node({
      id: "greet",
      text: "\"Corvin Slate. Officer of Safety. This district is stable. Extraction is civic duty. Nobody has been lost under a freeze; that is what a freeze is for.\" He says it the way a plaque says it.",
      effects: [flag(SF.OFFICER_MET), tally(SF.OFFICER_VISITS)],
      choices: [
        { id: "what", label: "What is Safety for?", next: "safety" },
        { id: "work", label: "Is there paper to carry?", next: "hub" },
        leave,
      ],
    }),
    safety: node({
      id: "safety",
      text: "\"Peace. Stability. A district that does not go under while you are standing in it. People call that the other answer. I call it the honest one. The weather does not care which.\"",
      wink: "He believes it. That is not the same as it being true. It is not the same as it being false.",
      choices: [{ id: "back", label: "Understood.", next: "hub" }],
    }),
    hub: node({
      id: "hub",
      text: officerHub,
      effects: [tally(SF.OFFICER_VISITS)],
      choices: [
        { id: "census", label: "The bell census.", when: ({ p }) => !offered(p, SQ.CENSUS), next: "census" },
        { id: "census-report", label: "Two with tongues. One without.", when: ({ p }) => atStep(p, SQ.CENSUS, 2), next: "census-report" },
        { id: "notice", label: "A notice for the bell.", when: ({ p }) => offered(p, SQ.CENSUS) && !offered(p, SQ.NOTICE), next: "notice" },
        { id: "notice-report", label: "The keeper refused it.", when: ({ p }) => atStep(p, SQ.NOTICE, 1), next: "notice-report" },
        { id: "form9", label: "Form 9.", when: ({ p }) => atStep(p, SQ.FORM9, 0), next: "form9" },
        { id: "grief", label: "You lost someone under a freeze.", when: ({ p }) => angel(p) && has(p, F.FREEZE) && !offered(p, SQ.HONEST) && (p.flags[SF.OFFICER_VISITS] ?? 0) >= 2, next: "grief" },
        { id: "twelve", label: "Number twelve.", when: ({ p }) => atStep(p, SQ.HONEST, 1), next: "grief-return" },
        leave,
      ],
    }),
    census: node({
      id: "census",
      text: "\"Safety is registering the bells. Count the first and the last on the Gold Ring. Bring me the number. It is a census. Nothing more.\" He does not ask if you can count. He asks if the keeper will let you.",
      effects: offer(SQ.CENSUS),
      choices: [{ id: "go", label: "I will count them." }],
    }),
    "census-report": node({
      id: "census-report",
      text: "\"Two with tongues. One without.\" He writes 'one without' and underlines it. \"I will go and see it. A bell that cannot be scheduled is a bell that cannot be made safe.\"",
      effects: [flag(SF.CENSUS_REPORTED)],
    }),
    notice: node({
      id: "notice",
      text: "\"Form 4. Registration of an hour. The mute bell is to be entered as a scheduled hour whether it rings or not. Take it to the keeper. He will sign or he will not. Either way, come back.\"",
      effects: offer(SQ.NOTICE),
      choices: [{ id: "go", label: "I will take it." }],
    }),
    "notice-report": node({
      id: "notice-report",
      text: "\"He refused.\" Corvin Slate files a refusal in the same drawer as a signature. \"Then the bell stays off the schedule. And he stays under it. That is his freeze. I understand it better than he thinks.\"",
      effects: [flag(SF.NOTICE_REPORTED)],
    }),
    form9: node({
      id: "form9",
      text: "\"You signed the freeze. The fee you paid was the deposit. Form 9 is the fee. Five Bestand at the tax window and the freeze is on paper, which holds longer than weather. Refuse and it lapses on paper. It holds on the ground either way. I did not tell you at the desk because nobody reads Form 9 before they sign.\"",
      wink: "You bought time. You spent a god. Form 9 is the receipt.",
      effects: [flag(SF.FORM9_ASKED)],
    }),
    grief: node({
      id: "grief",
      text: "He stops filing. \"Nobody has been lost under a freeze.\" A pause the length of a form. \"My brother went under during the first one I signed. Aldo. The Passing failed that season. He did not wake in the Care. There is no plate. Safety does not keep plates. If you go into the wreckage garden, you will find a number. I have never gone.\"",
      wink: "The other honest answer, finally being honest. It costs him the plaque.",
      effects: offer(SQ.HONEST),
      choices: [{ id: "go", label: "I will find the number." }],
    }),
    "grief-return": node({
      id: "grief-return",
      text: "\"Twelve.\" He says it once. He puts the form down. \"The freeze held. The district was stable. He went under stable.\" He takes his coat. \"I am going to stand where the Passing failed. Somebody from Safety should have.\"",
      effects: [flag(SF.HONEST_TOLD)],
    }),
  },
};

// ---------------------------------------------------------------- Halla Voss, omen-reader

const omenHub = (ctx: Ctx): string => {
  const { p, w } = ctx;
  if (finished(p, SQ.HOURS) || w.npcs["omen"]?.state === "glass") return "She is at the forecast glass with nothing to sell. \"I read the front now. For nothing. It is worse. It is better.\"";
  if (p.guest) return "\"Unsealed and on the Kerb. You cannot see the front. You can wait under a bell. Anyone can wait.\"";
  return "\"Omen-reader. I read the front and I sell the hour. Ask for one or the other. Not both at once; they do not agree.\"";
};

const omen: NpcDef = {
  id: "omen",
  name: "Halla Voss",
  role: "Omen-reader",
  home: "home:omen",
  portrait: "clearing-ring.jpg",
  sprite: "vesper",
  party: false,
  personal: (ctx) => (finished(ctx.p, SQ.HOURS) ? { ...place("omen-glass"), state: "glass" } : null),
  entry: ({ p }) => (has(p, SF.OMEN_MET) ? "hub" : "greet"),
  nodes: {
    greet: node({
      id: "greet",
      text: "\"Halla Voss. I read the front.\" She is not looking at the glass. She is looking at a slip with a time on it. \"Hours are three Bestand. Fronts are not for sale. Which are you?\"",
      effects: [flag(SF.OMEN_MET), tally(SF.OMEN_VISITS)],
      choices: [
        { id: "read", label: "What do you read?", next: "read" },
        { id: "buy", label: "Sell me an hour.", next: "hours" },
        { id: "bell", label: "Does the bell strike?", next: "hour" },
        leave,
      ],
    }),
    read: node({
      id: "read",
      text: "\"The front. Behind the band the glass shows there is a front, and I can see its edge.\" She says this to everyone. She does not say it to the glass.",
      wink: "The forecast is a lie with a time on it. She reads the time off a Safety schedule. The front she can actually see, she has never sold.",
      choices: [{ id: "back", label: "Understood.", next: "hub" }],
    }),
    hub: node({
      id: "hub",
      text: omenHub,
      effects: [tally(SF.OMEN_VISITS)],
      choices: [
        { id: "buy", label: "Sell me an hour.", when: ({ p }) => !offered(p, SQ.HOURS), next: "hours" },
        { id: "bell", label: "Does the bell strike?", when: ({ p }) => !offered(p, SQ.HOUR), next: "hour" },
        { id: "struck", label: "It struck.", when: ({ p }) => atStep(p, SQ.HOUR, 1), next: "hour-told" },
        { id: "confront", label: "The hour I bought did not come.", when: ({ p }) => atStep(p, SQ.HOURS, 2), next: "hours-confront" },
        { id: "front", label: "There is a front behind the band.", when: ({ p }) => atStep(p, SQ.FRONT, 1), next: "front-report" },
        { id: "season", label: "Last season's hole.", when: ({ p }) => atStep(p, SQ.SEASON, 1), next: "season-report" },
        leave,
      ],
    }),
    hours: node({
      id: "hours",
      text: "\"Three Bestand at the terrace. I write the time; the bell strikes for you then. If it does not, come back and tell me. Nobody has.\" She says the last part like a warranty.",
      effects: offer(SQ.HOURS),
      choices: [{ id: "go", label: "I will buy one." }],
    }),
    hour: node({
      id: "hour",
      text: "\"The hour bell does not strike. It is on a schedule nobody signed and the schedule has no hours on it. If you want to hear it, wait under it. Three times. Do not leave between. It will not strike. I am telling you so you do not blame me.\"",
      effects: offer(SQ.HOUR),
      choices: [{ id: "go", label: "I will wait." }],
    }),
    "hour-told": node({
      id: "hour-told",
      text: "\"It struck.\" She looks at the bell for the first time since you met her. \"For you. Once. That is not on any schedule I have.\" She puts the slip in her pocket. \"Then the schedule is wrong about one thing.\"",
      wink: "The bell you did not hear is the one that rang. She heard this one. It ruins her whole trade.",
      effects: [flag(SF.HOUR_TOLD)],
    }),
    "hours-confront": node({
      id: "hours-confront",
      text: "\"It did not come.\" She takes the slip back. \"No. The times are Safety's bell schedule. I copy them. The bell is on the schedule; the schedule is not on the bell. I sold you a lie with a time on it.\" She tears the slip. \"I am going to stand at the glass. I will read the front, which I can see, for nothing, which is what it is worth.\"",
      effects: [flag(SF.HOURS_CONFRONTED)],
    }),
    "front-report": node({
      id: "front-report",
      text: "You tell her the shape of the edge. She goes still. \"That is the one I see. I have never said it out loud.\" She names it. It is a Sky name; it does not translate. \"The House will stand for that. I will not charge you.\"",
      wink: "Look at the drift, not the number. She just did, in public. The House of Sky felt it.",
      effects: [flag(SF.FRONT_TOLD)],
    }),
    "season-report": node({
      id: "season-report",
      text: "\"A front that already went by.\" She has no slip for that. \"I read what is coming. You faced what came and did not. Keep the mark. It is the only omen on the Kerb that cannot be wrong.\"",
      effects: [flag(SF.SEASON_TOLD)],
    }),
  },
};

// ---------------------------------------------------------------- Dov Marrow, keeper of the Ring

const keeperHub = (ctx: Ctx): string => {
  const { p, w } = ctx;
  if (finished(p, SQ.NOTICE) || w.npcs["keeper"]?.state === "guarding") return "He is under the mute bell with the notice folded into the shrine cloth. \"They will send another. I will be here for that one too.\"";
  if (p.guest) return "\"Unsealed. You cannot keep a shrine. You can hold a broom. The city will not know the difference. I will.\"";
  return "\"Keeper. Three shrines, one vault, one bell that was cast without a tongue. Upkeep is Bestand. Everything else here is not for sale. Say what you want.\"";
};

const keeper: NpcDef = {
  id: "keeper",
  name: "Dov Marrow",
  role: "Keeper of the Ring",
  home: "home:keeper",
  portrait: "shrine-upkeep.jpg",
  sprite: "ione",
  party: false,
  personal: (ctx) => (finished(ctx.p, SQ.NOTICE) ? { ...place("keeper-bell"), state: "guarding" } : null),
  entry: ({ p }) => (has(p, SF.KEEPER_MET) ? "hub" : "greet"),
  nodes: {
    greet: node({
      id: "greet",
      text: "\"Dov Marrow. I keep the Ring.\" He has a broom and a key and does not put either down. \"The first bell rings. The last bell rings. The middle one was cast mute. Do not ask me to make it ring; it was made that way.\"",
      effects: [flag(SF.KEEPER_MET), tally(SF.KEEPER_VISITS)],
      choices: [
        { id: "why", label: "Why is the bell mute?", next: "mute-story" },
        { id: "sweep", label: "I could sweep.", next: "step" },
        { id: "work", label: "What needs keeping?", next: "hub" },
        leave,
      ],
    }),
    "mute-story": node({
      id: "mute-story",
      text: "\"Cast without a tongue. Before my time. A bell that cannot ring cannot be put on an hour, and a bell that is not on an hour cannot be sold as one. Whoever cast it knew that.\" He says 'whoever' carefully.",
      wink: "The cut is clean. He made it. He would do it again. He is not sorry and he is not lying about why; only about who.",
      choices: [{ id: "back", label: "Understood.", next: "hub" }],
    }),
    hub: node({
      id: "hub",
      text: keeperHub,
      effects: [tally(SF.KEEPER_VISITS)],
      choices: [
        { id: "notice", label: "Safety sent a notice.", when: ({ p }) => atStep(p, SQ.NOTICE, 0), next: "notice-refuse" },
        { id: "census", label: "I am counting bells for Safety.", when: ({ p }) => atStep(p, SQ.CENSUS, 0) || atStep(p, SQ.CENSUS, 1), next: "census-aside" },
        { id: "sweep", label: "I could sweep.", when: ({ p }) => !offered(p, SQ.STEP), next: "step" },
        { id: "swept", label: "The step is swept.", when: ({ p }) => atStep(p, SQ.STEP, 1), next: "step-done" },
        { id: "mute", label: "The bell was not cast mute.", when: ({ p }) => angel(p) && !offered(p, SQ.MUTE) && (p.flags[SF.KEEPER_VISITS] ?? 0) >= 2, next: "mute-offer" },
        { id: "upkeep", label: "Upkeep.", when: ({ p }) => angel(p) && !offered(p, SQ.UPKEEP), next: "upkeep-offer" },
        { id: "vault", label: "What does the vault keep?", when: ({ p }) => angel(p) && has(p, F.FORGE) && !offered(p, SQ.VAULT), next: "vault-offer" },
        { id: "vault-done", label: "The copy is in the vault.", when: ({ p }) => atStep(p, SQ.VAULT, 1), next: "vault-take" },
        leave,
      ],
    }),
    step: node({
      id: "step",
      text: "\"Sweep the step of the first shrine. No Bestand; a broom is not upkeep. Then come and tell me, and I will tell you what the city calls it.\"",
      effects: offer(SQ.STEP),
      choices: [{ id: "go", label: "I will sweep it." }],
    }),
    "step-done": node({
      id: "step-done",
      text: "\"The ledger will say 'kept'. Sweeping is not keeping. The city cannot tell a broom from a rite and it will count yours.\" He almost smiles. \"That is the city's problem. It is not yours. You swept a step.\"",
      effects: [flag(SF.STEP_TOLD)],
    }),
    "notice-refuse": node({
      id: "notice-refuse",
      text: "He reads Form 4 twice. \"Registration of an hour. For a bell with no tongue.\" He folds it into the shrine cloth without signing. \"Tell the Officer the bell is not an hour. Tell him I will be standing under it if he wants to register me.\"",
      effects: [flag(SF.NOTICE_REFUSED)],
    }),
    "census-aside": node({
      id: "census-aside",
      text: "\"Count them. They are bells; they hold still.\" He watches you go. \"When you get to the middle one, count what is not there. Safety will want that number most.\"",
    }),
    "mute-offer": node({
      id: "mute-offer",
      text: "A long look. \"No. It was not.\" He sets the broom down for the first time. \"Look under the altar of its shrine. Hang what you find. It will ring once, and then I will take it back, and it will be mute again, and you will know why. That is the whole hour.\"",
      wink: "He cut it so the hour could not be priced. He wants one person to hear it ring so he is not the only one who knows it can.",
      effects: offer(SQ.MUTE),
      choices: [{ id: "go", label: "I will look." }],
    }),
    "upkeep-offer": node({
      id: "upkeep-offer",
      text: "\"Three shrines. Bestand goes into the ground and the Gestell thins by an amount nobody feels. Nobody keeps the last bell. Pay it anyway. Divinities stands for people who pay for what nobody keeps.\"",
      effects: offer(SQ.UPKEEP),
      choices: [{ id: "go", label: "I will sweep them." }],
    }),
    "vault-offer": node({
      id: "vault-offer",
      text: "\"Things that do not list. That is all a vault is.\" He weighs the key. \"You have been to Quill's tray. Bring a copy here, a forged hint, something that sells, and put it through the slot. It will never sell again. Then we will talk about what is in there.\"",
      effects: offer(SQ.VAULT),
      choices: [{ id: "go", label: "I will bring one." }],
    }),
    "vault-take": node({
      id: "vault-take",
      text: "\"It is in.\" He turns the key. \"The only thing in there that was ever for sale, and you gave it up. That is the test. There is no other one.\" He presses a seal into your hand. \"Cult. It does not list. The vault is open to you. There is nothing in it for sale.\"",
      effects: [flag(SF.VAULT_TOLD)],
    }),
  },
};

// ---------------------------------------------------------------- Pim Ashe, sexton's apprentice

const sextonHub = (ctx: Ctx): string => {
  const { p, w } = ctx;
  if (finished(p, SQ.LEDGER) || w.npcs["sexton"]?.state === "garden") return "He is in the wreckage garden with the ledger open on his knee. \"I am numbering. It is faster out here. Nara does not come out here.\"";
  return "\"Sexton's apprentice. I dig. Nara buries. Every grave in the Care has a name.\" His coat has a ledger in it and the ledger has a corner showing.";
};

const sexton: NpcDef = {
  id: "sexton",
  name: "Pim Ashe",
  role: "Sexton's apprentice",
  home: "home:sexton",
  portrait: "plate-burial.jpg",
  sprite: "nara",
  party: false,
  personal: (ctx) => (finished(ctx.p, SQ.LEDGER) ? { ...place("sexton-garden"), state: "garden" } : null),
  entry: ({ p }) => (has(p, SF.SEXTON_MET) ? "hub" : "greet"),
  nodes: {
    greet: node({
      id: "greet",
      text: "\"Pim Ashe. I dig for Nara Vale.\" He is younger than the shovel. \"Every grave in the Care has a name. She says so. So it is so.\" The ledger corner in his coat says something else.",
      effects: [flag(SF.SEXTON_MET), tally(SF.SEXTON_VISITS)],
      choices: [
        { id: "lie", label: "Every grave has a name?", next: "lie" },
        { id: "work", label: "Is there digging?", next: "hub" },
        leave,
      ],
    }),
    lie: node({
      id: "lie",
      text: "\"Every one.\" He puts a hand over the coat pocket. \"Nara will not bury a number. So the numbers are not graves. So every grave has a name.\" He has said it before. It gets shorter each time.",
      wink: "Twelve numbers in a ledger he keeps because she will not. The lie is hers; he is only carrying it.",
      choices: [{ id: "back", label: "Understood.", next: "hub" }],
    }),
    hub: node({
      id: "hub",
      text: sextonHub,
      effects: [tally(SF.SEXTON_VISITS)],
      choices: [
        { id: "ledger", label: "The ledger in your coat.", when: ({ p }) => angel(p) && !offered(p, SQ.LEDGER), next: "ledger-offer" },
        { id: "ledger-done", label: "Two more numbers.", when: ({ p }) => atStep(p, SQ.LEDGER, 1), next: "ledger-done" },
        { id: "twelve", label: "Number twelve.", when: ({ p }) => angel(p) && offered(p, SQ.LEDGER) && !offered(p, SQ.TWELVE), next: "twelve-offer" },
        { id: "twelve-named", label: "Twelve has a name.", when: ({ p }) => atStep(p, SQ.TWELVE, 2), next: "twelve-named" },
        { id: "lamp", label: "The lamp in the hall.", when: ({ p }) => angel(p) && has(p, F.HALL) && !offered(p, SQ.LAMP), next: "lamp-offer" },
        { id: "lamp-told", label: "It is lit.", when: ({ p }) => atStep(p, SQ.LAMP, 1), next: "lamp-told" },
        { id: "seed", label: "The garden is dirt now.", when: ({ p }) => angel(p) && has(p, F.GARDEN) && !offered(p, SQ.SEED), next: "seed-offer" },
        leave,
      ],
    }),
    "ledger-offer": node({
      id: "ledger-offer",
      text: "He takes it out. Twelve lines. Numbers. \"The ones she would not. I keep them so somebody does.\" He does not ask you to fix it. \"Bury two the city did not count. Anywhere. Bring me the count and I will write it down. Numbers are a start.\"",
      effects: offer(SQ.LEDGER),
      choices: [{ id: "go", label: "I will bring you two." }],
    }),
    "ledger-done": node({
      id: "ledger-done",
      text: "He writes two lines and closes the book. \"That is fourteen. It is the only ledger in the city that gets shorter when someone does their job.\" He looks at the garden. \"I am going out there. It is faster to number where they are.\"",
      effects: [flag(SF.LEDGER_REPORTED)],
    }),
    "twelve-offer": node({
      id: "twelve-offer",
      text: "\"Twelve.\" He finds the line without looking. \"Went under in a freeze. The Passing failed. Nobody claimed the plate. Nara would not bury a number.\" He tears the line out and gives it to you. \"Get the plate from the desk. Bury him under a name. Any name. Then come and tell me what it was.\"",
      effects: offer(SQ.TWELVE),
      choices: [{ id: "go", label: "I will find the plate." }],
    }),
    "twelve-named": node({
      id: "twelve-named",
      text: ({ p }) => (has(p, SF.HONEST_FOUND)
        ? "\"Aldo Slate.\" He writes it where the number was. \"The Officer's brother. Under the Officer's freeze.\" He does not say anything else about that. \"Eleven now. Keep the name. It is the only one in the ledger that is cult.\""
        : "You give him the name. He writes it where the number was and does not ask if it is right. \"A name is a name. A number was not a grave. Eleven now. Keep the name. It is the only one in the ledger that is cult.\""),
      effects: [flag(SF.TWELVE_NAMED)],
    }),
    "lamp-offer": node({
      id: "lamp-offer",
      text: "\"The lamp in the Mortals hall is dark for anyone who is not Mortals. The desk keeps its wick.\" He gives you a tin of oil. \"Light it for the buried, not the House. It costs a tithe. The hall does not ask whose hand.\"",
      effects: offer(SQ.LAMP),
      choices: [{ id: "go", label: "I will light it." }],
    }),
    "lamp-told": node({
      id: "lamp-told",
      text: "\"Lit.\" He writes it in the back of the ledger, where the names are. \"Not your House. Your dead. That is the right column.\"",
      effects: [flag(SF.LAMP_TOLD)],
    }),
    "seed-offer": node({
      id: "seed-offer",
      text: "\"Dirt. That is the good outcome.\" He looks at the garden a long time. \"Take a handful to the Clearing. Turn it into the seed ground. I cannot plant; I am not a Dweller. Anyone can turn earth. A seed is a promise you cannot cash. Make one anyway.\"",
      effects: offer(SQ.SEED),
      choices: [{ id: "go", label: "I will take a handful." }],
    }),
  },
};

// ---------------------------------------------------------------- Renn Coil, cold desk

const deskHub = (ctx: Ctx): string => {
  const { p, w } = ctx;
  if (finished(p, SQ.FOUNDRY) || w.npcs["desk"]?.state === "foundry") return "He is at the dark Foundry with the number on a card. Zero. \"I wanted to see what a zero looks like from the front.\"";
  return "\"Cold desk. I post the number for each organ. Strait, Foundry, Cable. The number is the whole column.\" There is a second column on the sheet. It is folded under.";
};

const desk: NpcDef = {
  id: "desk",
  name: "Renn Coil",
  role: "Cold desk",
  home: "home:desk",
  portrait: "organ-cable-dark.jpg",
  sprite: "ord",
  party: false,
  personal: (ctx) => (finished(ctx.p, SQ.FOUNDRY) ? { ...place("desk-foundry"), state: "foundry" } : null),
  entry: ({ p }) => (has(p, SF.DESK_MET) ? "hub" : "greet"),
  nodes: {
    greet: node({
      id: "greet",
      text: "\"Renn Coil. Cold desk.\" He does not look up from the sheet. \"Strait, Foundry, Cable. A number for each. Honest. The number is the whole column; there is nothing under it.\" The sheet is folded so you cannot see under it.",
      effects: [flag(SF.DESK_MET), tally(SF.DESK_VISITS)],
      choices: [
        { id: "number", label: "What is the number?", next: "number" },
        { id: "work", label: "What does the desk need?", next: "hub" },
        leave,
      ],
    }),
    number: node({
      id: "number",
      text: "\"Yield. Per organ. Per hour. It goes up when you extract and down when you keep. I post it. I do not pretty it and I do not explain it.\" He taps the fold in the sheet without noticing he has.",
      wink: "The number is honest. Honest is not the same as whole. The second column is what each organ was.",
      choices: [{ id: "back", label: "Understood.", next: "hub" }],
    }),
    hub: node({
      id: "hub",
      text: deskHub,
      effects: [tally(SF.DESK_VISITS)],
      choices: [
        { id: "toll", label: "The Strait toll.", when: ({ p }) => angel(p) && has(p, F.M3) && !offered(p, SQ.TOLL), next: "toll-offer" },
        { id: "cable", label: "The Cable hums.", when: ({ p }) => angel(p) && has(p, F.M3) && !offered(p, SQ.CABLE), next: "cable-offer" },
        { id: "cable-told", label: "I kept a node.", when: ({ p }) => atStep(p, SQ.CABLE, 1), next: "cable-told" },
        { id: "foundry", label: "The Foundry.", when: ({ p }) => angel(p) && has(p, F.FOUNDRY) && !offered(p, SQ.FOUNDRY), next: "foundry-offer" },
        { id: "foundry-told", label: "The Foundry is dark.", when: ({ p }) => atStep(p, SQ.FOUNDRY, 1), next: "foundry-told" },
        { id: "column", label: "There is a second column.", when: ({ p }) => angel(p) && has(p, F.MAP) && !offered(p, SQ.COLUMN), next: "column-offer" },
        leave,
      ],
    }),
    "toll-offer": node({
      id: "toll-offer",
      text: "\"The Strait charges every body that crosses. Six Bestand into the House of Earth. I collect it here.\" He turns the sheet to the Earth column. \"Pay it or refuse it. Refuse and Earth takes a minus. I will not tell you which is right. I will write down which you did.\"",
      effects: offer(SQ.TOLL),
      choices: [{ id: "go", label: "I will decide at the desk." }],
    }),
    "cable-offer": node({
      id: "cable-offer",
      text: "\"The Cable hums because the Strait pays. Keep a node in the Organs. Any organ. Do not extract. Then come back and I will post a smaller number. It will be the first time.\"",
      effects: offer(SQ.CABLE),
      choices: [{ id: "go", label: "I will keep one." }],
    }),
    "cable-told": node({
      id: "cable-told",
      text: "He posts it. The Cable number goes down by one. \"Quiet. Not dark.\" He looks at the sheet longer than the number needs. \"The Foundry will notice. It is fed by that hum.\"",
      effects: [flag(SF.CABLE_TOLD)],
    }),
    "foundry-offer": node({
      id: "foundry-offer",
      text: "\"You read the Foundry. Heat without a nation.\" He writes a number and crosses it out. \"Rake it out. The Cable drinks less. The number goes to zero. I have never posted a zero. Come and tell me and I will.\"",
      effects: offer(SQ.FOUNDRY),
      choices: [{ id: "go", label: "I will rake it out." }],
    }),
    "foundry-told": node({
      id: "foundry-told",
      text: "He writes a zero. He looks at it. \"I have posted that number for three years and never seen the front of it.\" He picks up the card. \"I am going to stand at the Foundry. Somebody who posts the number should see what zero looks like from the front.\"",
      effects: [flag(SF.FOUNDRY_TOLD)],
    }),
    "column-offer": node({
      id: "column-offer",
      text: "He unfolds the sheet. The second column has no numbers in it. \"What each organ was. Before it was a number. I keep it folded because it is not honest; it is only true.\" He folds it back. \"It is on the back of each plaque. Read all three. Then you will hold the half I leave out.\"",
      wink: "Ord wants the number honest. Renn keeps the number and the thing the number replaced, and cannot post both.",
      effects: offer(SQ.COLUMN),
      choices: [{ id: "go", label: "I will read the backs." }],
    }),
  },
};

// ---------------------------------------------------------------- export

export const SIDE_NPCS: Record<string, NpcDef> = { officer, omen, keeper, sexton, desk };
