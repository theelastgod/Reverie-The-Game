# REVERIE: THE GAME — The Script

*Every spoken line of the campaign, scene by scene. `SYNOPSIS.md` is the story and wins on what happens; this is what is said. The rebuild lands it line by line (HANDOFF Backlog A): a line tagged **(shipped)** is in the code today, word for word; **(revised)** is the shipped line with a change; **(new)** does not exist yet.*

---

## How to read it

- A scene is one beat of the synopsis: `### I.6 Ask who owns the numbers`, then an italic line with the shipped step id (or *new beat, Phase B*), the place, the plate and whether a guest can play it.
- **A SPEAKER** in capitals, then the node id in backticks and the status tag. Spoken lines are blockquotes. What a character does stays inside the blockquote, in the shipped style.
- ✦ *in italics* is the Wink: the line only an Angel hears at that node, by school where the code authors it so. A guest hears none.
- ▸ is a choice the player can make, with the node it opens. A choice with no arrow closes the window.
- [square brackets] are the consequences that matter to the drama: a flag, a choice remembered, readiness, aura, Bestand with its sink, a news line, a world state.
- Things that speak get a speaker label too: **THE PLAQUE**, **THE RECORDER**, **THE ALTAR**, **THE OVAL**, **THE GLASS**, **THE BELL**, **THE FORM**, **THE DESK**, **THE BOARD**, **THE RING**, with their verb in place of a node id.
- The player is `#SERIAL`, never a name. An unsealed arrival has no name at all; a clerk writes one in a ledger before they have struck anyone.
- {braces} are the server's numbers and words: `{yield}`, `{tax}`, `{rate}`, `{figure}` (the weather), `{price}`, `{fee}`, `{count}`, `{readiness}`, `{bodies}`, `{band}` and `{drift}` (the glass's), `{number}` (the slip's), `{House}`, `{name}` (the Angel the news names). The script never fixes them; the server owns every number.
- The party is written by first name (**NARA**, **QUILL**, **ORD**) and the chief by his surname (**CAUL**); everyone else by their full name. *(revised: ...)* says in a few words what changed from the shipped line; *(new, Phase B)* or *(Phase C)* says which phase of HANDOFF Backlog A lands it when it is not plain dialogue.
- The appendix carries every side hour whole: who offers it, each verb's line in step order, its branches, its Wink, the report back, and the one line Phase D changes, tagged. The five who hand them out appear twice: in the movement where the spine meets them and in the appendix with their hours.

## The voice

Second person, short, cold, concrete noun first. Nobody lectures. Nobody is quoted. No theory, thinker, real country, company or person is ever named; the content lint (`src/sim/lint.test.ts`) reads this file too. Named people have jobs and lies; clerks are people doing jobs; enforcers do not lie. Comedy is Quill's and it stops at the funeral. Anselm Caul never shouts and never lies; he prices; he is funny by accident, once a scene, because nothing lands on him. Grief is not optional in the fourth hour. No one returns who the story says does not.

## The people

- **Nara Vale**, sexton. Buries what the weather makes. Lies about being only a sexton: at twenty-two she pressed record on the first reverie, and every grave since is her not doing it twice. Speaks in earth and plates. Will not say *the Concern* if *the man at the next desk* will do.
- **Quill**, forger. Prints what people want to have seen. Lies about having nothing to do with the catalog: she sold the Concern the margin. The only one who jokes, and she stops at the funeral.
- **Ord**, ex-Safety. Keeps the honest ledger at the Annex gate. Lies about leaving on principle: he counted the first capture, then walked. Names the company the way you name weather.
- **Anselm Caul**, chief executive of the Concern. A guest in every rule: the guest's sprite and portrait, the GUEST label, no aura, no hints, never in the Care, the Clearing or the Organs, never struck. Courteous, exact, unable to wait. Asks one question twice: *what did it look like*.
- **Vesper Hale**, concentrator. Buys private hours at a desk on the Wet Grid. Lies about the desk being hers. "That is not remorse. That is inventory." is his construction; she learned it across his desk.
- **Ione Kade**, the last word. Sat at the Concern's first counter and said the word to customers; sits on a bench at the edge of the garden now. The voice on the recorder is hers. She will not be in the next hour.
- **Corvin Slate**, Officer of Safety. The other honest answer. Signs the Concern's forms and calls them his own and means it.
- **Pim Ashe**, sexton's apprentice. Keeps the Care's book, the one ledger the Concern does not own, and twelve numbers in his coat.
- **Halla Voss**, omen-reader on the Kerb. Sells hours off the Concern's schedule and reads a front she has never sold.
- **Dov Marrow**, keeper of the Gold Ring. Says the middle bell was cast without a tongue. He cut it.
- **Renn Coil**, cold desk at the Foundry. Posts each organ's hour. Has never posted a zero.
- **The clerks** (the Intake Clerk, Desk Three, the Hour Clerks, the Foundry Clerks), **the wardens** (Pell, Ost, the Warden of the Ring), **the cold desks** (one, two, cable), **the Annex Runner**. People doing jobs. The job finishes them.

## The fixed lines

- The guest lock, paper panel, gold mark: **A guest cannot prepare the ground.** *(shipped, `lines.ts` GUEST_LOCK)*
- The going-under, for an Angel: **The ground takes you the way it takes anyone. You wake in the Care.** *(shipped, `effects.ts` ANGEL_UNDER, the line that plays; `lines.ts` exports an older ANGEL_UNDER, "The Care is open. You go under as death, not as a cutscene. Guests stop here.", which nothing reads)*
- A fall, anyone's: **{name} did their job.** *(shipped, `combat.ts` DEATH_BY; the clerks, the wardens, the cold desks and the Runner are people doing jobs, and the line is the same when the job finishes you)*
- The waking hint, the first of an Angel's life, in the Care: ✦ *They have your name. You went under where the book could not follow. It will follow now.* *(shipped, WAKING_WINK; Movement II's start)*
- The Runner's fall: **The Runner drops. A folded slip: the Office of Safety's number for this hour, on the Concern's paper, sealed for the funeral street. It is in your coat now.** *(shipped, FALL_LINES.bulletin)*


---

## MOVEMENT I — DIAGNOSIS
*What the Concern is doing: writing your name down.*

### I.1 The first threshold
*Step `arrive` (shipped). The west end of the Nave of Tubes, the guest spawn; the first altar north of it. Plate `plate-arena.jpg`. Guest-legal.*

*Nothing is said on the walk. The altars light as the body passes and go dark behind it; nobody explains it.* [F.ARRIVED]

**THE ALTAR** — `crt-altar-1` watch (shipped, pois.ts)
> A stack of screens with the tubes still warm. Static, then a room, then static. Nobody is in the room.
✦ *The room on the screen is this one. It is empty because you are looking at the screen.*
[poi crt-altar-1 lit]

### I.2 Your name in the ledger
*Step `intake` (shipped). The southern aisle; the Intake Clerk bars it. Plate `plate-arena.jpg`. Guest-legal.*

**THE FIGHT** — lines.ts (shipped)
> You stepped through the strike.
> The swing stops in the air. Readable. Same number.
> The hit held. Same number. The city felt it.

**THE CLERK** — the Intake Clerk falls, `FALL_LINES.intake` (new; combat.ts already reads `FALL_LINES[F.INTAKE]` on the fall and finds no line)
> The Intake Clerk drops. The pen finishes the line before the hand does. You did not give a name.

**THE JOURNAL** — the step's line on the fall (revised: replaces the step's notice, spine.ts:59)
> Entered.

**THE CLERK** — the Intake Clerk fells you, `DEATH_BY` (shipped, combat.ts:187 and lines.ts; your own death line, the one place the sentence plays)
> Intake Clerk did their job.

[F.INTAKE; wreckage on the aisle; the respawn is a shift change]

### I.3 Leave something unspent
*Step `first-node` (shipped). The first yield node, humming in the aisle west of the clerk's desk. Plate `plate-arena.jpg`. Guest-legal.*

**THE NODE** — `nave-node-1` E extract (shipped, economy.ts)
> Yield. {yield} Bestand after the tax of {tax}. The weather thickens a little.
> *(nothing after the tax:)* Yield. Nothing after the tax. The weather thickens all the same.
[C.FIRST_NODE extract; F.FIRST_NODE; the weather +1 for everyone; W.EXTRACTIONS +1]

**THE NODE** — `nave-node-1` Q keep (shipped, economy.ts)
> You leave it unspent. Readiness. No pay.
[C.FIRST_NODE keep; F.FIRST_NODE; readiness +3; restraint; the weather eases for everyone]

### I.4 The second clerk; the same question twice
*Steps `desk-three` and `second-node` (shipped). Desk Three on the aisle between the first node and the east gate; the second node south of it, two more along the aisle; the practice dummy on the arena patch. Plate `plate-arena.jpg`. Guest-legal.*

**THE PRACTICE GROUND** — `guest-arena` read (shipped, pois.ts)
> Practice ground. Strike the dummy; people are safe here. Click or Space to strike. Shift and a direction to step through a swing. R for the heavy: slower, same number, it stops a swing mid-air. No spoils. Guests are not loot.

**THE CLERK** — Desk Three falls, `FALL_LINES["desk-three"]` (new; closes on the shipped notice, spine.ts:81; the spawn already carries the flag)
> Desk Three drops. The count of the aisle stops at the gate.
[F.DESK_THREE; wreckage on the aisle; the step's notice stays as shipped]

**THE NODE** — `nave-node-2`, then the two beyond it: E extract, Q keep (shipped, economy.ts; the two lines of I.3)
[C.SECOND_NODE extract | keep | split; F.SECOND_NODE; the city reads the pair, not the choice: Ord's `pair`, I.6]

### I.5 A copy of a hole
*Step `quill` (shipped). Quill's stall by the east gate of the Nave. Plate `plate-forge.jpg`. Guest-legal. The company is not named on this kerb; Ord names it first, at the gate, I.6.*

**QUILL** — `first` (shipped)
> Copies travel. Aura doesn't. If you sell the face, keep the name. That's the only honest stall left on this kerb. Quill. Forger. I print what people want to have seen.
✦ *She is lying about being honest and honest about lying. It is a style.*
- ▸ "What sells?" → `market`
- ▸ "Who owns the stalls?" → `owners`
- ▸ "There is a body on the funeral street." → `burial-joke`
[F.TALKED_QUILL; party quill with]

**QUILL** — `market` (shipped)
> Exhibition. Prints, copies, surfaces. Things that can be in two hands at once. They decay, which is the joke. Cult objects are the other kind: one hand, one place, no listing. Nobody buys cult. Everybody wants it. That is the whole market in two sentences and I charge for the third.
→ `owners`

**QUILL** — `owners` (shipped)
> The Houses, on paper. The weather, in fact. The altars play prints with margins. She laughs and does not explain. Go through the east gate to the Wet Grid and stand at the listing board when you have eyes for it. You do not yet. Come back with a grave on you.
✦ *The Wet Grid looks like freedom. It is a stall. The sky is already priced.*
→ `offer` (once; closes when the print is already decided)

**QUILL** — `burial-joke` (shipped)
> You look like you might bury something. Cute. Burial doesn't list. I still respect it. Go see the sexton. She will not laugh. Someone on this street has to and she has decided it is me.
→ `offer` (once; closes when the print is already decided)

**QUILL** — `offer` (shipped)
> One more thing, since you are standing there. I can print you. Unsealed face, a surface; it travels, and the aura stays where it is, which is nowhere yet. Or keep the name and I print nobody. Cheaper. Lonelier.
✦ *She wants the print because a face on the kerb is a customer she can find again.*
- ▸ "Print me." → `print-yes`
- ▸ "Keep the name." → `print-no`

**QUILL** — `print-yes` (shipped)
> She prints you in one pass and hands it over wet. It is you the way a plaque is a district. "It will decay. Everything on paper does. List it on the Grid when you have eyes, or keep it and watch it go grey."
[C.QUILL_PRINT printed; item copy:face, exhibition, value 3, it decays]

**QUILL** — `print-no` (shipped)
> "Kept the name." She shrugs and wipes the plate. "Nobody will ask for it either. That is the honest version of privacy."
[C.QUILL_PRINT kept]

**QUILL** — `later`, before the weather is named (shipped)
> *(printed:)* Your face is on the kerb. Nobody has asked whose it is. *(kept:)* Still no print of you. Nobody has asked for one either. *(then:)* Still here. Still printing. Ord is up by the Annex gate with his numbers and Nara is on the funeral street with her earth. Between them you get the weather. I get the middle.

**QUILL** — `blind` (shipped; an Angel who acted on a Wink inside the last twenty seconds, once per Wink; never a guest)
> You're looking at something I'm not. I can sell you a print of it if you describe it well. Joke. Half a joke.
→ the node she would have opened
[flag blind:quill]

**QUILL** — `dark` (shipped; an Angel whose aura is dark; never a guest)
> Quill looks through you at the stall behind. No aura, no customer. She sells surfaces and you are not on one. Restore it at the Care shrine; she will find you funny again.

### I.6 Ask who owns the numbers
*Step `ord` (shipped). The Annex gate, north of the Nave, the ledger on his knee. Plate `safety-annex.jpg`. Guest-legal. The first time the company is named.*

**ORD** — `first` (revised: the entrance as the synopsis gives it)
> Ord. I was Safety. I signed freezes. The Concern owns the numbers. Safety counts them. I counted them. That is why I'm at a gate and not a desk. The number stays honest for it. Safety calls it stability. I call it the process. The number goes up because you extract. I will not pretty it.
✦ *He left Safety. He did not leave the ledger. Nobody leaves the ledger.*
- ▸ "What do you call the weather?" → `weather`
- ▸ "The nodes. What are they?" → `nodes`
- ▸ "Not now."
[F.TALKED_ORD; party ord with]

**ORD** — `nodes` (shipped)
> Standing-reserve. A place that has been told what it is for, with the Concern's meter on it. E extracts: Bestand in your hand, one point on the weather. Q keeps: nothing in your hand, readiness, the weather eases. Both are honest. Only one of them is paid.
→ `weather`

**ORD** — `weather` (shipped; also the way back in after `first`, until it is heard)
> The process. Not stability. Stability is what you call a thing when you are paid by the thing. The process is what it is when you count it. It goes up. It does not care what you call it. Safety knows the number; it sends a runner down the west corridor every hour with the figure on a slip, so the funeral street can dig to schedule. The slip is honest. The runner is only fast. The paper is the Concern's; Safety ran out of its own years ago. Nara will give you a third word. Hers is the one that hurts.
✦ *The number is honest. Honest is not the same as kind.*
→ `ledger` (once; closes when the ledger is already decided)
[F.WEATHER_ORD; step `weather-ord` done]

**ORD** — `ledger` (shipped)
> "I keep a second ledger. Not Safety's. Honest lines only: who came in, what they did, what it cost. It has no column for stability." He turns it so you can see the pen. "Give me a line, or stay off it. Both are honest. Only one is remembered."
✦ *The second ledger is the only book in the city that counts the dead as people.*
- ▸ "Enter me." → `ledger-yes`
- ▸ "Leave me off it." → `ledger-no`

**ORD** — `ledger-yes` (shipped)
> He writes without looking up. "Unsealed / #SERIAL. Came in. Extracted at the first node. / Kept the first node." He reads it back once. "That is the whole line. It will get longer. They always do."
[the name by guest or Angel; the node by C.FIRST_NODE; the two switch independently; C.ORD_LEDGER entered; news "A new line in Ord's ledger. Honest."]

**ORD** — `ledger-no` (shipped)
> "Off it." He closes the book. "Then the number is one short and honest about that too. The Concern's ledger has you anyway. The clerk wrote you in before you struck anyone. It has everyone."
[C.ORD_LEDGER off]

**ORD** — `later`, before the weather is named (shipped)
> *(entered:)* Your line is in the book. It has not got longer yet. *(off:)* You are off the book. The number is one short. *(then:)* Grief is not a ledger item. The process continues whether you keep the node or not. I am here so the number stays honest. Go and hear the other two names.
- ▸ "The second node." → `pair` (once, after the second node)
- ▸ "Give me the number." → `number`
- ▸ "That is enough."

**ORD** — `pair` (shipped)
> *(two kept:)* "Two kept." He writes it. "The number eased twice. On Safety's books that is a loss. On mine it is the only kind of line I like writing. Do not expect it to be paid."
> *(two extracted:)* "Two extracted." He writes it. "Up two. Honest. It will come back as earth, and I will write that down too, when it does."
> *(one and one:)* "One and one." He writes it. "Most people. The number does not care that you tried both. It counts both. So do I."
✦ *He counts the pair. Safety counts the extraction. Only one of them counts you.*
[F.ORD_PAIR]

**ORD** — `number` (shipped since Phase A, Movement III: his own word for the weather in place of the HUD's)
> The process, at {figure}. Tax {rate} percent on every node. The number goes up because people extract. I will not pretty it.

**ORD** — `blind` (shipped; an Angel, once per Wink)
> You're looking at something I'm not. I do not need to see it. I need it to be true. Is it?
→ the node he would have opened
[flag blind:ord]

**ORD** — `dark` (shipped; an Angel whose aura is dark)
> Ord does not look up from the ledger. A body with no aura is not a line he can write honest. Restore it at the Care shrine and he will count you.

### I.7 A name for the dead
*Step `nara` (shipped). The funeral street, south-west of the Nave, a grave open and a body nobody paid to bury. Plate `plate-burial.jpg`. Guest-legal; nothing on this street costs Bestand.*

**NARA** — `first` (shipped)
> A body on the funeral street. Desk Six. They did a job and the job finished them. I am the sexton. I put things in the ground. You look like you came in unsealed and did not know the city was already over.
✦ *She has buried people who called this stability. She has not forgiven any of it.*
- ▸ "Who was it?" → `who`
- ▸ "What do you need?" → `memorial`
- ▸ "Not now."
[F.TALKED_NARA; party nara with]

**NARA** — `who` (revised: the purse sent back, in the synopsis's words; the weather by its name)
> A clerk. Fourteen years at a yield desk. They counted what the street gave up and signed it as civic duty. The man at the next desk sat there the same fourteen years. He sent money for his neighbour. I sent it back. Nobody pays for this one. The weather took the street and then it took the counting. Nobody strikes a clerk in the end. The weather does.
→ `memorial`

**NARA** — `memorial` (shipped)
> *(the recorder not yet heard:)* A voice in that recorder, on a crate east of here. It is the oldest thing on this street and I keep it running. Its copper would close the coffin. Go and hear it first. I won't choose for you, and I won't let you choose deaf.
> *(heard:)* You heard it. Its copper would close the coffin. Leave the voice running, or give its body to this one. I won't choose for you.
✦ *A voice or a vessel. Neither one pays. That is the point of the street.*
- ▸ "I want to hear it first." *(before the recorder, or once the choice is made)*
- ▸ "Leave the voice running." → `memorial-voice` *(after the recorder)*
- ▸ "Take the copper for the coffin." → `memorial-copper` *(after the recorder)*

**NARA** — `blind` (shipped; an Angel, once per Wink)
> You're looking at something I'm not. Whatever it is, I cannot bury it for you. Say what you need.
→ the node she would have opened
[flag blind:nara]

**NARA** — `dark` (shipped; an Angel whose aura is dark)
> Nara Vale does not look up. A body with no presence on the funeral street is a shape the weather made. The shrine in the Care restores what the city looks at. Come back when it can see you.

### I.8 A voice or a vessel
*Steps `memorial` and `burial` (shipped). The recorder on a crate east of Nara; the plot west of her. Plates `memorial-recorder-v1.jpg`, `plate-burial.jpg`. Guest-legal; neither choice pays.*

**THE RECORDER** — `memorial-recorder` listen (shipped, pois.ts)
> *(before Nara:)* A recorder on a crate. A woman's voice in it, one word on a loop. Nara holds the grave open west of here. Speak with her first.
> *(after Nara:)* A woman's voice, on a loop. One word, then the quiet, then the word again. The unit is older than the crate it sits on, and somebody keeps it running.
> *(dismantled:)* The recorder is open. The coil is gone. The voice stopped mid-breath and did not start again. The copper is in a coffin.
[F.HEARD_RECORDER once Nara has been met; the voice is Ione Kade's, from the counter, and nobody says so until IV.1; a guest hears half of the last word in the game here]

**THE RECORDER** — E dismantle the copper (shipped, pois.ts; the same line as Nara's `memorial-copper`)
> You lift the coil from the recorder. The voice stops mid-breath. Nara folds the copper around the coffin. No part goes to market.
[C.MEMORIAL copper; F.MEMORIAL; item cult:copper-binding, bound, it does not list; poi memorial-recorder dismantled]

**THE RECORDER** — Q preserve the voice (shipped, pois.ts; the same line as Nara's `memorial-voice`)
> You leave the recorder running. Nara tears her coat into binding cloth. The voice has another night.
[C.MEMORIAL voice; F.MEMORIAL; W.MEMORIAL_VOICE 1]

**NARA** — `memorial-voice`, `memorial-copper` (shipped; the two lines above, spoken at her when chosen in dialogue, with the same consequences)
→ `plot`

**NARA** — `plot` (revised: the old word on the sexton's lips, Phase A; she uses it and does not explain it)
> *(voice:)* The cloth is ready and the voice is still playing. The plot is west of me. Press F there and close the earth. Then go into reverie with it a while. Do not thank me.
> *(copper:)* The copper holds. The plot is west of me. Press F there and close the earth. Then go into reverie with it a while. Do not thank me.
✦ *Burial does not list. She respects that more than she says.*

**THE PLOT** — `nara-plot` close the earth (shipped, pois.ts)
> *(copper:)* The copper holds. Under the earth, something that spoke has become something that carries. Nara waits until your hands are empty.
> *(voice:)* The cloth holds. The recorder carries a voice across the funeral street. Nara stays until you hear the silence between its words.
> *(someone on the server closed it first:)* Someone closed the earth before you. Nara makes room beside the name. The watch is still yours to keep.
[F.BURIED_NARA; poi nara-plot closed; readiness +8; restraint +8; history buried +1; nothing was paid]

**THE PLOT** — `nara-plot` stand (shipped)
> Closed earth. A name on a slat. The recorder can be heard from here if the wind is right.

### I.9 The altar
*New beat, Phase B: verbs on `crt-altar-2`, the lit altar at the south end of the aisle; no step of its own, reachable from I.4 on, so a saved index does not move. No journal plate; the screen plays `video/ambient-hall`. Guest-legal. Phase D re-points `side-nave-third-altar`: its dark twin is no longer this screen.*

**THE ALTAR** — `crt-altar-2` watch (shipped since Phase B, first beats)
> Screens in a ring. One is lit and people are kneeling at it. On the screen: a sky through an oval, a bell, the light a shade warmer than the room. The kneelers call it a reverie. It runs ninety seconds and starts again. A tag in the corner. A serial in the margin.
✦ *A copy of a hint somebody heard. The copy does not clock out.*
[the shipped watch sets no state; the tag is HUD acid, never world colour; the serial in the margin is not yours yet]

**CAUL** — on the altar reel, over the restart (shipped since Phase B, first beats; said inside the watch's own line, so no name and no window: "Over the restart, courteous, a man's voice:")
> You will feel it again. We kept it for you.

**CAUL** — `first`, a body at the back of the aisle (shipped; his one node in I, never opened: he is gone inside a hundred and sixty pixels, and gone for good once anyone has been under)
> A paper-white body with no halo, watching the kneelers and not the screen. By the time you are close enough to speak there is nobody there.
[the guest sprite, the guest portrait, aura 0, the label over him GUEST; nobody looks up; no prompt ever shows: he is gone at 160 px and the prompt wants 72, so the name does not appear in I]

### I.10 The official weather
*Steps `weather-safety`, `weather-ord`, `weather-nara`, `name` (shipped). The Office of Safety plaque by the Annex gate; the Annex Runner's route down the west corridor, gate to funeral street and back. Plate `safety-annex.jpg`. Guest-legal.*

**THE PLAQUE** — `safety-plaque` read (shipped, pois.ts)
> Office of Safety. This district is stable. Extraction is civic duty. Do not name the weather otherwise. Under it, smaller: do not name it from a plaque. Speak with the living.
> *(someone on the server struck it first:)* Office of Safety. Stability was the name they sold. Someone struck it. The weather has another name now. Speak with the living before you pick one.
> *(a number pinned under the word:)* Under the word, pinned in someone's hand: the Annex's own number, {number}.
> *(the slip in your coat, before the naming:)* The slip in your coat is Safety's own, on the Concern's paper, sealed for the funeral street. It does not say stability. It says {number}.
[F.WEATHER_SAFETY]

**THE RUNNER** — the Annex Runner falls, `FALL_LINES.bulletin` (shipped, lines.ts; the courier never starts a fight)
> The Runner drops. A folded slip: the Office of Safety's number for this hour, on the Concern's paper, sealed for the funeral street. It is in your coat now.
[F.BULLETIN; the figure reads at the plaque]

**ORD** — `weather` (shipped; I.6, if it was not heard the first time)
[F.WEATHER_ORD]

**NARA** — `weather` (shipped; after the body is in the ground)
> *(a print in your coat:)* There is a print of you in your coat. She does not ask to see it. "Paper. It will go grey before the earth does."
> *(the name kept:)* "You kept your name off Quill's plate." She notices it the way she notices a body without a number. "Good. The earth does not take prints."
> *(then:)* It's in the earth. Don't thank me. You want a name for the weather. Safety calls it stability. Ord will call it the process. I call it the end of world as world. Remember that when he shows you a number.
✦ *Three names. Only one of them has a body under it.*
[F.WEATHER_NARA]

**NARA** — `buried` (shipped; three names heard, the plaque not yet named)
> You have three names now. Go to the plaque by the Annex gate and give the weather one of them. Not from a plaque. From what you heard.

**THE PLAQUE** — F, name it: stability (shipped, lines.ts WEATHER_NAMED and pois.ts)
> You called it stability. Safety will thank you in writing. The plaque stays as it was.
> *(the slip:)* You fold the slip away. The word stays on the plaque; the number, {number}, stays in your coat.
[C.WEATHER stability; F.WEATHER_NAMED; poi safety-plaque named; readiness +0; W.WEATHER_NAMES +1; news "An arrival named the weather in the Nave."]

**THE PLAQUE** — E, name it: the process (shipped)
> You called it the process. Ord will not pretty it and neither did you. The plaque is struck.
> *(the slip:)* You pin the slip under the word. It says {number}. Both stay up; anyone who reads the plaque now reads the number too.
[C.WEATHER process; F.WEATHER_NAMED; poi safety-plaque named; readiness +2; W.WEATHER_NAMES +1; with the slip: W.BULLETIN_POSTED, W.BULLETIN_NUMBER {number}, news "An arrival pinned the Annex's own number, {number}, under the word stability."; news "An arrival named the weather in the Nave."]

**THE PLAQUE** — Q, name it: the end of world as world (shipped)
> You called it the end of world as world. Nara heard. The plaque is a lie the city paid for.
> *(the slip:)* You pin the slip under the word. It says {number}. Both stay up; anyone who reads the plaque now reads the number too.
[as E; C.WEATHER end]

**THE PLAQUE** — reread (shipped)
> *(one name heard:)* Office of Safety. Stability, it says. You have one name. Ord and Nara have the other two. Do not name it from a plaque.
> *(named:)* Office of Safety. You called it stability / the process / the end of world as world. The plaque still says stability. Plaques do.
> *(then the pinned number and the slip, as the read)*

**ORD** — `later`, after the naming (shipped)
> *(entered / off, as before; then:)* You named it. Whatever you called it, the number did not move. That is not a criticism. It is the number.
- ▸ "The second node." → `pair` (once)
- ▸ "Give me the number." → `number`
- ▸ "That is enough."

### I.11 The going-under
*Step `going-under` (shipped). The threshold east of the burial plot: a lip of concrete over the Care; the verb opens once the weather is named and the plot is closed. Plate `plate-under.jpg`; `video/going-under` for an Angel, `video/guest-lock` on the panel for a guest. Guest-legal to the lip. No Wink here, for anyone.*

**NARA** — `threshold` (revised: the Wink cut; on her street, after the naming)
> *(a guest:)* The threshold is east of the plot. The Care is under it. Angels go under as death. A guest stops at the lip. I do not make the rule. I bury what it makes.
> *(an Angel:)* The threshold is east of the plot. The Care is under it. You go under as death, not as a cutscene. I will be there when you wake. I am usually there.
[npcs.ts:161's ✦ removed: nothing is heard at the lip]

**QUILL** — `later`, after the naming (shipped)
> *(printed / kept, as before; then:)* You named it. Good. Now the threshold. I am not going under. Someone has to keep the lights on. Also I am not dead yet, which is a requirement.

**THE THRESHOLD** — `going-under` look down (shipped, pois.ts)
> *(the grave still open:)* A lip of concrete and under it, a dark that is a floor. Nara holds a grave open. Close it first.
> *(the weather unnamed:)* A lip of concrete. The weather has no name yet. Give it one at the plaque before you go under it.
> *(an Angel, after:)* The threshold. You have been under it. The Care is south, through the gate.

**THE THRESHOLD** — go under, a guest (lines.ts GUEST_LOCK shipped; then the lock panel, index.html, revised: the middle line cut)
> A guest cannot prepare the ground.
The paper panel, the gold mark:
> A GUEST CANNOT PREPARE THE GROUND
> You may remain in the Nave and watch. A wallet signs one line to link an Angel; the signature costs nothing and moves nothing. No mint, no chain, no settlement.
[index.html:146 cut; the title and the small copy as shipped; poi going-under open; locked; Movement I complete for the guest, the Nave still theirs to walk; the same sentence is the richest man in the city's origin and his plan]

**THE THRESHOLD** — go under, an Angel (shipped, effects.ts)
> The ground takes you the way it takes anyone. You wake in the Care.
[poi going-under open; F.UNDER; movement 2; hp full; respawn the Care shrine; news "An Angel went under in the Nave."; the waking hint waits in the Care; nothing is heard at the lip]

---

## MOVEMENT II — TECHNO-FEUDAL
*What the Concern is doing: pricing the hole and postponing the sky.*

### II.1 The price of shelter
*Step `shrine` (shipped). The Care, under the Nave: the shrine, with Nara Vale at her Care station beside it. Plate `plate-care.jpg`. Angels only; a guest locked at the lip in I and hears none of this.*

**THE WAKING HINT** — Movement II `onStart` (shipped, `lines.ts` WAKING_WINK; the first hint of an Angel's life, moved from the lip to the waking so that a guest hears none)
✦ *They have your name. You went under where the book could not follow. It will follow now.*

**NARA** — `care` (shipped)
> You woke. Most do. The Care does not keep you. It only lets you be mortal in a warehouse. Touch the shrine so the city knows where to put you back. Then read your hall and find out who owns the nodes you were standing on.
✦ *What is not here is not in the next room either. She knows. She checked.*

**NARA** — `dark` (shipped; whenever your aura is dark, here and after)
> Nara Vale does not look up. A body with no presence on the funeral street is a shape the weather made. The shrine in the Care restores what the city looks at. Come back when it can see you.

**NARA** — `blind` (shipped; whenever you act on a hint she could not see, then on to her node)
> You're looking at something I'm not. Whatever it is, I cannot bury it for you. Say what you need.

**THE SHRINE** — `rest` F (shipped, pois.ts care-shrine)
> You rest at the shrine. The body mends. The city knows where to put you back now. Not a revive; a place.
[F.SHRINE; F.CARE; healed; respawn at the shrine]

**THE SHRINE** — `restore` E, Restore aura (8) (shipped)
> You spent Bestand. Aura returns. The Wink can be held again.
[Bestand −8, sink restore; aura +4]

### II.2 Counted here
*Step `sexton` (shipped). Pim Ashe digging beside the Care shrine. Plate `plate-burial.jpg`. Angels only.*

**PIM ASHE** — `wake` (shipped, side-npcs.ts; the entry for an Angel who has woken and not yet spoken to him, whatever they said to him in I)
> "Pim Ashe. I dig for Nara Vale." He was digging when you woke; he does not stop. "You are in the book now. Name, hour, the district you went under from. Angels wake here and get a line. Guests stop at the lip and get nothing, which is also a kind of line. It is the one book in the city the Concern does not own." He wipes the shovel. "Every grave in the Care has a name. She says so. So it is so." The ledger corner in his coat says something else.
> *(met in I)* He was digging when you woke; he does not stop. "You are in the book now. ..." and the rest the same.
✦ *Twelve numbers in a ledger he keeps because she will not. You are the newest line in a book that only gets shorter when someone does their job.*
- ▸ "Every grave has a name?" → `lie`
- ▸ "Is there digging?" → `hub`
- ▸ "Leave."
[F.TALKED_SEXTON]

**PIM ASHE** — `lie` (shipped)
> "Every one." He puts a hand over the coat pocket. "Nara will not bury a number. So the numbers are not graves. So every grave has a name." He has said it before. It gets shorter each time.
✦ *Twelve numbers in a ledger he keeps because she will not. The lie is hers; he is only carrying it.*
- ▸ "Understood." → `hub`

**PIM ASHE** — `hub` (shipped; every later visit)
> "Sexton's apprentice. I dig. Nara buries. Every grave in the Care has a name." His coat has a ledger in it and the ledger has a corner showing.
- ▸ "The ledger in your coat." → `ledger-offer`
- ▸ "The lamp in the hall." → `lamp-offer` (once the hall is read; the side hour *A lamp you can light*, shipped, not written here)
- ▸ "Leave."

**PIM ASHE** — `ledger-offer` (shipped; the side hour *The unnamed ledger* opens on it)
> He takes it out. Twelve lines. Numbers. "The ones she would not. I keep them so somebody does." He does not ask you to fix it. "Bury two the city did not count. Anywhere. Bring me the count and I will write it down. Numbers are a start."
- ▸ "I will bring you two."
[side hour `side-care-unnamed-ledger` offered]

### II.3 Who owns the nodes
*Step `hall` (shipped). Your House hall: Mortals in the Care, west of the garden; Sky on the Kerb of Hours; Divinities on the Gold Ring; Earth in the Organs, behind a door that opens in III, so an Earth Angel's step completes on the shrine and the rate is read from the tax window until then. Plate `house-hall.jpg`. Angels only. {rate} is the weather divided by four.*

**THE PLAQUE** — `hall-mortals` read F, your own House (shipped, pois.ts hall)
> House of Mortals. Wreckage, funerals, care. You see the fallen longer than anyone. Tithe {rate} percent. The nodes are the House's on paper; the paper is the Concern's, and the House rents back what it owns. The tax is climate. It will never make you hit harder.

**THE PLAQUE** — `hall-sky` read F, your own House (shipped)
> House of Sky. Hours, omens, Passing timing. You see the front others do not. Tithe {rate} percent. The nodes are the House's on paper; the paper is the Concern's, and the House rents back what it owns. The tax is climate. It will never make you hit harder.

**THE PLAQUE** — `hall-divinities` read F, your own House (shipped)
> House of Divinities. Winke, shrines, traces. Fragile where the weather is fat. Tithe {rate} percent. The nodes are the House's on paper; the paper is the Concern's, and the House rents back what it owns. The tax is climate. It will never make you hit harder.

**THE PLAQUE** — `hall-earth` read F, your own House (shipped; read in III, behind the Organs door)
> House of Earth. Ground, ore, withdrawal. The tax bites less on ground nodes. Tithe {rate} percent. The nodes are the House's on paper; the paper is the Concern's, and the House rents back what it owns. The tax is climate. It will never make you hit harder.

✦ *Who owns the nodes: the Houses on paper, the Concern on the paper's back, and the weather in fact.* (shipped, at any of the four)
[F.HALL; the hall lit; E Tithe and Q Bounty are the lit hall's verbs and speak through the engine, not here]

**THE PLAQUE** — `read-other` F, another House's hall (shipped)
> *(Mortals)* A hall of names you cannot gather. This hall keeps House of Mortals standing. Your House is House of ...; its hall is elsewhere.
> *(Sky)* A sky you cannot name. This hall keeps House of Sky standing. Your House is House of ...; its hall is elsewhere.
> *(Divinities)* A Wink you cannot name. This hall keeps House of Divinities standing. Your House is House of ...; its hall is elsewhere.
> *(Earth)* A ground you cannot name. This hall keeps House of Earth standing. Your House is House of ...; its hall is elsewhere.

**ORD** — `hall` (shipped; at the Annex gate, from the waking until the hall is read)
> You went under. Now read your hall. It will tell you the tax and it will not tell you who set it. The Houses own the nodes on paper. The Concern holds the paper and leases them back. The weather owns them in fact. The tax is climate. Read it anyway. Numbers you have read are harder to lie to you.
- ▸ "Give me the number." → `number`
- ▸ "I will read it."

**ORD** — `number` (shipped since Phase A, Movement III; the weather has three names in the city and Ord's is the process)
> The process, at {figure}. Tax {rate} percent on every node. The number goes up because people extract. I will not pretty it.

**ORD** — `dark` (shipped)
> Ord does not look up from the ledger. A body with no aura is not a line he can write honest. Restore it at the Care shrine and he will count you.

**ORD** — `blind` (shipped)
> You're looking at something I'm not. I do not need to see it. I need it to be true. Is it?

### II.4 The other honest answer
*Step `officer` (shipped). Corvin Slate in the Annex corridor between the gate and the freeze desk. Plate `safety-annex.jpg`. Angels only.*

**CORVIN SLATE** — `corridor` (shipped, side-npcs.ts; the entry for an Angel who has read their hall and not yet been stopped here, whatever they said to him in I)
> "Corvin Slate. Officer of Safety." He is in the corridor between the gate and the desk, and he does not step aside. "You have read your hall. Good. The desk ahead will sell you a freeze: fifteen Bestand, the Nave holds for half an hour, nobody goes under in it. I sign them. They come on the Concern's paper; they are mine when I sign them. I will tell you what the plaque does not, because the desk will not ask: while the Nave holds, the Passing goes hungry. A held district feeds nothing. Peace is a kind of weather." He waits. "Tell me what you want the weather to be. Then go and sign, or do not."
> *(met in I)* He is in the corridor this time, between the gate and the desk, and he does not step aside. "You have read your hall. ..." and the rest the same.
✦ *He is asking you to say it out loud so that the form has a witness. The form is the point. The witness is you.*
- ▸ "I want it held." → `corridor-held`
- ▸ "Hungry is honest." → `corridor-hungry`

**CORVIN SLATE** — `corridor-held` (shipped)
> "Most do." He writes nothing down; he already has your serial. "I will have the form ready. Fifteen Bestand. If you change your mind at the desk, Safety keeps that too." He steps aside.
[F.TALKED_OFFICER; C.ANNEX held]

**CORVIN SLATE** — `corridor-hungry` (shipped)
> "Then you and I disagree, and I would rather know it here than read it off a form." He steps aside. "The desk will take your refusal and file it beside the signatures. It keeps those too. It is what keeping means to us."
✦ *The other honest answer, said back to him. It costs nothing here. It costs something at the desk.*
[F.TALKED_OFFICER; C.ANNEX hungry]

**CORVIN SLATE** — `greet` (shipped; an Angel who finds him before reading the hall, never met)
> "Corvin Slate. Officer of Safety. This district is stable. Extraction is civic duty. Nobody has been lost under a freeze; that is what a freeze is for." He says it the way a plaque says it.
- ▸ "What is Safety for?" → `safety`
- ▸ "Is there paper to carry?" → `hub`
- ▸ "Leave."

**CORVIN SLATE** — `safety` (shipped)
> "Peace. Stability. A district that does not go under while you are standing in it. People call that the other answer. I call it the honest one. The weather does not care which."
✦ *He believes it. That is not the same as it being true. It is not the same as it being false.*
- ▸ "Understood." → `hub`

**CORVIN SLATE** — `hub` (shipped; after the corridor, and every later visit)
> "Officer of Safety. The district is stable. If you have come about the freeze, it holds. If you have come about something else, say it."
- ▸ "The bell census." → `census` (side hour *The bell census*, shipped, not written here)
- ▸ "A notice for the bell." → `notice` (after the census; side hour *A notice for the bell*)
- ▸ "Form 9." → `form9` (after the freeze is signed; side hour *Form 9*)
- ▸ "You lost someone under a freeze." → `grief` (after the freeze is decided and a second visit; side hour *The other honest answer*)
- ▸ "Leave."

### II.5 Peace is a kind of weather
*Step `freeze` (shipped). The freeze desk in the Safety Annex, north of the Nave. Plate `safety-annex.jpg`. Angels only.*

**ORD** — `freeze` (shipped; at the gate, once the hall is read and before the desk is decided)
> The Annex has a desk. Sign a freeze and the Nave holds: no extraction, no yield, no weather for half an hour. It also starves the Passing. Refuse and the Nave stays a mouth. I signed a hundred of them. I will not tell you which was right. I will tell you both are honest.
✦ *Peace is a kind of weather. It does not come free and it does not come back.*

**THE DESK** — `sign` F, Sign the freeze (15) (shipped, pois.ts safety-desk)
> You signed the freeze. Fifteen Bestand. The Nave holds. The Passing will go hungry. Peace is a kind of weather. Under your signature, smaller, a line the form came with: funded by A. Caul.
> *(having said hungry in the corridor)* You said hungry in the corridor. The signature says otherwise. Safety keeps both.
✦ *You bought time. You spent an hour. The signature does not get it back.*
[C.FREEZE signed; F.FREEZE; Bestand −15, sink freeze; the Nave frozen 1800 s, for everyone; safety-desk frozen; news: "A freeze was signed at the Annex, on the Concern's paper. The Nave holds for half an hour."]

**THE DESK** — `refuse` Q, Refuse to sign (shipped)
> You refused. The Nave stays a mouth. The Passing stays possible. The clerk stamps a form that says you were here and did nothing, which is the form for that.
> *(having said held in the corridor)* You said held in the corridor. The refusal says otherwise. Safety keeps both.
[C.FREEZE refused; F.FREEZE; readiness +4]

**THE DESK** — `read` F, Read the desk (shipped)
> *(before the hall)* Safety Annex. Fifteen Bestand. Sign here. The district holds. The hour does not. The Annex will not take a name that has not read the hall.
> *(signed)* Your signature, in the ledger, over the form's own small line: funded by A. Caul. The Nave held for half an hour on it. The Passing went hungry for the same half hour.
> *(refused)* Your refusal, in the ledger. They keep those too. Safety keeps everything. It is what keeping means to them. The ledger's paper is the Concern's; the keeping is Safety's.

**THE FREEZE** — the line E gets at a Nave node while the freeze holds, for everyone (shipped, `lines.ts` FROZEN; economy.ts, the extract op)
> The freeze holds the nodes. Extraction is postponed. The Passing stays hungry.

**ORD** — `freeze-after` (shipped; from the desk until Vesper's)
> *(signed)* You signed. The district holds. The hour does not. There is a woman in an office on the Grid who will offer you a private node next. She is not a demon. She is a number with a name. Read the listing board first.
> *(refused)* You refused. The Nave stays a mouth. The Passing stays possible. There is a woman in an office on the Grid who will offer you a private node next. Read the listing board first. Then decide what you are.

### II.6 The rate is the weather
*Step `tithe` (shipped). The tax window, west of the Annex corridor past the cubicles. Plate `safety-annex.jpg`. Angels only. {rate} is the weather divided by four.*

**THE WINDOW** — `read` F, Read the tax (shipped, pois.ts tax-window)
> Tax window. Current tax {rate} percent on every extraction, taken before the yield reaches your hand. *(House of Earth:)* House of Earth pays {rate}−2 on ground nodes. The rate is the weather divided by four. Nobody at this window set it, and nobody at this window keeps it: the window remits to the Concern.
> *(paid)* Your tithe for this hour is in the ledger, paid before it was taken.
> *(rode)* You let this hour's tithe ride. The node will take it, at whatever the weather is then.

**THE WINDOW** — `pay` E, Pay this hour's tithe (4) (shipped)
> Paid. 4 Bestand, before the weather could take it at the node. The clerk writes House of ... beside it. Standing is what a House calls money that arrived early.
✦ *The tithe was always going to be taken. Paying it first only changes who writes your name.*
[C.TITHE paid; F.TITHE; Bestand −4, sink tithe; your House's standing +1]

**THE WINDOW** — `ride` Q, Let it ride (shipped)
> You let it ride. The clerk does not write anything; the node will, at whatever the weather is when you next extract. Nobody at this window set the rate, and nobody here can hold it for you.
✦ *Riding is a bet on the weather easing. The weather has never once been asked.*
[C.TITHE rode; F.TITHE]

### II.7 A prior hour
*Step `history` (shipped). The Care: wreckage only your serial can see, faced from the shrine with Q. Plate `serial-wreckage.jpg`. Angels only. A serial with no hour written back has no wreckage and walks on; the beat is theirs the next time they link.*

**THE WRECKAGE** — `history` Q, Face the history (revised: the shipped say ends "The serial remembers. The city does not."; the synopsis makes the mark the Concern's file on you)
> *(the mark's line, below)* Only you can face this wreckage. The serial remembers. The city does not. The Concern keeps the file.

**THE WRECKAGE** — the mark's line, by what the log holds (shipped, identity.ts; the last Passing's outcome first, else what the hands did)
> *(nothing else written)* A prior hour. You stood here and left the body in the weather.
> *(looted)* A prior hour. You took from the fallen here and left the body in the weather.
> *(buried)* A prior hour. You put a body in the ground here and did not make a story of it.
> *(an Appearance)* A prior hour. A trace came while you stood here. The city was briefly world.
> *(an Absence)* A prior hour. Nothing came. You stood in the hole anyway.
> *(a Hijack)* A prior hour. Somebody claimed the rite. You are still marked.
> *(Failed; revised from "Gestell kept the weather.")* A prior hour. The weather kept it. The hole did not open.
✦ *The serial remembers. The city does not. The file is theirs; the facing is yours.* (revised from "That is the only privacy left.")
[F.HISTORY; readiness +2]

### II.8 The sky is already priced
*Step `board` (shipped). The listing board on the Wet Grid by Quill's forge tray, where she stands from the going-under on. Plate `clearing-stall.jpg`. Angels only; a guest at the board spectates ("A stall of lights. You cannot afford a sky you cannot see."). Reversal.*

**QUILL** — `board-hint` (shipped; from the waking until the board is read)
> You went under. You have the eyes now. The listing board is by my old stall on the Grid. Read it. Then tell me it is not funny.

**QUILL** — `dark` (shipped)
> Quill looks through you at the stall behind. No aura, no customer. She sells surfaces and you are not on one. Restore it at the Care shrine; she will find you funny again.

**QUILL** — `blind` (shipped)
> You're looking at something I'm not. I can sell you a print of it if you describe it well. Joke. Half a joke.

**THE BOARD** — `read` F, Read the board (shipped, pois.ts listing-board; the first read posts the Clearing for everyone, a later read reads where the city moved it)
> Quill listed a Clearing, on commission, for a buyer she never met. 40 Bestand, the resistance's price today. Copies travel. The hole does not. Below it, smaller hands: keep-groups, hold-rates, a schedule of who will stand in which hole for what. The number is on the Grid now, in your ledger, and it moves when the city does.
✦ *It looks like freedom. It is a stall. The sky is already priced.*
[F.BOARD; W.CLEARING_LISTED; the city's listing "A Clearing, the hole scheduled" posted at 40 by the resistance, for everyone; it moves when the city does: +8 when a private hour is sold, −4 when one is refused]

**THE BOARD** — when anyone tries to buy the Clearing (revised, economy.ts MARKET_CITY_LISTING: shipped as "A price, not a sale. The hole does not travel."; the synopsis's "That is" added; economy.test.ts moves with it)
> That is a price, not a sale. The hole does not travel.

**QUILL** — `board-read` (revised: the synopsis's margin line and her look at the listing added to the shipped line; after the board, until the Organs open)
> Quill listed a Clearing. Forty Bestand. On commission: the buyer sent paper and a price and I never met them. She looks at the listing the way she looks at a print. There's a margin. Whoever the resistance is, they bought their paper from the same man I did. Nicer lighting than the company. Same electrician. Copies travel. The hole does not. The people who say they are against the process are pricing it. I am not against anything. I just print faster. That is the difference and it is not in my favour.
> *(when the city has moved the price)* Quill listed a Clearing. Forty Bestand when I wrote it; {price} on the board today. On commission: ... and the rest the same.
✦ *The resistance is a stall with better lighting.*

*The forge tray's F, Hear Quill on copies, opens `forge-lesson` from here already; that is III.8's scene and is written there. The board's E verbs (the copy's price, taking it down) are the side hour *A copy of a hole*, shipped.*

### II.9 The hour
*New beat, Phase B (rides steps `board` and `operator`; the dialogue is the Kerb's shipped side hours `side-kerb-hours-for-sale` and `side-kerb-hour-that-does-not-strike` and Halla's nodes; Caul's address is a dialogue effect on the bought hour's wait, new, Phase B; the ovals champagne at the hour for everyone is a world tick, Phase C, with the launch window). The Kerb of Hours: the omen terrace, the hour bell north of the terraces through the gap in the low wall, the forecast glass east of the bell. Plate `plate-kerb.jpg`. The Kerb is a district a guest may walk and Halla's hours are guest-legal, so a guest too can buy the hour that does not come and hear the voice when it does not; the Winke here are an Angel's. Set piece.*

**THE TERRACE** — `read` F, Read the terrace (shipped, pois.ts omen-terrace)
> Terraces of poured concrete with oval windows that look at nothing. A halo of thin pink light on the top step, at the wrong hour for it.
✦ *An omen is a bell that rings before the hour and is not wrong.*

**HALLA VOSS** — `greet` (shipped, side-npcs.ts)
> "Halla Voss. I read the front." She is not looking at the glass. She is looking at a slip with a time on it. "Hours are three Bestand. Fronts are not for sale. Which are you?"
- ▸ "What do you read?" → `read`
- ▸ "Sell me an hour." → `hours`
- ▸ "Does the bell strike?" → `hour`
- ▸ "Leave."

**HALLA VOSS** — `read` (shipped)
> "The front. Behind the band the glass shows there is a front, and I can see its edge." She says this to everyone. She does not say it to the glass.
✦ *The forecast is a lie with a time on it. She reads the time off the Concern's schedule, which Safety carries. The front she can actually see, she has never sold.*
- ▸ "Understood." → `hub`

**HALLA VOSS** — `hub` (shipped; every later visit)
> "Omen-reader. I read the front and I sell the hour. Ask for one or the other. Not both at once; they do not agree."
> *(a guest)* "Unsealed and on the Kerb. You cannot see the front. You can wait under a bell. Anyone can wait."
> *(after she has stopped selling)* She is at the forecast glass with nothing to sell. "I read the front now. For nothing. It is worse. It is better."
- ▸ "Sell me an hour." → `hours`
- ▸ "Does the bell strike?" → `hour`
- ▸ "It struck." → `hour-told` (after the third wait)
- ▸ "The hour I bought did not come." → `hours-confront` (after the bought hour's wait)
- ▸ "There is a front behind the band." → `front-report` (side hour *Storm front*, shipped, not written here)
- ▸ "Leave."

**HALLA VOSS** — `hours` (shipped)
> "Three Bestand at the terrace. I write the time; the bell strikes for you then. If it does not, come back and tell me. Nobody has." She says the last part like a warranty.
- ▸ "I will buy one."
[side hour `side-kerb-hours-for-sale` offered]

**THE TERRACE** — `side:hours:buy` E, Buy an hour (shipped, side-pois.ts)
> Three Bestand. Halla Voss writes a time on a slip and says the bell will strike for you then. She does not look at the glass while she writes it.
[Bestand −3, sink upkeep; a slip with a time on it]

**THE BELL** — `side:hours:wait` E, Wait for the bought hour (revised, side-pois.ts: the shipped line says "The schedule is Safety's. So, it turns out, is the slip."; the schedule is the Concern's and Safety carries it)
> The time on the slip comes and goes. The bell is on a schedule. The schedule is the Concern's. So, it turns out, is the slip. Safety only carries them.
[SF.HOURS_WAITED; the bought hour did not come → `oval-hour` (new, Phase B: a `{ kind: "dialogue", npc: "caul", node: "oval-hour" }` effect on the verb, which a guest can press)]

**CAUL** — through every oval on the Kerb, `oval-hour` (new, Phase B; npcs.ts, speaker caul; the moment the time on the slip has come and gone; no serial, he is addressing the city)
> The time goes by and every oval on the Kerb goes champagne at once, and the same voice is on all of them, on the real sky like a watermark. "The hour. The ovals are open. The sky through them is yours; the hour is ours. Some of you bought one on the terrace. It did not come. The slip is our time. The bell keeps its own. We are working on the bell. The god is not coming. The god is a demand. I have never failed to meet a demand. The date is on the glass. Until then, the altars. We kept something for you."
[a voice is not a Wink, and a guest on the Kerb hears it too; world: the ovals champagne at the hour, for everyone, on the world tick (Phase C, with the launch window)]

**HALLA VOSS** — `hours-confront` (shipped; the reversal lands here)
> "It did not come." She takes the slip back. "No. The times are the Concern's bell schedule; Safety carries it and I copy it. The bell is on the schedule; the schedule is not on the bell. I sold you a lie with a time on it, and the time was theirs." She tears the slip. "I am going to stand at the glass. I will read the front, which I can see, for nothing, which is what it is worth."
✦ *A forecast is a lie with a time on it. She stopped putting the time on. The lie stayed. So did she.*
[Halla moves to the glass, for everyone; readiness +1; news: "Halla Voss stopped selling hours. She is reading the forecast glass for nothing."]

**HALLA VOSS** — `hour` (shipped)
> "The hour bell does not strike. It is on a schedule nobody signed and the schedule has no hours on it. If you want to hear it, wait under it. Three times. Do not leave between. It will not strike. I am telling you so you do not blame me."
- ▸ "I will wait."
[side hour `side-kerb-hour-that-does-not-strike` offered]

**THE BELL** — `side:hour:wait` E, Wait under the bell (shipped)
> *(the first)* You wait. The bell does not strike. The terrace goes on selling hours behind you.
> *(the second)* You wait. Someone on the terrace stops talking to watch you. The bell does not strike.
> *(the third)* You wait. The bell strikes. Once. Nobody signed for it. The terrace has gone quiet.
✦ *The bell you did not hear is the one that rang. This one you heard. That is rarer.*
[hour-bell struck, for everyone; news: "The hour bell struck. Nobody signed for it."]

**HALLA VOSS** — `hour-told` (shipped)
> "It struck." She looks at the bell for the first time since you met her. "For you. Once. That is not on any schedule I have." She puts the slip in her pocket. "Then the schedule is wrong about one thing."
✦ *The bell you did not hear is the one that rang. She heard this one. It ruins her whole trade.*
[SF.HOUR_TOLD; readiness +2]

*The bell's verbs this hour are the two waits only. Its F, Strike the bell, is III.6's, the one strike on the way to the glass, and is written there; today the verb has no gate, so a strike here would complete III.6 and open the House of Sky's hour before III exists, and it is gated `when: ctx.p.movement >= 3` (shipped since Phase A, Movement III).*

**THE GLASS** — `read` F, Read the forecast (revised: the shipped calendar line ends "the next hour, with no time on it yet"; the synopsis puts the launch on it as a date with a count, in every meter's face)
> Forecast glass. *(the band:)* Clear weather. Clearings last. Winke are dense. Yield is poor. / Mixed weather. The default. Nothing has decided yet. / Fat weather. Yield is heavy. The sacred doors dim. The storm is high. / Meltdown weather. Passings fail unless a Clearing is held. The street flags itself. *(then:)* Under the band, in the same face as every meter in the city, a line the Concern posts: the next hour, as a date, and a count running down to it.
> *(House of Sky, between the band and the Concern's line)* The drift is down: the weather eases toward baseline. / The drift is up: the weather climbs toward baseline. / No drift. The weather sits at baseline. Only Sky sees the front.
[forecast-glass lit]

### II.10 The private hour
*Steps `operator` and `door` (shipped). Vesper Hale's office at the south-east of the Wet Grid, the oval light on her wall; then the Organs door east of the Grid, or the wreckage garden in the Care. Plates `plate-operator.jpg`, then `plate-m3.jpg`. Angels only; a guest at the desk spectates ("A woman at a desk. She is not speaking to you."). Caul speaks to you by serial for the first time.*

**VESPER HALE** — `dark` (shipped; she does not price what the city cannot see)
> Vesper Hale does not price what the city cannot see. She does not look up. Come back with an aura on you and she will tell you what your hour is worth.

**VESPER HALE** — `blind` (shipped)
> You're looking at something I'm not. I do not price what I cannot see. Sit down when you are back.

**VESPER HALE** — `cold` (revised: the shipped line says "Your hall is in the Care", which is the House of Mortals' hall only)
> Vesper Hale will not quote a private node to someone who has not read who owns the public ones. Your hall is where your House stands. Read the plaque. Then come back and I will tell you what your hour is worth.

**THE DESK** — `look` F, Look at the desk (shipped, pois.ts operator-desk)
> *(before the hall)* A woman at a desk with one number on it. She does not look up. Vesper Hale will not quote a private node to someone who has not read who owns the public ones.
> *(taken)* The desk is closed. The yield is in your hand. Private yield still wants a body and it has yours.
> *(refused)* The desk is here. The offer is not. She does not quote twice.

**THE DESK** — `hear` F, Hear the offer (shipped) → `offer`

**VESPER HALE** — `offer` (revised: the shipped "A private node." is "A private yield."; the Concern named at its own counter, in her mouth and inside her lie that the desk is hers; "the Third Movement" was the journal's word, not hers)
> Vesper Hale, Concentrator. A private yield. Sixty Bestand, yours, now, no tax. I do not sell hours at this desk. I buy them. The Concern pays. Take it and the Organs open the ugly way. Refuse and you stay mortal and walk to the Organs through a garden. I do not lie about the price. I only lie about whether it matters.
✦ *She is not a boss. She is a person who already priced your hour. The yield is honest. The door it buys is not.*
- ▸ "Take the private yield." → `take`
- ▸ "Refuse it." → `refuse`
- ▸ "Not yet."

**VESPER HALE** — `take` (shipped)
> You took the private yield. Cold is a current, not a costume. The Organs door is paid for out of it; I keep the door's price back and open it. Nara Vale has gone to the garden; she will not speak until it is in the ground. I would not wait. Sextons keep accounts too.
[C.OPERATOR take; F.OPERATOR; F.M3; Bestand +60, earner operator, then −40, sink door; current Cold; W.VESPER_GONE, the desk vacant for everyone; Nara waiting, at the garden; the Clearing's listing +8; news: "An Angel took the private yield."] → `oval-taken`

**THE DESK** — `take` E, Take the private yield (shipped; the same choice from the prompt, with the same consequences)
> You took the private yield. Cold is a current, not a costume. The Organs door is paid for out of it. Nara Vale has gone to the garden and will not speak until it is in the ground.
→ `oval-taken`

**VESPER HALE** — `refuse` (shipped)
> You refused. Go back to the wreckage garden and bury what our work destroyed. Then take the Organs door. There is another way through. It is slower and it has your hands in it.
[C.OPERATOR refuse; F.OPERATOR; readiness +10; the Clearing's listing −4; news: "An Angel refused the private yield."] → `oval-refused`

**THE DESK** — `refuse` Q, Refuse it (shipped)
> You refused. Go back to the wreckage garden and bury what our work destroyed. Then take the Organs door. There is another way through.
→ `oval-refused`

**CAUL** — through the oval, `oval-taken` (shipped, npcs.ts, speaker caul; as you leave, by serial, the first time; it knows which way you went)
> As you leave, the oval light on the wall speaks, by your serial, for the first time. "#SERIAL. You sold it. I will buy the rest."
✦ *The light knows your serial. It has known it since the clerk wrote it down.*

**CAUL** — through the oval, `oval-refused` (shipped)
> As you leave, the oval light on the wall speaks, by your serial, for the first time. "#SERIAL. You keep things. It is a lovely habit. I'd like to buy it."
✦ *The light knows your serial. It has known it since the clerk wrote it down.*

**VESPER HALE** — `refused` (shipped; the desk after, for a refuser, while nobody on the server has sold)
> You refused. The desk is still here. The offer is not. I do not quote twice. Go and bury your garden.

**VESPER HALE** — `taken` (shipped, written and unreached: the take sets W.VESPER_GONE and she is absent for anyone who has decided; the rebuild should either reach it or drop it)
> The yield is in your hand. The Foundry is lit on it. Read the Foundry plaque when you are in the Organs. I will not unlight a thing you have not seen.

**ORD** — `door` (shipped; at the gate, after the desk, for a refuser only: a taker has F.M3 from the desk, ordRoute tests it before `door`, and his station is the Strait from then on)
> *(refused)* You refused. The door to the Organs opens through the garden in the Care. There is a hole there with your hands on it. Put it in the ground. I will be at the Strait after.
> *(taken; written and unreached, as Vesper's `taken` is: the rebuild should either reach it or drop it)* You took it. Cold is a current, not a costume. The Organs door is open to you and the number knows why. I will be at the Strait.

**ORD** — `organs` (shipped; at the Strait, for a taker, from the desk on: the line a taker actually hears this hour)
> Walk the Strait, the Foundry and the Cable first. See what each one feeds. Then bring those three places back to me. I will draw it once. I will not draw it twice.
✦ *Three organs. One weather.*

*The door. Step `door` (shipped): the Organs gate east of the Wet Grid is a gate, not a thing that speaks; it opens on F.M3, paid by Cold at the desk or by the grave below. For a taker the step is done at the desk and the garden waits for III.5. For a refuser it is this hour's last scene.*

**NARA** — `garden-silent` (revised: "the node you turned on in the first hour" is also the one the city turned on while you kept yours; the synopsis III.5)
> Nara Vale looks at the garden that used to be a hole. The node you turned on in the first hour, or the one the city turned on while you kept yours. She will not speak until it is in the ground. Press F at the garden.
✦ *You took a hole and called it weather. It came back as earth. Only burial makes it world again.*

**THE GARDEN** — `bury` F, Bury the garden (revised: the shipped line opens "The Clearing from the first hour is wreckage now."; it was a node)
> The node from the first hour is wreckage now. You put it in the ground. Nara Vale will speak.
> *(someone closed it before you)* The garden has been buried. You stay beside it until the city stops counting your time. Nara Vale will speak.
✦ *You took a hole and called it weather. It came back as earth. Only burial makes it world again.*
[F.GARDEN; F.M3; wreckage-garden buried; W.GARDEN_BURIED; readiness +8; restraint +8; Nara with; history buried +1; the Organs door opens] → `garden-plate`

**THE GARDEN** — `look` F, Look at the garden (shipped)
> *(before)* A hole with a fence around it. Wreckage in the shape of a node. Someone will have to answer for it before it can be earth.
> *(after)* Buried ground. A garden in the sense that things are under it. Nara Vale comes here when nobody is dying.

**NARA** — `garden-plate` (shipped; she kneels as the earth closes; the plate is hers, the confession is not yet)
> It is in the earth. Nara Vale kneels and puts her hand flat on it. There is a plate. It has the node's number on it, or it does not. The Care keeps the numbered ones in the book. The unnumbered ones it keeps anyway. Which is this one?
✦ *The twelve numbers in the sexton's coat are numbers because nobody chose. This one, somebody does.*
- ▸ "Number it. Put it in the book." → `garden-numbered`
- ▸ "No number. Earth is enough." → `garden-unnumbered`
- ▸ "Let me look at it first."

**NARA** — `garden-numbered` (shipped)
> She scratches the node's number into the plate with the edge of the trowel. It is in the book now. Pim Ashe will read it at the next wake and somebody will hear it who never stood here. Nobody can say it was not a place.
✦ *A number is a name the city can pronounce. It is not the same as being remembered. It is close enough to argue with.*
[C.GARDEN numbered; news: "A garden in the Care went into the book under its number."]

**NARA** — `garden-unnumbered` (shipped)
> She leaves the plate blank and stands. The Care will keep it anyway. It keeps the unnamed ledger for exactly this: twelve numbers in a coat and one blank plate. That is the honest count. I would rather a blank plate than a number that is only there so a clerk can stop looking.
✦ *Unnumbered is not unremembered. It is remembered by someone instead of by something.*
[C.GARDEN unnumbered; aura +1]

**NARA** — `garden-buried` (shipped; after the plate, for the rest of the hour)
> *(numbered)* You put it in the earth and a number on it. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice.
> *(blank)* You put it in the earth and left the plate blank. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice.
✦ *A person who buried someone. Not a function.*

**NARA** — `waiting` (shipped; the second silence's door only: four extractions without a funeral send her gone, a burial brings her to waiting, and the desk paid brings her back. The sold hour never reaches this line: `garden-silent` is routed before it, and the garden in the ground is what gives her voice back)
> I am on the funeral street. I have not left. There is a body that nobody has paid to bury and you are the one who made it. Pay the desk. Then we talk.
✦ *Waiting is not forgiveness. It is a held door.*
[the engine's line when a burial brings her from gone to waiting: "Nara Vale is waiting on the funeral street. Pay for a burial and she will speak." (`lines.ts` NARA_WAITS)]

**NARA** — `gone` (shipped; the second silence: four extractions without a funeral; a burial brings her back to waiting)
> She does not turn. She will not stand with a city that will not bury. The hole in the Care is still a grave. Put it in the ground and she will speak.
[the engine's line when she goes: "Nara Vale is gone. You kept the process and lost the sexton." (`lines.ts` NARA_LEAVES)]

**THE DESK** — the funeral desk, `pay` F, Pay for a burial (5) (shipped, pois.ts funeral-desk; the sold hour's say new)
> *(she is waiting, the second silence)* You paid Nara Vale's street. Five Bestand. The body is in the ground. She will speak again.
> *(she is waiting, the hour sold and the garden not yet in the ground; new)* You paid Nara Vale's street. Five Bestand. She will stand with you. She will not speak until the garden is in the ground.
> *(otherwise)* You paid Nara Vale's street. Five Bestand. A body nobody claimed is in the ground. The desk writes a name it made up.
[Bestand −5, sink funeral; readiness +2; W.BURIALS +1; Nara with, if she was waiting; her voice only when the garden is in the ground, if the hour was sold]

---

## MOVEMENT III — GEOPOLITICS
*Lighting the catalog and showing you what it is made of.*

### III.1 Where the city feeds
*Step `strait` (shipped). Through the Organs door, west: the Strait, Ord beside it with the ledger open (station `ord-strait`). Plate `organ-strait.jpg`. Angels only: a guest cannot enter the Organs, and neither can Anselm Caul.*

**ORD** — `organs` (shipped)
> Walk the Strait, the Foundry and the Cable first. See what each one feeds. Then bring those three places back to me. I will draw it once. I will not draw it twice.
✦ *Three organs. One weather.*

**THE STRAIT** — `study` F (shipped, pois.ts)
> The Strait. Water that is not water. Ore and hulls pass. Extract here and the Foundry breathes.
[F.STRAIT]

**THE STRAIT** — `study`, once the water is stopped (shipped)
> The Strait. Someone stopped the water. No country here. Only a closed mouth.

**THE STRAIT** — `refuse` E (shipped)
> You refused the water. The Strait stops paying a furnace. The number is quieter. Nara Vale does not have to forgive it.
[organ-strait refused, for everyone; the weather down one; news "Someone refused the Strait. The water is not paying."]

**THE STRAIT** — the back of the plaque, `read the second column` Q (shipped, side-pois.ts; the Column hour's first step, after III.4 and Renn's `column-offer`)
> Back of the plaque, in a hand that is not Safety's: 'A river. Boats with names on them. A ferry that ran on hours, not yield.'

**THE PLAQUE** — the House of Earth hall, `read` (shipped, pois.ts; an Earth Angel reads their hall here, the one hall behind the Organs door, with the oldest copy of the lease)
> House of Earth. Ground, ore, withdrawal. The tax bites less on ground nodes. Tithe {rate} percent. The nodes are the House's on paper; the paper is the Concern's, and the House rents back what it owns. The tax is climate. It will never make you hit harder.
✦ *Who owns the nodes: the Houses on paper, the Concern on the paper's back, and the weather in fact.*
[F.HALL; hall-earth lit]

### III.2 What the heat consumes
*Step `foundry` (shipped). North-centre of the Organs: the Foundry, and Renn Coil's cold desk beside it. Plate `organ-foundry-dark.jpg`; the desk's own plate is `plate-vesper.jpg`. Angels only.*

**THE FOUNDRY** — `study` F (shipped)
> The Foundry. Heat without a nation. The Cable drinks what you take.
[F.FOUNDRY]

**THE FOUNDRY** — `study`, once the heat is off (shipped)
> The Foundry. Someone unlit the heat. The Cable still drinks on what was already paid.

**THE FOUNDRY** — `darken` Q (shipped)
> You shut the heat. The furnace goes from a mouth to a room. Cold is honest. It is not the last word.
[organ-foundry dark, for everyone; world foundryDark; news (revised, Phase C): "Someone darkened the Foundry. The heat is off. The altars in the Nave flicker."]

**THE FOUNDRY** — the back of the plaque, `read the second column` E (shipped, side-pois.ts; the Column hour's second step)
> Back of the plaque: 'A hill. Cold. People climbed it to see the Strait. There was nothing to extract and nobody tried.'

**RENN COIL** — `greet` (shipped, side-npcs.ts)
> "Renn Coil. Cold desk." He does not look up from the sheet. "Strait, Foundry, Cable. A number for each. Honest. The number is the whole column; there is nothing under it." The sheet is folded so you cannot see under it.
- ▸ "What is the number?" → `number`
- ▸ "What does the desk need?" → `hub`
- ▸ "Leave."

**RENN COIL** — `number` (shipped)
> "Yield. Per organ. Per hour. It goes up when you extract and down when you keep. I post it. I do not pretty it and I do not explain it." He taps the fold in the sheet without noticing he has.
✦ *The number is honest. Honest is not the same as whole. The second column is what each organ was.*
- ▸ "Understood." → `hub`

**RENN COIL** — `hub` (shipped)
> "Cold desk. I post the number for each organ. Strait, Foundry, Cable. The number is the whole column." There is a second column on the sheet. It is folded under.
> *Once Ord has written where you would cut it (III.4), one sentence more:* "Ord's entry says you would cut it at the water. I post the Strait first." *· or* "Ord's entry says you would cut it at the heat. I post the Foundry first." *· or* "Ord's entry says you would cut it at the light. I post the Cable first." *· or* "Ord's entry says nowhere. I post them in the order they are."
- ▸ "The Foundry." → `foundry-offer` (the Foundry read; posted first, or not behind the cut organ)
- ▸ "The Strait toll." → `toll-offer` (the Strait's hour, Phase D)
- ▸ "The Cable hums." → `cable-offer` (the Cable's hour, Phase D)
- ▸ "There is a second column." → `column-offer` (once the map is drawn)
- ▸ "Leave."

**RENN COIL** — `foundry-offer` (shipped)
> "You read the Foundry. Heat without a nation." He writes a number and crosses it out. "Rake it out. The Cable drinks less. The number goes to zero. I have never posted a zero. Come and tell me and I will."
- ▸ "I will rake it out."

**THE FOUNDRY** — `rake the coals out` E (shipped, side-pois.ts; the Foundry's hour)
> You rake it out. Heat without a nation, ended. The Cable hums a note lower. Somewhere a number becomes zero.
[organ-foundry dark, for everyone; news "Someone raked the Foundry out. Heat without a nation, ended."]

**RENN COIL** — `foundry-told` (shipped)
> He writes a zero. He looks at it. "I have posted that number for three years and never seen the front of it." He picks up the card. "I am going to stand at the Foundry. Somebody who posts the number should see what zero looks like from the front."
[Renn Coil leaves the desk for the dark Foundry; news "The cold desk clerk left the desk. He is standing at the dark Foundry with the number."]

**RENN COIL** — `hub`, at the dark Foundry (shipped)
> He is at the dark Foundry with the number on a card. Zero. "I wanted to see what a zero looks like from the front."

**RENN COIL** — `column-offer` (shipped)
> He unfolds the sheet. The second column has no numbers in it. "What each organ was. Before it was a number. I keep it folded because it is not honest; it is only true." He folds it back. "It is on the back of each plaque. Read all three. Then you will hold the half I leave out."
✦ *Ord wants the number honest. Renn keeps the number and the thing the number replaced, and cannot post both.*
- ▸ "I will read the backs."

**THE DESK** — the cold desk, `read the honest number` F (shipped since Phase A, Movement III, pois.ts: the HUD's word for the weather kept off the desk)
> Cold desk. The weather at {figure}. Extractions {count}. Burials {count}. Tax {rate} percent. Nobody at this desk will pretty it.

**VESPER HALE** — `taken` (shipped, npcs.ts; unreachable today: `take` raises W.VESPER_GONE and `personal` hides her from every decided body once any body has taken, and the side hour SQ.DESK is built on that absence, so the rebuild decides whether she stands for the taker), at her desk south-east of the Grid, while the heat is on
> The yield is in your hand. The Foundry is lit on it. Read the Foundry plaque when you are in the Organs. I will not unlight a thing you have not seen.

**VESPER HALE** — `foundry` (shipped, npcs.ts; unreachable today, as above), once the heat is off
> Somebody unlit the heat. The Cable still drinks on what the Strait paid. I am standing in the dark I sold. I will not quote another private node. That is not remorse. That is inventory.
✦ *Cold is honest. It is not the last word.*

### III.3 Who pays for the light
*Step `cable` (shipped). East of the Organs: the Cable. Plate `organ-cable-dark.jpg`. Angels only.*

**THE CABLE** — `study` F (revised: the catalog named as what the light carries; the first two sentences shipped since Phase A, Movement III, the flicker sentence waits for Phase C's weave)
> The Cable. Signal as flesh. The Strait is already paying for this light, and the light is the catalog: every altar in the Nave draws its reel from here. Darken the Foundry and they flicker, all of them, for everyone.
[F.CABLE]

**THE CABLE** — `study`, once a node is kept (shipped)
> The Cable. Someone kept a node. The hum is less. The Foundry notices.

**THE CABLE** — the back of the plaque, `read the second column` E (shipped, side-pois.ts; the last line of Renn's column)
> Back of the plaque: 'A street. Lamps that went out at night because people slept. Signal was a voice at a window.' The last line is not signed.

### III.4 Three organs, one weather
*Step `map` (shipped). Ord at the Strait, the three places walked. Plate `plate-m3.jpg`. Set piece. Angels only.*

**ORD** — `blind` (shipped), if you act on a Wink in front of him
> You're looking at something I'm not. I do not need to see it. I need it to be true. Is it?

**ORD** — `map` (shipped since Phase A, Movement III: the synopsis's line in his mouth; the keeper's garden named as the city's)
> Strait, Foundry, Cable. The water. The heat. The light. Extraction here lights a factory there. Extract in the Strait and the Foundry lights. The Foundry lights and the Cable drinks. There is no country here. There is only the process. The node you turned on in the Nave in the first hour: it is a garden now. That is not a map. That is the same map. Ord turns it to you. Tell me where you would cut it, and I'll tell you who goes dark. I will write down what you say. The cold desk reads what I write.
> *For the one who kept the first node:* …There is only the process. The node the city turned on while you kept yours: it is a garden now. That is not a map. That is the same map.…
✦ *Extraction here lights a factory there. You are the wire. He is asking where you would cut yourself.*
- ▸ "At the water. Stop the Strait." → `map-strait`
- ▸ "At the heat. Darken the Foundry." → `map-foundry`
- ▸ "At the light. Quiet the Cable." → `map-cable`
- ▸ "Nowhere. Draw it whole." → `map-whole`

**ORD** — `map-strait` (shipped)
> The water. He writes it. Stop the Strait and the Foundry goes hungry and the Cable goes dark on its own, a day later, honest. The Strait has a verb for that. I did not tell you to use it. Renn at the cold desk will post the Strait first now. That is what writing it down does.
✦ *Cutting at the source is the cleanest cut and the only one the city notices.*
[C.MAP strait; F.MAP; readiness +2; the cold desk posts the Strait first; the House whose layer the water is loses an hour (new, Phase C); news (shipped since Phase A, Movement III): "An Angel told Ord's ledger they would cut it at the water."]

**ORD** — `map-foundry` (shipped)
> The heat. He writes it. Darken the Foundry and the Strait keeps paying into a room. The Cable drinks what was already lit. Cold is honest; it is not the last word. Renn will post the Foundry first. He has never posted a zero. You may be the reason he does.
✦ *Cutting in the middle leaves both ends running. It feels like a decision. It is a delay.*
[C.MAP foundry; F.MAP; readiness +2; the cold desk posts the Foundry first; the House whose layer the heat is loses an hour (new, Phase C); news (shipped since Phase A, Movement III): "An Angel told Ord's ledger they would cut it at the heat."]

**ORD** — `map-cable` (shipped)
> The light. He writes it. Quiet the Cable and nothing upstream notices; the Strait pays, the Foundry burns, and the signal that told you so goes soft. Renn will post the Cable first. The Cable has no switch. It has a desk and a node you can choose not to extract.
✦ *Cutting at the end is what most people mean by resistance. The process does not mind.*
[C.MAP cable; F.MAP; readiness +2; the cold desk posts the Cable first; the House whose layer the light is loses an hour (new, Phase C); news (shipped since Phase A, Movement III): "An Angel told Ord's ledger they would cut it at the light."]

**ORD** — `map-whole` (shipped)
> Nowhere. He writes that too, and underlines it. The number is the whole column. Cut it anywhere and you have two columns and a lie between them. I drew it once. I will not draw it twice. Renn posts them in the order they are.
✦ *Refusing to cut is also a cut. It is the one that leaves your hands clean and the map honest.*
[C.MAP whole; F.MAP; readiness +2; the cold desk posts them in order; news (shipped since Phase A, Movement III): "An Angel told Ord's ledger they would cut it nowhere."]

**ORD** — `after-map` (revised: the Kerb, not the Clearing, is next; he stays at the Strait until the glass is faced, so this plays here. Phase A, Movement III, ships it with "I will be at it" in place of "behind it": Ord waits beside the glass until the room exists, Phase B)
> You said the water. *· or* You said the heat. *· or* You said the light. *· or* You said nowhere. The map is drawn. The Kerb first. Face the glass; I will be behind it. I have a line to read you there. Then Quill, on the Grid, about hints and what they cost to copy.
> *If the Foundry is dark:* …The Foundry is dark. The Cable still drinks on what the Strait already paid. Nobody unlights a debt. The number is quieter. I will not pretty it.
> *If the water is refused:* …You refused the water. I will stand at the Strait. The number is quieter. I will not pretty it.
- ▸ "Give me the number." → `number`
- ▸ "Enough."

**ORD** — `number` (shipped since Phase A, Movement III)
> The process is at {figure}. Tax {rate} percent on every node. The number goes up because people extract. I will not pretty it.

### III.5 What the work destroyed
*Step `garden` (shipped). The wreckage garden in the Care, Nara at its edge (station `nara-garden`); Ione Kade on the bench at its east edge. Plate `wreckage-garden.jpg`. Angels only. The taker of the private hour comes to it now. The refuser buried it in the second hour to open the Organs door and knelt at the plate then, so the step is already done for them; `garden-buried` and the bench are theirs here. Either way the plate is hers and the confession is not yet: she keeps that for the ring.*

**NARA** — `garden-silent` (shipped since Phase A, Movement III: the keeper's node named), for the taker, before the earth
> Nara Vale looks at the garden that used to be a hole. The node you turned on in the first hour. She will not speak until it is in the ground. Press F at the garden.
> *For the one who kept the first node:* Nara Vale looks at the garden that used to be a hole. The node the city turned on while you kept yours. She will not speak until it is in the ground. Press F at the garden.
✦ *You took a hole and called it weather. It came back as earth. Only burial makes it world again.*

**THE GARDEN** — `look` F (shipped), before the earth
> A hole with a fence around it. Wreckage in the shape of a node. Someone will have to answer for it before it can be earth.

**THE GARDEN** — `bury` F (shipped since Phase A, Movement III: a node, not a Clearing, from the first hour)
> The node from the first hour is wreckage now. You put it in the ground. Nara Vale will speak.
> *If someone closed it before you:* The garden has been buried. You stay beside it until the city stops counting your time. Nara Vale will speak.
✦ *You took a hole and called it weather. It came back as earth. Only burial makes it world again.*
[F.GARDEN; F.M3; wreckage-garden buried, for everyone; readiness +8; restraint +8; a burial in your history; Nara with you again; she kneels: `garden-plate`]

**NARA** — `garden-plate` (shipped)
> It is in the earth. Nara Vale kneels and puts her hand flat on it. There is a plate. It has the node's number on it, or it does not. The Care keeps the numbered ones in the book. The unnumbered ones it keeps anyway. Which is this one?
✦ *The twelve numbers in the sexton's coat are numbers because nobody chose. This one, somebody does.*
- ▸ "Number it. Put it in the book." → `garden-numbered`
- ▸ "No number. Earth is enough." → `garden-unnumbered`
- ▸ "Let me look at it first."

**NARA** — `garden-numbered` (shipped)
> She scratches the node's number into the plate with the edge of the trowel. It is in the book now. Pim Ashe will read it at the next wake and somebody will hear it who never stood here. Nobody can say it was not a place.
✦ *A number is a name the city can pronounce. It is not the same as being remembered. It is close enough to argue with.*
[C.GARDEN numbered; news "A garden in the Care went into the book under its number."]

**NARA** — `garden-unnumbered` (shipped)
> She leaves the plate blank and stands. The Care will keep it anyway. It keeps the unnamed ledger for exactly this: twelve numbers in a coat and one blank plate. That is the honest count. I would rather a blank plate than a number that is only there so a clerk can stop looking.
✦ *Unnumbered is not unremembered. It is remembered by someone instead of by something.*
[C.GARDEN unnumbered; aura +1]

**NARA** — `garden-buried` (shipped), after the plate, for the taker and the refuser alike
> You put it in the earth and a number on it. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice.
> *With the plate blank:* You put it in the earth and left the plate blank. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice.
✦ *A person who buried someone. Not a function.*

**NARA** — `blind` (shipped), if you act on a Wink in front of her
> You're looking at something I'm not. Whatever it is, I cannot bury it for you. Say what you need.

**THE GARDEN** — `look` F (shipped), after the earth
> Buried ground. A garden in the sense that things are under it. Nara Vale comes here when nobody is dying.

**IONE KADE** — `watching` (shipped), on the bench
> You have been to the Organs. You have the look. Everything feeds everything and none of it feeds anyone. I am not going to explain it. I am going to be here a little while longer and then I am not.

### III.6 One strike, on the way
*Step `bell` (shipped). The hour bell north of the Kerb's terraces, through the gap in the low wall. Plate `clearing-ring.jpg`. Angels; a guest on the Kerb is refused at the bell. The bell is the one sound the Concern cannot schedule.*

**THE BELL** — `strike` F (shipped, pois.ts)
> You strike the hour bell once, on the way to the glass. The note goes over the Kerb and does not come back. On the terrace below, the omen-reader looks up from her slip with a time on it; the time is wrong by exactly one strike.
[F.BELL; hour-bell struck, for everyone; news "The hour bell was struck on the Kerb."; the House of Sky's hour opens on it]

**THE BELL** — `strike`, any time after the glass (shipped)
> You strike the hour bell. The note goes over the Kerb and does not come back. Somebody below looks up and then goes on extracting.

**THE BELL** — for a guest (shipped, lines.ts)
> A bell on a schedule nobody signed. Not yours to strike.

**HALLA VOSS** — `struck` (shipped since Phase A, Movement III; the hub offers "I struck it once, on the way." with F.BELL until she has heard it), on the terrace, once
> "Once. On the way to the glass." She looks at the bell and then at the slip in her hand. "That is not on anything I copied."

**HALLA VOSS** — `hour-told` (shipped, side-npcs.ts; the Kerb's own hour, SQ.HOUR step 1: three waits under the bell, not the spine's strike)
> "It struck." She looks at the bell for the first time since you met her. "For you. Once. That is not on any schedule I have." She puts the slip in her pocket. "Then the schedule is wrong about one thing."
✦ *The bell you did not hear is the one that rang. She heard this one. It ruins her whole trade.*

### III.7 The glass, from behind
*Step `failed` (shipped) carries the glass and the hole; the room behind the glass is new, Phase B, as verbs and dialogue on the same step. Phase B (shipped): the step's `done` is `has(F.FAILED) && !!ctx.p.choices[C.GLASS]`: the room ends on the reader's post or the light put out, never on a walk out (a decliner is pointed at the oval, "the room has no other way out of it"); the hole-sight path keeps its F.FAILED, Wink and readiness, moved from the step's onComplete to a `Stand at the hole` verb on `seed-4` beside the mark, since the step no longer completes there; the target is `forecast-glass` (or the nearest mark for those who see it) until F.FAILED, then `station:caul-glass`. The forecast glass on the Kerb; then, past the hour clerks at the top of the Kerb, the room behind it: `plate-kerb.jpg` for the plate, `tiles/operator` for the floor, clear of the Kerb's node. Ord is in the room, having walked the Organs with you: a new station, `ord-glass`, from F.FAILED until the glass is decided (`ord-strait` then holds until F.FAILED, not F.MAP, so `after-map` plays at the Strait); his entry there is `figure`, and the jump from Caul's menu to him is a `dialogue` effect on the choice, not a `next`. Anselm Caul is in it, in person: the guest sprite and portrait, no halo, no aura, the GUEST label over him; his name is in the prompt and the dialogue only. New flags: F.CAUL_MET at `glass`, F.CAUL_OFFER at `offer`, F.CAUL_ASKED at `looked`; his entry: a guest hears `guest`; an Angel hears `glass`, then `sample`, then `looked`, then `after`, by flag. Read and dark are exclusive: C.GLASS takes one value; the oval's Q is offered only after the offer and while C.GLASS is unset; a reader's line stays on the glass; a darkened room never gets the offer again. The Kerb is a district a guest may walk, which is why he can be here and why a guest can walk in on him. The screen behind the desk is `props/crt-altar`, playing `video/passing-failed`. Set piece. The step is an Angel's.*

**THE GLASS** — `face last season` F (shipped since Phase A, Movement III, pois.ts: the recorders in the hole, not an empty one)
> In the glass, behind the forecast: last season's Passing failed. The hour went by. The city kept the weather. There is a hole in the Clearing with the recorders still standing in it. You watched. You did not loot it.
✦ *default, wreckage:* You face the wreckage. The storm is at your back. That is the whole stance.
✦ *hint:* A hole with four hundred in it was still a door. Something came through. The recorders were standing where it went. (shipped since Phase A, Movement III)
✦ *omen:* The front came and went while the glass showed a number. The number was not wrong. It was not the weather.
✦ *dwelling:* The hole had people in it, and it held. A room can be held and still be recorded from the door. (shipped since Phase A, Movement III)
✦ *process:* The ledger has the season as a line: opened, held, crossed, taken. The line is honest. Honest is not the same as enough. (shipped since Phase A, Movement III)
✦ *surface:* Last season's hole lists for ninety seconds at a time. It is the one thing on the Kerb that has already been copied. (shipped since Phase A, Movement III)
[F.FAILED; forecast-glass lit; readiness +2. Ruin-sight, the Storm and the House of Sky can stand at the hole itself, in the asphalt south of the Grid or on the Ring, and hear the same Wink there (shipped, spine.ts; Phase B moves it to a `stand` verb at the mark): F.FAILED; readiness +2]

**THE GLASS** — for a guest (shipped, lines.ts)
> Glass. You do not see the front.

**CAUL** — in person, `guest` (shipped since Phase B, first beats; a guest on the Kerb finds him here, elsewhere the altar's body), to an unsealed body in the room
> A paper-white body at a desk, no halo, the GUEST label over him like the one over you. He looks up and is pleased. "Unsealed. We have that in common. I have it for life." He goes back to the screen. "There is nothing here for you yet. Come back with a serial. I only buy what has a number on it."

**CAUL** — in person, `glass` (shipped since Phase B, first beats)
> A paper-white body at a desk, no halo, the GUEST label over him like any arrival's, and the room's own light on his face. Anselm Caul. He is pleased to see you. "#SERIAL. We have spoken, through a light. I prefer this."
> *If you kept the first node:* "You kept the first node. The hour it would have paid is in my book as a minus. I find those the most interesting lines."
> *If you extracted it:* "You extracted at the first node. The line is in my book. I remember my own first line."
> *If you left the voice running:* "At the recorder you left the voice running. Most take the copper; it closes a coffin, and people like a thing that closes. You gave it another night. I would have bought the night."
> *If you took the copper:* "At the recorder you took the copper. Sound. The voice is in my book either way."
> "Your name was in the book before you struck anyone. That is not a threat. That is how a book works."
✦ *He cannot hear this. He has never heard one. He is the only body in the room not listening.*
[F.CAUL_MET (new)]
- ▸ "The screen. What is it?" → `sample`
- ▸ "Ord. The figure." → ORD `figure` (a `dialogue` effect on the choice)
- ▸ "Not now."

**CAUL** — `sample` (shipped since Phase B, first beats)
> On the screen, last season: the ring, the floor, the hole, the recorders standing in it. "Four hundred in the ring. Readiness at sixty-one. Everything that crossed, the tape held. You are looking at a failure. I am looking at a sample." He lets it run. "The reel at the altar in the Nave, the one that has played since you arrived: this, cut to ninety seconds. The city kneels to its own sky. It is the best thing I have ever sold and I did not make it." He watches you watch it. "I was never counted. People take that for the wound. It is the clearance."
✦ *The altar in the first hour. The oval, the bell, the ninety seconds. It was beautiful. It is the same tape.*
- ▸ "Ord. The figure." → ORD `figure` (a `dialogue` effect on the choice)
- ▸ "What do you want from me?" → `offer`

**ORD** — `figure` (shipped since Phase A, Movement III; since Phase B in the room, `station:ord-glass` from F.FAILED until the glass is decided (or the forge's lesson, if taken first), reachable from Caul's menu by a `dialogue` effect, with "Back to him." the way back across the desk), the ledger open at last season
> Ord does not look at the screen. He has it by heart. "Four hundred and six in the ring. The glass at sixty-one; that is the city's figure, not a body's. The weather at seventy-three. Third minute: a trace crossed. I wrote that line the way I wrote every line. Then the next one came across my desk, on the Concern's paper, and I wrote that too: taken. One. That is the figure. It was not short of anything. I counted it, and I walked to a gate the same week, and I have been at one since." He closes the book on his finger. "The reel at the altar is that line. He will tell you it is a sample. It is a sample. It is also my handwriting."
✦ *The count. He said he left on principle. He left on this line.*
[F.FIGURE (new), once; news (new, Phase C), once: "Ord's figure is on the marquee: last season, four hundred and six in the ring, the glass at sixty-one, a trace crossed and was taken."]
- ▸ "Back to him." → CAUL `offer` (a `dialogue` effect on the choice)

**ORD** — `figure-after` (shipped since Phase A, Movement III), at the Annex gate once the figure is read, until the act
> The figure is read. It is on the marquee. The weather did not move for it; I did not expect it to. Quill has something for you on the Grid. Then the Care, and the act.

**CAUL** — `offer` (shipped since Phase B, first beats; the reader's bargain says what the glass gives today, "the city's figure, the count in the hole, and the hour, when the glass has one", since the journal line and the date are Phase C's)
> "The glass is not a forecast. It is an instrument. It sums the readiness of every angel in the city into one figure, and that figure sets the date. The city reads a calendar. I read the city." He turns the screen off; the room is no darker. "I would like a reader. Let the ledger read your readiness live, as a line, and in return you read the glass: the launch's hour, the count in the hole, the city's figure, in your journal from now on, the way we see them. Nothing is paid." He folds his hands and waits, pleasantly, for the laugh he has read about.
✦ *A line on his glass is a line in his book. The book listens. It has since the clerk.*
[F.CAUL_OFFER (new): from here the oval on the wall takes Q while the glass is undecided]
- ▸ "Read me. I read the glass." → `reader`
- ▸ "No." → `declined`

**CAUL** — `reader` (shipped since Phase B, first beats; "and a date" reads "and the Concern's line with no time on it yet" until Phase C puts the date on the glass)
> "Done." He does not write; the glass does. A line appears in it with #SERIAL on it, the length of your readiness, and under it the city's figure and a date. "You will find it reads the same from either side. That is the thing about glass."
[C.GLASS read (new); Cold is your current; perception: the glass's readings in your journal from now on, the launch's hour, the count in the hole, the city's figure; your serial on the glass as a line, for everyone; news (new): "An Angel's readiness is on the forecast glass as a line."]
→ `looked`

**CAUL** — `declined` (shipped since Phase B, first beats)
> "Then it stays an offer." He looks at the oval on the wall, and back. "The light is there if you would rather it were not. I would not feel it."
→ `looked`

**THE OVAL** — the light on the wall, `Look at the light` F (shipped since Phase B, first beats; guest-legal, the room's one prompt before the offer)
> An oval of champagne light on the wall, the same as every oval on the Kerb. It is the one thing of his in the city a hand can reach.
> *After the light:* The wall. The oval is dark. One lamp on the top terrace is dark with it.

**THE OVAL** — the light on the wall, `put the light out` Q (shipped since Phase B, first beats; `when: has(F.CAUL_OFFER)` and C.GLASS neither read nor dark; the say ends at the lamp going dark, the clerks' descent being Phase C's; F `Look at the light` beside it)
> You put the light out. The room is the room. Behind the glass the band keeps its colour, and one lamp in the top terrace goes dark for the whole Kerb. On the stair, the hour clerks start down.
[C.GLASS dark (shipped); readiness +10; one light dark on the Kerb for everyone, the count carried as world state (W.DARK_LIGHTS, shipped; the threshold that hides the date is Phase C); the hour clerks come down the stair for the rest of the hour, a world-wide spawn, and fall as clerks fall ("Hour Clerk did their job.") (Phase C); Halla Voss goes to the glass (an `npc` effect to `omen-glass`, state glass, for everyone; from then on she sells no hours to anyone) and reads the front for nothing from now on; news (new): "A light went out behind the forecast glass. {count} are dark."; past the threshold the glass shows no date]
→ CAUL `dark` (a `dialogue` effect)

**CAUL** — `dark` (shipped since Phase B, first beats; the two sentences about the clerks on the stair wait for Phase C's descent, so that he says nothing the game does not do)
> In the dark his voice is the same. "That was one. It takes more than one; I have the number, and I will not tell you it. The clerks are on the stair. A light goes and they come down. It is what the stair is for." A pause. "Every angel who does that darkens one. When enough are dark the glass shows no date."
→ `looked`, if you have not heard it

**CAUL** — `looked` (shipped since Phase B, first beats)
> "Before you go." He has a pen now. "I know what it looks like. From the reports. A change in the light with nothing behind it. A bell you did not hear, heard. The sense that the place was looking back, and had been for some time. Sixty to ninety seconds. Then the ordinary light, and a wish to be quiet for a while. I have written that down ten thousand times. I have never once been wrong." He has not looked up. "I have never felt anything. I sell what I was told it feels like. The city has not noticed the difference. Neither, I think, have you." Then, the first time: "What did it look like."
✦ *He means the waking hint. The first of your life, in the Care. The book had it before you had finished hearing it.*
[F.CAUL_ASKED (new)]
- ▸ "Tell him." → `told`
- ▸ "Say nothing." → `untold`

**CAUL** — `told` (shipped since Phase B, first beats)
> You tell him. He writes it down, all of it, and does not look up while he writes. When you stop he reads it back to himself once, moving his lips, and underlines one word. "Thank you." He closes the book. "I like to have it in the person's own words. The ledger's are exact. Yours were present."
[F.TOLD_CAUL (new); your waking hint in his book, in your words]

**CAUL** — `untold` (shipped since Phase B, first beats)
> He writes that down too. "Declined. It is still a line." He caps the pen. "I have the other version. It is exact. I would have liked yours."

**CAUL** — `after` (shipped since Phase B, first beats; after the light it reads "The light is out. It stays out. So do I, until the hour." until the clerks descend, Phase C), any later visit to the room
> "#SERIAL. The glass is there. So am I, until the hour."
> *Undecided, the light still on:* "#SERIAL. The glass is there. So is the light. So am I, until the hour."
> *For the reader:* "Your line is holding. I check it. It is the only one I check by hand."
> *After the light:* "The clerks are still on the stair. They will be, for the hour."

**HALLA VOSS** — `after-light` (shipped since Phase B, first beats; offered by her greet and hub, once; "the date went thin" reads "the Concern's line under it went thin" until Phase C puts a date on the glass), at the glass, once, for the one who put the light out
> "One went out up there. I felt it in the glass; the band held and the date went thin." She does not take the slip out of her pocket. "I read the front now. For nothing. It is what it is worth."

**HALLA VOSS** — `hub` (shipped, side-npcs.ts), at the glass from then on
> She is at the forecast glass with nothing to sell. "I read the front now. For nothing. It is worse. It is better."

**THE GLASS** — `read the forecast` F, after the room (revised, pois.ts: the calendar carries a date, and a countdown, Phase C; since Phase B the reader's line, the city's figure and the count in the hole are on it, and everyone reads how many lines cross it)
> Forecast glass. {band}. Under the band, in the same face as every meter in the city, a line the Concern posts: the launch, as a date, with a countdown.
> *For the reader:* …Your line is in it, the length of your readiness.
> *Past the threshold of dark lights:* …a line the Concern posts: the launch. The date is not on it. There are not enough lights left to show it.

### III.8 The hint can be forged
*Step `forge` (shipped). Quill at the forge tray on the Wet Grid (station `quill-forge`), the listing board beside it. Plate `plate-forge.jpg`. Reversal, in action. Angels only; a guest never reaches the tray with eyes.*

**THE TRAY** — `hear Quill on copies` F (shipped) → QUILL `forge-lesson`
[forge-tray warm]

**QUILL** — `blind` (shipped), if you act on a Wink in front of her
> You're looking at something I'm not. I can sell you a print of it if you describe it well. Joke. Half a joke.

**QUILL** — `forge-lesson` (shipped since Phase B, the forge: she hands you the one from the Grid, and the margin has your serial; the choices are the listing and the pull. Phase A, Movement III, shipped it first with "Now. Take it, or learn to spot it." and the choices "Take the print." and "Teach me to spot the copy."; the choice ids `sell` and `spot` are kept, so a body saved under the old labels reads the same)
> Quill fans two hints. One was buried. One was printed. Look at the edge. A buried hint has dirt in the grain. A print has a margin. The printed one lists. The buried one opens. She hands you the printed one, still cool from the Grid. It came in this morning with the rest. Read the margin. #SERIAL. The hint on it is the one you woke to in the Care. Everything you heard, they have. I'm sorry. I'd have charged more. Now. List it, or pull it. I will not think less of you either way. I will think exactly the same amount.
✦ *The hint can be forged. Exhibition Winke travel. Cult Winke stay in the hand that buried.*
- ▸ "List it." → `forge-sell`
- ▸ "Pull it." → `forge-spot`
- ▸ "Let me think."

**QUILL** — `forge-sell` (shipped since Phase B, the forge: a listing, not a sale; the fee the stall's either way, paid at the tray when the purse has it and kept back from the sale when it has not; no number in her mouth. Phase A shipped the sale, its first word "Taken.")
> Listed. Your own hint, at my price, on the board behind you. Yours when a body buys it, not before; the stall keeps the fee either way, which is the only part of this I invented. It lists. It decays. It will not open anything and it will look wonderful doing it. Aura thins when you hold a print of the sacred, and thinner when you sell one. Everybody does it once.
[C.FORGE sell; F.FORGE; the print (`copy:wink`) listed on the Grid at COPY_PRICE through the market as it is (the `list` effect, economy.ts `listOwn`: it never passes through your hand), LISTING_FEE spent now when the purse has it, else kept back on the listing and taken from the sale or charged on the cancel (sink listing), the price yours only when a body buys it; aura −1, once, by this node; Cold is your current; the Clearing's price climbs (moveClearing("taken"), +8 today); news: "An Angel listed their own hint on the Grid. The Clearing is dearer."]
→ `forge-plate`

**QUILL** — `forge-spot` (shipped since Phase B, the forge: the pull. Phase A's spot opened "She takes it back and does not put it on the tray." and moved nothing)
> You pull it. She takes it back and does not put it on the tray. Look at the edge once more, so you keep the eye: dirt in the grain, or a margin. The cult hint does not list. Copies will not open the hole. The board will feel the pull. So will the street; it goes hot when a thing comes off the Grid that the Grid wanted. The tray is warm if you want to try your hand.
[C.FORGE spot; F.FORGE; aura +1; readiness +2; the Clearing's price drops as a refusal (moveClearing("refused"), −4 today); the hot street flagged, for everyone (the `hot-street` POI set hot); news: "An Angel pulled their own hint off the Grid. The hot street is hot." *A street already hot (a van, or an earlier pull) is not made hot again, and the news says only "An Angel pulled their own hint off the Grid."; nothing cools the street yet, which is Phase C's window.*]
→ `forge-plate`

**QUILL** — `forge-plate` (shipped since Phase A, Movement III; follows `forge-sell` and `forge-spot` on their `next`)
> Before you go. Two things. The Concern asked me to cut one more plate: the margin for a ring. The frame the recorders look at a hole through. I said no. First thing I have ever said no to; I had to sit down after. They'll find somebody. It'll be worse than mine. And Vesper's got a new line. Not remorse, inventory. She got it off him. Everyone on this street is quoting him and nobody's been paid.
- ▸ "Whose margin is it?" → `forge-margin`
- ▸ "Him?" → `forge-caul`
- ▸ "Enough."

**QUILL** — `forge-margin` (shipped since Phase A, Movement III): the lie, put down
> Mine. I sold them the margin. They sold the margin to the city. Years ago; a technique, on a sheet, for a price I was pleased with at the time. I don't do their margins. I don't have to. That is what selling a thing means. She wipes the plate.

**QUILL** — `forge-caul` (shipped since Phase A, Movement III; the told-him branch waits for Phase B)
> He asked me once what a hint looked like. I told him. He wrote it down. Only time I've been quoted and not paid.
> *If you told him at the glass:* …He asked you too. Don't look like that. Everybody tells him. He has a way of holding the pen.

**QUILL** — `forge-after` (shipped since Phase B, the forge: the listing in place of the print in hand; the listing's line follows the print, so the three lines after the first are new with Phase B, tagged here)
> *For the pull:* You keep the eye. Every print on the Grid looks a little worse to you now. That is what learning costs. E at the tray crafts a copy anyway, if you want to know how it feels.
> *For the listing, while it is on the board:* Your hint is on the board. It has not sold yet. Q at the tray if you want to learn what you listed. E if you want another. I am not judging. I am counting.
> *Once a body bought it (new, Phase B):* It sold. The price went to your bank and the fee stayed with me. Somebody on the Grid has your hint by now, and the hole has none of it. I am not judging. I am counting.
> *Once they took it down from the ledger and hold it (new, Phase B; also a body saved under Phase A's sale, the print in hand):* You took it down. You hold the print. It is thinning already. Q at the tray if you want to learn what you listed. E if you want another. I am not judging. I am counting.
> *Once it is gone, to the tray by Q or decayed to nothing on the board (new, Phase B):* It is off the board. Taken down to the tray, or decayed to nothing; the board does not say which and I do not ask. The fee was mine either way. E at the tray crafts a copy anyway, if you want to know how it feels.
✦ *A stall can be a shrine. She will not say it out loud on the Grid.*

**THE TRAY** — `look` F (shipped; for the pull only), after the lesson
> Two sheets on the tray. One has dirt in the grain. One has a margin. You can tell now. It does not make the print worth less to anyone but you.

**THE TRAY** — `craft a copy` E (shipped, economy.ts)
> A print. It looks like a Wink. It lists. It will not open the hole.
[FORGE_COST Bestand, sink forge; a `copy:wink` in hand; aura −1 for every print past the first in a run]

**THE TRAY** — `spot the copies` Q (shipped, economy.ts; the board's line new with Phase B)
> You keep the eye. The printed ones go to the tray. The buried one opens.
> *With nothing in hand and your own print on the board (the one Quill listed; "learn what you listed"):* You keep the eye. Your own print comes off the board and goes to the tray. The buried one opens. *· with a fee the stall kept back:* …The stall's fee, {fee}, comes out of the purse.
> *With nothing to spot:* Nothing in your hand is a copy.
[every copy in hand to the tray; aura +1; or the own listing off the board, the kept-back fee charged as far as the purse goes, aura +1]

**THE TRAY** — `sell a copy` F (shipped, economy.ts; for the one who listed; the figures are the stall's, interpolated)
> Listed at {price}. Listing fee {fee}. Exhibition decays. *· with Glamour:* Listed at {price}. Glamour waived the fee. Exhibition still decays.
> You sold a copy. Aura thins. Cult does not list.
> *With nothing to sell:* Nothing in your hand is a print. Craft one first.

**THE BOARD** — the listing board, a buy of the Clearing (revised, as II.8)
> That is a price, not a sale. The hole does not travel.
[the Clearing's price is where the hour moved it: up for the listing, down for the pull]

**THE STREET** — the hot street, `read the street` F (shipped, pois.ts), once the pull has made it hot
> A wet street. Painted on the kerb: opt in, seconds, spoils from people, not from the street. Press V to flag. Unbanked and copies drop. Cult and banked stay. Guests are not loot. In meltdown weather the street flags itself.

---

## MOVEMENT IV — THE TURN
*What the Concern is doing: ringing the Clearing with recorders.*

### IV.1 The act
*Step `mortality` (shipped). The Care: the buried garden, and the bench at its east edge (the Care floor, no new patch, no bench prop; no bed, silence as a feature). Nara's offer stands on her body wherever it is (the funeral street as shipped; the rebuild walks her to the garden's edge). Plate `plate-ione.jpg`. Angels only; the Care is shut to a guest. Caul has no line here: the Care has no oval.*

**THE RING** — `clearing-ring` look, before the act (shipped, pois.ts)
> A ring in the asphalt. Keep the hole. The hour is not a character. A mortality act is required first: watch, a burial, or a last word.

**THE GARDEN** — `wreckage-garden` look (shipped, pois.ts)
> Buried ground. A garden in the sense that things are under it. Nara Vale comes here when nobody is dying.

**THE GARDEN** — `wreckage-garden` keep watch, Q (shipped, pois.ts; any Angel's burial opens it)
> You keep watch over buried ground. Nothing happens. That is the act. Readiness is slower than salvage.
[C.MORTALITY watch; F.MORTALITY; readiness +6]

**NARA** — `stand-offer` (shipped)
> The Clearing wants a mortality act before it takes anyone. Watch, or a burial, or a last word. I have a grave in the garden with your hands on it. Stand at it with me. It counts. It is not a costume.
- ▸ "Stand at the grave with her." → `stand`
- ▸ "Not yet."

**NARA** — `stand` (shipped)
> You stand. She does not say anything for a long time. Then: that is the act. Do not make a story of it. Now the ring.
[C.MORTALITY burial; F.MORTALITY; readiness +8]

**NARA** — `blind` (shipped)
> You're looking at something I'm not. Whatever it is, I cannot bury it for you. Say what you need.

**IONE KADE** — `offer` (shipped since Phase A, Movement IV: the voice recognised, by what you did at the recorder in your first hour)
> You know the voice before she speaks. It is the one on the crate on the funeral street, one word on a loop. Ione Kade.
> *Voice preserved:* "You left it running. Some nights I hear it from here."
> *Copper taken:* "You took the coil out of it. Good. A coffin needs the copper more than a crate does. I know the word without it."
> I will not be in the next hour. Do not make a story of it. Stand in the hole. If you want a last word I have one. It is not for the city. It is for whoever is standing here when I say it.
✦ *The hour does not arrive as a body. It is a trace, or it is not. You cannot buy it.*
- ▸ "Say it." → `lastword`
- ▸ "Not yet."

**IONE KADE** — `lastword` (shipped since Phase A, Movement IV: the recorder's word first, as at the counter; then the other thing)
> She says the word once, the way she said it at the counter, to a customer who wept. Reverie. The word on the crate; the word on the first form. Then the other thing, the one that was never on the form. It is short. It is not written down anywhere and it will not be. When you look up the bench is a bench. That was the last word.
[C.MORTALITY lastword; F.MORTALITY; W.IONE_GONE 1; readiness +6; she does not return, and the game does not show her go]

**IONE KADE** — `other` (shipped)
> You chose another act. Good. I stay a while longer then. Not for you. The bench is comfortable and the garden is quiet now that it is a grave.

**IONE KADE** — `gone` (shipped; unreached, her body is absent after the word; the line is the bench's if a verb is ever put on the floor there)
> Ione Kade is not here. That was the last word.

**IONE KADE** — `blind` (shipped)
> You're looking at something I'm not. Keep looking. I will not be looking much longer.

### IV.2 Who stands in it
*Step `party` (shipped). The Care gate to the Clearing, just inside it: Ord's station `ord-gate`, the ledger open on his knee. Plate `plate-m3.jpg`. Angels only.*

**ORD** — `gate` (shipped)
> Ord is at the Care gate, not the ring. The ledger is open on his knee. Before you go in: who stands in it. The party will, if you say so; Nara is in there already and I will walk in behind you. Or you stand alone and we count from the gate. Both are written. Neither is wrong. One of them is yours.
✦ *He is asking whether the hour is a party or a person. The ledger has a column for each and he has never filled the second.*
- ▸ "With me. All of you." → `gate-with`
- ▸ "Alone. Count from the gate." → `gate-alone`
- ▸ "Let me look at the ring first."

**ORD** — `gate-with` (shipped)
> He closes the ledger. Then it is a party. A willing one counts: it is the one number about the hour that is not weather. We stand in it with you. If it fails, it failed with people in it, and I will write that.
✦ *Willingness is readiness that has other names on it.*
[C.PARTY with; F.GATE; readiness +4; his station moves into the ring once the ground is kept]

**ORD** — `gate-alone` (shipped)
> He writes it without looking up. Alone. Your own counsel, then; the hour cannot be claimed off a person who is not selling anything. We count from the gate. Nara will not leave the ring for it. I would not ask her to.
✦ *Alone is not brave and it is not sad. It is the second column, and somebody finally filled it.*
[C.PARTY alone; F.GATE; restraint +8 (Safety's door into the rite shuts past 50); he keeps the gate; news (new): "An Angel chose to stand alone in the Clearing. Ord counts from the gate."]

**ORD** — `gate-after` (shipped)
> *Alone:* The gate. I count from here. Nara is at the ring; she reads the number. Prepare the ground when you are ready and I will write what it does.
> *With:* We stand with you. Nara is at the ring already; she reads the number. Prepare the ground and I will be in behind you.

**ORD** — `blind` (shipped)
> You're looking at something I'm not. I do not need to see it. I need it to be true. Is it?

**THE RING** — look, before the gate is decided (shipped, pois.ts)
> A ring in the asphalt. Ord is at the Care gate with the ledger open: who stands in it is decided there, before the ground.

### IV.3 The ring before it is a ring
*Step `prepare` (shipped), before F is pressed. The Clearing south of the Wet Grid; Nara's station `nara-clearing` on asphalt that is not yet a hole; north of it, above the ring, the Grid's gate and a white mark on it. Plate `clearing-ring.jpg`; `tiles/clearing`; `motion/clearing-ring.mp4`; `audio/bed-ring`. Angels only. Braces are the server's numbers.*

**NARA** — `garden-silent` (shipped), if the garden is not in the ground
> Nara Vale looks at the garden that used to be a hole. The node you turned on in the first hour. She will not speak until it is in the ground. Press F at the garden.
✦ *You took a hole and called it weather. It came back as earth. Only burial makes it world again.*
[she stays at the garden; the ring is read without her; the confession below is not made]

**NARA** — `waiting` (shipped): the weather took her past the threshold and she was gone; a burial since brought her back this far; the funeral desk paid brings her back to you. (Vesper's yield sets it too, but that case speaks `garden-silent` until the garden is in the ground.)
> I am on the funeral street. I have not left. There is a body that nobody has paid to bury and you are the one who made it. Pay the desk. Then we talk.
✦ *Waiting is not forgiveness. It is a held door.*

**THE DESK** — `funeral-desk` pay, F (shipped, pois.ts)
> You paid Nara Vale's street. Five Bestand. The body is in the ground. She will speak again.
[5 Bestand, sink funeral; party nara with; readiness +2]

**NARA** — `gone` (shipped)
> She does not turn. She will not stand with a city that will not bury. The hole in the Care is still a grave. Put it in the ground and she will speak.

**ORD** — `gone` (shipped)
> Ord is gone. He will not number a city that will not freeze. His desk is a chair and a ledger with the last honest line still wet.

**NARA** — `brink` (shipped since Phase A, Movement IV: three numbers; the bodies are the Angels holding the ring)
> Nara Vale is at the ring before it is a ring. The asphalt is asphalt until somebody keeps it. She looks at you the way she looks at a plate. Three numbers. First, yours.
> *At 80 or past:* Readiness {readiness}. Enough for a trace, if the weather lets it.
> *60 to 79:* Readiness {readiness}. The floor is 60; you are over it. A trace wants 80.
> *Under 60:* Readiness {readiness}. The floor is 60. You are short, and I will say so now rather than after: the hours you did not take, the nodes you did not keep, the freeze you signed or did not. It is not a sin. It is a number.
> Then the weather. {weather}. *At 91 or past:* At ninety-one a hole holds only as long as bodies stand in it. Then the bodies: {bodies} in the ring. *At 91 or past, fewer than two:* Fewer than two and nothing passes, whatever you are.
> I will stand in it either way. Press F at the ring and keep the ground; then E to keep the hole or Q to take it. Then the hour, or not.
✦ *A sexton reads the ground before the funeral, not after. She is telling you the depth.*
[F.BRINK; → `lid` once, if the garden is in the ground]

**NARA** — `lid` (shipped since Phase A, Movement IV; once, on the brink's `next`, with F.GARDEN; the flag is F.LID)
> Her hand goes flat on the asphalt. *Numbered:* You put a number on the garden. *Blank:* You left the plate blank.
> I was twenty-two and I heard something and I wanted to keep it. They kept it. That is the catalog. Every grave since is me not doing it twice. A Clearing is a grave with the lid off. I know. I put the lid on the first one.
> *Voice preserved:* It is still running on my street. You left it on. I hear it every day. *Copper taken:* You stopped it. I never could. The copper is in a coffin, which is where copper should be.
> She looks up once, at the white mark on the Grid's gate above the ring. He is at the gate. He sent money for my street once. He will send it again next season. Let him stand there.
✦ *Ione's voice. Her hand. The catalog has two authors and only one of them is still digging.*
[flag nara:lid (new); the only scene with the sexton and the man who prices gravesides in it; he has been on the gate since she looked up]

**THE RING** — look (shipped, pois.ts): the party unwilling; the asphalt setting; the reserve spent
> A ring in the asphalt. The party will not stand. Someone walked. You cannot force the hour alone.
> A ring in the asphalt. The last hole was contested lately and the asphalt has not set: {seconds} seconds. Wait for the hour, or stand here while it sets.
> A ring in the asphalt. The Clearing's reserve is spent; there is nothing left to open until it fills back, a point at a time.

**CAUL** — on the Grid's gate, no line (shipped since Phase A, Movement IV: station `caul-lip` on the Grid's edge at the gate from the fourth hour on; the prompt opens `lip-silent`, a description and not a line, until IV.6 lands)
*A paper-white body with no halo on the tile where the city stops a guest, north of the ring, looking at the hole. The label over him says GUEST. He has no line until you climb to him (IV.6).*

### IV.4 Keep the hole
*Steps `prepare` and `stance` (shipped). The ring and the four seed grounds. Other Angels are in it on both sides; the contest is the only fight that is also the plot. Plate `clearing-ring.jpg`; `props/clearing-seed`; `audio/bed-clearing`. Angels only.*

**THE RING** — prepare, F (shipped, pois.ts)
> You keep the hole. The party still willing stands in it. The Passing is not yet the weather.
[F.PREPARE; the hole opens for everyone; news: "A Clearing was prepared."]

**THE RING** — the hole opening (shipped, clearing.ts)
> You open the hole. Keep it or extract it; the hour watches which.

**THE RING** — join, F (shipped, pois.ts), when another Angel's hole is open
> The hole is open already. Somebody prepared it and it has not set. You stand in it with them; the ring counts bodies, not who opened it.
[F.PREPARE; no second contest over a live one]

**THE RING** — keep, E (shipped, clearing.ts)
> You keep the hole. Readiness. The weather thins by the width of a body.
> *Pressed again:* You are already keeping it. Stand in it; the hour counts bodies, not presses.
[C.CLEARING keep; a dwelling vote; the weather eases per second per body standing]

**THE RING** — extract, Q (shipped, clearing.ts)
> You extracted the Clearing. {pay} Bestand. Cold is a current. The hole narrows.
> *Reserve spent:* You extracted the Clearing. Its reserve is spent; the loss pays nothing.
[C.CLEARING extract; 10 Bestand from the reserve; aura −2; the weather +2]

**THE RING** — not open (shipped, clearing.ts)
> The Clearing is not open. Open it first, or stand in it while someone does.

**THE SEED GROUND** — plant, F (shipped, pois.ts; Dwellers only)
> A seed in the kept ground. A promise you cannot cash. The Clearing will hold a little longer for it.

**THE SEED GROUND** — look (shipped, pois.ts)
> Bare ground inside the ring. A Dweller could seed it. You are not one.
> *Seeded:* A seed in the ground. Someone dwelt here long enough to leave one.

**NARA** — `ring` (shipped since Phase A, Movement IV: three numbers)
> I am in the ring. I will stand in the hole as long as it is a hole. If the process takes it I will still be here; I will just be standing in stock. Readiness {readiness} of 60. The weather {weather}. Bodies {bodies}. Press F at the ring when the party is ready.
✦ *The Clearing holds when people do.*

**ORD** — `ring` (shipped since Phase A, Movement IV: the bodies counted with the rest)
> *With:* I am in the ring. I am counting. *Alone:* I count from the gate; you are in the ring, alone, as you said.
> *At 80 or past:* Readiness {readiness}. Over the line for a trace. *60 to 79:* Readiness {readiness}. Over the floor of 60; a trace is 80. *Under 60:* Readiness {readiness} against a floor of 60. It will not open for you. I would write that down before you stand, so nobody says the number lied.
> Bodies in the ring: {bodies}. If the hour opens I will write it down honest. If it does not I will write that. Press F when *the party is / you are* ready.
> *The weather at 91 or past, in place of the above:* Gestell is maxed. I have to tell you: the hour will not open unless enough of you hold the ring. Bodies in the ring: {bodies}; it wants two. I cannot make that number smaller by wanting it. Nobody can. *Then the readiness read, the same three ways:* Readiness {readiness}. Over the line for a trace. / Readiness {readiness}. Over the floor of 60; a trace is 80. / Readiness {readiness} against a floor of 60. It will not open for you. I would write that down before you stand, so nobody says the number lied.
✦ *A solo cannot force the hour. He knows the arithmetic and hates it.*

### IV.5 The launch
*New beat, Phase B as what the player stands through; the window itself is Phase C (a flag and a timer in the world tick, once a season at the hour on the glass). No step is inserted: the lines land on the altars, the ovals, the glass, the board, the vans and the Organs' nodes during `prepare`, `stance` and `passing`. The whole server at once. Plates: the altar reel as the countdown; `trailer-hot-street` for the flagged Grid; `props/armored-van`; `props/oval-light`; `sprites/enforcer` at the nodes. The Nave and the Grid are guest districts, so a guest watches the altars count and the vans park; the Clearing stays shut to them. The tag on the reel is HUD, never world.*

**THE ALTAR** — the countdown (new; every CRT altar in the Nave, for the hour)
> Every screen in the aisle on one reel: the ring from above, empty, and a number counting down in the face of every meter in the city. A serial in the margin. The tag in the corner where it always is. People kneel to the count.

**CAUL** — on the altar reel (new)
> This hour is the Concern's. For a season we sold you the feeling of being near it. For an hour we take it. Nothing is for sale. Stand where you like.

**CAUL** — through the ovals, at the hour (new; the Kerb's apertures go champagne for everyone, as at II.9)
> The hour. I am told this is the part where people look up. Please do. I will be at the Grid's gate, which is as far as I go.

**THE GLASS** — `forecast-glass` read, during the window (new, pois.ts)
> Forecast glass. {band}. Under the band, in the same face as every meter in the city, the Concern's line with a time on it: now. The number under it and the number on every meter are the same number.

**THE GLASS** — read, dark past the threshold (new)
> Forecast glass. {band}. Under the band, where the date was, nothing. {dark} lights out on the Kerb. The line has no hour to come at.

**THE ALTAR** — dark glass (new)
> The altar plays what it played yesterday: ninety seconds of someone's sky, with a margin. No count. The vans are on the Grid anyway. The season sends them; only the shift needed a glass.

**CAUL** — through the ovals still lit, dark glass (new)
> The glass is dark. I noticed. Dark lights are a figure; I have it. Smaller than you hope. The vans are on their way; the season sends them, not the glass.

**THE ENFORCER** — Cold desk · cable at the Organs' node, on shift (new); Cold desk · one and · two on the hot street the window flags, as shipped
> Cold desk · cable, at the node, not the desk. "Shift." The meter runs. It does not look up.
> *Fall line (shipped, lines.ts `DEATH_BY`):* Cold desk · cable did their job.
[the weather climbs a point at a time on every HUD on the server, by a bounded amount, never past 91 on its own; the altars draw on the Cable as before]

**THE BOARD** — `listing-board` read, during the window (new, pois.ts)
> Quill listed a Clearing, on commission, for a buyer she never met. The buyer has a name this hour. BUYER: THE CONCERN. {price} Bestand. Copies travel. The hole does not. The vans backing up to it say otherwise.
[label (new): "Listing board — a Clearing at {price} · BUYER: THE CONCERN"; the price moves with the hour]

**THE VAN** — `armored-van` look (new; the Grid's edge; a guest may look)
> An armored van, no markings. Everyone knows whose. The doors are open on a rack of recorders, lenses toward the ring, each one looking through a printed frame. On the mast above, the oval light, lit. Nobody in the cab.

**QUILL** — `ring` (revised: two choices added; unrouted today, `quillRoute` never returns it; the rebuild routes it from her station at the vans on the Grid's edge, her own street)
> I am not standing in your hole. I am keeping the lights on over here where it is dry. Go. If a trace comes I want a print of it. If it does not, I want a print of that.
- ▸ "The frame on the recorders." → `margin` (new)
- ▸ "Keep the lights on."

**QUILL** — `margin` (new)
> Look at the frame on the lenses: it is worse than mine. There is a gap in it, low on the near side, where whoever cut it did not know what a margin is for. Whatever stands in the gap, the tape does not have. That is where you stand.
✦ *A margin is the part of a print that says it is a print. The gap is the one place in the ring that cannot be sold.*

**THE HOT STREET** — read, flagged by the window (shipped line, pois.ts; the state set by the launch)
> A wet street. Painted on the kerb: opt in, seconds, spoils from people, not from the street. Press V to flag. Unbanked and copies drop. Cult and banked stay. Guests are not loot. In meltdown weather the street flags itself.
[world window (Phase C): the hot street hot; at 91 the Grid flags itself by its own rule; the listing's buyer named; enforcers at the Organs' nodes; the vans at the Grid's edge and the oval on a mast; all but the vans skipped past the dark-light threshold; news (new): "The launch. The Concern stopped selling. The weather is climbing on every meter." / dark: "The vans are on the Grid. The glass had no hour to give them."]

### IV.6 The recorders
*New beat, Phase B; no step inserted: Caul's lines land as dialogue during `stance` and `passing`, and the offer writes its own key beside the operator's. The lip: the Grid's gate to the Clearing (`gate-wet-clearing`), the tile where the city stops a guest, the ring in sight below. `sprites/guest`, `guest.jpg`, no halo, no aura, the label GUEST; his name is in the prompt and the dialogue only. Plate `plate-operator.jpg`, the same desk's plate. A guest can stand beside him; an Angel can; nobody can strike him.*

**THE HUD** — a strike at him (shipped line, lines.ts `GUEST_GRIEF`; new wiring: a strike at the body at `home:caul`'s lip station answers with it)
> A guest is not a spoils path. The server will not strike them for you.

**CAUL** — `lip` (new; an Angel who refused at Vesper's desk)
> #SERIAL. He says it the way the clerk wrote it: before anything else. A paper-white body with no halo, the GUEST label over it like every unsealed body; the only thing that tells him apart is the name in the prompt. He is looking down at the ring, not at you. Every angel in the city is looking up. I have never been able to do that. I would like a copy.
> Vesper priced it. Sixty, no tax, and the door out of it. You said no to the number; I have that on file. I am not here with a number. I am here with the form. Sign it and the hour is kept, and you stand in it like everyone, and what crosses is kept too. Nothing is paid. The price was the desk's. This is the signature.
> *Freeze signed:* You signed Safety's form in the Annex. Mine is on the back of it. Whether it holds depends on what you held back, which is not a figure I have yet.
> I have read that people find this part moving. I have it on paper.
✦ *He is standing on the tile where the city stops a guest. It stops him. He has stood here every season and never once heard this.*
- ▸ "Sign it." → `lip-sign`
- ▸ "No." → `lip-refuse`
- ▸ "Walk on."

**CAUL** — `lip-sign` (new)
> Thank you. He does not look at the form. It goes into his coat with the others. Stand where you like. The gap is as good as anywhere now.
[C.LIP signed (new key beside C.OPERATOR; the resolver reads either, so Vesper's and Ord's lines do not re-route); current cold; the rite is claimed]

**CAUL** — `lip-refuse` (new)
> He does not argue; a refusal is a figure he has. You wait for it to pass. I am building what it would have passed through. He looks down at the ring, at the vans backing up to it. Then: I will wait. He says it the way a man names a price he cannot pay. He stays where he is. He is still there when you look back.
[C.LIP refused (new); readiness, a little; he keeps the lip through the Passing]

**CAUL** — `lip-sold` (new; an Angel who took the private yield, or who already signed here)
> #SERIAL. You sold it already. Stand where you like.
> Sixty, no tax, the door out of it. It was a good price. It is still a good price. You will not need to do anything. That is the whole product.
[no offer: a player who already sold gets the line, not the form]

**CAUL** — `lip-guest` (new; an unsealed body on the Grid)
> A paper-white body with no halo looks at a paper-white body with no halo. He does not say a serial; you have none. Unsealed. So am I. The ring is three steps down and the city stops us both on this tile. I have stood here every season. You may have the view.
[no Wink: a guest hears none, and neither does he]

**VESPER HALE** — `nogod` (shipped; she is at her desk only while no Angel in the city has taken the yield)
> You are going to the Clearing. I will not quote a body that is not here. Private yield does not list absence. The desk stays empty of gods. It is the one thing I have never had for sale.
✦ *No god for sale. She checked the price once.*

**VESPER HALE** — `blind` (shipped)
> You're looking at something I'm not. I do not price what I cannot see. Sit down when you are back.

**QUILL** — `blind` (shipped)
> You're looking at something I'm not. I can sell you a print of it if you describe it well. Joke. Half a joke.

### IV.7 The Passing
*Step `passing` (shipped). F at the ring, once a season, on prepared ground; the server resolves it against your readiness and the city's weather at that moment, in this order: the party gone, the floor unmet or no act → Failed; the weather at 91 with fewer than two bodies in the ring → Failed; your hour sold (at the desk or at the lip) with Cold as your current, or Safety's freeze signed with nothing held back → Hijack; readiness at 80 → Appearance; else Absence. Plates `video/passing-appearance`, `video/passing-absence`, `video/passing-hijack`, `video/passing-failed`; `sfx-appearance`, `sfx-hijack`. Angels only. The brief counts three; the server counts four; the story keeps the fourth.*

**THE RING** — pass, F, on unprepared ground (shipped, clearing.ts)
> The ground is not prepared. The party must be willing to stand in it.

#### Appearance

**THE RING** — pass (shipped, clearing.ts)
> A trace, not a face. The city is briefly world again. A stipend for the shrine. Cult upkeep.
[C.PASSING appearance; stipend 20 Bestand, "For the shrines, not the hand."; aura stops withering for the season, for the whole city; news: "A Passing. {name} prepared the ground. The city is briefly world."; the listing +12]

**THE ALTAR** — every altar in the Nave, at once (new)
> Light through every oval on the Kerb. The bells. Every altar in the aisle lit at once, and then dark. For the Angel whose rite it was, the altars stay dark the length of a breath, and then the ordinary light.

**CAUL** — at the van beside the lip, to the crew (new)
> Play it again.

**THE CREW** — in the van, rewinding (new; people doing a job)
> There is nothing on it.

**CAUL** (new)
> Then sell that.

**QUILL** — `after`, appearance (shipped since Phase A, Movement IV: the tape in her hands)
> She has the tape out of the van in both hands and she is laughing. A trace. I did not print it. Do not look at me like that. Nobody did. There is nothing on it. Not a margin, not a grain. I am not printing anything for a day.
[news (new, Phase C): "The tape at {name}'s Clearing is blank. The god passed through the ones who were ready."]

**CAUL** — `lip-appearance` (new; he stood still for the whole of it because he had to)
> He has not moved. The tile does not let a guest go down and he did not go back. The second time, the only question he asks twice: What did it look like.
[no choice; you walk away or you do not; either is an answer he cannot record]

**NARA** — `after`, appearance (shipped)
> A trace. Not a face. The city was world for a minute and I saw you see it. That is all I ever wanted from the street. Now bury the next one.
✦ *She buried the outcome the way she buries everything: without a number.*

**ORD** — `after`, appearance (shipped)
> A trace. I wrote it down. One line. The number did not move and I wrote that too. Both are true. I have never had both be true before.

**THE RING** — stand in what is left, appearance (shipped, pois.ts)
> A trace. The city was world for a minute. It is a ring in the asphalt again. That is not a loss. That is what a trace is.

#### Absence

**THE RING** — pass (shipped, clearing.ts)
> The hour went by. Absence is honest. Nara Vale stays. No one can force a god alone.
✦ *You went under once and came back. The hour did the same. Neither of you arrived.* (shipped since Phase A, Movement IV; clearing.ts)
[C.PASSING absence; news: "A Passing went by. {name} kept the hole. Absence is honest."; the listing +4; Nara's station kept at the ring (Phase B: her `personal` releases her on F.PASSING today)]

**NARA** — `after`, absence (shipped)
> The hour went by. Absence is honest. I stay. The hole is still a grave. Nothing you did was wrong. Nothing you did was enough. That is what the word means.

**CAUL** — through the mast's oval, after a while (new)
> Absence has a margin too.

**THE ALTAR** — absence (new)
> Ninety seconds of an empty sky through an oval, with a margin, and the tag in the corner. People kneel.

**CAUL** — `lip-absence` (new; to you, pleasantly)
> Next season. Same ring. I will have the number by then.

**QUILL** — `after`, absence (shipped)
> Nothing came. I have a print of nothing if you want one. It is my best seller this season.

**ORD** — `after`, absence (shipped)
> Nothing came. I wrote that down. It is the most honest line in the ledger. You stood there for it. That is in the ledger too.

**THE RING** — stand in what is left, absence (shipped, pois.ts)
> The hour went by. Absence is honest. The ring is a ring. Nara Vale stays.

#### Hijack

**THE RING** — pass, Cold (shipped since Phase A, Movement IV, clearing.ts: whatever would have crossed, with a margin, so a taker at the floor is not told a trace crossed; "Cold", not the desk, so a lip signer is not told a concentrator claimed it)
> Cold claimed the hour. Whatever would have crossed, the recorders had it, with a margin. The world continues. You are marked.

**THE RING** — pass, Safety (shipped, clearing.ts)
> Safety claimed the hour. The freeze ate the rite. You are marked.
[C.PASSING hijack; hijackedBy cold or safety; the lip's key read beside the operator's (Phase B); news (shipped since Phase A, Movement IV): "{name} sold their Passing. Cold claimed the hour at their Clearing; the margin has a serial in it." / "Safety's freeze ate {name}'s Passing. The district held. The form says funded by."; the listing +8; the Ruin kit reads the mark forever]

**THE ALTAR** — every altar you pass from now on (new; per viewer)
> *At the trace's line:* The Reverie of the Passing: the Appearance, with a margin, and in the margin, small, #SERIAL.
> *Under it:* The Reverie of the Passing: an empty sky through an oval, with a margin, and in the margin, small, #SERIAL.
> *Safety:* A district holding still, sold back to it by the hour. Under the reel, the form; under the form, smaller, funded by.
> Other Angels see their own sky.

**CAUL** — `lip-hijack` (new; he does not gloat)
> Thank you. It is exactly what I was told it would be like.
> *Safety:* Safety's form. Mine on the back. Thank you. It is exactly what I was told it would be like.

**NARA** — `after`, hijack (shipped)
> Somebody claimed the hour. Cold or Safety, it does not matter to the body. You are marked. Marks are not sins. They are places. I bury places.

**QUILL** — `after`, hijack (shipped since Phase A, Movement IV: one sentence added)
> Somebody claimed the hour. Not me. I only claim margins. You are marked. Marks sell, by the way. I am telling you as a friend. Your serial is in the margin of the sky now.

**ORD** — `after`, hijack (revised: the lip's door added)
> *Sold at the desk:* Cold claimed the hour. You funded it. I am not blaming you. I am telling you the number. You are marked and the mark is accurate.
> *Signed at the lip:* Cold claimed the hour. You signed for it at the gate, for nothing. I am not blaming you. I am telling you the number. You are marked and the mark is accurate.
> *Safety:* Safety claimed the hour. The freeze ate the rite. I signed a hundred of those. This one had your name on it. The number is accurate.

**CORVIN SLATE** — where he stands, Safety's door (new; side-npcs.ts)
> *At the Annex, or under the mute bell:* "The freeze held." He has your form. He turns it over. "Funded by. I have read it. It is mine when I sign it. I signed it."
> *Where the Passing failed last season, if he walked (shipped hub line, `clearing` state):* You are standing where the Passing failed. He does not turn around. "The freeze held. I have the paperwork. Say what you came to say."

**THE RING** — stand in what is left, hijack (shipped, pois.ts)
> The hour was claimed. You are marked. The world continues. So do you.

#### Failed

**THE RING** — pass (shipped, clearing.ts)
> Gestell kept the weather. Without a held Clearing the hour does not open. No stipend is owed.
[C.PASSING failed; the hole closes; a mark at `failed-1` for the season; news: "{name}'s Passing failed. Gestell kept the weather."; the listing −6]

**NARA** — `after`, failed (shipped since Phase A, Movement IV: the short case and the weather's, read off the readiness against the floor and the act; a gone Nara is routed to `gone` before `after`)
> *Short of the floor, or no act:* You are short. It is a number. Stand anyway, or come back. I stood in the ring. Nobody can say I did not. Next season there will be earth again.
> *The weather at 91, fewer than two bodies:* The weather kept it. No hole. I stood in the ring anyway. Nobody can say I did not. Next season there will be earth again.
> *Nara gone:* she was not in the ring and does not say she was. `gone` stands (IV.3): she does not turn, and the hole in the Care is still a grave.

**CAUL** — `lip-failed` (new; already leaving)
> Next season. Same ring.

**QUILL** — `after`, failed (shipped)
> Gestell ate the hole. The stall is fine. The stall is always fine. That is the horror of the stall.

**ORD** — `after`, failed (shipped)
> Gestell kept the weather. The hole did not open. I told you the arithmetic. Being right is not a comfort. I stopped expecting it to be.

**THE RING** — stand in what is left, failed (shipped, pois.ts)
> No hole. Gestell kept the weather. No stipend. Next season there is asphalt again and people to stand on it.

#### Every outcome

**VESPER HALE** — `after` (shipped)
> The hour passed or it did not. The desk is closed either way. I priced a lot of hours. I never priced that one.

**IONE KADE** — `other`, if she is still on the bench (shipped)
> You chose another act. Good. I stay a while longer then. Not for you. The bench is comfortable and the garden is quiet now that it is a grave.

**CORVIN SLATE** — where he stands, every other door (new)
> *At the Annex:* "Officer of Safety. The district is stable." He says it the way a plaque says it. The form on his desk is blank where a signature would be. He does not ask how the hour went; Safety does not keep that column.

### IV.8 The rest is the city
*Step `credits` (shipped). The ring; then every district. Plate `plate-credits` (the step ships `wing-star.png`; the synopsis names `plate-credits`); `music/title-theme`. The credits name only the game.*

**THE CREDITS** — `CREDITS` (lines.ts; shipped)
> REVERIE: THE GAME
> The city: the Nave of Tubes, the Wet Grid, the Care, the Safety Annex, the Kerb of Hours, the Gold Ring, the Organs, the Clearing.
> The weather had three names. You gave it one.
> What you buried stayed buried. What you extracted is still on the ledger.
> The clerks were doing a job.
> Nobody arrived. Something passed.
> The city continues. So do you.
> REVERIE: THE GAME. The rest is the city.
[F.CREDITS; movement 5; news: "An Angel reached the credits. The city continues."]

**THE GLASS** — `forecast-glass` read, after the credits (new, pois.ts)
> Forecast glass. {band}. Under the band, in the same face as every meter in the city, the Concern's line: the next season's hour, with a date on it.
> *Dark:* Forecast glass. {band}. Under the band, where the date was, nothing. {dark} lights out on the Kerb. The season will come anyway. It will come without a count.

**THE ALTAR** — after the credits (new)
> The altar plays. Ninety seconds of someone's sky, a bell, a serial in the margin. People kneel. The tubes are warm.

**CAUL** — after the credits (no new line)
*The I.9 reel resumes at the altar and the ovals go champagne at the hour. He is not fought and he does not fall. He is weather with a diary, and the next date is on the glass.*

---

## APPENDIX — THE SIDE HOURS
*What the Concern is doing: standing behind every clerk, desk, van, hour and copy the side hours touch, named or not. Thirty-three hours; each keeps its id and changes one thing in the city: a POI, a person's schedule, a cult object, a House's standing. Every Wink below is an Angel's; a guest playing a guest-legal hour hears none.*

### Who hands them out
*Five people with jobs and lies. Their first nodes and their hubs, as shipped in side-npcs.ts; the hub choices open the hours and are listed with the hour they open. Pim's `wake` is II.2 and Corvin's `corridor` is II.4; they are written there.*

**CORVIN SLATE** — `greet` (shipped; side-npcs.ts)
> "Corvin Slate. Officer of Safety. This district is stable. Extraction is civic duty. Nobody has been lost under a freeze; that is what a freeze is for." He says it the way a plaque says it.
- ▸ "What is Safety for?" → `safety`
- ▸ "Is there paper to carry?" → `hub`
- ▸ "Leave."
[SF.OFFICER_MET; a visit counted]

**CORVIN SLATE** — `safety` (shipped; side-npcs.ts)
> "Peace. Stability. A district that does not go under while you are standing in it. People call that the other answer. I call it the honest one. The weather does not care which."
✦ *He believes it. That is not the same as it being true. It is not the same as it being false.* (shipped)
- ▸ "Understood." → `hub`

**CORVIN SLATE** — `hub` (shipped; side-npcs.ts)
> "Officer of Safety. The district is stable. If you have come about the freeze, it holds. If you have come about something else, say it."
> *Guest:* "Unsealed. You can still carry paper. Safety has paper that needs carrying."
- ▸ "The bell census." → `census`
- ▸ "A notice for the bell." → `notice` (once the census is offered)
- ▸ "Form 9." → `form9` (Angels who signed the freeze)
- ▸ "You lost someone under a freeze." → `grief` (Angels, the freeze decided, on a second visit)
- ▸ the report lines of each hour, below
- ▸ "Leave."

**HALLA VOSS** — `greet` (shipped; side-npcs.ts)
> "Halla Voss. I read the front." She is not looking at the glass. She is looking at a slip with a time on it. "Hours are three Bestand. Fronts are not for sale. Which are you?"
- ▸ "What do you read?" → `read`
- ▸ "Sell me an hour." → `hours`
- ▸ "Does the bell strike?" → `hour`
- ▸ "Leave."
[SF.OMEN_MET]

**HALLA VOSS** — `read` (shipped; side-npcs.ts)
> "The front. Behind the band the glass shows there is a front, and I can see its edge." She says this to everyone. She does not say it to the glass.
✦ *The forecast is a lie with a time on it. She reads the time off the Concern's schedule, which Safety carries. The front she can actually see, she has never sold.* (shipped)
- ▸ "Understood." → `hub`

**HALLA VOSS** — `hub` (shipped; side-npcs.ts)
> "Omen-reader. I read the front and I sell the hour. Ask for one or the other. Not both at once; they do not agree."
> *Guest:* "Unsealed and on the Kerb. You cannot see the front. You can wait under a bell. Anyone can wait."
- ▸ "Sell me an hour." → `hours`
- ▸ "Does the bell strike?" → `hour`
- ▸ the report lines of each hour, below
- ▸ "Leave."

**DOV MARROW** — `greet` (shipped; side-npcs.ts)
> "Dov Marrow. I keep the Ring." He has a broom and a key and does not put either down. "The first bell rings. The last bell rings. The middle one was cast mute. Do not ask me to make it ring; it was made that way."
- ▸ "Why is the bell mute?" → `mute-story`
- ▸ "I could sweep." → `step`
- ▸ "What needs keeping?" → `hub`
- ▸ "Leave."
[SF.KEEPER_MET]

**DOV MARROW** — `mute-story` (shipped; side-npcs.ts)
> "Cast without a tongue. Before my time. A bell that cannot ring cannot be put on an hour, and a bell that is not on an hour cannot be sold as one. Whoever cast it knew that." He says 'whoever' carefully.
✦ *The cut is clean. He made it. He would do it again. He is not sorry and he is not lying about why; only about who.* (shipped)
- ▸ "Understood." → `hub`

**DOV MARROW** — `hub` (shipped; side-npcs.ts)
> "Keeper. Three shrines, one vault, one bell that was cast without a tongue. Upkeep is Bestand. Everything else here is not for sale. Say what you want."
> *Guest:* "Unsealed. You cannot keep a shrine. You can hold a broom. The city will not know the difference. I will."
- ▸ "I could sweep." → `step`
- ▸ "Upkeep." → `upkeep-offer` (Angels)
- ▸ "The bell was not cast mute." → `mute-offer` (Angels, on a second visit)
- ▸ "What does the vault keep?" → `vault-offer` (Angels, after the forge)
- ▸ the report lines of each hour, below
- ▸ "Leave."

**PIM ASHE** — `greet` (shipped; side-npcs.ts)
> "Pim Ashe. I dig for Nara Vale." He is younger than the shovel. "Every grave in the Care has a name. She says so. So it is so." The ledger corner in his coat says something else.
- ▸ "Every grave has a name?" → `lie`
- ▸ "Is there digging?" → `hub`
- ▸ "Leave."
[SF.SEXTON_MET]

**PIM ASHE** — `lie` (shipped; side-npcs.ts)
> "Every one." He puts a hand over the coat pocket. "Nara will not bury a number. So the numbers are not graves. So every grave has a name." He has said it before. It gets shorter each time.
✦ *Twelve numbers in a ledger he keeps because she will not. The lie is hers; he is only carrying it.* (shipped)
- ▸ "Understood." → `hub`

**PIM ASHE** — `hub` (shipped; side-npcs.ts)
> "Sexton's apprentice. I dig. Nara buries. Every grave in the Care has a name." His coat has a ledger in it and the ledger has a corner showing.
- ▸ "The ledger in your coat." → `ledger-offer` (Angels)
- ▸ "Number twelve." → `twelve-offer` (Angels, once the ledger is offered)
- ▸ "The lamp in the hall." → `lamp-offer` (Angels with a hall read)
- ▸ "The garden is dirt now." → `seed-offer` (Angels with the garden buried)
- ▸ the report lines of each hour, below
- ▸ "Leave."

**RENN COIL** — `greet` (shipped; side-npcs.ts)
> "Renn Coil. Cold desk." He does not look up from the sheet. "Strait, Foundry, Cable. A number for each. Honest. The number is the whole column; there is nothing under it." The sheet is folded so you cannot see under it.
- ▸ "What is the number?" → `number`
- ▸ "What does the desk need?" → `hub`
- ▸ "Leave."
[SF.DESK_MET]

**RENN COIL** — `number` (shipped; side-npcs.ts)
> "Yield. Per organ. Per hour. It goes up when you extract and down when you keep. I post it. I do not pretty it and I do not explain it." He taps the fold in the sheet without noticing he has.
✦ *The number is honest. Honest is not the same as whole. The second column is what each organ was.* (shipped)
- ▸ "Understood." → `hub`

**RENN COIL** — `hub` (shipped; side-npcs.ts)
> "Cold desk. I post the number for each organ. Strait, Foundry, Cable. The number is the whole column." There is a second column on the sheet. It is folded under.
> *By Ord's map (III.4), one of:* "Ord's entry says you would cut it at the water. I post the Strait first." / "Ord's entry says you would cut it at the heat. I post the Foundry first." / "Ord's entry says you would cut it at the light. I post the Cable first." / "Ord's entry says nowhere. I post them in the order they are."
- ▸ "The Strait toll." → `toll-offer` (Angels through the door; the cut organ's hour comes first)
- ▸ "The Cable hums." → `cable-offer` (Angels through the door)
- ▸ "The Foundry." → `foundry-offer` (Angels who have studied the Foundry)
- ▸ "There is a second column." → `column-offer` (Angels after Ord's map)
- ▸ the report lines of each hour, below
- ▸ "Leave."

### side-nave-third-altar — The third altar
*Movement I, the Nave of Tubes. Opens once the Safety plaque is read; the lit altar, then its dark twin across the aisle. Plate `wing-star.png`. Guest-legal. Changes a POI: `crt-altar-2` lit, for everyone.*

**THE ALTAR** — `crt-altar-1` count, `side:altar:count` (shipped; side-pois.ts)
> Two altars, says the plaque. This one is lit. Its twin across the aisle is not. Safety counted two. Safety did not count the dark one.
[SF.ALTAR_COUNTED]

**THE ALTAR** — `crt-altar-2` light it, `side:altar:light` (shipped; side-pois.ts)
> The screen comes up white, then the colour of the Nave. No picture. Just on. The third altar is lit. The plaque still says two.
✦ *Three screens. Two on the ledger. The one that is not counted is the one that is still a place.* (shipped; side.ts; Angels only)
[poi `crt-altar-2` lit, for everyone; SW.ALTAR_LIT; news "Someone lit the altar Safety did not count."; readiness +2]
*Skipped when the twin is already lit by another hand: the step closes on its own and the Wink lands.*

### side-nave-unspent — Leave something unspent
*Movement I, the Nave of Tubes. Opens on the first node; two nodes kept (the spine's `Q`, counted from the hour's start), then a hand on the lit altar's dark glass. Plates `plate-arena.jpg`, `wing-star.png`. Guest-legal. Changes a POI: `crt-altar-1` lit.*

**THE ALTAR** — `crt-altar-1` put your hand on the glass, `side:unspent:touch` (shipped; side-pois.ts)
> The glass is warm where nothing is playing. Two nodes behind you still have their charges. The screen takes that as a signal.
✦ *A kept node is a place. An extracted node was one. The glass knows the difference.* (shipped; side.ts; Angels only)
[poi `crt-altar-1` lit; news "An altar in the Nave lit for two nodes nobody drained."; restraint +3]
*Skipped when the altar is already lit (anyone's Watch at it, pois.ts): the step closes on its own once the two nodes are kept, and the Wink lands.*

### side-nave-another-night — Another night
*Movement II, the Nave of Tubes. Angels only, with the voice left running (anyone's `Q` at the recorder, I.8) and Nara's plot closed by your hand; the memorial recorder, twice, the second time from under. Plate `memorial-recorder-v1.jpg`. Changes a cult object: the silence between its words. Whose voice it is stays unsaid here; that is IV.1's.*

**THE RECORDER** — `memorial-recorder` sit with the voice, `side:night:sit` (shipped; side-pois.ts)
> The voice runs its length and starts again. Between the last word and the first there is a gap you did not notice the first time. You notice it now.
[SF.NIGHT_SAT]

**THE RECORDER** — `memorial-recorder` listen again, `side:night:listen` (shipped; side-pois.ts; only after the going-under)
> From this side the words are the same. The gap is longer. You went under and came back and the silence kept your place.
✦ *The voice is not the cult object. The gap it leaves is. You can carry that. It does not list.* (shipped; side.ts)
[cult: The silence between its words; readiness +3]

### side-nave-doing-a-job — They were doing a job
*Movement I, the Nave of Tubes. Angels only, after the intake; a fallen clerk's wreckage buried on the aisle, then the desk numbers cut into the Safety plaque once the weather is named. Plate `plate-burial.jpg`. Changes a standing: Mortals.*

**THE AISLE** — wreckage of a clerk, `F` bury (shipped; lines.ts BURY_COPY)
> You put it in the ground. Readiness. The city stops counting that body.

**THE PLAQUE** — `safety-plaque` strike the clerks' names in, `side:job:names` (shipped; side-pois.ts)
> Under 'civic duty' you cut two desk numbers and the word 'buried'. The plaque takes it. Safety will repaint it. The cut stays under the paint.
✦ *The city counts extractions. It does not count who fell. You made it count one.* (shipped; side.ts)
[Mortals +1; news "Someone buried a clerk on the Nave and wrote the desk number on Safety's plaque. Mortals noticed."]

### side-wet-armored-van — The armored van
*Movement I, the Wet Grid. Opens on entering the Grid; stall four, then the hot street's south end. Plate `stall-surface.jpg`. Guest-legal. Changes a POI: `hot-street` hot, for everyone.*

**THE STALL** — `stall-4` ask about the van, `side:van:ask` (revised; side-pois.ts: the vans carry recorders, and the clerk is doing a job, not lying)
> Armored. For moving Bestand between desks, the clerk says, because that is what the clerk was told to say. They carry recorders. No markings; everyone on this street knows whose. This one wants the south end.
[SF.VAN_ASKED]

**THE STREET** — `hot-street` wave the van through, `side:van:wave` (shipped; side-pois.ts)
> You step aside. The van takes the corner and parks across the mouth of the street. Doors stay shut. The street is a different temperature now.
✦ *It looks like freedom. It is a stall with wheels. The street it parks on stops being a street.* (shipped; side.ts; Angels only)
[poi `hot-street` hot, for everyone; SW.VAN_PARKED; news "An armored van parked on the wet street. The street went hot."]
*Skipped when the street is already hot (another van, or a pulled print, III.8): the step closes on its own, with no van parked, no news and no Wink; only the hour's closing notice is said.*

### side-wet-copy-of-a-hole — A copy of a hole
*Movement II, the Wet Grid. Opens on the listing board read; the board, twice. Plate `clearing-stall.jpg`. Guest-legal on paper; the board's read is spectate, so it opens for Angels. Changes a person: Quill walks to the board.*

**THE BOARD** — `listing-board` read the copy's price, `side:copy:read` (revised; side-pois.ts: the seller is the resistance, the price is the board's live one)
> {price} Bestand. Exhibition copy of a Clearing. The hole itself is not for sale. The copy is. Seller: the resistance. Printer: Quill. Fee paid, on a slip with a margin.
[SF.COPY_READ]

**THE BOARD** — `listing-board` take it down, `side:copy:down` (revised; side-pois.ts: the resistance's price stays on the board, II.8; costs the listing fee, sink listing)
> You pay the fee the seller paid and the copy comes down. The price stays up where the hole was priced; a price is not a copy. Somewhere on the Grid, Quill feels the space.
✦ *A copy travels. The hole does not. You paid to make the board say nothing. That is not nothing.* (shipped; side.ts; Angels only)
[Quill walks to the board; news "Someone took a Clearing off the listing board. Quill went to look."; aura +1]

### side-wet-listing-fee — Listing fee
*Movement II, the Wet Grid. Angels with a House, after the board; four stalls, one name. Plate `stall-surface.jpg`. Changes a standing: your House. Sink: the listing fee, four times.*

**THE STALL** — `stall-1` pay the fee in your House's name, `side:fee:pay` (shipped; side-pois.ts)
> Surfaces. The stallholder writes your House on the fee slip and does not look up.

**THE STALL** — `stall-2` pay the fee in your House's name, `side:fee:pay` (revised; side-pois.ts: the Concern's stamp on the tin)
> Copies. The fee goes in a tin. The tin has four Houses scratched on it and the Concern's stamp on the lid. Yours was already there.

**THE STALL** — `stall-3` pay the fee in your House's name, `side:fee:pay` (shipped; side-pois.ts)
> Plants. Real ones, under a lamp that is not. The fee buys them another night under it.

**THE STALL** — `stall-4` pay the fee in your House's name, `side:fee:pay` (shipped; side-pois.ts; hidden while the van hour is still at its ask)
> Vans. The fee is the same as for plants. The stallholder finds that funny and does not say why.
✦ *A fee is a sink. A name on four stalls is a standing. Neither one strikes.* (shipped; side.ts)
[your House +1; news "{House} paid the fees on four stalls. The market says the name now."; SW.FEES_PAID]

### side-wet-tray-warm — The tray stays warm
*Movement III, the Wet Grid. Angels who spotted the copies at the forge (III.8); Quill's tray, banked, then the sheet on it. Plate `plate-forge.jpg`. Changes a cult object: a hint that does not list. Sink: the forge.*

**THE TRAY** — `forge-tray` bank the coals, `side:tray:bank` (shipped; side-pois.ts; costs the forge, sink forge)
> You rake the coals to the back of the tray and cover them. The print that was not a print stays warm. It has nowhere else to go.
[poi `forge-tray` warm; news "Someone banked the forge tray. The print that was not a print stays warm."]

**THE TRAY** — `forge-tray` take the spotted hint, `side:tray:take` (revised; side-pois.ts)
> Paper with a hint on it that no press made. No margin. You spotted it. It is yours the way a grave is yours.
✦ *You kept the eye. The cult hint does not list. Copies will not open the hole.* (shipped; side.ts)
[cult: A hint that does not list]

### side-wet-desk-closed — The desk stays empty
*Movement III, the Wet Grid. Angels who decided Vesper's offer, once a sale (yours or anyone's) has walked her from the desk; her desk, twice. Plate `plate-operator.jpg`. Changes a POI: `operator-desk` closed, for everyone.*

**THE DESK** — `operator-desk` read the empty desk, `side:desk:read` (shipped; side-pois.ts)
> The desk is empty. The ledger is open at a page with your hour on it. Private yield still wants a body.
[SF.DESK_READ]

**THE DESK** — `operator-desk` close the ledger, `side:desk:close` (revised; side-pois.ts; unreachable as shipped: the sale that walked her already closed the desk, pois.ts and npcs.ts, so the close step completes on the tick after the read and the verb is never offered. Phase D gates the close step's done on SF.DESK_CLOSED alone)
> You close it. The desk stops asking. It will not start again for you. The oval light on the wall stays on; it was never the desk that was asking.
✦ *A desk is a mouth. You shut it. The number it quoted was honest. The door it bought was not.* (shipped; side.ts; as shipped it lands off the read)
[poi `operator-desk` closed, for everyone; SW.DESK_CLOSED; news "Someone closed the Concentrator's desk. Yield still wants a body. It will have to ask elsewhere."; restraint +2]

### side-care-unnamed-ledger — The unnamed ledger
*Movement II, the Care. Angels, from Pim Ashe; two bodies buried anywhere, then the count to him. Plate `wreckage-garden.jpg`. Changes a person: Pim takes the ledger into the garden.*

**PIM ASHE** — `ledger-offer`, from the hub's "The ledger in your coat." (shipped; side-npcs.ts)
> He takes it out. Twelve lines. Numbers. "The ones she would not. I keep them so somebody does." He does not ask you to fix it. "Bury two the city did not count. Anywhere. Bring me the count and I will write it down. Numbers are a start."
- ▸ "I will bring you two."
[offer `side-care-unnamed-ledger`]

**WRECKAGE** — anywhere, `F` bury, twice (shipped; lines.ts BURY_COPY)
> You put it in the ground. Readiness. The city stops counting that body.

**PIM ASHE** — `ledger-done`, from the hub's "Two more numbers." (shipped; side-npcs.ts)
> He writes two lines and closes the book. "That is fourteen. It is the only ledger in the city that gets shorter when someone does their job." He looks at the garden. "I am going out there. It is faster to number where they are."
✦ *A ledger of the unnamed is still a ledger. It is the only one in the city that shrinks when someone does their job.* (shipped; side.ts)
[SF.LEDGER_REPORTED; Pim to the wreckage garden; news "The sexton's apprentice took his ledger into the wreckage garden. He is numbering what is there."]

**PIM ASHE** — `hub`, in the garden from now on (shipped; side-npcs.ts)
> He is in the wreckage garden with the ledger open on his knee. "I am numbering. It is faster out here. Nara does not come out here."

### side-care-number-twelve — A name for number twelve
*Movement II, the Care. Angels, from Pim Ashe after the ledger; the funeral desk for the plate, the garden for the burial, Pim for the name. Plate `plate-burial.jpg`. Changes a cult object: the twelfth name. Sink: a funeral.*

**PIM ASHE** — `twelve-offer`, from the hub's "Number twelve." (shipped; side-npcs.ts)
> "Twelve." He finds the line without looking. "Went under in a freeze. The Passing failed. Nobody claimed the plate. Nara would not bury a number." He tears the line out and gives it to you. "Get the plate from the desk. Bury him under a name. Any name. Then come and tell me what it was."
- ▸ "I will find the plate."
[offer `side-care-number-twelve`]

**THE DESK** — `funeral-desk` ask for plate twelve, `side:twelve:plate` (shipped; side-pois.ts)
> A brass plate. A number. No name. The desk says it was never claimed and the sexton would not bury a number.
[SF.TWELVE_PLATE]

**THE GARDEN** — `wreckage-garden` bury twelve under a name, `side:twelve:bury` (shipped; side-pois.ts; costs a funeral, sink funeral)
> You put the plate in the ground with the number turned down. The earth closes. A number is not a grave. This is.
[readiness +4; history: buried +1]

**PIM ASHE** — `twelve-named`, from the hub's "Twelve has a name." (shipped; side-npcs.ts; branch by prior choice)
> *The Officer's brother found (side-annex-other-honest-answer):* "Aldo Slate." He writes it where the number was. "The Officer's brother. Under the Officer's freeze." He does not say anything else about that. "Eleven now. Keep the name. It is the only one in the ledger that is cult."
> *Otherwise:* You give him the name. He writes it where the number was and does not ask if it is right. "A name is a name. A number was not a grave. Eleven now. Keep the name. It is the only one in the ledger that is cult."
✦ *You put a name where the city put a number. Cult. It does not list. It does not strike. It stays.* (shipped; side.ts)
[cult: The twelfth name; SW.TWELVE_NAMED; news "Number twelve has a name. The ledger is one line shorter." or, with the brother found, "Number twelve has a name. Aldo Slate. The ledger is one line shorter."]

### side-care-standing — Standing, not a stick
*Movement II, the Care. Angels with a hall read and the shrine touched; the funeral desk, then the Mortals book at the Care shrine. Plates `plate-care.jpg`, `house-hall.jpg`. Changes a standing: Mortals. Sink: a funeral.*

**THE DESK** — `funeral-desk` pay for the unnamed, `side:standing:funeral` (shipped; side-pois.ts; costs a funeral, sink funeral)
> You pay for a funeral nobody claimed. The desk writes 'paid' where the name would go.
[SF.STANDING_FUNERAL]

**THE SHRINE** — `care-shrine` enter the burial in the book, `side:standing:enter` (shipped; side-pois.ts)
> The shrine keeps the Mortals book. You write 'paid' and a number. The House will count it.
✦ *Standing is a name on a dead line. It will never make you hit harder. That is what makes it standing.* (shipped; side.ts)
[Mortals +2; news "A funeral nobody claimed was entered at the Mortals hall. The House stands taller."]

### side-care-lamp — A lamp you can light
*Movement II, the Care. Angels with a hall read, from Pim Ashe; the funeral desk's wick, his oil, your tithe. Plate `house-hall.jpg`. Changes a POI: `hall-mortals` lit, for everyone. Sink: the tithe.*

**PIM ASHE** — `lamp-offer`, from the hub's "The lamp in the hall." (shipped; side-npcs.ts)
> "The lamp in the Mortals hall is dark for anyone who is not Mortals. The desk keeps its wick." He gives you a tin of oil. "Light it for the buried, not the House. It costs a tithe. The hall does not ask whose hand."
- ▸ "I will light it."
[offer `side-care-lamp`]

**THE DESK** — `funeral-desk` light the lamp for the buried, `side:lamp:light` (shipped; side-pois.ts; costs the tithe, sink tithe; hidden while plate twelve is still unasked)
> Pim's oil, the desk's wick, your tithe. The lamp in the Mortals hall comes up across the district. Not your House. Your dead.
[poi `hall-mortals` lit, for everyone; SW.LAMP_LIT; news "Someone lit the Mortals lamp for the buried. Not their House. Their dead."]
*Skipped when the Mortals hall is already lit (a Mortals Angel's plaque read, pois.ts): the step closes on its own.*

**PIM ASHE** — `lamp-told`, from the hub's "It is lit." (shipped; side-npcs.ts)
> "Lit." He writes it in the back of the ledger, where the names are. "Not your House. Your dead. That is the right column."
✦ *A lamp you can light. Not a lamp you own. The hall does not ask whose hand.* (shipped; side.ts)
[SF.LAMP_TOLD; readiness +2]

### side-annex-form-nine — Form 9
*Movement II, the Safety Annex. Angels who signed the freeze; Corvin Slate for the form, the tax window to file it or refuse it, once this hour's tithe is decided. Plate `safety-annex.jpg`. Changes a POI: `safety-desk` frozen on paper. Sink: the freeze fee.*

**CORVIN SLATE** — `form9`, from the hub's "Form 9." (shipped; side-npcs.ts)
> "You signed the freeze. The fee you paid was the deposit. Form 9 is the fee. Five Bestand at the tax window and the freeze is on paper, which holds longer than weather. Refuse and it lapses on paper. It holds on the ground either way. I did not tell you at the desk because nobody reads Form 9 before they sign."
✦ *You bought time. You spent a god. Form 9 is the receipt.* (shipped)
[SF.FORM9_ASKED]

**THE WINDOW** — `tax-window` file Form 9, `side:form9:file` (shipped; side-pois.ts; five Bestand, sink freeze)
> Five Bestand. Stamped. The freeze you signed is on paper now. Paper holds longer than weather.
✦ *You bought time. You spent a god. The hour does not forgive the signature. Form 9 does not ask it to.* (shipped; side.ts)
[SC.FORM9 filed; poi `safety-desk` frozen; SW.FORM9_FILED; news "Form 9 was filed. The freeze is on paper now. Paper holds longer than weather."]

**THE WINDOW** — `tax-window` refuse Form 9, `side:form9:refuse` (shipped; side-pois.ts)
> You do not pay for it twice. The freeze holds on the ground. On paper it lapses. The clerk writes 'lapsed' with no expression.
✦ *You signed the freeze and would not pay for it twice. Paper remembers. Weather does not.* (shipped; side.ts)
[SC.FORM9 refused; readiness +2; news "Someone refused Form 9. The freeze holds on the ground and lapses on paper."]

### side-annex-other-honest-answer — The other honest answer
*Movement II, the Safety Annex. Angels with the freeze decided, from Corvin Slate on a second visit; the wreckage garden for the number, then him. Plates `failed-passing.jpg`, `safety-annex.jpg`. Changes a person: the Officer walks to where the Passing failed.*

**CORVIN SLATE** — `grief`, from the hub's "You lost someone under a freeze." (shipped; side-npcs.ts)
> He stops filing. "Nobody has been lost under a freeze." A pause the length of a form. "My brother went under during the first one I signed. Aldo. The Passing failed that season. He did not wake in the Care. There is no plate. Safety does not keep plates. If you go into the wreckage garden, you will find a number. I have never gone."
✦ *The other honest answer, finally being honest. It costs him the plaque.* (shipped)
- ▸ "I will find the number."
[offer `side-annex-other-honest-answer`]

**THE GARDEN** — `wreckage-garden` look for the frozen name, `side:honest:look` (shipped; side-pois.ts; branch by prior choice)
> *Twelve already buried under a name (side-care-number-twelve):* The plot you buried under a name. The number under the name is twelve. Went under during a freeze. The Passing that season failed. It was Corvin Slate's brother.
> *Otherwise:* A plot with a number. Twelve. Went under during a freeze. The Passing that season failed. No plate. No name. That is his brother.
[SF.HONEST_FOUND]

**CORVIN SLATE** — `grief-return`, from the hub's "Number twelve." (revised; side-npcs.ts: the form's small line)
> "Twelve." He says it once. He puts the form down, face up, the small line at the foot of it showing: funded by. He has signed over it a hundred times. "The freeze held. The district was stable. He went under stable." He takes his coat. "I am going to stand where the Passing failed. Somebody from Safety should have."
✦ *Safety was the other honest answer. He still is. He just stopped saying it where it was safe.* (shipped; side.ts)
[SF.HONEST_TOLD; the Officer walks to where the Passing failed; SW.OFFICER_WALKED; news "The Officer of Safety left the Annex. He is standing where the Passing failed."; a guest keeps him at the Annex desk]

**CORVIN SLATE** — `hub`, where the Passing failed from now on (shipped; side-npcs.ts)
> You are standing where the Passing failed. He does not turn around. "The freeze held. I have the paperwork. Say what you came to say."

### side-annex-tax-is-climate — The tax is climate
*Movement II, the Safety Annex. Angels with a House, once this hour's tithe is decided; the tax window, twice. Plate `safety-annex.jpg`. Changes a standing: your House. Sink: the tax.*

**THE WINDOW** — `tax-window` read who pays, `side:tax:read` (revised; side-pois.ts: the city's word for the weather)
> Tax: {rate} percent on every yield. Payers: nobody, by name. The rate is the weather. The weather is everyone, added up.
[SF.TAX_READ]

**THE WINDOW** — `tax-window` pay your House's share, `side:tax:pay` (revised; side-pois.ts; costs the tithe, sink tax)
> You pay a share under a House's name. The clerk has a column for that. It has never had anything in it. The column beside it, the one the window remits to, has never once been empty.
✦ *The tax is climate. The climate is you, added up. You paid for a House to be counted as weather.* (shipped; side.ts)
[your House +1; news "{House} paid its share at the tax window. The Annex wrote the name down."]

### side-annex-notice-for-the-bell — A notice for the bell
*Movement I, the Safety Annex. From Corvin Slate once the census is offered; Form 4 to Dov Marrow, his refusal back to the Officer. Plates `shrine-upkeep.jpg`, `safety-annex.jpg`. Guest-legal. Changes a person: the keeper stands under the mute bell.*

**CORVIN SLATE** — `notice`, from the hub's "A notice for the bell." (revised; side-npcs.ts: the Concern's paper, in his own formula from the corridor)
> "Form 4. Registration of an hour. The mute bell is to be entered as a scheduled hour whether it rings or not. The paper is theirs; the form is mine. Take it to the keeper. He will sign or he will not. Either way, come back."
- ▸ "I will take it."
[offer `side-annex-notice-for-the-bell`]

**DOV MARROW** — `notice-refuse`, from the hub's "Safety sent a notice." (shipped; side-npcs.ts)
> He reads Form 4 twice. "Registration of an hour. For a bell with no tongue." He folds it into the shrine cloth without signing. "Tell the Officer the bell is not an hour. Tell him I will be standing under it if he wants to register me."
[SF.NOTICE_REFUSED]

**CORVIN SLATE** — `notice-report`, from the hub's "The keeper refused it." (shipped; side-npcs.ts)
> "He refused." Corvin Slate files a refusal in the same drawer as a signature. "Then the bell stays off the schedule. And he stays under it. That is his freeze. I understand it better than he thinks."
✦ *A bell with no tongue cannot be scheduled. That was the point of cutting it.* (shipped; side.ts; Angels only)
[SF.NOTICE_REPORTED; the keeper to the mute bell; news "The keeper of the Ring refused a Safety notice. He is standing under the mute bell."]

**DOV MARROW** — `hub`, under the mute bell from now on (shipped; side-npcs.ts)
> He is under the mute bell with the notice folded into the shrine cloth. "They will send another. I will be here for that one too."

### side-annex-bell-census — The bell census
*Movement I, the Safety Annex. From Corvin Slate; the first and last bells on the Gold Ring counted, the number back to him. Plates `shrine-upkeep.jpg`, `safety-annex.jpg`. Guest-legal. Changes a person: the Officer goes to the Ring.*

**CORVIN SLATE** — `census`, from the hub's "The bell census." (shipped; side-npcs.ts)
> "Safety is registering the bells. Count the first and the last on the Gold Ring. Bring me the number. It is a census. Nothing more." He does not ask if you can count. He asks if the keeper will let you.
- ▸ "I will count them."
[offer `side-annex-bell-census`]

**DOV MARROW** — `census-aside`, from the hub's "I am counting bells for Safety." (shipped; side-npcs.ts; optional, while the count is open)
> "Count them. They are bells; they hold still." He watches you go. "When you get to the middle one, count what is not there. Safety will want that number most."

**THE SHRINE** — `shrine-1` count the bell, `side:census:first` (shipped; side-pois.ts)
> One bell. Tongue present. It has not rung in your hearing. You write 'one' for Safety.
[SF.CENSUS_FIRST]

**THE SHRINE** — `shrine-3` count the bell, `side:census:last` (shipped; side-pois.ts)
> One bell. Tongue present. Dust on it. No keeper comes here. You write 'two, and one without' for Safety.
[SF.CENSUS_LAST]

**CORVIN SLATE** — `census-report`, from the hub's "Two with tongues. One without." (shipped; side-npcs.ts)
> "Two with tongues. One without." He writes 'one without' and underlines it. "I will go and see it. A bell that cannot be scheduled is a bell that cannot be made safe."
✦ *He did not want the count. He wanted to know if the keeper would talk to someone Safety sent.* (shipped; side.ts; Angels only)
[SF.CENSUS_REPORTED; the Officer to the Ring; news "The Officer of Safety went to the Ring to count the bells himself."]

**CORVIN SLATE** — `hub`, at the Ring from now on (shipped; side-npcs.ts)
> He is under the shrine of the mute bell with a form on a board. "Two with tongues. One without. Your count was right. I wanted to see the one without."

### side-kerb-hour-that-does-not-strike — The hour that does not strike
*Movement I, the Kerb of Hours. From Halla Voss; under the hour bell three times without leaving, then her. Plate `wing-star.png`. Guest-legal. Changes a POI: `hour-bell` struck, for everyone.*

**HALLA VOSS** — `hour`, from the hub's "Does the bell strike?" (shipped; side-npcs.ts)
> "The hour bell does not strike. It is on a schedule nobody signed and the schedule has no hours on it. If you want to hear it, wait under it. Three times. Do not leave between. It will not strike. I am telling you so you do not blame me."
- ▸ "I will wait."
[offer `side-kerb-hour-that-does-not-strike`]

**THE BELL** — `hour-bell` wait under the bell, `side:hour:wait`, three times (shipped; side-pois.ts)
> *First:* You wait. The bell does not strike. The terrace goes on selling hours behind you.
> *Second:* You wait. Someone on the terrace stops talking to watch you. The bell does not strike.
> *Third:* You wait. The bell strikes. Once. Nobody signed for it. The terrace has gone quiet.
✦ *The bell you did not hear is the one that rang. This one you heard. That is rarer.* (shipped; side.ts; Angels only)
[SF.HOUR_WAITED ×3; poi `hour-bell` struck, for everyone; SW.HOUR_STRUCK; news "The hour bell struck. Nobody signed for it."]

**HALLA VOSS** — `hour-told`, from the hub's "It struck." (shipped; side-npcs.ts)
> "It struck." She looks at the bell for the first time since you met her. "For you. Once. That is not on any schedule I have." She puts the slip in her pocket. "Then the schedule is wrong about one thing."
✦ *The bell you did not hear is the one that rang. She heard this one. It ruins her whole trade.* (shipped; Angels only)
[SF.HOUR_TOLD; readiness +2]

### side-kerb-storm-front — Storm front
*Movement II, the Kerb of Hours. Angels with a hall read; the forecast glass, then Halla Voss, for nothing. Plate `house-hall.jpg`. Changes a standing: Sky; the glass lit, for everyone. The read is shared with the omen-glass hour and is heard once, in whichever comes first.*

**THE GLASS** — `forecast-glass` read the front, `side:front:read` (shipped; side-pois.ts)
> {band} {drift} Behind the band, a front. You cannot see its edge. You can see that it has one.
> *House of Sky:* {band} {drift} Behind the band, a front. You can see its edge. Nobody else on the Kerb can.
[SF.FRONT_READ]

**HALLA VOSS** — `front-report`, from the hub's "There is a front behind the band." (shipped; side-npcs.ts)
> You tell her the shape of the edge. She goes still. "That is the one I see. I have never said it out loud." She names it. It is a Sky name; it does not translate. "The House will stand for that. I will not charge you."
✦ *Look at the drift, not the number. She just did, in public. The House of Sky felt it.* (shipped)
✦ *Look at the drift, not the number. The number is what Safety sells. The front is what the sky does.* (shipped; side.ts)
[SF.FRONT_TOLD; Sky +2; poi `forecast-glass` lit, for everyone; SW.FRONT_NAMED; news "A storm front was named on the Kerb. The House of Sky stands taller. The glass is lit."]

### side-kerb-hours-for-sale — Hours for sale
*Movement I, the Kerb of Hours. From Halla Voss; an hour bought at the terrace for three Bestand, waited for under the bell, asked for back. Plate `wing-star.png`. Guest-legal. Changes a person: Halla stops selling and reads the glass for nothing. Sink: upkeep.*

**HALLA VOSS** — `hours`, from the hub's "Sell me an hour." (shipped; side-npcs.ts)
> "Three Bestand at the terrace. I write the time; the bell strikes for you then. If it does not, come back and tell me. Nobody has." She says the last part like a warranty.
- ▸ "I will buy one."
[offer `side-kerb-hours-for-sale`]

**THE TERRACE** — `omen-terrace` buy an hour, `side:hours:buy` (shipped; side-pois.ts; three Bestand, sink upkeep)
> Three Bestand. Halla Voss writes a time on a slip and says the bell will strike for you then. She does not look at the glass while she writes it.
[SF.HOURS_BOUGHT]

**THE BELL** — `hour-bell` wait for the bought hour, `side:hours:wait` (revised; side-pois.ts: the schedule is nobody's, the slip is the Concern's, II.9)
> The time on the slip comes and goes. The bell is on a schedule nobody signed. The slip, it turns out, was the Concern's.
[SF.HOURS_WAITED]

**HALLA VOSS** — `hours-confront`, from the hub's "The hour I bought did not come." (shipped; side-npcs.ts)
> "It did not come." She takes the slip back. "No. The times are the Concern's bell schedule; Safety carries it and I copy it. The bell is on the schedule; the schedule is not on the bell. I sold you a lie with a time on it, and the time was theirs." She tears the slip. "I am going to stand at the glass. I will read the front, which I can see, for nothing, which is what it is worth."
✦ *A forecast is a lie with a time on it. She stopped putting the time on. The lie stayed. So did she.* (shipped; side.ts; Angels only)
[SF.HOURS_CONFRONTED; Halla to the forecast glass; news "Halla Voss stopped selling hours. She is reading the forecast glass for nothing."; readiness +1]

**HALLA VOSS** — `hub`, at the glass from now on (shipped; side-npcs.ts)
> She is at the forecast glass with nothing to sell. "I read the front now. For nothing. It is worse. It is better."

### side-kerb-omen-glass — A sky you can name
*Movement II, the Kerb of Hours. Angels with a hall read, once the hour bell has struck; the glass read, then a sliver of it taken. Plate `house-hall.jpg`. Changes a cult object: omen glass.*

**THE GLASS** — `forecast-glass` read the front, `side:front:read` (shipped; side-pois.ts; as in the storm-front hour, and skipped when already read there)
> {band} {drift} Behind the band, a front. You cannot see its edge. You can see that it has one.
> *House of Sky:* {band} {drift} Behind the band, a front. You can see its edge. Nobody else on the Kerb can.

**THE GLASS** — `forecast-glass` take the omen glass, `side:skyhall:take` (shipped; side-pois.ts)
> A sliver of the forecast glass comes away in your hand. It shows the drift. It will never show the hour.
✦ *The sky is a schedule nobody signed. You hold a piece of it. It shows the drift. It does not show the hour.* (shipped; side.ts)
[cult: Omen glass]

### side-ring-mute-bell — Mute bell
*Movement II, the Gold Ring. Angels, from Dov Marrow on a second visit; under the second shrine's altar, then the bell. Plate `shrine-upkeep.jpg`. Changes a POI: `mute-bell` rung, for everyone, then mute again.*

**DOV MARROW** — `mute-offer`, from the hub's "The bell was not cast mute." (shipped; side-npcs.ts)
> A long look. "No. It was not." He sets the broom down for the first time. "Look under the altar of its shrine. Hang what you find. It will ring once, and then I will take it back, and it will be mute again, and you will know why. That is the whole hour."
✦ *He cut it so the hour could not be priced. He wants one person to hear it ring so he is not the only one who knows it can.* (shipped)
- ▸ "I will look."
[offer `side-ring-mute-bell`]

**THE SHRINE** — `shrine-2` look under the altar, `side:mute:look` (shipped; side-pois.ts)
> Under the altar, in shrine cloth: a bell's tongue. The cut is clean. Not cast without one. Cut. The keeper's story is a story.
[SF.MUTE_TONGUE]

**THE BELL** — `mute-bell` hang the tongue, `side:mute:hang` (shipped; side-pois.ts)
> You hang it. The bell swings on its own weight and rings once. Then the keeper is beside you with his hand out. Then it is mute again.
✦ *An omen is a bell that rings before the hour and is not wrong. This one rang once and was right about nothing. It was still a bell.* (shipped; side.ts)
[poi `mute-bell` rung, for everyone; SW.BELL_RANG; news "The mute bell rang once. Then it was mute again."; Winke +1]
*Skipped when the bell is already rung (anyone's `F` at it with the second shrine kept, pois.ts): the step closes on its own.*

### side-ring-cult-upkeep — Cult upkeep
*Movement II, the Gold Ring. Angels, from Dov Marrow; three shrines swept for Bestand, the last one nobody keeps. Plate `shrine-upkeep.jpg`. Changes a standing: Divinities. Sink: upkeep, three times.*

**DOV MARROW** — `upkeep-offer`, from the hub's "Upkeep." (revised; side-npcs.ts: the city's word for the weather)
> "Three shrines. Bestand goes into the ground and the weather thins by an amount nobody feels. Nobody keeps the last bell. Pay it anyway. Divinities stands for people who pay for what nobody keeps."
- ▸ "I will sweep them."
[offer `side-ring-cult-upkeep`]

**THE SHRINE** — `shrine-1` sweep the shrine, `side:sweep:first` (revised; side-pois.ts: the city's word for the weather; upkeep, sink upkeep)
> Upkeep. Bestand into the ground. The weather thins by an amount you will not feel.

**THE SHRINE** — `shrine-2` sweep the shrine, `side:sweep:second` (shipped; side-pois.ts; upkeep, sink upkeep)
> Upkeep for the shrine of a bell that does not ring. The cloth on the altar has something wrapped in it. You leave it.

**THE SHRINE** — `shrine-3` sweep the shrine, `side:sweep:last` (shipped; side-pois.ts; upkeep, sink upkeep)
> Nobody keeps the last bell. You pay its upkeep anyway. The dust comes off the tongue in one piece.
✦ *Every earner has a hole. Bestand goes into the ground. Three shrines are three holes. That is the whole rite.* (shipped; side.ts)
[Divinities +2; SW.SHRINES_SWEPT; news "Three shrines swept in one hour. The House of Divinities stands taller."]

### side-ring-what-the-vault-keeps — What the vault keeps
*Movement III, the Gold Ring. Angels, from Dov Marrow after the forge; a printed hint through the vault's slot, then him. Plate `wet-grid-cult.jpg`. Changes a cult object: the vault seal; the vault open to you.*

**DOV MARROW** — `vault-offer`, from the hub's "What does the vault keep?" (shipped; side-npcs.ts)
> "Things that do not list. That is all a vault is." He weighs the key. "You have been to Quill's tray. Bring a copy here, a forged hint, something that sells, and put it through the slot. It will never sell again. Then we will talk about what is in there."
- ▸ "I will bring one."
[offer `side-ring-what-the-vault-keeps`]

**THE VAULT** — `cult-vault` leave the copy, `side:vault:leave` (shipped; side-pois.ts; needs a `copy:wink` in hand)
> The copy goes through the slot. It was worth nine. It is worth nothing now. It is the only thing in the vault that was ever for sale.
[one copy removed; fake Winke −1; SF.VAULT_LEFT]

**DOV MARROW** — `vault-take`, from the hub's "The copy is in the vault." (shipped; side-npcs.ts)
> "It is in." He turns the key. "The only thing in there that was ever for sale, and you gave it up. That is the test. There is no other one." He presses a seal into your hand. "Cult. It does not list. The vault is open to you. There is nothing in it for sale."
✦ *A copy travels. What it copies stays in the hand that buried it. You buried a copy. That is a first.* (shipped; side.ts)
[SF.VAULT_TOLD; cult: Vault seal; poi `cult-vault` open]

### side-ring-sweeping-is-not-keeping — Sweeping is not keeping
*Movement I, the Gold Ring. From Dov Marrow; the first shrine's step swept with a broom, no Bestand, then him. Plate `shrine-upkeep.jpg`. Guest-legal. Changes a POI: `shrine-1` kept, which the city will count and the keeper will not. No Wink: none is authored, and a guest can hold the broom.*

**DOV MARROW** — `step`, from the hub's "I could sweep." (shipped; side-npcs.ts)
> "Sweep the step of the first shrine. No Bestand; a broom is not upkeep. Then come and tell me, and I will tell you what the city calls it."
- ▸ "I will sweep it."
[offer `side-ring-sweeping-is-not-keeping`]

**THE SHRINE** — `shrine-1` sweep the step, `side:step:sweep` (shipped; side-pois.ts; no cost)
> You sweep the step. Grit, a shrine cloth thread, a fee slip somebody dropped. The step is clean. Nothing else has changed.
[SF.STEP_SWEPT]

**DOV MARROW** — `step-done`, from the hub's "The step is swept." (shipped; side-npcs.ts)
> "The ledger will say 'kept'. Sweeping is not keeping. The city cannot tell a broom from a rite and it will count yours." He almost smiles. "That is the city's problem. It is not yours. You swept a step."
[SF.STEP_TOLD; poi `shrine-1` kept; news "Someone swept the first shrine's step. The city counts it as kept. That is the city's problem."]

### side-organs-strait-toll — Strait toll
*Movement III, the Organs. Angels through the door, from Renn Coil (first, if Ord's map cut the water); the cold desk to pay or refuse, the toll plaque after. Plate `organ-strait.jpg`. Changes a standing: Earth, up or down. Sink: the tax.*

**RENN COIL** — `toll-offer`, from the hub's "The Strait toll." (shipped; side-npcs.ts)
> "The Strait charges every body that crosses. Six Bestand into the House of Earth. I collect it here." He turns the sheet to the Earth column. "Pay it or refuse it. Refuse and Earth takes a minus. I will not tell you which is right. I will write down which you did."
- ▸ "I will decide at the desk."
[offer `side-organs-strait-toll`]

**THE DESK** — `cold-desk` pay the Strait toll, `side:toll:pay` (shipped; side-pois.ts; six Bestand, sink tax)
> Six Bestand into the House of Earth. Renn Coil writes it in the column without comment. That is his comment.
✦ *Ore that will not strike. You paid a House to keep being ground.* (shipped; side.ts)
[SC.TOLL paid; Earth +2; news "Someone paid the Strait toll into the House of Earth. Earth stands taller."]

**THE DESK** — `cold-desk` refuse the Strait toll, `side:toll:refuse` (shipped; side-pois.ts)
> You refuse. Renn Coil writes a minus in the Earth column and does not tell you it is there.
✦ *A refusal is not free. Somebody's standing paid for it. You did not pretty it.* (shipped; side.ts)
[SC.TOLL refused; Earth −1; readiness +2; news "Someone refused the Strait toll. Earth took the loss and kept the bridge open."]

**THE PLAQUE** — `organ-strait` read the toll plaque, `side:toll:read` (shipped; side-pois.ts; branch by prior choice)
> *Paid:* Toll paid. The bridge does not remember who. The House of Earth does.
> *Refused:* Toll refused. The bridge stayed open. Somebody's standing paid for that. You did not pretty it.
[SF.TOLL_TOLD]

### side-organs-cable-quiet — Cable quiet
*Movement III, the Organs. Angels through the door, from Renn Coil (first, if Ord's map cut the light); one node kept in any organ, then the desk. Plate `organ-cable-dark.jpg`. Changes a POI: `organ-cable` quiet, for everyone.*

**RENN COIL** — `cable-offer`, from the hub's "The Cable hums." (shipped; side-npcs.ts)
> "The Cable hums because the Strait pays. Keep a node in the Organs. Any organ. Do not extract. Then come back and I will post a smaller number. It will be the first time."
- ▸ "I will keep one."
[offer `side-organs-cable-quiet`; the keep is the spine's `Q` at any Organs node, counted from the hour's start]

**RENN COIL** — `cable-told`, from the hub's "I kept a node." (shipped; side-npcs.ts)
> He posts it. The Cable number goes down by one. "Quiet. Not dark." He looks at the sheet longer than the number needs. "The Foundry will notice. It is fed by that hum."
✦ *Quiet was a keep. Dark would be a grave. You chose the one you can still hear.* (shipped; side.ts)
[SF.CABLE_TOLD; poi `organ-cable` quiet, for everyone; SW.CABLE_QUIET; news "Someone kept a node. The hum is less. The Foundry notices."]

### side-organs-foundry-dark — Foundry dark
*Movement III, the Organs. Angels who have studied the Foundry, from Renn Coil (first, if Ord's map cut the heat); the coals raked out, then the desk. Plate `organ-foundry-dark.jpg`. Changes a person: Renn leaves the desk for the dark Foundry with the first zero.*

**RENN COIL** — `foundry-offer`, from the hub's "The Foundry." (shipped; side-npcs.ts)
> "You read the Foundry. Heat without a nation." He writes a number and crosses it out. "Rake it out. The Cable drinks less. The number goes to zero. I have never posted a zero. Come and tell me and I will."
- ▸ "I will rake it out."
[offer `side-organs-foundry-dark`]

**THE FOUNDRY** — `organ-foundry` rake the coals out, `side:foundry:rake` (shipped; side-pois.ts)
> You rake it out. Heat without a nation, ended. The Cable hums a note lower. Somewhere a number becomes zero.
[poi `organ-foundry` dark, for everyone; SW.FOUNDRY_DARK; news "Someone raked the Foundry out. Heat without a nation, ended."]
[new, Phase C: every altar in the Nave flickers once, for everyone]
*Skipped when the Foundry is already dark (the spine's `Q`, yours or anyone's, III.2): the step closes on its own and the hour's line is Renn's.*

**RENN COIL** — `foundry-told`, from the hub's "The Foundry is dark." (shipped; side-npcs.ts)
> He writes a zero. He looks at it. "I have posted that number for three years and never seen the front of it." He picks up the card. "I am going to stand at the Foundry. Somebody who posts the number should see what zero looks like from the front."
✦ *Every furnace is a mouth. Every mouth was a place. He went to see what the place was.* (shipped; side.ts)
[SF.FOUNDRY_TOLD; Renn to the dark Foundry; news "The cold desk clerk left the desk. He is standing at the dark Foundry with the number."]

**RENN COIL** — `hub`, at the Foundry from now on (shipped; side-npcs.ts)
> He is at the dark Foundry with the number on a card. Zero. "I wanted to see what a zero looks like from the front."

### side-organs-second-column — The second column
*Movement III, the Organs. Angels after Ord's map, from Renn Coil; the backs of three plaques. Plate `plate-m3.jpg`. Changes a cult object: the second column.*

**RENN COIL** — `column-offer`, from the hub's "There is a second column." (shipped; side-npcs.ts)
> He unfolds the sheet. The second column has no numbers in it. "What each organ was. Before it was a number. I keep it folded because it is not honest; it is only true." He folds it back. "It is on the back of each plaque. Read all three. Then you will hold the half I leave out."
✦ *Ord wants the number honest. Renn keeps the number and the thing the number replaced, and cannot post both.* (shipped)
- ▸ "I will read the backs."
[offer `side-organs-second-column`]

**THE PLAQUE** — `organ-strait` read the second column, `side:column:strait` (shipped; side-pois.ts)
> Back of the plaque, in a hand that is not Safety's: 'A river. Boats with names on them. A ferry that ran on hours, not yield.'
[SF.COLUMN_STRAIT]

**THE PLAQUE** — `organ-foundry` read the second column, `side:column:foundry` (shipped; side-pois.ts)
> Back of the plaque: 'A hill. Cold. People climbed it to see the Strait. There was nothing to extract and nobody tried.'
[SF.COLUMN_FOUNDRY]

**THE PLAQUE** — `organ-cable` read the second column, `side:column:cable` (shipped; side-pois.ts)
> Back of the plaque: 'A street. Lamps that went out at night because people slept. Signal was a voice at a window.' The last line is not signed.
✦ *The number is honest. Honest is not the same as whole. You hold the half that was left out.* (shipped; side.ts)
[SF.COLUMN_CABLE; cult: The second column]

### side-clearing-seed — Seed
*Movement III, the Clearing. Angels with the garden buried, from Pim Ashe; a handful of it turned into the first seed ground. Plates `wreckage-garden.jpg`, `clearing-ring.jpg`. Changes a POI: `seed-1` seeded, for everyone.*

**PIM ASHE** — `seed-offer`, from the hub's "The garden is dirt now." (shipped; side-npcs.ts)
> "Dirt. That is the good outcome." He looks at the garden a long time. "Take a handful to the Clearing. Turn it into the seed ground. I cannot plant; I am not a Dweller. Anyone can turn earth. A seed is a promise you cannot cash. Make one anyway."
- ▸ "I will take a handful."
[offer `side-clearing-seed`]

**THE GARDEN** — `wreckage-garden` take a handful of the garden, `side:seed:take` (shipped; side-pois.ts)
> Garden earth. It was a hole in the first hour. It was wreckage in the third. It is dirt now. Dirt is the good outcome.
[SF.SEED_EARTH]

**THE GROUND** — `seed-1` turn the earth in, `side:seed:turn` (shipped; side-pois.ts)
> Garden earth into seed ground. It was a hole, then wreckage, then dirt. Now it is a place someone could stand. That is all a seed is.
✦ *A seed is a promise you cannot cash. You planted one with what a hole became.* (shipped; side.ts)
[poi `seed-1` seeded, for everyone; SW.SEEDED; news "Someone turned garden earth into the seed ground. A promise nobody can cash."; readiness +3]
*Skipped when the ground is already seeded (a Dweller's seed, pois.ts): the step closes on its own.*

### side-clearing-contest — Contest
*Movement IV, the Clearing. Angels with a House; the east seed ground held three times, the south-west one's ledger read. Plate `house-war.jpg`. Changes a standing: your House.*

**THE RING** — `seed-2` stand for your House, `side:contest:stand`, three times (shipped; side-pois.ts)
> *First and second:* The ring asks whose you are. You say it. The ring wants to hear it again.
> *Third:* The ring asks whose you are a third time. You say it. The ring writes it. Tithe and omen. Never a bigger stick.
[SF.CONTEST_HELD ×3; your House +2; news "{House} held the ring. Tithe and omen, never a bigger stick."]

**THE RING** — `seed-3` read the ring's ledger, `side:contest:read` (shipped; side-pois.ts)
> Four columns. Who stood, and how long. It does not write who won. The ring does not think that is its job.
✦ *Friends split here. Tithe and omen, never a bigger stick.* (shipped; side.ts)
[SF.CONTEST_READ]

### side-clearing-last-season — Last season's hole
*Movement III, the Clearing. Angels; the south-east seed ground faced, not looted, then Halla Voss. Plate `failed-passing.jpg`. Changes a cult object: last season's mark. The hour opens with the movement, before or after the glass; the ground reads differently each side of it.*

**THE GROUND** — `seed-4` face last season, `side:season:face` (shipped; side-pois.ts; before the glass is faced, III.7)
> South-east of the seed ground the asphalt is a different colour. Last season's Passing failed here. The hour went by. The city kept the weather. You do not loot it.

**THE GROUND** — `seed-4` face last season, `side:season:face` (revised; side-pois.ts; a new branch once the glass is faced, F.FAILED)
> South-east of the seed ground the asphalt is a different colour. Last season's Passing failed here, the glass says. The hour went by. The city kept the weather. You do not loot it. Somebody already did.
[SF.SEASON_FACED]

**HALLA VOSS** — `season-report`, from the hub's "Last season's hole." (shipped; side-npcs.ts)
> "A front that already went by." She has no slip for that. "I read what is coming. You faced what came and did not. Keep the mark. It is the only omen on the Kerb that cannot be wrong."
✦ *A front that already went by. You faced it and did not loot it. That is the only omen that cannot be wrong.* (shipped; side.ts)
[SF.SEASON_TOLD; cult: Last season's mark; readiness +2]
