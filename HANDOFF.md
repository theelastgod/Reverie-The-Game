# HANDOFF — Reverie: The Game (rebuild)

State of the rebuild. Read `DESIGN.md` first, then `.rebuild/CONTRACTS.md`
(shared-sim signatures) and `.rebuild/CLIENT.md` (client contract). The master
brief is `PROMPT.md`. This document replaces the stage log of the prototype.

## Where things stand (2026-10-04)

- **Built and verified on this branch:** the whole campaign (four movements,
  nineteen decisions, about 59 minutes on the spine; see Length below) plays
  over the wire on a fresh world; 652 tests (2026-10-04), the session smoke, the campaign smoke and the
  Playwright render check (desktop and phone, through a real dialogue
  with Nara Vale, a node, and the phone's touch stick with its strike and
  heavy) pass; the Worker bundles
  (`wrangler deploy --dry-run`: 558 KB, 147 KB gzipped, 94 site files, the
  bindings WORLD, LOG, ASSETS and the `ANGEL_*` variables empty). The server
  since the 26th: a message and join budget, an hourly sweep of stale guest
  bodies, a world record without bodies and body records written only when
  they change, each reviewed and security-reviewed (see Done). The dev
  tools are current (vite 8.3, vitest 5, wrangler 4.146, TypeScript 7 and
  Phaser 4.2 since 2026-10-02; `npm audit` reads 0 for production and dev
  dependencies alike and `npm outdated` lists nothing). Since 2026-10-01 every
  push runs the typecheck, the tests, the client build and a dry-run
  bundle on GitHub's runner by itself (`.github/workflows/gates.yml`, no
  secrets, nothing deployed); the Actions tab shows the mark on each
  commit, and the first run passed in half a minute. Since 2026-10-02 a
  second job on the same push serves the built client from a local
  Worker on the runner and runs the session smoke and the render check
  there, keeping the screenshots as an artifact. Since 2026-10-02 the
  client's first request (the generated-asset manifest) is answered, by
  an empty manifest committed until the Stage B pull overwrites it, and
  the render check fails on any file the city's own origin fails to serve.
  On 2026-10-04 a sweep for defects a player would meet (six lenses, each
  finding reproduced and then challenged by a skeptic) confirmed and
  fixed twenty-one, and a second round with six new lenses eighteen more
  (see Done).
- **Two steps only you can take** (Backlog 1 and 2 have the detail): the
  Stage B art waits on the results host being reachable from a machine that
  runs `node scripts/pull-generated.mjs`; the deploy waits on either the
  **Deploy the city** workflow with the two repository secrets set, or
  `git checkout claude/game-rebuild-fable-ccwl6i && npm ci && npm run
  d1:migrate:remote && npm run deploy` from any machine where `wrangler` is
  logged in. The workflow needs one thing first: GitHub registers workflows
  from the default branch only, and `main` has none, so until this branch
  is on `main` neither the Actions tab nor the API can start it (checked
  2026-09-27: the API answers 404). `main` is an ancestor of this branch, so
  `git push origin claude/game-rebuild-fable-ccwl6i:main` fast-forwards it
  with no merge; that push is yours to make, never the routine's. The
  account's Worker still runs the build of 2026-09-25; once this branch
  is deployed, `GET /health` on the city names the commit it runs.
- **One call for you** (Backlog 5): no heal stands between the intake and
  Desk Three, so a worn body meets the desk at about 44 hp; a player who
  strikes first or dodges wins, and the bot falls about one run in five.
- **The rest of Phase C waits on you** (Backlog A, 2026-10-03): the Houses'
  lost hour at Ord's map needs which House is the water's, the heat's
  and the light's, and what a House's "hour" is (a hold of the House war,
  or standing); the listing's seller "exposed by Quill for everyone who
  asks" needs the words of the asking (her answer is written and in the
  game after the board). Also open, each recorded where it landed: the
  dark-light switch per city or per season, whether the city's figure
  moves the launch's hour, and whether the clerks' descent lasts an hour
  from the light (as built) or to the end of the clock hour.
- **Length, since the script landed** (Backlog 5–8, 2026-10-03): the
  spine alone now runs about 59 minutes over the wire (I 17.5, II 13.2,
  III 18.3, IV 9.8) with 19 decisions, up from 48. Movement III is past
  its 10–12 minute proposal at 18 because the script's third hour (the
  room behind the glass, Caul, the forge's reversal) is long; nothing was
  cut, since the synopsis wins. Whether its target moves or the third
  hour is trimmed is yours to say.
- **Four small calls from the player-defect sweep** (2026-10-04): a
  guest's Movement I purse follows the body into its Angel (PROMPT §5.1
  says "wiped or capped at lock"; a skeptic found the documents and the
  verified spine rely on it, so it stands; wiping it would close the
  freeze to anyone who links at the lock). Ord's after-map line says
  "You refused the water" to every body once anyone has refused the
  Strait (it is SCRIPT.md's wording; whether he should say "Someone" is
  yours). A raised flag on the hot street now makes the news once a
  body per five minutes (an abuse guard on the marquee and the public
  log that no document asks for; `FLAG_NEWS_GAP`, revert it if you want
  every raise). The funeral desk sells readiness, +2 for 5 Bestand, as
  often as it is paid (a sink by design, or a purchase of the Passing?).
- **From the sweep's second round** (2026-10-04): an enemy that fells a
  body now lets it go (with every other enemy on it) and walks back to
  its post; before, it chased the woken body and could stand pinned
  inside its leash, blind to everyone, and a second guest felled Desk
  Three without taking a hit. The skeptic called the old way the
  contract's (CONTRACTS said the swing recovers on the same body) and
  the change yours; it is kept because the pin is the same harm as a
  confirmed finding (an enemy stuck walking home), and it is
  revertable (`letGo` in world.ts and its two callers in combat.ts).
  A held Clearing that cannot be contested again is joined rather than
  looked at; the confirmed case is a spent reserve (the ring was locked
  for the season), and I extended it to the half hour the asphalt sets,
  which was a wait. Judged intended and left as they are, each yours to
  change: a failed rite closes a live contest ("The hole closes"); a
  Movement I guest's confronted hour ends Halla's sales for the city;
  the Officer stands wherever the latest census or honest answer put
  him; a Witness's Blitz traces offer Bury and Loot (verbs follow
  sight); the last hold of a season loses its omen to the roll on the
  same tick; the freeze desk says "a freeze holds" after the freeze has
  lapsed; a purse of one banks nothing (the floor is the contract's).
- **From the sweep's third round** (2026-10-04, yours to decide): a
  seed does nothing yet. A Dweller's K and the ring's four seed grounds
  both plant one, and the seed ground's line (SCRIPT.md IV.4) promises
  "The Clearing will hold a little longer for it", but `clearing.seeds`
  and the grounds' `seeded` state are read by nothing but the drawing.
  The smallest mechanic that keeps the line: each seed in the ring adds
  a few seconds to an opened hole's contest (`endsAt`); the season roll
  keeps the seeds today. Say the word, or have the line cut.
- **The story is now `SYNOPSIS.md`** (your brief of 2026-10-02, the
  afternoon). The enemy has a name and a shape: the Concern, the company
  that owns the numbers, and Anselm Caul, its chief, who is a guest (he
  never went under, so he cannot hear a hint, enter the Care or the
  Clearing, or be struck, and he bought the ground he could not
  prepare). The party has wants and lies; Ione Kade's word is the first
  Reverie and the last; the four movements keep their ids and gain the
  conspiracy; the four Passing outcomes are written with Caul's
  recorders at the lip of the ring. Backlog A is the rebuild around it,
  in four phases, and the routine has begun: Phase A's Movements I and
  II are in the running game (the Concern named in the first two hours'
  lines, Caul's body at the back of the altar aisle, the waking hint in
  the Care, the lease on the hall plaques, "funded by A. Caul" on the
  freeze form, the oval light speaking by serial at Vesper's desk), and
  Movement III (the catalog named at the Cable, Ord's figure at the
  glass, the recorders in last season's hole, Quill's print with your
  serial in the margin and the plate she would not cut), and Movement
  IV (Ione's voice known from the crate and her word said first, Nara's
  three numbers and her confession at the ring, Caul's body on the
  Grid's gate above it, the hijack with a margin). Phase A is complete.
  Phase B, the new beats, has begun: the altar's reel in the Nave; the
  room behind the forecast glass, where Caul sits across the desk in
  Movement III and offers the reader's post or the light to put out; and
  the forge, where the print with your serial is listed on the Grid
  through the market or pulled off it, and either moves the Clearing's
  price for everyone; the lip of the ring, where Caul makes his last
  offer of the hour as a signature, for nothing, and says his word on
  the rite after it; and the rite's remainders, Nara staying at the ring
  after an Absence and the altars playing a marked Angel their own sold
  sky; and the Kerb's ovals, through which Caul addresses the city when
  a bought hour does not come; Phase B is done, Quill's lines at the
  vans having landed with the launch. Phase C, the shared world,
  has begun with the weave: darkening the Foundry flickers every altar
  in the Nave for everyone, Ord's figure goes on the marquee, and the
  Appearance's blank tape is news; and the forecast glass carries the
  launch as a date with a count, until enough lights go dark behind it;
  and at that moment, once a season, the launch itself opens for an
  hour for the whole city, with the cable enforcer on shift at the
  Organs' node, the vans' doors open on the recorders, and Quill by the
  vans keeping the lights on; and a light put out behind the glass now
  sends the hour clerks down the Kerb's stair for the hour, for
  everyone; and when the launch's hour is out the vans leave and the hot
  street is a street again, until the next van or pull heats it; and a
  reader of the glass carries it in the field notes, as Caul promised.
  Phase D, the side hours re-pointed to the script, is done: every line
  the appendix tagged revised is in the game, and the third altar has a
  screen of its own.
- **The script is `SCRIPT.md`** (your request of 2026-10-02, the evening:
  "Write the script of dialogue"). Every spoken line of the four
  movements, scene by scene in the synopsis's order, with the speaker,
  the node, the choices, the Winke, Caul's lines, the things that speak,
  the four Passing endings and the credits; then every side hour whole.
  Each line is tagged shipped (in the code today, word for word),
  revised (the shipped line with a change, said in a few words) or new
  (not yet written), so the routine's Phase A, B and D work is to make
  the code say what the script says, line by line. It is inside the
  content lint's roots.
- **The hourly routine** probes the two hosts, then takes a Backlog item or a
  discovered one, with tests, the gates, the smokes, a commit and a push to
  this branch, and reports here and to you. `main` is never pushed.

## Architecture pointers

- `DESIGN.md` — how the rebuilt code satisfies the brief: one city map, the
  player/world/snapshot shapes, controls → messages, content layout, art map,
  quality gates.
- `.rebuild/CONTRACTS.md` — exact exported names and signatures for every
  `src/sim/**` module. Modules were written against it in parallel.
- `.rebuild/CLIENT.md` — client files and the seam between scenes/net and HUD.
- `src/sim/{types,constants,map,protocol}.ts`, `src/sim/content/ids.ts` — fixed
  contracts. Persistent ids do not change once shipped.
- `server/src/index.ts` — the Durable Object shell (`ReverieWorld`, object name
  `city-v2`, keys `world:v2` / `player:v2:<token>`), `server/src/clock.ts` — the
  elapsed-time fixed-step clock.

## Done

- Shared sim contracts and the level file (`map.ts`: eight districts, gates with
  personal requirements, walls, patches, every POI / node / NPC / enemy position).
- Server: cookie sessions, same-origin check, hibernation restore, single-tab
  ownership (4001), checkpoint before broadcast, alarm-driven 20 Hz steps,
  stale-intent expiry, per-viewer `snapshotFor`, `/health`.
- Live scripts: `scripts/smoke-world.mjs` (protocol v2 session smoke),
  `scripts/smoke-campaign.mjs` (Movement I over the wire, guest lock, link 7777,
  going under), `scripts/render-check.mjs` (Chromium screenshots + frame pacing).
- Landing page in `site/` (the game only), README rewritten.
- Engine, content and client modules are landing from their own workflows;
  see the file list in `DESIGN.md` §1.
- Sim review fixes (2026-09-25): the storm press reads no kit and scales by
  climate band; the dash is a window against people; the private yield pays
  the Organs door into the `door` sink and is decided once (a verb on the world
  closes a stale dialogue, one-shot choices are gated); a market buy needs the
  seller on the Grid; the Clearing contest is one stance per Angel per contest,
  recounted from who stands in the ring, re-openable after `WAR_PERIOD`, with a
  reserve that refills while closed; seasons roll (`SEASON_LENGTH`), the
  Passing rite is once per Angel per season, every shard starts with last
  season's hole; aura addresses (party and operators do not look up at a dark
  aura, sacred doors dark or dim in fat weather, a dark aura farms +10%, prints
  and listings wither it, Glamour counts +10); Winke resolve by school with
  density for Divinities and Wink seeds; the serial's log writes back as a
  history mark the Ruin-angel kit reads; ruin duels are offered and answered
  at a wreckage and close the ring to third bodies; the Officer stays reachable
  for guests; side-hour verbs win their key while live; the desk and stipend
  copy speak the city's register.
- World surface (2026-09-25): wall faces from the wall texture over a
  rectangle cover of the wall tiles (no per-frame masks), rain on the Wet Grid
  by weather band, shrine light pools, walk bob and lean, idle breath, hit-stop
  squash and a shadow under every body.
- Side hours surfaced (2026-09-25): the snapshot carries every active side
  quest's current step with the quest title and a resolved target (newest
  first, capped at six); the journal lists them with live bearings and the
  world draws a paper ring at each target.
- Ledger panel (2026-09-25): L toggles it; it opens itself at the claims desk
  and the listing board. Holdings grouped cult / exhibition / paper, claims
  with their hold clocks and the desk's F / E / Q, the Grid's listings with
  BUY for other Angels' items you can afford and CANCEL for your own, and a
  price field to list an exhibition item. Guests see what they hold and the
  refusal.
- PvP surfaces (2026-09-25): an events strip under the top row shows the
  House war (site, who holds, countdown; a next-war countdown inside five
  minutes), the Clearing contest (keep / extract counts, dwellers, countdown,
  a two-tone bar) and your ruin duel (offered or live, the opponent, the
  clock); the hot street draws its boundary while hot, the whole Wet Grid in
  meltdown weather.
- Combat readability (2026-09-25): the Intake Clerk has twice the health, so
  a first fight shows two telegraphs and a heavy interrupt pays (the bot's
  fight went from 3 s to 7 s); telegraphs are wedges aimed at their target
  over a faint reach ring; an interrupted swing shows a longer sky window and
  a burst; hp changes tick as cold ledger numbers over the body; enemies
  differ in silhouette and gait (wardens plod, enforcers hurry).
- Opening measured (2026-09-25): the campaign smoke reports bot time by phase,
  words shown by source, decisions, and a first-playthrough estimate.
- Shape migration (2026-09-25): `src/sim/migrate.ts` rebuilds a checkpoint
  from any earlier build over the current defaults (nodes, npcs, pois merged
  by id; enemies and transient player state rebuilt; every scalar type-checked;
  unknown keys and ids dropped) and stamps `shape` on every checkpoint; the
  server restores worlds and players through it. Verified live against the
  oldest local checkpoint.
- Quest givers marked (2026-09-25): `NpcView.offers` says a person has a side
  hour to hand this viewer: a line in their tree whose gate passes and whose
  effects (its own, or the node it opens) start a side quest the viewer has not
  started and may hold; a guest only a guest-legal one. The candidate lines are
  found once per person, so the check per snapshot is a few gate closures. The
  world draws a breathing paper diamond over such a person and adds "· has an
  hour" to the label; the minimap rings their dot. Party members keep the gold
  dot.
- Music and a trailer (2026-09-25, owner-authorized Higgsfield spend): seven
  instrumental tracks (title theme, Nave underscore, combat pulse, burial
  elegy, Grid underscore, Clearing rite, a 32 s trailer cue) and a 30 s
  16:9 trailer cut in the Higgsfield sandbox from four new image-to-video
  clips (Nave, hot street, Kerb, arena) plus four existing loops, with paper
  captions in the game's register and the cue mixed under. All rows are in
  `.rebuild/generated-manifest.tsv` (72–83); the trailer itself is an uploaded
  media file, not a generation. Nothing is wired into the client yet (see
  Backlog 1).
- Opening beats (2026-09-25): Movement I has fifteen steps. Desk Three is the
  second fight (a data `fallFlag` on its spawn credits every participant, the
  way the Intake Clerk's kind does); the second node follows and the city
  reads the pair (`C.SECOND_NODE`: keep / extract / split). Quill's first
  conversation ends in her offer: print your face (an exhibition item that
  decays) or keep the name; Ord's weather answer opens his second ledger:
  enter a line (a news item everyone sees) or stay off it; both remember it
  in their later lines. The memorial recorder must be heard (F) before it can
  be decided at the crate or with Nara. The campaign bot fights Desk Three,
  takes the second node (or the third when the second is spent), answers both
  offers, and listens before deciding. Ord reads the pair back once from his
  later line; Nara notices the print in your coat, or the name you kept.
- Writeback log (2026-09-26): a D1 binding `LOG` with one additive
  migration (`server/migrations/0001_events.sql`, an append-only `events`
  table). `server/src/log.ts` diffs two world states into events (link,
  wallet, under, burial, claim.filed, claim.settled, passing, credits, news)
  with public names only; `server/src/logSink.ts` queues them (500, oldest
  dropped and counted) and flushes in batches of 100, keeping the queue on a
  failure and warning once a minute. The object diffs only when it
  checkpoints and hands the flush to `waitUntil`; without the binding nothing
  is written. `GET /log/recent?kind=passing|news|burial|link&limit=1..50`
  serves the public kinds newest first with a 15 s cache; claims and wallets
  never leave the table. `npm run d1:migrate` applies the migration locally;
  the deploy needs `wrangler d1 create reverie-log`, its id in
  `wrangler.toml`, and `npm run d1:migrate:remote`.
- The snapshot diet, protocol v3 (2026-09-26, backlog 4's first step). The
  object sends a `fast` frame every step (`now`, `tick`, `you`, `players`
  as motion only, `enemies` as views with positions to a tenth, `prompt`)
  and a `slow` frame carrying only the sections that changed (`gestell`,
  weather, `frozen`, `district`, `npcs`, `nodes`, `wreckage`, `graves`,
  `pois`, `history`, `failed`, `houses`, `clearing`, `passing`, `market`,
  `news`, `objective`, `sideObjectives`, `notices`) plus the roster entries
  (who another body is) the viewer does not hold yet or that changed;
  checked every 5 steps, at once after the viewer acts, at once when the
  bodies in view change, in full after a hello. `src/sim/frames.ts` splits,
  merges and tracks (`SlowTracker`, per viewer, by section signature and per
  roster entry); `WorldSocket` folds frames into one `Snap` so the
  renderers, the HUD and the audio read what they always read; the smokes
  and the load check fold the same way. `EnemyView` replaces `Enemy` on the
  wire (no participants, home or respawn). Measured on this container: per
  viewer per broadcast 4.3 KB at 20 bodies (was 14.3), 7.2 KB at 40 (was
  20.3), 14.4 KB at 80 (was 31.8); 40 bodies now hold 20 Hz (alarm late
  mean 8 ms, worst 80 ms) where before the worst alarm slipped to 145 ms;
  80 still fall behind (interval mean 117 ms). Next levers, in
  `.rebuild/ZONES.md`: the 36-character ids are now about a third of a
  crowd's fast frame, `you` still rides whole, then zones.
- The tax window as a decision (2026-09-26, backlog 6): a spine step
  `tithe` between the freeze and the history. At the Annex tax window (7,22),
  an Angel who has read their hall decides this hour's tithe once: E pays it
  now (`TITHE_COST` Bestand into the `tithe` sink, one standing to their
  House, `C.TITHE` paid), Q lets it ride (`C.TITHE` rode; the node takes it
  at the weather's rate); the window's read line remembers. Movement II is
  ten steps. The smoke's Movement II walks the window on the way back from
  the desk and pays when the purse allows (the window also carries a side
  hour's verb on E, so the smoke picks the spine's verbs by choice).
- Movement II beats (2026-09-26, backlog 6): two spine steps on the route.
  `sexton`: Pim Ashe beside the shrine meets an Angel at the wake (a `wake`
  node whatever they said to him before: you are a line in the Care's book,
  guests get nothing, the twelve numbers in his coat), then his hours as
  before. `officer`: Corvin Slate stops an Angel who has read their hall in
  the Annex corridor (`corridor`): what a freeze buys in Safety's own
  words, and a choice, `C.ANNEX` held or hungry, that the desk remembers:
  a signature after hungry or a refusal after held gets "You said … in the
  corridor. Safety keeps both." Flags `F.TALKED_SEXTON`, `F.TALKED_OFFICER`;
  Movement II is nine steps. The smoke's Movement II talks to both and
  asserts the desk's line.
- Movement II over the wire (2026-09-26): `scripts/smoke-campaign.mjs
  --movement=2` (`npm run test:campaign:2`) goes on from the wake: rests at
  the Care shrine, reads the House of Mortals hall, walks the Nave to the
  Annex and refuses the freeze, walks back and faces the history at the
  shrine, walks to the Wet Grid, reads the listing board, takes Vesper's
  private yield, and reaches Movement III with Cold as its current; it
  crosses the Care, Annex and Wet gates on foot and prints a second
  `measure:` block. PASS on the first run. The numbers are in Verified and
  Backlog 5.
- A security review of the branch (2026-09-26; a finder over every trust
  boundary, then a false-positive pass per finding): nothing at high
  confidence. Two things below the bar were fixed anyway, before a deploy.
  The wallet challenge carried no domain, URI, chain or address, so a
  signature phished on a lookalike page (plain text, nothing for the wallet
  to compare) could have sealed a stranger's body as the victim's Angel;
  low while nothing is armed, but the challenge now has the Sign-In with
  Ethereum shape (`<host> wants you to sign in with your Ethereum account:`
  / the address / the purpose line / URI, Version, Chain ID 8453, Nonce,
  Issued At, Expiration Time), `POST /wallet/challenge { address }` issues
  it for that address, and `/wallet/link` rebuilds it from the request's
  own origin and the stored challenge and requires the signer to be that
  address; a wallet shows the domain and can warn, and a signature over
  another site's text or a challenge issued for another address seals
  nothing (tests for both). And `applyTruce` required no flag on the
  caller, so any Angel within 96 px could unflag a flagged neighbour and
  freeze a duel; it now needs the caller flagged and not under a truce
  (the prompt's rule, kept by the server; a test presses it from outside).
  The review confirmed sound: cookie sessions and the same-origin checks,
  the packet validator, the takeover, the parameterized D1 log and its
  public kinds, every verb acting on the session's own body, the market
  and claims desk rules, the snapshot's projection of other bodies, and the
  client's DOM (textContent only, no eval, no location reads). Noted, not
  changed: the object accepts any well-formed UUID as a session token it
  never minted (fixation would need a cookie planted on the same
  registrable domain, which `workers.dev` on the public suffix list
  prevents; revisit on a custom apex), and a serial is never re-checked
  against the chain after linking (a holder could seal several saved
  bodies by linking while the others are offline; closed on 2026-10-04 by
  the player-defect sweep: the server's `serial:v2:` index names the body
  that holds a serial and a saved body another holds comes back unsealed;
  a re-read of the chain at the join, for a sale, still waits on Backlog
  3's holder source). Not in the review's
  list, found later the same day: a socket could make the object
  checkpoint and broadcast at any rate; bounded since (see the object's
  message budget, below).
- A review of the day's diff (2026-09-26, `42ba668..HEAD`, medium effort)
  found one real defect and one line: the ring's `prepare` and `join`
  verbs did not wait for the gate, so an Angel who prepared the ground
  before answering Ord could never reach his `gate` node (Ord's route put
  the ring first once the ground was kept), `C.PARTY` was never set, and
  the sequential `party` step stalled Movement IV for good. The ring's
  verbs now wait for the party decision (the stand line says where it is
  decided), Ord's route puts the gate before the ring, and his ring line
  says he counts from the gate when you stood alone. A test stands an
  undecided Angel at a set ring and at an open one, presses prepare to no
  effect, answers Ord, and prepares. The review found nothing else in the
  shared views, the frame cache, the tracker's identity skips, the
  encoder's key order, the ring's ground or the Movement II gates.
- The Care gate (2026-09-26, backlog 8): a third Movement IV decision on
  the walk from Ione Kade to the ring. Ord waits with the ledger at a new
  station just inside the Clearing at the Care gate (`station:ord-gate`,
  38,67) from the mortality act on, and asks who stands in it: the party
  with you (`C.PARTY` with: readiness 4, Ord walks in behind you to the
  ring once the ground is kept) or alone (restraint 8, which is the number
  the Safety hijack reads; Ord counts from the gate, and the city writes
  the rite's news under "name, alone,"). A spine step `party` between the
  act and the preparation; Movement IV is six steps. Nara stays at the
  ring either way; she said she would. The spine test decides it both
  ways and reads the news; the smoke answers "with".
- Movement IV beats (2026-09-26, backlog 8): the number is read before
  anyone stands. The journal's `prepare`, `stance` and `passing` steps
  carry "Readiness N of 60" (and, at the Passing, whether the hour can
  open, whether a trace is possible, or that it is short and where the
  rest is); Nara Vale stands at the ring from the mortality act on, before
  the ground is kept, and her `brink` node reads the number against the
  floor (`F.BRINK`); Ord's `ring` line reads it too. The first stance is a
  spine step: `stance` between `prepare` and `passing` (E keeps, Q
  extracts; done on `C.CLEARING` or a vote in the live contest). Movement
  IV is five steps. Found by the smoke on a reused world and fixed: the
  ring's `prepare` verb set `F.PREPARE` whether or not the engine's open
  op took (it refuses within `WAR_PERIOD` of the last opening, with the
  reserve spent, or over a live contest), so an Angel could be "prepared"
  at a closed hole. The ring's verbs now follow the hole: `prepare` only
  on a set, unspent ring; `join` (the flag without a second contest) when
  another Angel's hole is open; `look` says how many seconds the asphalt
  has left to set, or that the reserve is spent. Four tests pin the four
  grounds. The smoke prepares or joins as the prompt offers, and on a
  world whose last hole is still setting it notes the rite skipped and
  passes partial; a full Movement IV run wants a fresh local world (stop
  the Worker, delete `.wrangler/state/v3/do/reverie-the-game-ReverieWorld`).
- Movement IV over the wire (2026-09-26): `scripts/smoke-campaign.mjs
  --movement=4` (`npm run test:campaign:4`, 600 s deadline) goes on from
  Quill's forge: down the Wet Grid through its Clearing gate, across the
  Clearing to the Care gate and Ione Kade's bench, takes the last word (she
  is gone from the snapshot after), back to the ring, prepares the ground
  with the party willing, stands for the Passing, and reaches the credits
  (movement 5, `F.CREDITS`); it prints the outcome, the readiness it stood
  with, the current, the party and Gestell, then a fourth `measure:`
  block. PASS on the first run. The numbers and what they say are in
  Verified and Backlog 8.
- Movement III beats (2026-09-26, backlog 7): three stops on the route.
  Ord's map is a decision: after drawing it he asks where you would cut
  the process (`C.MAP`: strait, foundry, cable, or whole); closing without
  an answer draws nothing, each answer draws the map (`F.MAP`) with its own
  line, Ord's later text starts from it, and Renn Coil at the cold desk
  reads the entry: he names it in his hub and posts the cut organ's hour
  first (the other two organ hours wait until that one is offered; drawn
  whole, or without a map, they come as they are). Nara at the garden:
  the burial verb opens her `garden-plate` node (she kneels; a number on
  the plate or a blank one, `C.GARDEN` numbered or unnumbered; numbered
  goes into the Care's book as news, unnumbered thickens the aura by one);
  a player who closes it meets it again from her, and her buried line
  remembers the plate. The hour bell: a spine step `bell` between the
  garden and the glass (`F.BELL`; the strike's line names the way to the
  glass and the omen-reader hearing it), which also wakes the House of
  Sky's side hour, whose gate is the struck bell. Movement III is eight
  steps. The smoke's Movement III answers Ord (the water), numbers the
  plate through a new `answer()` helper for a verb-opened dialogue, and
  walks the bell through the row-6 wall's gap before the glass. Numbers in
  Verified and Backlog 7.
- The step's shared views (2026-09-26, backlog 4): `stepViews(w)` in
  `snapshot.ts` builds once per broadcast what every viewer sees the same
  (public shapes, enemy and node views, pois, market, news, clearing,
  passing, frozen, history by serial) plus a frame cache (`frames.ts`:
  each body's split and each object's JSON for the step); `snapshotFor(w,
  id, step)` takes it, `splitSnap`, `SlowTracker.diff` and the new
  `encodeFast` use it, and the object makes one per broadcast. Sections
  that read one unchanged world section keep their identity across steps,
  so the tracker reads "unchanged" off identity without a stringify (no
  version counters: identity is the version). For that the object now
  replaces the world's collections on a join or a close (`withBody`)
  instead of mutating them; a body that joined between two frames was the
  first thing the new views caught (missing from the others' fast frame,
  the frame threw and the socket closed), and a server test now joins one
  between two frames. In one process at 80 viewers a broadcast fell from
  23.3 ms to 4.8 ms mean (`npm run bench`, `src/sim/broadcast.bench.ts`,
  4.8× less compute, identical bytes); the local 40-bot check now passes
  three runs in five (worst alarm 80–131 ms, was 159–220 and failing);
  the local 80-bot check cannot rank the two through the dev proxy (see
  `.rebuild/ZONES.md`). The campaign smoke's intake fight now hunts the
  clerk wherever a load run left it and names the clerk's state when it
  does not fall.
- The Stage B pull rehearsed (2026-09-27): `scripts/pull-generated.mjs`
  had never run against anything, and it is the first thing to run when
  the results host opens (Backlog 1), so a failure then would cost the
  hour. It now takes `PULL_ORIGIN` (every url's origin replaced),
  `PULL_MANIFEST` and `PULL_OUT`, and `server/src/pullGenerated.test.ts`
  stands up a stub of the results host (a 1200 by 2000 portrait, a
  sprite that is mostly empty around a 100 px square, a video and an
  audio file as bytes, and a missing file), runs the script as a child
  process, and checks that the portrait lands as a jpeg within 640 by
  1136, the sprite is trimmed to its ink, the video and the audio arrive
  byte for byte, the missing file is one counted failure that fails the
  run, and `manifest.json` lists the four that landed with the images'
  sizes and zeros for the rest. The script's defaults are unchanged;
  the real pull is still `node scripts/pull-generated.mjs`.
- A security review of the day's server changes (2026-09-27, the
  message budget, the sweep, the join budgets, the world record and
  their review fixes, `8f2ccb8..0e0377b`; a finder over every untrusted
  input to its sink, at the >80% bar): no finding. Checked and sound:
  every `player:v2:` and `seen:v2:` key is built from a token that
  passed the session cookie's UUID check or from a key the sweep itself
  listed, and `CF-Connecting-IP` keys only the in-memory join map, never
  storage, a header or a body; the sweep deletes only a token not in
  `sessions` with a numeric stamp thirty days old on a record whose
  `guest` is true and `wallet` empty (a raw, unmigrated record with
  `guest` missing is kept; a missing stamp is written, not treated as
  stale), live tokens are always in `sessions` because the constructor
  rebuilds them before any alarm, and the object's input gates keep a
  join from landing between the sweep's list and its delete; a record
  under token T can only carry an id the server assigned to T's own
  session, and the socket attachment is server-serialized; an action
  inside the 20 ms window stays in memory and is written by the next
  checkpoint with no path by which another player reads or is charged
  for it; `/world` gained three integer counters and the 429 answer has
  fixed headers; the deploy step, the scripts and the HUD variable take
  no new untrusted input. The one thing a spoofed address could touch is
  the join bucket, rate limiting, which the review's brief excludes.
- Review fixes on the world record (2026-09-27, a code review of
  `127eb19`, seven findings, all taken): a body restored from its record
  bypassed the shape migration that every saved thing goes through, so
  a record from an older build (a missing field after a deploy) could
  throw on the first tick and stall the city; the constructor and
  `join()` now read a record through `migratePlayer`, which also drops
  the transient state (a dodge in flight, a kit, a duel) as the old path
  did, and a partial record fills in. A body back from its record counts
  as written (the migration is the same on every read), so a rejoin no
  longer rewrites the body it just read; the close writes the leaving
  body only when it changed and its stamp always; the constructor's
  three sequential reads are one multi-get; `saved` and `stamped` are
  updated after the put lands, so a put that threw leaves every body
  owed to the next checkpoint (a test throws one); the restore test now
  proves a restored body is not rewritten by forcing a checkpoint from
  another socket; README and CONTRACTS say the stamp is when the session
  was last seen live, not when the body was saved. Found on the way: a
  body's first tick hands it the opening quest and its notice, so a
  record saved before that is written once more, by design. And the
  campaign smoke's Desk Three recovery now extends the run's deadline
  by the minute it spends (a fall this evening walked back and passed
  the fight, then the 90 s deadline cut the run).
- Bodies out of the world record (2026-09-27, found reading the
  checkpoint): every checkpoint wrote `world:v2` with every body
  embedded, one row that grew with the population (a few KB a body; the
  2 MB row cap near 600), and every live body's record beside it, up to
  fifty times a second under actions since the budget: write
  amplification, and rows written are what the object is billed for.
  Now `serializeCity` writes the world with no bodies, and a checkpoint
  writes a body's record only when its object is not the one last
  written: the sim keeps a body's object when nothing changed (its
  step, its timers, its drift and its district each return the same
  object), so a body standing still at full restraint costs no row and
  a walking or fighting one costs its own. The constructor restores
  every hibernated socket's body from its record in one multi-get; a
  world saved before this change (bodies embedded) is the fallback, and
  a body that came that way is written to its record at the next
  checkpoint, so the old shape migrates itself on the first tick after
  a deploy. The close still writes the leaving body. Checkpoints on the
  Movement I smoke: 0.25 ms smoothed, from 0.44.
- Review fixes on the landing log, the bench and the phone HUD
  (2026-09-27, a code review of `343b351..8f2ccb8`, eleven findings,
  eight taken): the Deploy workflow's `wrangler deploy | tee` step ran
  without pipefail, so a failed deploy passed the step on tee's exit
  (an explicit `shell: bash` runs with pipefail); the workflow's build
  no longer typechecks a second time after the gates (`vite build` with
  `VITE_BASE`). The render check's process deadline is four minutes
  (two landing loads and two software-rendered city boots could pass
  two); the phone page now has the same error listeners as the desktop
  page, and a script error the phone page alone throws fails the run;
  the landing step guards the log route's shape. The bench's `frames`
  row asks `youDue` every step as the object does, so its curve covers
  that path (40 bodies: 1.85 ms mean, as before). The phone HUD's
  offsets under the top chips were a fixed 150 px, three rows; the HUD
  now measures where the chips end (`ResizeObserver` on `#hud-top`
  setting `--below-top` on `#hud`), so a fourth row (a long name, a
  weather chip) moves the minimap, the journal's tab, the ledger and the
  left column down instead of under the chips; CONTRACTS' `mergeFrames`
  line no longer contradicts the undefined rule; `siteLog.test.ts` says
  why it lives under `server/src` (`site/` is deployed as public
  assets). Three findings were not taken, on inspection: the
  `if (outcome)` guard in `applyPassing` is live (`PassingOutcome`
  includes `""`); the snapshot's `you` copy is always needed (every
  Player carries `notices`, the off-wire key); the test's location
  stands for the reason above.
- The load check under the join budget (2026-09-27): every bot of
  `scripts/load-check.mjs` joins from one address, so past the address's
  burst (30 at once, then 10 a second) the city answers 429; a bot now
  waits it out with a growing pause and tries again, as the client's
  backoff does, and the "connected" line says how many joins were
  refused. Proven with 45 upgrades opened at once from one address: 25
  refused and retried, all 45 connected in 2.2 s, the city's `refused`
  25. The sequential local check at 40 bots never trips it (2.6 s for
  40, under the burst plus the refill); the deployed runs at 120 and
  160 (Backlog 4) would, and now pass through it. The 120-bot run on
  this container times out on the join phase alone (each join's
  checkpoint and broadcast grow with the city), as `.rebuild/ZONES.md`
  already says of 80.
- The join budget per address (2026-09-26, found reading the last change
  again): one bucket for the whole city meant one script joining in a
  loop refused every honest player's join too, a denial the budget
  itself handed out. Now a bucket per address (`CF-Connecting-IP`, which
  the edge sets and a client cannot; "local" without it, as under
  `wrangler dev` and in the tests) is drawn first, 30 deep and 10 a
  second, so a script starves only its own address; then the city's own
  bucket, 60 deep and 30 a second, the backstop on what the object
  computes for joins in all (a join costs a checkpoint, a broadcast to
  every viewer and a hello). Past either the upgrade answers 429 with
  `Retry-After: 1` and `/world` counts `refused`. Address buckets that
  are full again are forgotten once the map is past 1024 entries, so a
  sweep of addresses cannot grow it without bound. `/log/recent` was
  checked for the same reason and already carries `max-age=15`, so the
  edge absorbs a read flood there.
- Review fixes on the budget and the sweep (2026-09-26, a code review of
  `8f2ccb8..3305f22`, nine findings, all taken): joins are budgeted for
  the whole object (30 deep, 10 a second, `draw()` shared with the
  socket buckets), since a session cookie is minted for free and a
  reconnect loop would have bypassed the per-socket bucket while each
  join cost a checkpoint, a forced broadcast and a hello; past it `join`
  returns null, the upgrade answers 429 with `Retry-After: 1` (the client
  already backs off 1–10 s), and `/world` counts `refused`. An oversize
  message spends its token and is counted as dropped (it was neither). A
  socket replaced by a newer tab drops its bucket (it leaked). The seen
  stamp is written by a session's first checkpoint in an instance and by
  the close, not by every checkpoint (that doubled the keys in the hot
  put for a value read thirty days later). The sweep's clock and cursor
  live in `sweep:v2` so an evicted instance carries on from the page
  after the one it read (in memory, every visit restarted at page one
  and pages past the first were never reached); a new city waits an
  hour before its first sweep instead of sweeping on its first tick; the
  sweep runs after the next alarm is armed and inside a try, so a storage
  error in it can no longer leave the tick dead with `ticking` set.
  `dirty` and `owed` were one bit: `pending`, read once at the top of
  the alarm and cleared by any broadcast. The put and delete key limits
  the review raised do not apply: the object is SQLite-backed
  (`new_sqlite_classes` in `wrangler.toml`), which the review confirmed
  against a probe Worker; `SWEEP_PAGE` carries the note. Also settled:
  the render check's three page errors are the container's proxy
  certificate on Google Fonts (twice) and the manifest gate's 404 on
  `assets/gen/manifest.json`, absent by design until Stage B lands; both
  pages declare their icon, so no favicon request is made. And the
  campaign smoke's Desk Three fight recovers from a fall: the bot enters
  it worn by the intake (about 44 hp against a desk that hits for 14),
  and twice in a row this evening it fell, respawned at the spawn, and
  the hunt's straight walk at the desk stuck on the pillar at (9,38)
  while the desk waited at its leash (the diagnostics read "bot at
  423,1881 hp 100, desk aggro hp 22 at 828,1880"; the third run on the
  same code passed, and a `TRACE_HUNT=1` trace shows the fight second
  by second). The smoke now notices a fall or a body far from the desk,
  waits for the respawn, walks the lanes back (5,36 → 11,36 → the desk
  lane) and hunts again; the desk keeps the damage it took.
- The sweep of saved guest bodies (2026-09-26, found reading the storage
  keys): a saved body outlives its socket so a guest can come back, and
  nothing else ended it, so every guest who opened the city once left a
  `player:v2:<token>` record for good, a few KB each, with no bound on
  how many a visitor (or a loop minting sessions) could leave. Now every
  checkpoint and every close write `seen:v2:<token>` (the wall clock)
  beside the record, and once an hour the alarm sweeps one page (64) of
  saved bodies: a live token is skipped, a record from before the stamps
  is stamped now and enters the clock, and a guest that bound no wallet
  and was not seen for thirty days is deleted with its stamp. An Angel's
  body (a serial) and a bound wallet's are never swept: they are the
  owner's progress. A cursor walks the whole set a page at a time and
  starts over at the end, so the sweep never weighs on a step; the count
  is `swept` on `/world`. Wallet challenges need a live body and are one
  key per session, overwritten on repeat, so they were already bounded.
- The object's message budget (2026-09-26, found reading the message
  path): every non-intent message cost the object a full checkpoint (a
  storage put of the world and every player) and a forced broadcast to
  every viewer, with nothing bounding it per socket, so one client
  sending verbs in a loop could make the object write and send at any
  rate it chose. Now `webSocketMessage` admits a message only from a
  token bucket per socket (`MESSAGE_BURST` 120 deep, refilled at
  `MESSAGES_PER_SECOND` 60; an honest client sends an intent per key
  change and a strike or two a second); past it the message is dropped
  unread and counted (`load.dropped()` → `dropped` on `/world`). And an
  action's checkpoint and forced broadcast happen at most once per
  `ACTION_BROADCAST_MIN_MS` (20) of the last action's: inside the window
  the object marks itself dirty and owed and returns, and the next alarm
  checkpoints first, then broadcasts forced, so the invariant (an action
  is checkpointed before its snapshot goes) holds and nothing is later
  than one step. A message that changed nothing (a strike on cooldown, a
  refused packet: `applyAction` returned the same world) costs nothing
  past its token; a join's or a close's broadcast opens no window, so the
  first action after either is immediate. The bucket is per socket and
  dies with it; a hibernation wake starts every socket full.
- A phone's HUD (2026-09-26): at 390 px wide the play client's HUD ran
  off the right edge (the verb chips), the minimap and the journal's tab
  sat on the wrapped top chips, and the prompt had no room; a
  `max-width: 600px` block in `src/ui/hud.css` now shrinks and wraps the
  chips, seats the minimap and the journal's tab under them at the
  right (the journal opens full width), gives the prompt and the heard
  line the width above the bars, wraps the verb chips and drops the
  keyboard hints, seats the ledger and the dialogue in the screen, and
  moves the event cards above the prompt. Touch controls stay out of
  v1 as the brief says; this keeps the city readable in a hand. The
  landing page's log rows stack their time above the line at that
  width. `scripts/render-check.mjs` now ends with a phone pass (390 by
  844, the desktop page closed first, since two software-rendered
  cities starve each other's boot): the landing page, then the city,
  failing when any chip or panel runs off the screen, the page scrolls
  sideways, or the minimap or the journal's tab sits on the chips above
  (`05-phone-landing.png`, `06-phone-nave.png`). The branch is 55
  commits ahead of `main` and none behind, so its merge is a
  fast-forward.
- The city's log on the landing page (2026-09-26): `site/log.js` reads
  the public writeback route (`GET /log/recent?kind=news&limit=8`) into a
  band on `site/index.html` ("The city's log": the last news lines, each
  with how long ago), as text only; the band stays hidden while the
  route answers nothing (a city without the log binding, or nothing
  written yet), so the page is unchanged until the city has written. Pure
  functions (`ago`, `logLines`) and the mount are tested from
  `server/src/siteLog.test.ts` with a fake document and fetch;
  `scripts/render-check.mjs` now opens the landing page first, waits for
  the band to finish, screenshots it (`00-landing.png`) and fails when
  the route has lines the page does not show, or the page shows lines the
  route does not have.
- Review fixes on the last three changes (2026-09-26, a code review of
  `2e6c233..343b351`, ten findings, all taken): the notices leave the
  wire's `you` altogether (`YOU_OFF_WIRE` in `frames.ts`; `Snap.notices`
  was already the section the HUD reads, so they went twice, and every
  notice push or expiry re-sent the whole `youSlow`); `SlowTracker
  .youDue(viewer, you)` brings the slow frame forward the step one of the
  viewer's own record fields is a new object, so a dialogue the tick
  closes at a death, a print that decays or a quest the tick advances
  reaches the client at once and not at the fifth step (the object asks
  it every step beside `rosterDue`); `mergeFrames` skips a fast-`you` key
  carried as `undefined`, so an in-process fold of the object's frames
  keeps the record; the Deploy workflow scopes the two secrets to the
  migration and deploy steps (never the install or the tests), builds and
  stages the client before it touches the database, deploys with
  `wrangler deploy` and then reads `/health` at the URL wrangler printed;
  `CITY_SELLER`, `LISTING_PRICE_MIN` and `LISTING_PRICE_MAX` live in
  `constants.ts` and the ledger, the economy and the snapshot all read
  them; `applyPassing` re-prices through `moveClearing(outcome)`, typed,
  instead of a cast. The campaign smoke counts the notices from their
  section.
- The deploy's database side, through the Cloudflare connector
  (2026-09-26, backlog 2): the owner's Cloudflare MCP connector reaches
  the account from outside the container (`workers_list` shows the
  Worker `reverie-the-game` last deployed 2026-09-25; no `reverie-log`
  existed), so the D1 database was created with it, the first migration
  applied and recorded the way `wrangler d1 migrations apply` records
  it, and the id replaced the placeholder in `wrangler.toml`. The
  connector has no way to upload a Worker, so the deploy itself waits
  (Backlog 2). `.github/workflows/deploy.yml` is the second way: a
  manual **Deploy the city** workflow (typed `deploy`; refuses without
  the two secrets; gates, `d1:migrate:remote`, `npm run deploy`).
  Nothing deploys on a push. Since 2026-09-27 it also takes `check`:
  the install, the gates, the client build and stage and a dry-run
  bundle on GitHub's runner, no secrets, nothing deployed, so the
  pipeline can be proven before the first deploy. It cannot run yet:
  GitHub registers workflows from the default branch only and `main`
  carries none, so the API answers 404 for it until the branch is on
  `main` (Backlog 2 says how). The check's steps were run here instead
  (Verified). Also found that day: `sharp`, which the pull script and
  its rehearsal need, reached the tree only through wrangler's
  miniflare; it is now named in `devDependencies`.
- The resistance's Clearing on the Grid (2026-09-26, backlog 6's last
  candidate): a `listing` effect (`effects.ts` → `economy.applyListing`)
  lets the city post a listing under its own seller (`CITY_SELLER`, no
  body on the Grid: nobody buys it, "A price, not a sale. The hole does
  not travel.", nobody cancels it) or move its price by a delta within
  the stall's bounds; posting and every move go to the news. The board
  read posts "A Clearing, the hole scheduled" at 40 for everyone (a
  second read leaves the price where the city moved it), and its say,
  its label and Quill's board line read the live price; the private
  yield taken moves it up 8 and refused down 4 (both the desk's verbs and
  Vesper's dialogue), and every Passing moves it by its outcome
  (appearance +12, absence +4, hijack +8, failed −6) once the board has
  been read. The snapshot's market puts city listings first so prints
  never push the price off the board; the ledger shows the row with no
  button. `src/sim/content/market.ts` holds the listing and its moves;
  `CLEARING_LIST_PRICE` and `CLEARING_PRICE_MOVE` in `constants.ts`. The
  Movement II smoke waits for the price on the Grid after the board and
  for the move after the yield.
- The viewer's own side (2026-09-26, backlog 4, the per-viewer work that
  remained): profiled first, and the cost was not the NPC views the plan
  named but the prompt, the `you` split, the fast encode and the
  tracker's roster maps. `framesFor(w, id, step)` (`snapshot.ts`) now
  gives the object the fast frame and a slow thunk it calls only when a
  slow frame is due, so four steps in five build no per-viewer slow side
  at all (NPC offers, nodes, wreckage, graves, marks, objectives, the
  kit's readout); the prompt gathers what is in reach by distance and
  reads verbs nearest first from the kind's own function (`playerVerbs`,
  `poiVerbs`, `nodeVerbs`, `wreckageVerbs`, `npcVerbs` in `interact.ts`;
  `verbsFor` dispatches), a guest or locked viewer gathering no bodies;
  `fast.you` is one native copy with the slow keys left undefined for
  JSON to drop; the open dialogue rides `youSlow` and the notices leave
  the wire's `you` (their section carries them; a body in conversation
  sends a third less per fast frame); a body's roster
  entry keeps its identity while its fields stand, and a tracker whose
  roster is entry for entry what it saw owes nothing. Bytes identical to
  `splitSnap(snapshotFor(...))`, held by a test encoded and folded back.
  Bench on this container: viewer-by-viewer 20.2 ms, the shared views
  6.9 ms, the frames 5.2 ms per broadcast to 80 walking viewers; the
  profile and the wire bound (847 KB per step at that density) are in
  `.rebuild/ZONES.md`.
- Movement III over the wire (2026-09-26): `scripts/smoke-campaign.mjs
  --movement=3` (`npm run test:campaign:3`, 480 s deadline) goes on through
  the Organs door: studies the Strait, the Foundry and the Cable, hears Ord's
  map at the Strait, walks back across the Nave to bury the wreckage garden
  in the Care (Nara waits, then walks), north to the Kerb's forecast glass
  for last season, and to Quill at the forge tray to spot the copy, reaching
  Movement IV; it prints a third `measure:` block. The Care garden's lane
  comes down x 17 to row 70 before turning east through the gap (the wall at
  x 19 rows 66–68 jammed the diagonal). Numbers in Verified and Backlog 7.
- The tax window's key clash (2026-09-26, found by the smoke's diagnostics):
  the side hour "The tax is climate" opened on the same gate as the spine's
  tithe (`F.HALL` and a House) and its "Read who pays" took key E at the
  window, so "Pay this hour's tithe" was never in the prompt; a player could
  only let it ride, or pay the hour's share first. The hour now opens once
  the tithe is decided (`F.TITHE`), and Form 9's file / refuse verbs at the
  same window wait for it too (the Officer's ask stays on the way). The
  spine test presses every POI verb through a `use()` helper that first
  asserts the verb is in `verbsFor`'s prompt, the way the client would, and
  pins both `E:pay` and `Q:ride` at the window with the tax hour not yet
  started; the smoke no longer falls back to the prompt's first verb when
  the one it wants is missing (the missing verb is the finding).
- The fast frame's second pass (2026-09-26): new bodies get twelve-hex ids
  (`bodyId()` in the object; saved bodies keep theirs) instead of 36-character
  uuids, and `you` splits like the roster (`quests`, `flags`, `choices`,
  `party`, `items`, `claims`, `history`, `respawn`, `wallet`, `kitReadout`
  ride the slow frame as `youSlow`, sent when their signature changes,
  merged under the fast fields by the client and the scripts). The meter
  also times each checkpoint's write (`checkpointMs`): 1–2 ms at 40 and 80
  bodies, so the late alarms are compute, not storage. Per fast frame: 4.0
  KB at 20 bodies, 6.4 KB at 40, 9.7 KB at 80 (from 4.5 / 7.6 / 12 after the
  first pass, 14.3 / 20.3 / 31.8 before the diet). At 40 the worst alarm
  now sits at the 100 ms line (71 and 101 ms in two runs) with the bots
  sharing this container's one CPU with the Worker; 80 still fall behind.
- Load meter, load check and the scale design (2026-09-26, backlog 4).
  `server/src/load.ts` reads what a Worker can read about its own load
  (the clock is frozen during compute): how late each alarm fires against
  the step it asked for, catch-up steps, stalls (`SimulationClock.lastCapped`
  is new), and the last broadcast's size; `/world` reports it as `load`.
  `scripts/load-check.mjs` (`npm run test:load`) connects N guests over the
  real socket, walks them through the Nave with strikes, samples the meter
  and every bot's snapshot cadence, prints `measure:` lines and passes when
  20 Hz held. `.rebuild/ZONES.md` keeps the numbers (one object holds 20
  bodies on this container's workerd, the knee is about 40, 80 falls behind),
  the cost model (viewers × snapshot size × 20 Hz; a lone viewer's snapshot
  is already ~10 KB because the slow state rides every tick), the snapshot
  diet that must come first (a 20 Hz fast frame and a 5 Hz-at-most slow
  frame, protocol v3, merged in the client), the zone design for after it
  (what is per zone and what is global, the globals frame and the event
  boundary, the handoff at a gate with close code 4010, the campaign smoke
  crossing, the migration from one object behind `ZONES=0`), and why
  instancing is out (the brief says one shard).
- Generated-asset slots (2026-09-26, Stage B prep): every Stage B file has a
  place, with today's rendering as the fallback, so the pull is a drop-in.
  `src/assets/gen.ts` loads `assets/gen/manifest.json` once before Phaser
  boots (404, junk or a wrong shape is an empty manifest; one request) and
  `gen.has`/`gen.url` gate every generated file; `src/assets/slots.ts` is the
  pure map: portraits for officer, omen, keeper, sexton, desk (dialogue
  panel); sprites for wardens, enforcers and the hour clerks (entities,
  through the boot's `gen:` textures); House seals in the identity chip and
  messenger badges in the kit chip; plates by district in the journal (Kerb,
  Nave, the hot street while hot); loops (`src/ui/loops.ts`, muted, looping,
  inline, never under reduced motion): the title mark behind the word, the
  guest lock in the lock panel, going-under and the four Passing outcomes as
  full-screen overlays, the ambients in the journal header for the Organs,
  the Nave and the Wet Grid; static props from the level (node bases and
  altars, bells at the Ring's shrines and the two bells, light pools at every
  shrine, stalls, desks, the furnace, the board, two vans on the hot street)
  drawn under bodies when their texture loaded, replacing the drawn altar,
  pool and bell post; wreckage uses its prop. Not slotted yet: grave slabs,
  planted seeds, the credits plate, the minimap seal, the `coin-reverie` and
  `lockup-game` marks. The asset lint accepts references the generated
  manifest names.
- The Annex Runner as a courier (2026-09-26, backlog 5's optional beat).
  Enemies can walk an authored route: `ENEMY_SPAWNS.route` (px points,
  walked as a cycle from home while idle; `Enemy.leg` is the point in hand;
  the route is content, never saved), the leash reads the distance from the
  route polyline (`strayOf`), a return walks to the point in hand, a respawn
  starts the cycle over. A struck enemy answers whoever struck it last before
  anyone inside its aggro radius. New kind `courier` (aggro 0: never starts a
  fight; hp 36, speed 130). The Annex Runner is one: the Annex gate (17,30)
  down the west corridor to the funeral street (6,47) and back, carrying the
  Office of Safety's real number for the hour. Felled, every participant gets
  `F.BULLETIN` and the line (`LINES.FALL_LINES`, keyed by the fall flag). At
  the plaque the slip reads the rounded Gestell; naming it stability folds
  the slip away, either other name pins the number under the word for
  everyone (`W.BULLETIN_POSTED`, a news line, the read and reread say so).
  Ord's weather line and the journal's naming step point at the Runner. The
  campaign smoke hunts it on the way back (an optional beat: a note when it
  is not met) and counts the pin as a decision.
- Angel holders from the chain (2026-09-26, disarmed): `server/src/holders.ts`.
  With `ANGEL_CONTRACT` and `ANGEL_RPC_URL` set, `/wallet/link` reads the
  signer's Angel with two `eth_call`s over JSON-RPC (ERC-721 Enumerable:
  `balanceOf`, then `tokenOfOwnerByIndex(owner, 0)`; serial = token id +
  `ANGEL_TOKEN_OFFSET`, inside 1..7777 or no Angel) and remembers definite
  answers five minutes per address (a thousand addresses, oldest forgotten).
  The `ANGEL_HOLDERS` map wins first, so test serials keep working; without
  a contract the map is the only source. An unreadable chain (transport,
  RPC error, junk word) refuses the link with `503 chain`, spends the nonce
  and changes nothing; the lock panel says so. Never a transaction; the
  Worker signs nothing. `wrangler.toml` ships both vars empty.
- Audio system (2026-09-26, Stage B prep): `src/audio/cues.ts` decides the
  bed by district, the music track (title theme on the title and the
  credits; Nave and Annex underscore; Grid underscore on the Wet Grid and the
  Kerb; the burial elegy at the plot, in the Care and while dead; the rite in
  the Clearing and the Ring; the beds alone in the Organs; the combat pulse
  after half a second of a fighting enemy within 320 px, held four seconds
  past the last contact) and the effects from snapshot diffs (hit, death,
  keep, extract, wink, under, bury, freeze, appearance, hijack; strike, heavy,
  dodge and the journal page come from the inputs). `src/audio/bus.ts` is
  WebAudio behind it: a bed that cross-fades, a track that ducks the bed, one
  shots with a throttle; the context opens on the title click; every file is
  fetched once and an absent one is silence forever. Settings live in
  localStorage; the top row has an AUDIO chip; O mutes, [ and ] step the
  volume. The generated files are still absent, so the city is silent and
  identical; when `scripts/pull-generated.mjs` lands them under
  `public/assets/gen/`, it sounds.
- Wallet login (2026-09-25, disarmed): the lock panel offers LINK A WALLET.
  The client discovers wallets by EIP-6963 (`window.ethereum` as fallback),
  asks for an account, fetches a challenge for that address from `POST
  /wallet/challenge { address }` (since 2026-09-26 a Sign-In with Ethereum
  message naming the city's host, the address, the chain and the nonce),
  has the wallet `personal_sign` the challenge text (hex-encoded), and
  posts the signature to `POST /wallet/link`. The Durable Object rebuilds
  the message from its own origin, recovers the signer (EIP-191 hash,
  secp256k1 recovery through `@noble/curves`), requires it to be the
  challenge's address, spends the
  nonce (ten-minute life), and either seals the live body with the serial the
  `ANGEL_HOLDERS` map assigns (a wallet proof through `applyLink`) or binds
  the address to the guest and says so. The test link (serial + `mock`) is
  accepted only when `MOCK_LINK` is `1`; `.dev.vars` sets that for
  `wrangler dev`, `wrangler.toml` deploys it off; `hello.mockLink` tells the
  lock panel whether to offer it, and the title offers it only on localhost.
  Never a seed, never a transaction, never a chain call.
- Dependency hygiene (2026-09-27): `npm audit` had five findings, all in
  the dev tools (vitest critical, vite high, esbuild, vite-node and
  `@vitest/mocker` moderate; the production dependencies had none) and
  all fixed only past a major. Taken: vite 5 → 8 (Rolldown bundles the
  client now; the same 40 output files, `index.html` equal modulo hashes,
  the script 1.30 MB minified where vite 5 wrote 1.59 MB) and vitest 2 → 5
  (the 468 tests ran unchanged; the benchmark API moved into a test's
  context, so `src/sim/broadcast.bench.ts` registers its four rows with
  `bench()` and compares them in one `bench.compare()`, and `npm run
  bench` asks for the verbose reporter, where the table now prints). In
  range: wrangler 4.125 → 4.141, playwright-core 1.56 → 1.63, ws and the
  workers types. The audit reads 0. Vitest 5's module runner turns
  imports into getters and warns that the bench crosses them often; the
  absolute bench numbers read about a fifth higher than under vitest 2
  (frames 6.2 ms, old 26.5 ms on this container; the ratios hold), so
  compare bench numbers within one vitest major. Not taken: phaser 4 and
  typescript 7, majors no finding needs (Backlog 9).
- `/health` names the live build (2026-09-27): the Worker reads the
  staged client's `/play/release.json` (the commit and the build time
  `scripts/stage-play.mjs` writes) through the assets binding, once per
  binding, and answers `{ ok, v, release: { revision, builtAt } }`;
  nothing staged, a malformed file or a binding that fails leaves
  `release` out and is asked again next time. The Deploy workflow's last
  step now fails a deploy whose city does not name the run's commit,
  whatever wrangler printed, and `scripts/smoke-world.mjs` prints the
  release and, against the local Worker, requires it to be the one staged
  in `site/play`. Until now the only sign of what was live was the
  Worker's modified time. The release is public, as the client's
  `release.json` already was.
- Review fixes on the day's five commits (2026-09-27, later; the review
  ran over `8a58d98..d764605`): the workflow's revision check polls
  `/health` for up to a minute with `jq` (the new version takes a moment
  to reach every edge, and a one-shot substring match failed a healthy
  city on any reformatting); a 404 or a malformed `release.json` is
  remembered per binding like a good read, so a city with nothing staged
  costs no asset subrequest per health call (a binding that throws or
  answers 5xx is still asked again, and the test now counts the asks);
  the session smoke's release check gates on a loopback origin however
  it is spelled and finds `site/play/release.json` from the script, so
  neither an explicit local origin nor another working directory skips
  it silently; the bench's unused generic is gone; the bench warning
  vitest 5 printed on every run is suppressed in `vitest.config.ts`
  (under `test.benchmark`; at the top level it is ignored), the header
  note being the explanation that stays. Not taken: the WeakMap keyed on
  the assets binding (a runtime handing over a new binding per request
  would only cost one asset read per health call, and a module-level
  cache would leak between tests), and the release's disclosure (above).
- Security review (2026-09-27, later) of the seven commits since the last
  one (`0bf9460..ec2a29b`): no finding at the review's bar (>80%
  confidence of real exploitability). Checked: `/health`'s release read
  (a constant path through the assets binding, the same bytes already
  public at `/play/release.json`, two string fields re-emitted as JSON,
  the memory derived only from the bundle, the session and origin guards
  on the other routes untouched); the Deploy workflow (the two secrets
  reach only the two `deploy`-gated steps, the check path runs with none
  and uploads nothing, `workflow_dispatch` only, the poll step's `url`
  from a strict regex over wrangler's own log and `live` only compared
  quoted and echoed); the pull script's overrides (environment variables,
  the manifest committed); the session smoke's release check (a CLI
  argument, a local file); the lockfile (every new `resolved` on the npm
  registry, no new install scripts, `sharp` from prebuilt optional
  packages). Noted, pre-existing and not findings: `.dev.vars` is tracked
  and holds only the mock flag and a well-known test address; the two
  actions are tag-pinned, not SHA-pinned.
- The HUD's markup for assistive technology, first step (2026-09-27,
  later): the dialogue, the lock and the credits are dialogs (the
  dialogue named by its speaker and described by its line, the lock by
  its heading; the title already was), the heard line and the dialogue's
  text join the live regions the connection chip, the events strip and
  the notices already were, the four bars are meters whose
  `aria-valuenow` and `aria-valuemax` `Hud.setBar` keeps equal to the
  numbers shown, and the prompt is a labelled group. `src/ui/a11y.test.ts`
  reads the static attributes off `index.html`; the render check reads
  the dialog, the live regions and the four meters in the browser and
  fails when a meter's value is not the number it shows. Written up in
  `.rebuild/CLIENT.md`; what is left is Backlog 10.
- The load check re-read under wrangler 4.141 (2026-09-27, later; the
  first server-side read since the dev tools moved): at 20 and 40 bots
  the per-viewer bytes and the checkpoint cost are unchanged from the
  rows in `.rebuild/ZONES.md`, and the timing bars miss on this
  container's own hiccups as they did before (a single late alarm fails
  the worst bar); the numbers are in ZONES, and nothing is a regression.
- The map in text (2026-09-27, later; Backlog 10's next step): the
  minimap canvas's label is the map in a sentence, `mapLabel` in
  `src/ui/format.ts`, set on every snapshot: your district, the
  objective with its bearing in words (direction, tiles, and its
  district when not yours; "is here" within reach), or no objective,
  and what is under a freeze. Unit-tested on the sentence; the render
  check reads the label in the browser and fails when it does not name
  the district the chip shows. Found on the way: `hud.css` already
  honours `prefers-reduced-motion`, so Backlog 10 no longer asks for it.
- The render check's exchange made dependable, and the minimap under
  reduced motion (2026-09-27, later): the check used to walk right for
  two seconds and press F only if something happened to be in reach, and
  east of the spawn stands the Intake Clerk, a fight with no verb, so its
  "dialogue shot" had never once opened a dialogue. Now it walks north
  (the fourth Nave node at 6,34 and the first at 11,36 stand that way,
  the clerk east) and then east until the prompt offers a verb, presses
  the first one, and fails unless a dialogue opens or the notices change;
  near the spawn that is a node's EXTRACT answered by a notice, since the
  Nave's people all stand past the intake, and the check says which it
  got. The minimap's objective ring stands still at its mean size when
  the browser asks for reduced motion, the last moving thing the HUD drew
  under that setting.
- Keyboard reach for the HUD's controls (2026-09-27, later; Backlog
  10's next step): the scene swallowed every Tab for the stance, so a
  keyboard user could never move focus into the HUD's buttons at all.
  Now plain Tab on the canvas is still the stance; Shift+Tab is the
  browser's and moves focus into the HUD's controls (from their end, as
  the browser does); with a control focused, Tab and Shift+Tab move among
  them, Space and Enter activate the focused one, Escape hands the keys
  back to the game (the scene blurs it), and the game's other keys keep
  working, so a player who tabbed to the journal can still walk.
  `src/ui/keys.ts` decides who owns a press (unit-tested: the canvas,
  Shift+Tab, a focused control, Space and Enter, the game's own keys);
  the render check walks the path in the browser (Shift+Tab focuses a
  HUD button, another moves within, Escape leaves).
- Focus into an opened dialogue and back, and the canvas under reduced
  motion (2026-09-28; Backlog 10's last two items this container can
  do). An opened dialogue now takes focus itself (`#hud-dialogue` has
  `tabindex="-1"`, so a screen reader announces the dialog with its
  speaker and line): Tab reaches its first choice, digits and Enter
  choose, and when the next line replaces a focused choice the panel
  takes focus back. The panel and not the first choice, so a strike key
  held as a dialogue opens cannot pick a decision. Escape inside the
  dialogue closes it (`escapeDoes`: a focused control outside the
  dialogue still just blurs), and the close returns focus to the HUD
  control that had it when the dialogue opened, else to the canvas
  (`focusAfterClose`; the return waits until the panel is hidden, since
  the open dialogue hides the prompt and the bars and a hidden control
  cannot take focus, which a first browser probe caught). Both decisions
  are unit-tested in `keys.test.ts`. The canvas honours
  `prefers-reduced-motion` (`src/render/motion.ts`, unit-tested): the
  camera never shakes; a strike flash, a ledger tick, the Wink ripple,
  the interrupt ring and the hijack scanlines fade in place (`stillTween`
  drops a tween's moving keys); the going-under's wing-star holds its
  size; the rings and lights that pulse hold their mean (`pulseAt`); an
  idle body does not breathe and an Angel's aura does not turn; camera
  fades and flashes stay. The minimap reads the same query through
  `reducedMotion`. The render check now opens a real dialogue every run:
  Nara Vale stands at her home (8,49), seven tiles south and three east
  of the guest spawn with nothing in the way, and any present person
  offers Speak; the check walks there by time (170 px/s, 48 px tiles,
  nudged by half tiles until the verb shows), speaks, reads the dialog
  with its speaker while open, then proves the focus path (the panel
  took focus, Tab reached a choice, Escape closed it through the server,
  focus went back to the game), and only then walks the x 6 lane north
  to the node at 6,34 for the verb-without-a-dialogue exchange, whose
  answer is a heard line and a ledger change (the earlier check waited
  for a notice, which an extract does not post; it had passed on a
  notice that happened to arrive). The keyboard step names a control by
  its text when it has no id, so the prompt's two verb buttons read as
  two controls.
- The guest lock, the credits and the title take focus too (2026-09-28,
  later; Backlog 10's last container-side item). The dialogue's focus
  handling moved into `src/ui/focus.ts`, a keeper per panel (`take`,
  `retake`, `holds`, `release(hide)`; the DOM side of `focusAfterClose`),
  and the guest lock panel and the credits use it: the lock takes focus
  when it appears (a dialog named by its heading; Tab reaches the wallet
  button; Escape hands the keys back and the panel stays; "remain in the
  Nave" or the unlock give focus back), and the credits take focus when
  they roll and close on Enter, Space or Escape as on a click (the hint
  says so), giving focus back. The title's Enter button has focus at
  boot, so a screen reader lands on the way in. `scripts/smoke-campaign.mjs`
  learned `SMOKE_COOKIE` (play a browser's session) and `SMOKE_STOP=lock`
  (stop at the guest lock and leave the guest there), which is how the
  lock panel was read in a real browser (Verified).
- The README's Controls say what the keyboard and assistive technology
  get (2026-09-28, later): a Shift+Tab row, and a paragraph on the panels
  that take focus, the live regions, the meters, the map's sentence and
  reduced motion, pointing at `.rebuild/CLIENT.md` for the list.
- Reduced motion read in a browser, and the journal named (2026-09-28,
  later): the render check's phone pass now asks Chromium for
  `prefers-reduced-motion: reduce`, presses Space and Shift+D after the
  HUD is up (a strike flash and a dodge, the canvas's fade-in-place
  branches), and fails unless the page sees the query, the marquee's
  animation is `none`, and no script error appears that the desktop pass
  did not have. The journal `aside` carries `aria-label="Field notes"` (a
  named landmark) and its open quests `aria-label="Open quests"` (a named
  list); the markup test reads both.
- The render check's node exchange made dependable on a lived-in world
  (2026-09-28, later). Found by running the check three times in a row:
  the fourth Nave node offers EXTRACT, then KEEP, then nothing (a keep
  holds until someone extracts and charges come back one per 300 s), and
  the third run failed. Two causes fixed. The check read the prompt's
  buttons off the DOM while the HUD had hidden the prompt (the HUD hides
  it when nothing is in reach and leaves the last name and buttons in
  place), so a thing walked away from still seemed in reach and its key
  was pressed at nothing; a hidden prompt now reads as empty. And there
  was no second node: now the walk north stops short of the fourth node
  and nudges until the prompt offers its verbs or the CRT altar's WATCH
  at 5,31 (the landmark at the corridor's top, which means the node
  offered nothing), and from the altar goes by the row 30 crossing to
  the first node at 11,36. Nara's leg is aimed a tile short and nudged
  through her reach, since a leg walked long passed her once and the
  nudges then walked away. The dry-run bundle re-read after the day's
  client commits: 558.62 KiB, 147.16 KiB gzipped, 94 site files, the
  bindings as before.
- One-stick mobile (2026-09-28, later; the brief's "one-stick mobile
  later, not a v1 blocker", taken now that the phone HUD fits and the
  Backlog's container-side items are done). `src/ui/stick.ts`, pure and
  unit-tested: a finger down on the canvas plants a stick where it lands,
  a drag from there is the eight-way intent the keys send (45-degree
  sectors past a 14 px dead zone; the knob follows within 40 px), lifting
  ends it; a press of at most 250 ms that travelled under 10 px is a
  strike, and a second finger down while the stick is held is a strike
  too; the dodge chip is a button on coarse pointers (`pointer: coarse`,
  labelled "DODGE"; a mouse can press it too) and dodges the way the
  stick or the keys point, else the way the body faces. The scene applies
  it (`touchDown`, `pointerMove`, `pointerUp`, `dodgeButton`; the keys
  and the stick merge into one intent; a second Phaser pointer for two
  fingers); the HUD draws the ring and the knob (`#hud-stick`,
  `showStick`/`moveStick`/`hideStick`, paper on void) and gained the
  `dodge` callback. No new message: the server's rules are the whole
  story. The render check's phone pass now sends real touch events
  through CDP: the stick plants, a drag north walks (the map's sentence
  moves the objective), the finger up hides it, a tap strikes, the dodge
  button starts the cooldown (`07-phone-stick.png` shows the ring). Found
  on the way and fixed: a full-page screenshot on the phone made
  Chromium drop the touch emulation (no touch points, no coarse pointer
  from then on), so the phone landing shot is a plain one; a CSS edit
  had closed the phone block early (three rules moved back). And the
  check's two walks now start from walls: an over-walk into the
  corridor's top wall, or into the low wall east of Nara's home, stops at
  the same place whatever the drift, so every later leg is short and the
  nodes and Nara are reached every run (a leg walked by time alone had
  missed her one run in a few).
- The heavy by touch (2026-09-28, later; Backlog 11's last client item).
  The second finger, down while the stick is held, is now a light strike
  when it lifts before 350 ms and a heavy the moment it has been held that
  long: the scene fires the heavy on a timer while the finger is still
  down, so the windup is felt at once, and the lift then does nothing
  (`secondFinger` and `HEAVY_MS` in `src/ui/stick.ts`; the scene's
  `second` record with its timer, cleared when the stick drops or the
  canvas blurs; a third finger does nothing). The render check's phone
  pass now reads the wire (an init script notes the kind of every
  message the client sends) and asks: a second finger held 600 ms on the
  dragging stick sent exactly one `heavy`, its lift sent nothing, and a
  tap on the canvas sent exactly one `strike`. The docs' touch rows and
  the client contract say so.
- The gates on GitHub for every push (2026-10-01; discovered: no workflow
  had ever run in the repository, and the Deploy workflow's `check` cannot
  start until `main` carries it). `.github/workflows/gates.yml` runs on
  `push` from the pushed branch's own copy (GitHub takes a push-triggered
  workflow from the pushed ref; only a dispatched one is registered from
  the default branch): `npm ci`, the typecheck, the tests, the client
  build and stage, and a dry-run bundle of the Worker, no secrets,
  nothing deployed; a newer push cancels a run still going, so a branch's
  mark is its latest commit's. The Deploy workflow's `check` stays as a
  hand-run of the same steps; its header and the README say which runs
  when. The first run's one warning (the v4 checkout and setup-node
  actions target Node 20, which the runners have deprecated) moved both
  workflows to the v5 actions on the follow-up push.
- The generated manifest's 404 ended (2026-10-02, Backlog 13). The client's
  first request, `assets/gen/manifest.json`, answered 404 on every load
  since the slots were built, in production as in the render check, because
  nothing was staged under `public/assets/gen/`; the client read it as an
  empty manifest by design, but the browser logged a failed request each
  time. Now `public/assets/gen/manifest.json` is committed as the empty
  manifest (`{ "v": 1, "targets": {} }`, the bytes `pull-generated.mjs`
  writes when nothing is pulled, so a pull that lands nothing leaves no
  diff), Vite copies it into the build and the Worker serves it as JSON.
  Tests: the committed file is those bytes and loads as a manifest naming
  nothing (`gen.test.ts`); the pull rehearsal starts with the committed
  manifest in its output directory and proves the pull overwrites it, and a
  second rehearsal with nothing to pull writes the committed file byte for
  byte (`pullGenerated.test.ts`). The render check now keeps each console
  error's URL (Playwright puts a failed resource's URL in the message's
  location, not its text) and fails the desktop pass when the city's own
  origin failed to serve a file the client asked for; proven against a
  stage with the manifest deleted, which it fails naming the manifest, and
  against the new stage, which passes with the proxy's two certificate
  errors on Google Fonts as the only ones left.
- Dependencies refreshed within their ranges (2026-10-02; discovered: `npm
  audit` had gone from 0 to 3 advisories, one high, all in `undici` under
  `miniflare` under wrangler 4.141, dev-only, fixed by wrangler 4.143 and
  up). `npm audit fix` and `npm update` moved the lockfile only
  (`package.json`'s ranges already allowed every step): wrangler 4.146.0
  (miniflare 5.20261001.0-alpha, undici 7.29.1), `@cloudflare/workers-types`
  5.20261002.1, sharp 0.35.5, vite 8.3.2, vitest 5.0.3; `npm audit` reads 0
  again. Not taken then, and recorded in Backlog 9: the two majors `npm
  outdated` shows (phaser 4.2.1 and TypeScript 7.0.2), each a migration
  rather than a bump.
- TypeScript 7 (2026-10-02, Backlog 9's cheaper half, on its own commit).
  `typescript` moved from ^5.6.3 (5.9.3 installed) to ^7.0.2, the native
  compiler: the lockfile carries its twenty platform packages as optional
  dependencies (`@typescript/typescript-linux-x64` and the rest, 27 MB on
  disk, so `npm ci` picks the right one on any machine), nothing else in
  the tree depends on `typescript`, and both tsconfigs (ES2022, `bundler`
  resolution, strict, `skipLibCheck`, `noEmit`; the server's
  `allowImportingTsExtensions` and the workers types) pass unchanged with
  no deprecation printed. The typecheck of the client and the Worker went
  from 6.9 s to 1.55 s here. Only the dev tool changed: Vite builds the
  client with its own transformer and vitest the tests, so the bundle
  and the tests are the same bytes as before.
- Phaser 4 (2026-10-02, Backlog 9's other half, on its own commit).
  `phaser` moved from ^3.90.0 to ^4.2.1, the release built on the new
  WebGL renderer. The port cost no code: the typecheck against the 4.2.1
  types lists zero breaks, and the shipped migration guide's checklist
  names nothing the client uses (the seven files that touch Phaser use
  plain `setTint`, never `setTintFill`; `BlendModes.ADD`, one of WebGL's
  four native modes; TileSprite without cropping; Graphics, Text,
  Rectangle, Arc, Particles, Tweens, the Scale manager; no masks, no FX,
  no shaders, no lights, no `Geom.Point` or `Mesh`). The client bundle
  grows from 1,305 kB (355 kB gzipped) to 1,482 kB (394 kB gzipped), the
  renderer's size; the Worker bundle is unchanged. The render check's
  screenshots were read by eye on desktop and phone (the Nave's tiles and
  bodies, the labels, the player ring, the dialogue's portrait, the phone's
  HUD) and the city looks as it did under 3.90; frame pacing under
  SwiftShader is 10.0 fps against 8.4 and 9.4 on the two 3.90 runs of the
  same day, so no regression the check can see. Phaser 4's filters,
  lighting and tint modes are now available to the client if a later item
  wants them; nothing uses them yet.
- The live checks on GitHub's runner (2026-10-02; discovered: the session
  smoke and the render check had only ever run in this container, on its
  one CPU and its preinstalled Chromium, so a clean machine had never
  served the built client or driven its wire). `gates.yml` gains a second
  job, `live`, on its own runner beside `gates`: `npm ci`, the client built
  with `VITE_BASE=/play/` and staged (so `release.json` exists for `/health`
  and the smoke's revision check), the log's migration applied to the
  runner's own SQLite (`npm run d1:migrate`, local), `wrangler dev --port
  8788 --local` in the background until `/health` answers (90 s bound, the
  Worker's log printed on a miss), then `npm run test:smoke` over the wire
  and `RENDER_MIN_FPS=5 npm run test:render` in the runner image's Google
  Chrome, which the check now launches by path when `RENDER_CHROMIUM` names
  a browser (`scripts/render-check.mjs`; without it, the preinstalled
  Chromium as before, and the step falls back to `playwright-core install
  chromium` on an image without Chrome). The screenshots and the Worker's
  log are kept as the run's `render-check` artifact for fourteen days, on
  success or failure, so the city as a clean machine rendered it can be
  looked at from the Actions tab. No secrets, nothing on Cloudflare; the
  campaign smokes stay local (Movement I alone is a quarter of an hour).
  The README's release-checks paragraph says so.
- The campaign bot fights like a player (2026-10-02; discovered: the whole
  spine failed at the intake twice in three runs that day, the clerk at
  full or near-full hp and the bot back near the spawn with 100 hp, and
  the traced reruns showed why). Three things in `scripts/smoke-campaign.mjs`:
  (1) `hunt` ends at once when the body wakes at its respawn point with
  the goal far off (`dead` never shows on the wire: `killPlayer` wakes
  the body at its respawn point the same tick), instead of spending the
  rest of its budget walking a straight line at the enemy from the spawn
  row; (2) the intake step walks the lane back after a fall and tries
  again, as Desk Three has since 2026-09-27 (`extendDeadline(60)`, the
  respawn, `walk(ROUTE.toIntake)`, a second `hunt`), the clerk by then
  reset to full hp by its abandoned-shift rule; (3) in reach the bot
  stands and faces the enemy instead of walking at it: a strike lands
  only in front (`inFront`, a dot above -0.2) and the facing turns only
  with a moving intent, so a clerk that had walked into the body and
  stood a few px behind it was missed by every strike while the walk's 5
  px dead zone left the facing alone (the clerk at 176 hp after a minute
  of strikes in the rehearsal), and walking at it with no dead zone
  overshot a step each way, the facing flipping with it, so half the
  strikes missed and the bot fell again (clerk at 22); now the body turns
  one step along the dominant axis only when the enemy is not in front,
  and otherwise stands. `SMOKE_FALL_AT_INTAKE=1` rehearses the fall:
  the bot stands in the clerk's reach until it wakes at the spawn
  (about 13 s), then the recovery runs for real. The game did not
  change; the bot plays it better.
- The load check on GitHub's runner, as numbers (2026-10-02). The `live`
  job runs `scripts/load-check.mjs` (20 bots, 20 s) after the render
  check against the same Worker, with `continue-on-error`, and appends
  its `connected`, `measure:` and verdict lines to the job summary; the
  log joins the `render-check` artifact. Never a gate: the check's
  worst-alarm and stall bars are the machine's hiccups as much as the
  Worker's (they fail in this container on every run), so a miss there
  must not turn a push red; what the summary gives is the step held, the
  bytes per viewer and the checkpoint cost on a clean machine with every
  push, beside the container's rows in `.rebuild/ZONES.md`.
- The fonts self-hosted (2026-10-02; discovered: both pages fetched Anton
  and Space Grotesk from Google on every load, a preconnect and a
  stylesheet from fonts.googleapis.com and the files from fonts.gstatic.com,
  a third-party request the container's proxy refuses, an offline or
  blocking browser never gets, and the render check listed as its last
  known page errors). Now `public/fonts/` carries the four latin faces as
  fontsource's woff2 builds (Anton 400, Space Grotesk 400, 500, 700;
  58 KB in all; `@fontsource/anton` and `@fontsource/space-grotesk` 5.3.0,
  fetched once and not kept as a dependency) with their SIL Open Font
  License files beside them, and `public/fonts.css` declares the faces
  with `font-display: swap` and the latin unicode-range. The client's
  `index.html` links `/fonts.css` (Vite rewrites it to `/play/fonts.css`
  on the play build and copies the files) and the landing page links
  `play/fonts.css`, so the staged client is the one source. The content
  lint gains a test: neither page reaches a font or script CDN, both link
  the self-hosted stylesheet, the four faces are the ones named and each
  file and licence exists. No new art: the same two faces the pages have
  set since the rebuild, served from the city instead of Google.
- `SYNOPSIS.md` (2026-10-02, the owner's brief of that afternoon): the
  story the rebuild follows. The enemy the brief asked for, given a name
  and a shape inside the systems the game already has: the Concern, the
  company that owns the numbers and sells the city its wonder at three
  counters (the freeze, the Kerb's slip, the print) and buys the player's
  own hour at a fourth (Vesper's desk), and
  Anselm Caul, its chief, drawn with the guest's own sprite and portrait
  because he is a guest: he never went under, so the server's rules for the
  poorest arrival protect and bar him (no hints, no Care, no Clearing, not
  loot), and "A guest cannot prepare the ground" is his origin and his
  plan. The party given wants, lies and the scenes that rewrite the plot
  (Nara's hand on the first recording; Quill's margin; Ord's figure from
  the first capture); Ione Kade's word as the first Reverie and the last;
  the four movements kept, each hour with a reversal, a name and a world
  change, the altar, the hour on the Kerb, the map, the plate, the catalog
  with the player's serial in the margin, the recorders at the lip of the
  ring; the four Passing outcomes written through Caul's tape. Themes as
  verbs, never named; nothing from outside the game anywhere; every scene mapped to
  existing art; §10 the rebuild in four phases (Backlog A). Written from
  the brief, the design, the current spine and the cast's lines, with a
  panel of four independent treatments and their adversarial judges
  consulted for what to keep. Revised the same evening on the panel's
  converged findings: Caul given a seat across the desk (III.7, the room
  behind the forecast glass, the reader's post or the light struck dark,
  the count of dark lights as a city-wide switch) and a turn in action
  before the Passing (IV.5, the launch: the weather driven up on every
  HUD by the company's own extraction); the product played before it is
  refused (II.9, Halla's hour at three Bestand); the guest's hint at the
  lip moved to the waking in the Care (II.1), since a guest hears none;
  the recorder's provenance (Nara keeps it running at the first grave she
  dug); Nara's refusal of the company's purse (I.7); Quill's refusal to cut
  the ring's plate; the brake-and-throttle shape of the company (paid when
  the city takes and when it stops); Caul's comedy by accident; Safety's
  Hijack given its line. Then read adversarially by three readers and
  three verifiers against the code (continuity, the hard rules, the
  shipped systems) and corrected to what the sim actually does: the
  Passing is each angel's own press at the ring, so the launch is a
  seasonal world window and not a date for the god; the Hijack's two
  doors are the player's own and the contest never opens them; Failed's
  causes listed as the resolver has them; "floor" kept for readiness and
  "meltdown" for the weather; flags raised only by the player or the
  weather; no earner without its sink (the glass's post pays perception,
  the lip's offer pays nothing, the catalog sale is a listing); the
  statues the brief names have no art, so the altars light instead; Caul
  wears the GUEST label; the bought hour does not come, as the Kerb's
  side hour already says; Nara's confession moved to the ring; Quill at
  the vans, never in the hole; the cast's lies the shipped hours carry;
  33 side quests, not 24; new beats never inserted between saved steps.
  `SYNOPSIS.md` is inside the content lint's roots. One thing for the
  owner, noted by a judge and left as written: the token and the
  company's product share the name Reverie, which is the story's point
  and a commercial decision only you can make.
- Backlog A, Phase A, Movement I (2026-10-02, evening): the Concern in
  the mouth of the first hour, content only, on the shipped steps. Ord
  names the company the way you name weather ("The Concern owns the
  numbers. Safety counts them. I counted them. That is why I am at a gate
  and not a desk"), says the runner's slip is on the Concern's paper, and
  the ledger that has everyone is the Concern's; Quill says the altars
  play prints with margins and does not explain; Nara sent back the
  neighbour's purse ("Nobody pays for this one") and keeps the recorder
  running herself, the oldest thing on her street, a woman's voice saying
  one word on a loop; the Runner's slip is on the Concern's paper, and a
  pinned figure is kept in the world (`W.BULLETIN_NUMBER`) so the news and
  the plaque's line carry the number for whoever reads it next. The first
  hint of an Angel's life now waits in the Care on waking (`WAKING_WINK`,
  Movement II's `onStart`; the going-under step's own completion never
  fires for an Angel, since the movement changes first and the quest
  finishes by skipping the step, so the shipped "An Angel went under"
  news line is a dead branch, left as it was). Anselm Caul is in the
  roster as a guest in every rule: the guest's sprite and portrait, home
  at the back of the altar aisle (`home:caul`, Nave 25,47), present only
  in Movement I and only while the viewer is farther than 160 px (gone by
  the time anyone can speak; `NPC_REACH` is 72), the GUEST label in the
  guest's colour through the client's new `src/render/labels.ts`
  (`npcLabel`, a per-NPC override), never a party member. A saved world
  gains him through the migration's merge of the roster's homes. Tests:
  content (present far, gone near, gone after the going-under; the
  roster's node graph still resolves for him), spine (the pinned figure
  in the flag, the news and the reread; the waking hint on the snapshot
  after going under), labels. Next for Phase A: Movement II (the hall's
  lease plaque, the freeze form's "funded by", Corvin's and Vesper's
  lines, the Kerb's hour as the product's lie), then III and IV.
- Backlog A, Phase A, Movement II (2026-10-02, later): the Concern in the
  second hour, content only, on the shipped steps and side hours. The
  hall plaques say the nodes are the House's on paper and the paper is
  the Concern's (the House rents back what it owns), and the hall's Wink
  and Ord's hall line say the same; the freeze form carries its own small
  line, "funded by A. Caul", under the signature (the sign line, the desk
  re-read, the news), and Corvin says in the corridor that the forms come
  on the Concern's paper and are his when he signs them; the tax window
  remits to the Concern; Pim's book at the wake is the one book in the
  city the Concern does not own; the listing board and Quill both say
  the Clearing was listed on commission for a buyer she never met, with
  her "nicer lighting than the company, same electrician"; Halla's slips
  are the Concern's bell schedule, which Safety carries and she copies,
  and the bought hour's notice says the slip was the Concern's time; the
  forecast glass carries the Concern's posted line, the next hour with
  no time on it yet. The oval light on Vesper's wall speaks as you leave
  her desk, by serial, through Caul's own portrait (a `speaker: "caul"`
  node on Vesper's take and refuse, and the desk's E and Q verbs open the
  same node after the stale offer window closes), branched on the hour
  sold: "You sold it. I will buy the rest." or "You keep things. It is a
  lovely habit. I'd like to buy it." The private yield's line about Nara
  now says what the sim does: she goes to the garden and will not speak
  until it is in the ground (the shipped "until you pay a funeral" was
  never true on that path). Tests: the stale-window test now expects the
  oval's node with Caul as speaker and the guest's portrait, and a raw
  choose on it still pays nothing twice. Next for Phase A: Movement III
  (Ord's figure at the glass, the recorders in last season's hole, the
  Foundry as the catalog's heat, Quill's margin with the player's serial
  and her refusal to cut the ring's plate), then IV.
- `SCRIPT.md` (2026-10-02, the owner's request of that evening: "Write
  the script of dialogue"): the dialogue script of the whole game, about
  36,000 words. A front matter (how to read it, the voice, the people
  with their jobs and lies, the fixed lines), then the four movements
  beat by beat in the synopsis's order: each beat with its step, its
  place and plate and whether a guest can play it, then every node a
  player can reach from it with its choices and its branches by prior
  choice (the taker's and the refuser's, the guest's and the Angel's,
  the numbered and the blank plate), the Winke by school, Caul's every
  line, the things that speak with their verbs, the consequences in
  brackets, and the beat's reversal landing in a line; the four Passing
  outcomes with every character's after line, the recorder crew's
  exchange and the credits; then an appendix with all thirty-three side
  hours whole (the five who hand them out, each verb's line in step
  order, the branches, the Winke, the reports back, the one line Phase
  D changes). Every line is tagged shipped, revised or new, and a
  revised or new tag says in a few words what changed or which phase
  lands it; the server's numbers stay in braces. Written by five
  writers (a movement each and the side hours), each draft read
  adversarially against the synopsis, the shipped lines and the sim
  (status tags true, node ids real, trees reachable, numbers the
  server's, nobody lecturing, Caul never lying, the synopsis's lines
  verbatim), and revised on every finding that held: sixty-four, among
  them Quill naming the company before Ord, a strike in II that would
  have completed III.6 and opened the Sky hour early, Caul's oval
  speech contradicting Halla's shipped line, the reader's post and the
  light put out writing the same key with no gate, Ord unable to reach
  the room behind the glass, Vesper's two nodes unreachable for the
  taker, the Foundry rake auto-skipped for anyone who darkened it on
  the spine, the Concentrator's desk close never offered, the appendix
  first written one line per hour. Caul's nine lines are each said
  once: the four the synopsis leaves unplaced go to the hour on the
  Kerb, the room behind the glass and the lip of the ring; the rest are
  where the synopsis puts them. The lint
  reads the file; the README names it; Backlog A names it as the source
  of Phases A, B and D.
- Backlog A, Phase A, Movement III (2026-10-02, night): the Concern in
  the third hour, content only, on the shipped steps, the script's
  III.1 to III.8 as the source. The Cable's study says the light is the
  catalog, every altar in the Nave drawing its reel from it (the flicker
  sentence waits for Phase C's weave); the cold desk and Ord read the
  weather by the city's words, never the HUD's; Ord's map carries the
  synopsis's line ("Tell me where you would cut it, and I'll tell you
  who goes dark"), names the garden as the city's node for a keeper,
  and each cut is news; after the map he sends you to the glass and
  waits beside it (a new station, `ord-glass`) with the figure: last
  season was not short of anything, it was captured, four hundred and
  six in the ring, a trace crossed in the third minute and the next
  line came across his desk on the Concern's paper, taken; he counted
  it and walked to a gate the same week (`figure`, F.FIGURE, then
  `figure-after` at the gate until the act). The glass itself shows the
  hole with the recorders still standing in it, and every school's hint
  there points at them. Nara's garden line names the keeper's node too,
  and the garden's earth is a node, not a Clearing. The hour bell's one
  strike is gated to Movement III (struck in the second hour it finished
  III.6 before the hour existed and opened the House of Sky's hour
  early), and Halla Voss hears it once: "That is not on anything I
  copied." Quill hands over the print from the Grid with your own serial
  in the margin, the hint on it the one you woke to; after the print is
  taken or the copy spotted she says the Concern asked her to cut one
  more plate, the margin for a ring, and she said no, the first thing
  she ever said no to (`forge-plate`, `forge-margin`, `forge-caul`).
  Her forge choices keep the shipped mechanics until Phase B turns the
  sale into a listing and the spot into a pull. Tests: the strike's
  gate by movement, the glass's say and hints, the Cable's and the cold
  desk's words, the omen-reader's hub offering the strike once; the
  Movement III walk now reads Ord before and at the glass, the figure
  once, the serial in Quill's lesson and the plate after either choice.
  `SCRIPT.md`'s tags for these lines now read shipped since Phase A,
  Movement III, with the Phase A variant noted where the script's line
  waits for Phase B. Next for Phase A: Movement IV (Nara's three numbers
  and her confession at the ring, Ord's gate line, Ione's word, Caul's
  placement on the Grid's gate tile).
- Backlog A, Phase A, Movement IV (2026-10-02, night): the Concern in
  the fourth hour, content only, on the shipped steps, the script's
  IV.1 to IV.8 as the source. Ione Kade's offer opens with the voice
  the player already knows from the crate on the funeral street, and
  says what they did at it (left it running, or took the coil); her
  last word is the word itself first, Reverie, the way she said it at
  the counter, then the other thing. Nara at the brink reads three
  numbers (the readiness against the floor, the weather, the bodies
  holding the ring, with the meltdown rule when it applies) and then,
  once, with the garden in the ground, her confession on the brink's
  `next`: she was twenty-two and pressed record on the first one, a
  Clearing is a grave with the lid off, and she looks up at the man on
  the Grid's gate (`lid`, F.LID, the plate and the recorder branched).
  Nara's and Ord's ring lines count the bodies. Caul's body stands on
  the Grid's edge at its gate to the Clearing from the fourth hour on
  (a new station, `caul-lip`); the prompt opens a description, not a
  line, until the recorders' beat (Phase B). The Cold hijack says the
  recorders had whatever would have crossed, with a margin, and its
  news says the margin has a serial in it; Safety's says the form says
  funded by. Quill after an Appearance has the blank tape in both
  hands; after a Hijack she adds that your serial is in the margin of
  the sky. Nara after a failed rite says the short case or the
  weather's; a sexton who walked is routed to `gone` before `after` so
  she never claims a ring she left. An Absence carries its hint. Tests:
  the whole Movement IV walk reads the voice, the word, the three
  numbers, the lid once, Caul at the lip, the hijack line and news, the
  absence hint and Quill's margin; the content test reads the gone
  route and the lip's entry. `SCRIPT.md`'s tags updated. Phase A is
  complete: every movement has the company in its mouth. Next: Phase B,
  the new beats (SYNOPSIS §10), starting with the altar as a readable
  POI in the Nave (I.9) and the room behind the glass (III.7).
- Backlog A, Phase B, first beats (2026-10-02, late): the altar's reel
  (I.9) and the room behind the forecast glass (III.7), from the
  script's lines tagged new. The lit altar in the Nave now plays the
  catalog: a sky through an oval, a bell, ninety seconds, a tag in the
  corner, a serial in the margin, and over the restart a courteous
  voice, "You will feel it again. We kept it for you.", inside the
  watch's own line so nobody is named. The room: new map geometry at
  the top of the Kerb past the hour clerks (`room-glass`, an operator
  floor, the `oval-glass` POI on its wall, the stations `caul-glass`
  and `ord-glass` inside it). Anselm Caul is in it in person in
  Movement III (and for a guest who walks the Kerb): your serial, your
  first node and the recorder said back as compliments; last season on
  the screen as a sample ("You are looking at a failure. I am looking
  at a sample."; "I was never counted. People take that for the wound.
  It is the clearance."); the offer of a reader's post; the first "What
  did it look like", told or not. The reader's post (C.GLASS read)
  makes Cold your current, counts your line on the glass for everyone
  (W.GLASS_LINES) and lets you read the glass the way the company sees
  it: the city's figure (`cityFigure`, the Angels' readiness averaged)
  and the count in the hole. The light put out (Q at the oval, once
  the offer is made and while the glass is undecided; never a guest's):
  readiness, one dark light counted for the city (W.DARK_LIGHTS), the
  oval dark, Halla Voss sent to the glass for everyone, news, and his
  voice in the dark. Ord's figure is reachable from Caul's choices (the
  dialogue engine now hands a window over when a choice's effects open
  another person's node) and "Back to him." returns across the desk;
  Ord stays in the room until the glass is decided. The step `failed`
  now waits for the glass to be decided (C.GLASS read or dark, as the
  script's header says: the room ends on the reader's post or the
  light, never on a walk out, and a decliner is pointed at the oval);
  the hole-sight path's F.FAILED moved to a "Stand at the hole" verb on
  the seed ground south-east of the ring, Movement III only. Halla's
  after-light line, offered once, and once any Angel has put the light
  out she is at the glass for everyone and sells no more hours. The
  campaign smoke walks the room and takes the reader's post. What the
  script leaves to Phase C stays there and no landed line claims it:
  the date on the glass, the journal line for readers, the hour
  clerks' descent as a spawn, the dark-light threshold hiding the
  date; Caul's offer and reader lines say what the glass gives today.
  Reviewed by three adversarial readers (engine, script, world) with a
  refuter on each finding; the confirmed ones folded: the omen-reader
  was being moved by tile numbers where the effect takes pixels (she
  would have stood in the map's corner for everyone), the oval's POI
  state was unregistered and would have been dropped on reload, the
  hole verb lacked the movement gate the glass has, Ord's jump was
  offered after he had left the room, Caul and Halla claimed a descent
  and a date the game does not have yet, the step's end followed the
  question instead of the decision, and Halla kept selling hours after
  walking to the glass.
  Next for Phase B: the catalog reversal at the forge as a listing or a
  pull that moves the price (III.8), then the recorders at the lip with
  Caul's last offer (IV.6).
- Backlog A, Phase B, the forge (2026-10-03, night): the catalog reversal
  at the forge (III.8), from the script's lines tagged new. Quill's
  lesson now ends "List it, or pull it." (the choice ids `sell` and
  `spot` kept, so a saved body reads the same). The listing: a new
  `list` effect (`economy.listOwn`) posts the player's own print
  (`copy:wink` at COPY_PRICE) on the Grid through the market as it is,
  never passing through their hands; the stall's fee is spent at the
  tray when the purse has it, else kept back on the listing (a `fee`
  field, off the wire) and taken from the sale or charged on the cancel
  as far as the purse goes, the figure spoken each time it is taken; the
  price is the seller's only when a body buys it (the sale counted on
  them, `sold:copy:wink`); aura −1 once, by the node; Cold is the
  current; the Clearing's city listing climbs (moveClearing "taken");
  news. The pull: aura +1, readiness +2, the Clearing's price eases
  (moveClearing "refused"), the hot street set hot for everyone (not
  twice: a street already hot gets the shorter news line), news. Quill's
  later line follows the print (on the board, sold, back in the hand
  after a cancel, or gone to the tray or to decay), and the tray's Q
  with nothing in hand takes the player's own print off the board
  (the kept-back fee charged as a cancel's is, aura +1). Around the
  beat: listing ids come from a world counter (`market:seq`) instead of
  the board's length, so a post and a removal in one tick never share an
  id; a player's listing whose print has decayed to nothing leaves the
  board (the city's rows stand); a seller sees their own rows the board's
  top-12 cut left out, so what they owe on can always be cancelled;
  saved listings are rebuilt scalar by scalar on restore (a bad fee or a
  missing price never reaches the seller's bank); the armored-van hour's
  wave step, when the street is already hot by another van or a pull,
  closes with no van parked and no news. The journal's step text and
  its notice say the new scene. The campaign smoke pulls the print and
  waits for the hot street on the wire and the Clearing's price eased.
  Reviewed by three adversarial readers (economy, script, world) with a
  refuter on each finding; confirmed and folded: a guest (or an Angel
  before Movement III) could open the lesson from the tray and move the
  Clearing's price, the hot street and the news for everyone (the
  tray's F is now Angels' and Movement III's, and the node offers a
  guest neither choice); the listing counted a copy in a hand that held
  nothing, so the tray's Q gave the aura back for free; the later line
  said "on the board" after a sale or a cancel; a kept-back fee left the
  purse with no line; the ids; the fee on the wire; the cut rows; the
  van hour's false news; the saved rows; the step text; the choices'
  order (the script's: the listing first). Phase C still owns the
  street's cool-down (nothing un-hots it today) and the launch window.
  Next for Phase B: the recorders at the lip with Caul's last offer
  (IV.6), then the Hijack's and Absence's remainders.
- Backlog A, Phase B, the lip (2026-10-03, small hours): the recorders
  (IV.6) and Caul's word after the rite (IV.7's `lip-*` lines), from the
  script's lines tagged new; no step inserted. He stands on the lip from
  the fourth hour, and for a guest who walks the Grid (`content/caul.ts`,
  one rule the roster and combat share), silent until the hole is kept.
  Then, to an Angel who refused the private yield at Vesper's desk, the
  last offer: the hour as a signature, nothing paid (`lip`: "Sign it."
  writes C.LIP signed and makes Cold the current; "No." writes C.LIP
  refused and a little readiness, and he waits in silence after; "Walk
  on." leaves it open). The Passing's resolver reads the lip's key
  beside the operator's for Cold's claim, so a signer's hour is claimed
  as a taker's is, and Ord's `after` names the door the way the resolver
  read it ("You signed for it at the gate, for nothing."). An Angel who
  took the yield, or already signed, hears `lip-sold` and is not asked
  twice; a guest hears `lip-guest` and is offered neither key. After the
  rite his line is the outcome's: the question asked twice after a
  trace, "Next season. Same ring." after an absence or a failure, "It is
  exactly what I was told it would be like." after a hijack (Safety's
  form named when it was Safety's). A strike or a heavy that hits
  nothing and would reach the lip with him on it answers with the guest
  line; nothing is struck. What the script leaves to Phase C stays
  there: the vans backing up to the ring in his refusal line are
  trimmed and tagged. The campaign smoke reads his silence on the way
  to the Care, his line for the hour sold at the desk once the hole is
  kept, and his word on the outcome after the credits. Reviewed by
  three adversarial readers (engine, script, world) with a refuter on
  each finding; confirmed and folded: a swing beside him that the sweep
  had already answered (an unflagged body, a dodge) was overwritten by
  the guest line (now only a swing that neither hit nor spoke); his word
  on the rite was permanent, so a man who never leaves announced he was
  leaving on every visit (said once a season now, then the description,
  and a later season finds him silent); the serial he says first sat
  outside his quotes; the resolver's second key had no pure unit test;
  Vesper's desk fixed "Sixty" in her mouth while the lip read the
  constant (her `offer` now says the script's II.10 line, "A private
  yield", the Concern paying, with the figure the constant's, which
  Phase A had left as the shipped "private node" line); the IV.3 tag
  still said IV.6 had not landed; the IV.6 header named a plate a line
  cannot carry. Phase C keeps the vans, the mast and the launch.
  Next for Phase B: the Hijack's and Absence's remainders (Nara kept at
  the ring after an Absence, the per-viewer Hijack reel), then Quill's
  `ring` and `margin` at the vans.
- Backlog A, Phase B, the remainders (2026-10-03, small hours): the
  Hijack's and the Absence's, from IV.7's lines tagged new; no step
  inserted. After an Absence Nara Vale stays at the ring for that body,
  through the credits and after, while the Absence is the last word on
  its hour (her `personal`, before the movement-5 release; a sexton who
  walked does not stay), and says "I stay." as the shipped line did.
  The marked Angel's own sky: the rite now writes on the body who
  claimed the hour (Cold or Safety, as the resolver read it) and whether
  a trace was on the way (readiness at the appearance floor when it was
  taken), and both CRT altars' watch play that back to a body whose last
  rite was claimed: the Appearance with their name in the margin, or an
  empty sky through an oval with their name, or Safety's district
  holding still with the form under it. Every other body sees the
  catalog as it always played; the say is the viewer's alone. Ord's and
  Caul's hijack lines now read the rite's record first (`content/caul.ts`
  `coldClaimed`), falling back to the resolver's rule for bodies saved
  before it was written. Reviewed by three adversarial readers (engine,
  script, world) with a refuter on each finding; confirmed and folded:
  the dark altar's room hint was still given to a body shown its own sky
  (the altars' Winke are now the catalog's and the room's only); the reel
  ended with the next rite where the script and the synopsis say "from
  now on" (it reads the body's record now, so the mark is forever, as the
  Ruin kit's is); a body marked before the record read no trace (its
  readiness now decides, as its current does for the claimant); the
  rite's writes had no pure unit cases. What remains of Phase B: Caul's
  `oval-hour` through every oval on the Kerb, on the bought hour's wait
  (II.9), which is the next beat; and Quill's `ring` and `margin` at the
  vans, which wait for Phase C's launch. Then Phase C (the launch window,
  the dark-light threshold, the clerks' descent, the journal line and
  the date for readers).
- Backlog A, Phase B, the hour (2026-10-03, small hours): Caul's
  address through every oval on the Kerb when a bought hour does not
  come, from II.9's lines tagged new and revised; no step inserted. The
  bell's wait for the bought hour (the second step of the Kerb's side
  hour `Hours for sale`) opens `oval-hour` through a `dialogue` effect
  on the verb: his address, one text for every body, in his own table so
  the window carries his name and the guest's portrait, no serial (he
  is addressing the city), no Wink (a voice is not one), nothing after
  it; and the bell's own line, said in the same press, now says what the
  script says, that the bell is on a schedule, the schedule is the
  Concern's and so is the slip, and Safety only carries them (the
  shipped line had the schedule Safety's). The verb was already a
  guest's to press and the hour is guest-legal, so an unsealed body that
  bought the hour hears the same words. Once a body: the verb is `once`
  on SF.HOURS_WAITED and gated on the step, so the ovals do not speak to
  that body again. Phase C keeps the ovals going champagne for everyone
  at the hour, with the launch window, and the date on the glass: until
  then he says the date will be there. Reviewed by three adversarial
  readers (engine, script, world) with a refuter on each finding;
  confirmed and folded: the bell's revised line was lost in the client
  (the press opens the window and says the line in one step, the HUD
  hides a heard line under an open window, and its six-second fade ran
  out underneath; the four shipped pairings of a say and a window carry
  a notice beside them, this verb did not), so the HUD now holds a heard
  line's fade while a window is open and starts it the frame the window
  closes, through a pure `heardStep` in `src/ui/format.ts` with its own
  cases, which repairs those four pairings too; "The date is on the
  glass" outran the shipped glass, which carries no date until Phase C,
  so he says the date will be there, tagged as the reader lines are; the
  Verified entry recorded a run on GitHub's runner for a commit that did
  not yet exist; the hour's tags did not name the firing as every other
  Phase B tag does. Refuted: the test's literal speaker and portrait (he
  is drawn as a guest by design and has no Stage B slot); a Phase C
  promise missing from the synopsis (the script's launch beat carries
  it); the step's notice saying a schedule nobody signed beside the
  bell's the Concern's (Phase A wrote it so, and Halla's confront
  reconciles them). Of Phase B only Quill's
  `ring` and `margin` at the vans remain, and they wait for Phase C's
  launch; Phase C is next (the launch window, the dark-light threshold,
  the clerks' descent, the journal line and the date for readers).
- Backlog A, Phase C, the weave (2026-10-03, morning): the first of the
  shared world, from the script's lines tagged Phase C that need no
  launch; no step inserted. A new `flicker` effect puts the world's time
  on `W.ALTARS_FLICKER`, and the snapshot carries it to every viewer as
  `flicker`, a slow section (an old client ignores it; the protocol
  stays v3). The client pulses every altar in the Nave once when the
  moment is new to it and at most four seconds old, so a viewer who
  arrives later sees the altars as they are; under reduced motion it is
  one slow dip and nothing flashes (`render/motion.ts` `flickerDue` and
  `flickerTween`, pure, with cases; the floors keep each altar's resting
  brightness so a flicker ends where it began). The spine's darkening of
  the Foundry flickers them and its news now says "The altars in the
  Nave flicker."; the Foundry side hour's rake flickers them, for
  everyone, when the body at the step raked it out, and a Foundry
  already dark now closes that step with no
  second flicker and no false "Someone raked the Foundry out" (it used to
  post it), as the van's wave step does. The Cable's study says what
  darkening does. Ord's figure goes on the marquee once for the city,
  by the first body to hear it. The Appearance posts the recorders'
  blank tape after its own line, naming the angel by serial (never
  ", alone,", which would break the possessive). Reviewed by one
  reader after the first commit; folded in the next: a viewer could
  miss the flicker when the slow frame carrying it lands before the fast
  frame of its step (the merged snapshot's clock a step behind the
  moment), so the scene now waits for its clock to reach the moment
  (`flickerStep`, pure, with cases); the Cable told every later Angel to
  darken a Foundry already dark (it now says someone did, and they
  flickered); a rake followed in the same tick by someone's darkening
  still posted the raked news and a second flicker (the step's effects
  now also need the Foundry still lit); the script and this entry said
  the rake's flicker was the raker's alone (it is everyone's; only its
  firing depends on the raker); and Ord's `figure-after` in the script
  carried "It is on the marquee.", which the code never said and which
  the once-for-the-city news would make false for most bodies (tagged
  as not said). Next in Phase C: the date on the glass and the
  dark-light threshold that withholds it, then the launch window that
  reads them.
- Backlog A, Phase C, the date (2026-10-03, morning): the forecast
  glass carries the Concern's launch, from the script's lines that
  waited for it; no step inserted. The world's clock runs only while the
  city is live, so the date is in the season's own calendar, not the
  wall's: the launch is the first hour of a season's seventh day
  (`LAUNCH_OFFSET`), and once this season's has gone by the glass shows
  the next season's. A new pure module, `src/sim/launch.ts`, gives the
  moment, its date ("season 2, day 7, 00:00") and the count running down
  to it ("6d 23:59:12"), and the dark-light threshold
  (`DARK_LIGHTS_THRESHOLD`, seven; Caul has the number and says only
  that it takes more than one). The glass reads "the next hour" before
  the Organs and "the launch" from Movement III, each as a date with its
  count; from the threshold on, the line is there without a date, "There
  are not enough lights left to show it", with how many lights are out.
  The lines that had waited for the date now say it: Caul's reader's
  bargain shows "a date" under the line (past the threshold, where it
  was, nothing); Halla's word for the light put out is "the date went
  thin"; Caul's address through the ovals says "The date is on the
  glass." (past the threshold, that it is not and he noticed). Content
  and a pure module only: no server or protocol change, and the date is
  computed when a body reads it, so nothing new rides the snapshot. Next
  in Phase C: the launch window that opens at that moment (a flag and a
  timer in the tick, once a season: the weather raised a bounded
  amount, the hot street set hot, the listing's buyer named, all but
  the vans skipped past the threshold), with the glass reading "now"
  through it. Reviewed by one reader after the commit; folded in the
  next: Halla's word for the light put out said "the date went thin" to
  the seventh refusal and every one after, when there was no date left
  (past the threshold it is "the date went out"); the content test meant
  to show his address is the same for every body in a world compared
  only two guests (it now compares every body within each world, and
  reads Halla's line through a world instead of stringifying it); three
  stale comments and the `offer` tag. Two questions it raised are the
  owner's, recorded rather than decided: the switch is the city's, not
  the season's (seven refusals in a city's life withhold the date in
  every season after, which is how the synopsis's "switch with no
  handle" reads; a season-keyed count is a small change if wanted); and
  Caul says the city's figure sets the date while the date is a fixed
  hour of the season (the launch window is where the figure could move
  the hour).
- Backlog A, Phase C, the launch (2026-10-03, morning): the window itself,
  from IV.5; no step inserted. Once a season, at the moment on the glass,
  the world tick opens it for an hour of world time, for everyone at
  once, and decides once, at the opening, whether it is lit or dark
  (`src/sim/launch.ts` `launchDue`, `launchOpen`, `launchDark`; the
  tick's `tickLaunch` after the season roll; three world flags record
  which season opened, whether dark, and how far the weather climbed).
  Lit: the hot street is set hot, the marquee says "The launch. The
  Concern stopped selling. The weather is climbing on every meter.", the
  weather climbs a point just after the opening and one every five
  minutes, twelve at most, and never into meltdown on its own (the
  launch alone stops at the top of the fat band, 90, below the HUD's
  meltdown band; a point the ceiling blocks is spent, not saved;
  extraction can still take the city past it), and every body on the
  Kerb with no conversation open hears Caul through the ovals ("The
  hour. I am told this is the part where people look up."), except one
  in a fight, which gets the ovals as a notice instead of a window that
  would stop it; the House of Sky reads the drift as the launch's.
  Through the hour the glass reads "the Concern's line with a time on
  it: now"; both altars play the countdown reel for every body, the
  marked included, with his voice over the count; the board names the
  buyer, "BUYER: THE CONCERN", in its line and its label. Dark (past
  the threshold): no shift, no climb, the marquee says "The vans are on
  the Grid. The glass had no hour to give them." (the two vans drawn on
  the Grid are the vans), Caul through the ovals still lit says he
  noticed, the glass has no hour to come at, and the altars play
  yesterday's sky with no count and no voice. After the hour the glass
  shows the next season's date. The world's clock runs only while the
  city is live, so the hour is never skipped: an empty city meets it
  when it next wakes. Three stubbed-world tests (combat, fairness,
  world) now stub the dialogue opener the tick reaches, as they stub the
  quests. The cable enforcer on shift, the vans' look and Quill's
  `ring` and `margin` at the vans followed (below); next the clerks'
  descent, the hot street's cool-down, the Houses' lost hour at Ord's
  map, and the journal line for readers.
- Backlog A, Phase C, the launch's remainder (2026-10-03, morning):
  from IV.5's lines that waited for the window; no step inserted.
  Through a lit window the cable enforcer ("Cold desk · cable") stands
  its shift at the Organs' node, not the desk: its post moves to
  `organ-node-cable` at the opening and back to its desk after the hour
  (`W.LAUNCH_SHIFT`: 1 on shift, 2 going back, 0 at its desk). Every
  tick puts the body where the flag says: an idle or homeward enforcer
  away from its post is set down there whole; one in a fight, or dead,
  keeps its fight or its wait and is set down when that ends (a dead one
  respawns at the post); a world restored mid-window, or after it, is
  put right the same way. The Cable's study reads the line, "Cold
  desk · cable, at the node, not the desk. "Shift." The meter runs. It
  does not look up." A dark window sends no shift. The vans have a POI
  of their own, `armored-van`, beside the van drawn on the hot street's
  south-east corner: through any window, lit or dark ("the season sends
  them"), anyone who looks, a guest included, reads the doors open on a
  rack of recorders and the oval on the mast. The look and Quill's
  station stand east of the van, out of both hot-street enforcers' reach,
  so a guest who looks is not engaged. Quill keeps the lights on
  by the vans (a new station, `quill-vans`) through the window for a
  Movement IV body that has kept the hole and not yet stood in it: her
  shipped `ring`, never routed until now, gains its two choices, "The
  frame on the recorders." to the new `margin` (the gap low on the near
  side where whatever stands is not on the tape) and "Keep the lights
  on.". With that Phase B's last lines are in. A review of the commit
  found the shift held only for an idle enforcer, the look inside an
  enforcer's aggro, and two overclaims in the docs; all are folded.
- Backlog A, Phase C, the clerks' descent (2026-10-03, morning): from
  III.7's lines that waited for it; no step inserted. Putting the light
  out behind the forecast glass now sends the hour clerks down the
  Kerb's stair for the hour after it, for the whole city: the oval's Q
  writes `W.CLERKS_DESCENT`, an hour of world time on (a second light
  while they are down keeps them down an hour from the second), and the
  tick (`src/sim/descent.ts`, `reconcileDescent`) files three Hour
  Clerks out of the head of the stair below the room's door, five
  seconds apart, pacing the stair past the glass down to the Grid's gate
  and back (`STAIR_SPAWNS` in map.ts, routed like the Annex Runner, the
  Kerb's clerk sprite by id). They fight and fall as clerks do ("Hour
  Clerk did their job."), and a fallen one comes back at the head of the
  stair; once the hour is out each goes as soon as it is out of a fight.
  They are never saved: a restored world gets them filed out again if
  the hour still runs. The lines that waited are in: the oval's say ends
  "On the stair, the hour clerks start down.", Caul's `dark` says "The
  clerks are on the stair. A light goes and they come down. It is what
  the stair is for.", and his `after` reads "The clerks are still on the
  stair. They will be, for the hour." while they are on it, and the
  light's line after. "For the rest of the hour" is read as the hour of
  world time after the light, not the clock hour it falls in (a light at
  :59 would otherwise send them down for a minute); the owner may want
  the other reading. Next in Phase C: the hot street's cool-down, the
  Houses' lost hour at Ord's map, the listing's seller exposed by Quill,
  and the journal line for readers.
- Backlog A, Phase C, the hot street's cool-down (2026-10-03, late
  morning): until now nothing un-hotted the street once a van, a pull or
  the launch had made it hot. The script gives the cool-down to Phase
  C's window and has no line for it, so it is the launch window's close:
  once a season, when the hour is out (`launchClosing` in launch.ts,
  `closeLaunch` in the tick, `W.LAUNCH_CLOSED` so it is taken once), the
  vans leave and the hot street goes quiet for everyone, whoever made it
  hot, lit window or dark. Nothing is said; the street's label ("Hot
  street — flagged" back to "Hot street") is the city's notice. After
  it the street is the city's to heat again: the next one to wave a van
  through parks it with the van hour's own line, and the next pull at
  the forge heats it with the whole news line. A street heated after the
  close stays hot until the next season's. `SW.VAN_PARKED` is left as
  the record that a van once parked (nothing reads it). Next in Phase
  C: the Houses' lost hour at Ord's map, the listing's seller exposed by
  Quill, and the journal line for readers.
- Backlog A, Phase C, the journal line for readers (2026-10-03, midday):
  what Caul's reader's post promised, "the launch's hour, the count in
  the hole, the city's figure, in your journal from now on, the way we
  see them". A new slow section, `Snap.glass`, is built for a reader
  (C.GLASS "read") and null for everyone else (`glassFor` in
  snapshot.ts; the city's figure summed once a step and only when a
  reader asks). The field notes show THE GLASS under the bearing: "The
  launch: season 2, day 7, 00:00 · 6d 23:41:07" with the count run down
  by the client against the world's clock, "now" through a lit window,
  "no date · 7 lights out on the Kerb" through a dark one or past the
  threshold, then "The city's figure: 61 · In the hole: 3", in the
  glass's own words. Caul's offer now says the script's line, "in your
  journal from now on", since the journal gives it. The two items
  before it in this list were passed over, each needing the owner (see
  Backlog A): the Houses' lost hour names a House "whose layer the
  water (the heat, the light) is" and nothing in the synopsis, the
  script or the code says which House that is, or what a House's hour
  is (the synopsis points at the House war); and Quill's "Whoever the
  resistance is, they bought their paper from the same man I did" is
  already hers after the board, so "exposed for everyone who asks"
  needs a choice the script does not write.
- Backlog A, Phase D, the side hours re-pointed (2026-10-03, afternoon):
  the appendix's side hours made to say what the script says, found by
  a read-only audit workflow (six slices of the appendix against
  side.ts, side-pois.ts, side-npcs.ts and news.ts, each finding checked
  again by a skeptic: 28 confirmed of 39 reported) and a review
  workflow over the diff (three lenses, each verified). Every line the
  appendix tagged revised now ships word for word: the van's clerk
  saying what the clerk was told to say and the vans carrying
  recorders; the copy of a hole at the board's live price, "Seller: the
  resistance. Printer: Quill."; the copy taken down while the price
  stays up; the Concern's stamp on the fee tin; "No margin." on the
  spotted hint; the desk's close with the oval light on the wall;
  Corvin's form face up, "funded by"; the tax as "Tax", not the
  theory's word, and the column the window remits to; Corvin's "The
  paper is theirs; the form is mine."; the weather, not the theory's
  word, thinning under Dov's upkeep and the swept shrine; and last
  season's ground read against the glass once the glass itself has
  shown it (`F.GLASS_FAILED`, new, set by the glass's "Face last
  season"; standing at the hole sets `F.FAILED` alone). The desk's
  close step is done on its own flag, as the script asked, so the close
  is offered even when the sale that walked Vesper already shut the
  desk. The third altar has a screen of its own at last (`crt-altar-3`,
  across the aisle from the first, a dark altar with no verb until the
  hour lights it; the client draws every `crt-altar-*` with the
  existing prop), so lighting it no longer touches the catalog's lit
  altar the kneelers watch (I.9). Bugs the audit and the review found
  and fixed: the hour bell's waits and the contest's stands each spoke
  one step ahead, because a verb's say is read after its count
  (`interact.ts`), so the bell said it struck on the second wait and
  the ring said it wrote on the second stand; the honest answer's look
  branched on the name told to Pim instead of the burial under a name,
  and its notice said "No plate. A number." over a grave with a plate
  (now "Number twelve. The Officer's brother.", the same words less
  three); and the Cable's hour counted a keep anywhere in the city.
  It now counts keeps in the Organs (every keep raises the body's
  `kept:<district>` flag, `keptIn` in ids.ts), and because the Organs
  have three shared nodes and a kept node offers no Keep until someone
  extracts it, while all three stand kept a keep anywhere still counts,
  so the hour never waits on an extract. The script was corrected where
  it was wrong about the code: every giver's visit tally ("[a visit
  counted]"), Halla's greet at the glass and the choices her greet and
  hub really offer, Renn's cut-organ gates, the mute bell's header (the
  bell stays rung), and Movement III's Renn hub no longer promising
  Phase D. The two Phase C items that wait on you are still open (see
  the status block).

- Backlog A, the movements audit (2026-10-03, evening): `SCRIPT.md`'s
  four movements (lines 1–1630) read against the code line by line, a
  skeptic confirming each finding (93 of them). Where the script was
  wrong about the code, the script was corrected (54: tags, citations
  and transcriptions); where the code had not yet said the script's
  words, the code now does (42 items, about thirty changes). The lines:
  the Intake Clerk's and Desk Three's falls are heard (`FALL_LINES`),
  the intake step's notice is "Entered."; Ord's first, Nara's who and
  plot, Quill's board read, Vesper's cold read and the mark's failed
  line in the script's words (the weather, never Gestell's name); no
  Wink at the lip; the wreckage's line keeps the Concern's file; the
  Clearing's buy is "That is a price, not a sale."; the tray's sale
  says the listing's line before the forge's. The gates: Ord holds the
  Strait from the map until the glass is faced, so his after-map line
  plays there, says "I will be behind it", and reads the Foundry off
  the Organs rather than a world flag (Vesper too); the way back
  across the desk is offered only in the room; a print that sold is
  said before one in hand; Vesper's desk is closed to everyone after
  the rite; the funeral desk's line is chosen before the pay (her
  street, the sold hour waiting on the garden, or a made-up name);
  the garden's first-burial line now reaches the first to bury it.
  The new beats: an Appearance lights every altar for everyone and
  tells the bodies in the Nave; Caul opens the Appearance with the
  crew in the van ("Play it again.") and the Absence through the
  mast's oval ("Absence has a margin too."), each continuing to his
  word on the lip; the altars play this season's Absence and, after
  the credits, someone's sky, with no Wink about the room or the
  catalog; the glass after the credits names the next season's hour
  (or, the lights out, no count); Corvin Slate's two lines after the
  rite; Ord writes the gate alone on the news; Quill's "He asked you
  too." The client: the credits roll is the script's (`LINES.CREDITS`,
  filled by the HUD, the name as a title and the rest as prose; the
  old four rows are gone) and the lock panel's going-under line is
  cut. Two keys were wrong in the journal and are now tested
  everywhere: a step that sends the body to a place names a key that
  place answers to (the Strait's second column is a Q; the listing
  fee's stalls are Q, not E), for the spine and every side hour.

- The movements audit's review (2026-10-03, evening): four lenses over
  efec59d (the sim, the script's words, the client, the tests' strength)
  with a skeptic per finding; five confirmed and fixed. Quill's line
  after the forge said "It sold." when the forge's print had been taken
  back down by a body that had sold an earlier copy by hand: the sale
  is now the forge listing's own (`Listing.forge`, set by `listOwn`,
  kept by the save's migration and off the wire; a buy of it raises
  `F.FORGE_SOLD`). Under reduced motion the longer credits roll was
  centred past the screen's edges, the script's last line cut off on a
  laptop and printed under the return hint on a phone: the roll now
  stands still inside the dialog, which scrolls (wheel, End, PageDown),
  with the hint pinned clear of it. The glass, the board and the desk
  were tagged as saying a guest's line they never say (a spectated verb
  answers with LINES.SPECTATOR); retagged. And both new key checks were
  too weak to catch the bug they named: the side hours' check now asks
  the verb that answers the body standing at that step, and the spine's
  reads every key letter its detail names. The stronger side check
  found seven more journal hints naming E where the hour's verb is Q:
  the armored van's ask (E at the van stall buys insurance), the warm
  tray's bank and take (E there crafts and spends), the standing hour's
  funeral, and the cult upkeep's three shrines. SCRIPT.md's legend now
  defines every placeholder the script uses.

- The key audit (2026-10-03, night): every key a character, a place,
  a notice or the HUD tells a player to press, checked against what the
  key reaches in the state the line is heard in, and every place where
  one live verb hides another on the same key (the prompt offers the
  first live verb per key, a place's side verbs first); a skeptic
  confirmed all eight findings, all fixed. Spoken: Nara at the brink
  said "Press F at the ring" before the party was chosen at Ord's gate,
  where the ring only looks; she now sends you to Ord first (a new
  clause, in SCRIPT.md). A ruin duel's "F answers it" pressed F on the
  nearer wreckage and buried the duel's ground; an offer to you now
  leads the prompt. "Press I to use it" used the first paper, so an
  insured body could never use its repair paper; I now uses the paper
  that would do something and never spends repair on a whole body. A
  flagged body was told "Press V to flag" by the street and the strike,
  and V lowered its flag; it now hears "You are flagged. Press V to
  lower it." and "They have not flagged. A strike needs both."
  Hidden: the tax hour's E behind Form 9's paid filing (a purse under 5
  was stuck), the garden's free handful behind twelve's paid burial, the
  tray's spine "spot" behind the warm tray's paid banking for the whole
  hour, and the spine's "A prior hour" behind the standing hour's entry
  at the care shrine. Now the tax hour does not begin while a Form 9
  waits at the window and filing waits while the hour runs (refusing
  stays on Q); the free handful comes first; the tray's hour is on F;
  the standing entry waits for the history. `src/sim/keys.test.ts`
  holds each case with real content.

- The dead-end audit (2026-10-03, night): two agents walked every
  spine step and every side hour looking for a journal step that an
  event the body does not control could leave unfinishable, each
  candidate built through the real reducers; I checked every finding
  against the code. Fixed: (1) Movement IV's stance could be stranded
  for good, and with it the credits: the Passing was offered on F right
  after the ground was prepared, so a failed rite (or a season's roll,
  or another Angel's extract winning the contest) closed the hole the
  stance needs, and a prepared body was never offered the ground again.
  Now the Passing waits for the stance, and a prepared body whose stance
  is pending is offered "Prepare the ground" again once the hole has
  closed. (2) A guest whose sexton walked out after four extractions
  could never finish Movement I: only the funeral desk brings her back
  and it is in the Care, past gates a guest cannot pass; she no longer
  walks out on a guest. (3) The dialogue window showed four choices and
  bound keys 1 to 4, so Dov Marrow's and Halla Voss's hubs could push a
  report-back the journal points at off the end; the hubs now list
  report-backs first, and the window shows up to nine on keys 1 to 9,
  its body scrolling when they do not fit. Not changed: a guest who
  goes under early locks with Movement I unfinished, but the lock is
  the guest's designed end and linking unlocks the body to finish it.
  The side hours had no dead end (every verb's gate reads only the
  body's own step and flags; nodes regenerate; copies can be crafted
  again; the toll and Form 9 can be refused for free).

- The reach audit (2026-10-03, night): every place the journal or a
  hand-out points a body at, read against the gates that body can open
  at that moment, over every action and tick of both spine runs and of
  an Angel linked before the first step (881 states, about fourteen
  thousand targets). Every target resolved and was walkable, but the
  check found the city's one hole: the Care's door from the Clearing
  asked only for an Angel, so an Angel linked in the first hour could
  walk Grid → Clearing → Care before dying as death, and read and tithe
  at the House of Mortals hall (Movement II's step), pay the funeral
  desk, insure at the clinic and rest at the shrine. `PROMPT.md` ("Guests
  stop. Angels continue into the Care") and the synopsis ("dying as
  death opens the Care") close it, so that door now asks for `under`
  as the Nave's does; the Clearing stays an Angel's. A body saved in
  the Care before its going-under (possible until now) would stand
  behind two shut doors, so a restore now wakes any body that cannot
  walk to its respawn at the respawn (`walksBetween` in map.ts). The
  check stays: `spine.test.ts` asserts it after every action and tick
  (side hours' later steps included, since a body can run ahead of the
  spine; every live hand-out's speaker and steps; no Angel's hour handed
  to a guest), and `resolveTarget` is exported for it.

- The numbers audit (2026-10-04, small hours): every price, count and
  time a line, a label, a journal step or a notice names, read against
  the number the server uses (about seventy, in the content, the sim and
  the HUD). One was false: the Witness's Blitz says "The last eight who
  fell are traced on the ground", as `PROMPT.md` and `DESIGN.md` specify,
  but it showed every wreckage the city still held, however many;
  `BLITZ_COUNT` (8) was defined and never read. It now adds the last
  eight who fell (by the time of the fall, however old their wreckage)
  to what the body already sees, and never hides what it sees. The rest
  hold: every place that charges Bestand says and labels the price it
  charges (now a test over every costed verb), the kits' seconds and
  minute, the truce, the claims cap, the freeze's half hour (now
  `FREEZE_SECONDS`, 1800, used by the desk), the tax as the weather
  over four, the seed grounds, the shrines, the copy's nine. A stale
  comment in Halla's hub still said the window showed four choices.
  `src/sim/numbers.test.ts` holds it.

- The player-defect sweep (2026-10-04, small hours): a workflow of six
  finders, each a lens (the hard rules; state shared between bodies;
  repeatable gains; save and restore; the dialogue graphs; the client
  against the server), every finding reproduced through the real
  reducers and then re-reproduced by a skeptic who tried to refute it
  against the documents and this file. Twenty-four reported; the fixes,
  each confirmed: Movement I's node choice could be taken from an
  arrival by other bodies (a kept node offered no Keep to anyone, a
  drained one no Extract), so each body now keeps a node once a cycle
  whoever kept it first (`keepers`, off the wire) and E always answers;
  a freeze hid the node verbs from everyone in the Nave for half an
  hour (a guest's Movement I stopped there), so the choice stays and E
  says the freeze's line, as SCRIPT.md has it "for everyone"; an Angel
  linked in Movement I whose sexton walked out could never finish the
  hour (the desk that brings her back is in the Care, shut to it until
  the going-under since the reach audit), so she walks out on nobody
  who has not gone under; "Face the trace" paid +2 readiness on every
  press, the Passing's own number (now once, `F.TRACE`); a guest's fall
  dropped its purse and prints as an Angel's spoils ("Guests are not
  loot"); a locked guest still took, advanced and finished side hours
  through dialogue and changed the city with its presses (startQuest,
  the offer marker, the side hours and every verb with a cost, a once
  or effects now hold the lock); a third body's truce could stop a live
  ruin duel (a truce never reaches into one from outside); a reload
  mid-duel left the partner in a ring alone (a one-sided duel ends on
  the next tick); one Angel could walk as two bodies, its serial
  restored with a saved body while another body carried it, or after a
  sale (the server now keeps `serial:v2:<serial>` → the body that holds
  it, and a saved body whose serial another holds comes back unsealed:
  a locked guest at the threshold, its progress kept, told why, free to
  link again; guests never pass the Care's or the Organs' doors whatever
  flags they carry; the 2026-09-26 security review had noted this and
  left it); the recorder could be dismantled by one body and "preserved"
  by another, handing the coil's taker the voice's hour (the recorder is
  each body's own now, as SYNOPSIS I.8 and IV.1 have it: "the one you
  preserved or took the copper from ... she knows which"); the hour
  bell's news fired on every strike (now the one strike's); the third
  altar's and the unspent altar's news repeated for every body whose
  step closed on another's light (now the lighter's alone); one fresh
  print restored a decayed stack's value, and a print decayed to nothing
  still listed (merged by weighted average; the stall refuses nothing);
  Corvin Slate, walked to the Ring by another body's census, still said
  he stood in the Annex corridor and thanked bodies that never counted
  (the corridor beat keeps him in the Annex for its body; the Ring line
  thanks only the counter). The client: the ledger panel never opened or
  filled since the ledger was built, so nobody could buy, list or cancel
  on the Grid (L and the desk and the board open it now, and the render
  check presses L); the duel strip told the offerer "F at the wreckage",
  which buries the ground and voids the offer (it waits now), and the
  offered body saw nothing of the offer (the snapshot now derives
  `you.duelOffer` from the offerer's record, and the strip shows "RUIN
  DUEL ASKED · F on them answers"); Take at
  the claims desk said nothing while a claim was held; the HOT STREET
  tag, the HUD's band and the weather's news read meltdown from 90.5
  while the street flags itself at 91 (the band is now the floored
  figure's, PROMPT.md's 91–100, so label, news and rules turn together;
  the same at 71 for fat); the HUD, the canvas and the server
  tiered aura at three thresholds (one now, the server's); a holder whose
  Angel already walks was told the wallet holds none; the Face readout
  was sent and never shown (a row in the strip while the Face is up,
  and the passings on the wreckage's label). Twenty-one confirmed and
  fixed; three judged otherwise. Judged intended or the owner's and left: Ord's
  after-map wording, the guest's purse at the link, the flag's news
  (kept behind a five-minute guard, see the status block).
  `src/sim/sweep.test.ts`, and tests in session, economy, events, hud
  and wallet, hold every case.
- The player-defect sweep, round two (2026-10-04, morning): six new
  lenses (enemies and the body in a fight; the Clearing, the Passing
  and the House holds; the money paths; the side hours in a shared
  world; the client's input and panels; time at its edges), round
  one's findings given as already found. Twenty-seven reported,
  eighteen confirmed and fixed: a Clearing kept open by its contest and
  then drained could never be prepared, joined or reopened until the
  season rolled, so every later Angel stood at Movement IV's prepare
  step (high; a held hole that cannot be contested again is joined); a
  wreckage could be looted or buried by its id up to three minutes past
  the hour the body could see it (high, twice; the server now takes
  only what the prompt offers that body); an enemy whose walk home met
  a pillar stayed in `return` for good, blind and free to fell (Desk
  Three on the guest spine, Pell, the Foundry clerk, the cable desk:
  set down whole at its post when the walk stalls or runs 30 s); a fall
  to an enemy left a live ruin duel on both bodies (every fall ends it
  now); an answered duel's fall after its grave's 45 s was not the
  duel's (its sixty seconds keep the grave); the omen's notice named
  the hole when the House held the hot street; the clinic and the
  shrine sold repair to a whole body, a second insurance and aura past
  full (offered only when they do something); the insurance paper spoke
  the death's line on holding it and the repair paper spoke of a print;
  three side steps that close on another body's act (the lamp, the mute
  bell, the seed ground) posted that act's news and re-stamped the place
  for every skipper; another body's copy hour moved Movement I's Quill
  to the listing board and another's ledger hour moved Movement II's
  Pim off the wake (each keeps its beat for the body on it, as the
  Officer's corridor does); Pim held hours for Angels not yet under, a
  marker behind a shut door; a locked guest was told it had lit the
  altar or waved the van (side hours' verbs hold the lock); the ledger
  never redrew a listing's new price, reset a price being typed to 9 on
  any rebuild (another body's listing listed yours at 9), and could not
  be closed with L at the desk; a HUD button clicked with the mouse kept
  focus, so Space pressed it again instead of striking (the render check
  now clicks the stance chip and fails on the old HUD); the prompt's T
  named one body and truced another. The nine judged otherwise are in
  the status block. `src/sim/sweep2.test.ts`, and tests in spine,
  economy, side, ledger and keys, hold every case; each of the sweep2
  cases fails on the commit before.
- The player-defect sweep, round three (2026-10-04, afternoon; run by
  hand, lens by lens, because the multi-agent run waited on an approval
  nobody was there to give): the K kits and the messengers, personas on
  the spine, two bodies on the spine together, reconnects and the
  protocol's edges. One defect: a Dweller's K planted in the nearest
  node in reach even when a seed was already there, said "Already." and
  spent its thirty seconds; it now plants in the nearest bare node and a
  press that plants nothing spends nothing (the need line says what it
  needs). `src/sim/sweep3.test.ts` holds it; it fails on d352a45. One
  owner call (seeds do nothing yet; status block). The rest came back
  clean, by design where it differs (see Verified). The journal and map
  and the weather's content are not yet swept this round.

## Verified (2026-09-25, integration)

- `npm run typecheck` — client and Worker clean.
- `npm test` — 34 files, 436 tests (2026-09-26): map integrity and reachability, identity,
  world/combat/fairness, economy, houses, clearing, engine glue, snapshot
  visibility, content coverage, side quests (all 33 driven end to end, every
  verb through the prompt, who offers what to whom), two full spine
  playthroughs reaching every Passing outcome, the desk decided once, ruin
  duels, meltdown streets, the season roll, shape migration, server sessions
  (including a stale-shape restore), clock, client socket, HUD helpers (events
  strip, ledger, journal), standalone-content lint.
- `npm run build:play` + `node scripts/stage-play.mjs` — production client staged.
- Against `npx wrangler dev --port 8788`: `scripts/smoke-world.mjs` PASS;
  `scripts/smoke-campaign.mjs` PASS on a fresh world and again on the same
  world (Movement I to the guest lock, link 7777, going under, Movement II).
  The campaign smoke used to fail about one run in two, for two reasons
  found 2026-09-26: its lanes end a tile (48 px) from the node or plot and
  the bot could stop 10 px past the lane's end, outside the 56 px reach
  ("prompt for nara-plot did not complete"); and it waited for two nodes
  taken in total, which a lived-in Nave cannot always give (a node keeps
  once until someone extracts, and charges come back one per 300 s), so
  after a few runs the first node was kept and empty and the count stopped
  at one ("keep the second node did not complete"). It now steps inside
  reach before every interaction, takes ops at nodes 1, 2 and 3 until the
  pair is taken, counts relative to what the body had, notes a spent Nave
  and skips the pair beat (the `measure:` lines of such a run under-read;
  keep only runs without a `spent` note), and its failures name where the
  bot stood and what the prompt showed. Separately, `wrangler dev` reloads the local
  server about a quarter second after `site/` changes (a fresh
  `stage-play`) and a reload drops the object mid-run, so both smokes wait
  for three quiet probes before connecting and the campaign smoke fails fast
  when the snapshot stream stalls for three seconds. Once, after many
  reloads in a row, workerd itself died ("Fatal uncaught kj::Exception:
  SQLite failed; database is locked: SQLITE_BUSY_RECOVERY") and left an
  orphaned `workerd serve` holding the local Durable Object's sqlite; the
  cure is `pkill -x workerd` (kill -9 any survivor that is not a child of the
  new wrangler), then start `wrangler dev` again and wait for `/world`;
  latest measure (after the courier beat, a full run on a reused world):
  bot 67 s (walk 48 s, three fights 16 s, talk 1.8 s), 1524 words shown, 8
  decisions, first playthrough estimate 16.7 min. With `--movement=2`
  (2026-09-26, after the sexton, Officer and tax-window beats): Movement II
  PASS, bot 79 s (walk 78 s: hall 6 s, the Annex 20 s, the desk 2 s, the
  window 9 s, back to the shrine 17 s, the board 19 s, the operator 5 s; talk
  and verbs 1.9 s), 1369 words (dialogue 492, spoken 446, journal 281,
  notices 150), 4 decisions, estimate 12.6 min on the spine alone (664
  words, 2 decisions, 7.0 min before the beats; 1196 / 3 / 10.7 before the
  window). One run right after a worker restart failed at the intake fight
  ("intake clerk falls did not complete") and passed on the rerun; not
  reproduced, not root-caused. With `--movement=3` (2026-09-26, after the
  tax-window fix): Movements I, II and III PASS in one run; Movement III bot
  95 s (walk 95 s: the Strait 6 s, the Foundry 3 s, the Cable 4 s, Ord 6 s,
  the garden 30 s, the glass 32 s, the forge 14 s; talk and verbs 0.7 s),
  723 words (dialogue 202, spoken 210, journal 188, notices 123), 1
  decision (the forge), estimate 7.5 min on the spine alone. Before the fix
  the same run failed at the window one time in two ("the tithe decided did
  not complete": the prompt offered `E:side:tax:read, F:read, Q:ride`, no
  `pay`; the other time the purse was short and the bot let it ride). After
  the Movement III beats (the same day): Movement III PASS, bot 104 s (walk
  103 s: the organs 13 s, Ord 6 s, the garden 32 s, the bell 34 s, the
  glass 4 s, the forge 14 s; talk and verbs 1.1 s), 1157 words (dialogue
  421, spoken 327, journal 253, notices 156), 3 decisions (the cut, the
  plate, the forge), estimate 11.5 min on the spine alone. With
  `--movement=4` (the same day): all four movements PASS in one run (7.5
  min of bot time); Movement IV bot 22 s (walk 22 s: the Care gate 16 s,
  the ring 6 s; talk and verbs 0.4 s), 309 words (dialogue 95, spoken 69,
  journal 79, notices 66), 1 decision (the last word), estimate 3.0 min on
  the spine alone; the Passing wrote `failed` at readiness 36 (the rite's
  floor is 60, appearance 80) with Cold as the current and the party all
  with. A run where an earlier run's Annex Runner is still up notes the
  slip beat skipped; that is the courier's respawn, not a failure. After
  the Movement IV beats (the same day, on a fresh local world): all four
  movements PASS; Movement IV bot 22 s (walk 21 s; talk and verbs 1.3 s),
  568 words (dialogue 222, spoken 111, journal 161, notices 74), 2
  decisions (the last word, the stance), estimate 5.1 min on the spine
  alone; the Passing wrote `failed` at readiness 48, told beforehand by
  Nara, Ord and the journal. After the Care gate (the same day, fresh local
  world): Movement IV bot 22 s (walk 21 s: the Care gate 15 s, Ord 2 s,
  the ring 4 s; talk and verbs 1.6 s), 851 words (dialogue 348, spoken
  169, journal 244, notices 90), 3 decisions (the last word, the party,
  the stance), estimate 7.3 min on the spine alone; `failed` at readiness
  52. On the reused world the run before it failed
  at "the hole is open": the last hole had not set (600 s of world time,
  and the world only runs while bodies are in it), which is the ring's
  ground bug above; the smoke now notes that case and passes partial.
- Writeback log: 4 diff tests (every kind, unchanged world, a body that only
  appeared, rolling news), 4 sink tests (batches, overflow, a failing D1
  keeps the queue and warns once a minute, one flush in flight), 3 session
  tests (a mock link writes one row through waitUntil, movement writes none,
  nothing without the binding, the read route's kinds and limits). Live: the
  local Worker with the migration applied writes the campaign smoke's link
  and serves it from `/log/recent?kind=link`.
- Audio: 15 tests pin the bed by district, the music machine (the pulse
  starts after 0.5 s of contact, stops 4 s after the last, never on a brush,
  drops off the city), every effect diff, and the settings (clamping,
  persistence, a storage that throws). The bus itself is thin and untested;
  the render check passes with the chip in the top row. No generated file
  exists in this checkout, so nothing has been heard.
- Wallet login: 7 session tests drive the object with real secp256k1
  signatures (holder sealed, stranger bound, forged signature refused, nonce
  spent and expired, the chain read through a stubbed `fetch` and refused
  while down, mock link on/off by environment, worker routing); the
  handshake's client side is tested with fake EIP-6963 wallets; the local
  Worker answers `/wallet/challenge` (409 without a live session). A real
  wallet in a browser is not verified from this container.
- Load: 3 meter tests (empty, smoothing and the windowed worst that is
  forgotten, no negative lateness, stalls, the last broadcast per viewer)
  and a session test reads `/world`'s report after one late alarm. Live,
  `scripts/load-check.mjs` against the local Worker after the diet: 20
  bots, 15 s, snapshot interval mean 48 ms (p99 74 ms), alarm late mean 4 ms
  (worst 40 ms), 4.5 KB per fast frame, PASS; 40 bots: mean 56 ms (p99 96
  ms), alarm late mean 8 ms (worst 80 ms), 7.6 KB per fast frame, PASS; 80
  bots: mean 117 ms, alarm late mean 347 ms, FAIL. Before the diet 40 bots
  failed on a 145 ms alarm and 80 stalled. This container's workerd, one
  small CPU.
- Protocol v3: 8 frame tests (every Snap key fast or slow exactly once,
  a body split into motion and roster and joined back exactly, `you` split
  and merged back with the slow records kept under later fast frames, a
  crowd's split and merge equal to the snapshot, a body without a roster
  entry left out, the fast frame under 35 % of the snapshot, applySlow
  merging the roster by id, the tracker's first-full/nothing/only-changed/
  youSlow-alone/roster-owed sequence), a socket test folding fast and slow
  frames and forgetting them on reconnect, and the session tests reading the
  object's view through the same fold. Both smokes and the load check fold
  frames the same way.
- Generated-asset slots: 13 tests pin the manifest loader (the URL and
  no-cache request, one load shared, 404 / network / junk / wrong shape as
  empty, unsafe targets dropped) and the pure slot map (who has a portrait,
  which enemies get a sprite, seals and badges never for the unsealed, plates
  by district and heat, loops by outcome and district, every prop kind sized,
  the static props standing on level positions with unique ids and nothing
  live listed). The DOM and Phaser wiring is exercised only by the render
  check, with an empty manifest: the city renders as before and asks for the
  manifest once.
- Enemy routes: 5 tests pin the Runner's authored cycle and leg 0 at home,
  the walk around the cycle, that a courier never starts a fight and answers
  its striker, the leash measured from the corridor (a point on the route is
  no stray) with the return to the point in hand and the respawn on leg 0,
  and the fall handing the slip and its line to every participant. The spine's
  first playthrough fells the Runner and pins the number; the second names
  without it and pins nothing.
- Holders from the chain: 8 tests pin the calldata of both calls, word
  decoding, the offset and supply bounds, the five-minute cache and its
  bound, every unreadable-chain shape (down, RPC error, thrown fetch, junk,
  empty body) as unknown and uncached, and the map-then-chain order. No
  real RPC has been called from this container.
- The step's shared views: `npm run bench` (one process, 80 walking
  viewers, 3 s each): viewer-by-viewer 23.3 ms per broadcast mean, p99 37
  ms; the step's shared views 4.8 ms mean, p99 10.6 ms, one 68 ms outlier;
  identical bytes. 10 new or changed tests: shared identity across viewers
  and across an unchanged step, a changed section as a new object, the
  encoder byte for byte against JSON.stringify with and without the cache,
  the tracker's identity skip and the once-per-step stringify, and the
  server joining a body between two frames. Local load check after: 40
  bots PASS three runs in five (worst alarm 80–131 ms, interval mean
  55–57 ms; before 159–220 / 58–63, no pass); 80 bots not rankable through
  the dev proxy (multi-second stalls with `Broken pipe` in the wrangler
  log, p50 intervals under the step). The session smoke, the Movement I
  smoke and the render check PASS after the change.
- `scripts/render-check.mjs` PASS: title, Nave with HUD, dialogue screenshots
  in `.rebuild/shots/`; 14.9 fps under this sandbox's software WebGL
  (SwiftShader), so frame pacing on a GPU-backed laptop is still unmeasured.
- After the wallet challenge change (2026-09-26): typecheck, 448 tests, the
  build, the session smoke and the Movement I smoke PASS; the render check
  passes its screenshots and reads 8 fps on the container the session
  resumed in that afternoon (its SwiftShader is slower than the morning's,
  which gave 15; `RENDER_MIN_FPS=5` for that container, 10 for the other,
  30 is the real-hardware bar).
- The Stage B pull rehearsal (2026-09-27): typecheck, 468 tests (the
  new one runs the script as a child process against a stub host: the
  portrait bounded and jpeg, the sprite trimmed, the video and the audio
  byte for byte, the missing file counted and the run failed on it, the
  manifest listing the four that landed with the images' sizes), and
  the build.
- The deploy bundle after the day's server changes (2026-09-27, `npx
  wrangler deploy --dry-run`): 558 KB, 147 KB gzipped, 94 site files,
  bindings WORLD (the Durable Object), LOG (the D1 database), ASSETS,
  `MOCK_LINK "0"` and the `ANGEL_*` variables empty; the bundle builds
  and the settings read as the deploy needs them.
- The whole spine over the wire after the world record and its review
  fixes (2026-09-27, `npm run test:campaign:4` on a fresh world): I 15.7
  min / 7 decisions (the optional Runner beat not met this run), II 12.5
  / 4 (the Clearing at 40), III 11.4 / 3, IV 7.4 / 3 with the Passing
  `failed` at readiness 52 as designed, the credits reached; `/world`
  after: 5260 alarms, checkpoints 0.25 ms, `dropped` 0, `swept` 0,
  `refused` 0. Then the 40-bot load check for the checkpoint under load:
  1.05 ms mean, 3 ms worst (was 1.2–1.4; walking bots still write their
  records, the world blob no longer carries them); its timing bars missed
  on this container as before (interval mean 82.2 ms, worst alarm 485
  ms, one stall), which `.rebuild/ZONES.md` already treats as the
  container's noise, not the object's.
- The review fixes on the world record (2026-09-27, latest): typecheck,
  467 tests (a record with fewer fields restored through the migration
  and given its quest on the first tick, a dodge in flight dropped; a
  restored body not rewritten when another socket's action checkpoints;
  the close writing a stamp and not an unchanged body; the rejoin
  writing a stamp and not the body it read; a put that throws leaving
  the body to the next alarm's checkpoint), the build, the session
  smoke, the Movement I smoke on a fresh world twice (one run fell at
  Desk Three, walked back, passed the fight and then hit the old 90 s
  deadline, which the recovery now extends; the next run 16.6 min / 8
  decisions, checkpoints 0.25 ms), and the render check at
  `RENDER_MIN_FPS=5` (desktop and phone).
- Bodies out of the world record (2026-09-27): typecheck, 466 tests (a
  first checkpoint writing the world, both bodies and both stamps with
  the world record carrying no bodies, a second writing the world and
  the body that acted and not the one standing still; a hibernated
  socket's body restored from its record, untouched, and a socket with
  neither a record nor an embedded body closed with 1012; the legacy
  embedded world still restoring; the wallet, takeover and coalescing
  tests reading the records), the build, the session smoke (its saved
  reconnect over the wire), the Movement I smoke on a fresh world (15.8
  min / 8 decisions; checkpoints 0.25 ms), and the render check at
  `RENDER_MIN_FPS=5` (desktop and phone).
- The review fixes on the landing log, the bench and the phone HUD
  (2026-09-27): typecheck, 464 tests, the build, the workflow's YAML
  parsing, `BENCH_BODIES=40 npm run bench` with the frames row asking
  youDue (1.85 ms mean, 4.3× the tick alone), and the render check at
  `RENDER_MIN_FPS=5` on the rebuilt bundle: desktop, then the phone
  with the chips measured (three rows, the minimap and the journal's tab
  seated under them in `06-phone-nave.png`), its page errors printed
  (the proxy's certificate on the fonts and the manifest gate's 404,
  the same as the desktop's, so not failed).
- The whole spine over the wire after the sweep, the review fixes and
  the per-address budget (2026-09-27, `npm run test:campaign:4` on a
  fresh world): I 16.7 min / 8 decisions, II 12.5 / 4 (the Clearing at
  40), III 11.4 / 3, IV 7.4 / 3 with the Passing `failed` at readiness
  52 as designed, the credits reached; `/world` after: 5054 alarms,
  `dropped` 0, `swept` 0, `refused` 0. The load check's retry: 45
  upgrades at once from one address, 25 refused and retried, 45
  connected in 2.2 s; the fixed script connects 40 bots in 1.8–2.6 s.
  The local 40-bot check itself ran three times on this container:
  interval means 80.9, 83.2 and 79.0 ms against the 80 bar, worst alarms
  201, 455 and 149 ms against 100 (the 26th's runs gave 80–131 at best
  and passed three in five); checkpoints 1.2–1.4 ms as before. Noisier
  than the day before, not attributable from here: the object's
  per-message work grew by a bucket draw, and the deployed run (Backlog
  4) is the measure that counts.
- The join budget per address (2026-09-26, latest): typecheck, 464 tests
  (thirty joins from one address admitted and its thirty-first refused
  while another address joins; sixty from everyone and the city's
  sixty-first refused, `refused` 2; the upgrade without an address header
  answering 429 with `Retry-After`; a token back a tenth of a second
  later; 1024 address buckets and the full ones forgotten at the next
  new address three seconds on; an oversize message dropped and
  counted), the build, the session smoke (its 5000-character junk frame
  now the one `dropped` on the report, by design), the Movement I smoke
  on a fresh world (16.8 min / 8 decisions, `refused` 0), and the render
  check at `RENDER_MIN_FPS=5` (desktop and phone).
- The review fixes on the budget and the sweep (2026-09-26, last):
  typecheck, 464 tests (thirty joins in one instant admitted and the
  thirty-first refused, the upgrade answering 429 with `Retry-After`,
  `refused` 1 on the report, a token back a tenth of a second later; an
  oversize message dropped and counted; the stamp written by a session's
  first checkpoint and not its second, then by the close; a new city's
  first tick carrying no sweep, `sweep:v2` holding the clock and the
  cursor after one, a second instance over the same storage sweeping
  nothing inside the hour and then the page after the cursor, wrapping
  past the end; a sweep whose list throws leaving the alarm armed and
  the record in place, swept an hour later; the report's shape), the
  build, the session smoke, the Movement I smoke on a fresh world (16.8
  min / 8 decisions; `/world` after: `dropped` 0, `refused` 0, `swept`
  0) after the two falls at Desk Three described in Done, and the render
  check at `RENDER_MIN_FPS=5` (desktop and phone).
- The sweep of saved guest bodies (2026-09-26): typecheck, 462 tests (a
  saved body stamped by an action's checkpoint and by its close; at 31
  days the sweep deletes the stale guest with its stamp and keeps the
  Angel, the bound wallet, the guest seen a second ago, the live body and
  the record from before the stamps, which it stamps; no second sweep a
  step later; 31 days on the cursor wraps and the once-fresh guest and
  the once-unstamped record go, the Angel, the wallet and the live body
  stay; `swept` 3 on the report; the report's shape), the build, the
  session smoke and the Movement I smoke on a fresh world (16.7 min / 8
  decisions; `/world` after: 1863 alarms, `dropped` 0, `swept` 0), and
  the render check at `RENDER_MIN_FPS=5` (landing page with 8 log lines,
  desktop, phone: nothing off the screen).
- The object's message budget (2026-09-26): typecheck, 460 tests (an
  action at t=1000 checkpointed and broadcast at once, a second at
  t=1005 coalesced, the alarm at 1050 checkpointing first and
  broadcasting forced with the saved world carrying the stance, the
  window closed by t=2000, a no-op strike costing nothing; 200 stance
  messages in one instant leaving the first immediate and the rest
  dropped past the burst, `dropped` 80 on the report, one more after
  the refill at 1500, a second socket's bucket its own; the report's
  shape), the build, the session smoke, the whole spine over the wire
  on a fresh world (`npm run test:campaign:4`: I 8 decisions, II 4 with
  the Clearing at 40, III 3, IV 3 with the Passing `failed`, the credits
  reached; `/world` after it: 4819 alarms, `dropped` 0, checkpoints
  0.44 ms smoothed), and the render check at `RENDER_MIN_FPS=5`
  (landing page with 8 log lines, desktop, phone: nothing off the
  screen).
- A phone's HUD (2026-09-26): typecheck, 458 tests, the build, and the
  render check's new phone pass PASS (nothing off the screen, nothing
  stacked, no sideways scroll) beside the desktop pass and the landing
  page's; the tablet width (820) was already sound.
- The whole spine over the wire after the frames, the listing and the
  review fixes (2026-09-26, `npm run test:campaign:4` on a fresh world):
  I 16.8 min / 8 decisions, II 12.5 / 4 (the Clearing priced at 40, then
  48 on the yield), III 11.4 / 3, IV 7.4 / 3 with the Passing `failed` at
  readiness 52 as designed, the credits reached; the city's log then
  reads the credits, the failed Passing, the re-price (48 → 42) and the
  ground prepared, newest first, on the landing page. The bench curve at
  80, 120 and 160 bodies is in `.rebuild/ZONES.md` and Backlog 4.
- The city's log on the landing page (2026-09-26): typecheck, 458 tests
  (the wording of "ago", the lines kept and left out, the mount with a
  fake document and fetch: shown as text, hidden on a 404, on nothing
  written and on a fetch that throws, and a page without the band left
  alone), the build, the content lint over `site/`, and the render check
  with its new first step: the landing page shows the two news lines the
  local log holds (`00-landing.png`, the band under the controls), then
  the play client as before at `RENDER_MIN_FPS=5`.
- The review fixes (2026-09-26, last): typecheck, 455 tests (youDue on a
  record field, a dialogue closed by the tick, never on motion, notices
  or the kit's readout, fresh per viewer and after forget; the notices
  absent from the wire's `you` and present in their section, in the split
  and in the frames alike; a fast `you` carrying slow keys as undefined
  never covering the record on merge), the build, the session smoke, the
  Movement I smoke on a fresh world (notices counted from their section:
  161 words, as before), the render check at `RENDER_MIN_FPS=5`, the
  workflow's YAML parsing.
- The resistance's Clearing on the Grid (2026-09-26, later still):
  typecheck, 454 tests (the listing posted once and moved within bounds
  with its news lines, a buy and a cancel refused, decay leaving it, a
  player's listing never moved by it; the Passing re-pricing by outcome
  and not before the board; Movement II both ways through the spine
  fixture with the price, the board's label and say, the news line, a
  second read leaving the price, the yield taken +8 and refused −4; the
  ledger's city row), the build, the session smoke PASS, `npm run
  test:campaign:2` PASS on a fresh world right after the session smoke
  (the resistance prices a Clearing at 40 after the board, 48 after the
  yield; 12.6 min on the spine alone, unchanged), the render check PASS
  at `RENDER_MIN_FPS=5`. The Movement I smoke's Desk Three fight now
  hunts the clerk as the intake fight does and names the clerk's state
  when it does not fall: from the lane's end the desk stands a tile away
  on the diagonal (68 px, past a strike's 56), so the fight depended on
  the clerk walking to the body, and twice on a fresh world it did not
  within 25 s; hunted, it falls in 2.4 s.
- The viewer's own side (2026-09-26, later): typecheck, 451 tests (three
  new: the frames against the split snapshot, encoded and folded back,
  with a guest's hidden line, an open dialogue, notices and the kit's
  readout; a body's roster entry keeping its identity across a step and
  the tracker owing nothing for it; the prompt in a crowd passing over
  bodies without a verb and the fallen), the build, `npm run bench`
  (frames 5.2 ms vs shared 6.9 ms vs old 20.2 ms on this container), the
  session smoke PASS, the Movement I smoke PASS twice on fresh worlds
  (16.6–16.7 min estimate) after one run that stopped at Desk Three's
  fall (25 s of strikes, the clerk did not fall; not seen again, and
  nothing in the change touches combat), the render check PASS at
  `RENDER_MIN_FPS=5` (8.3 fps, this container's SwiftShader). A local
  note: `pkill -x workerd` does not stop `wrangler dev`, which respawns
  the runtime and keeps port 8788; stop the wrangler `node` process by
  its pid (from `ps -eo pid,comm,args`) before starting another.
- The deploy bundle: `npx wrangler deploy --dry-run` builds it without
  the API (549 KB, 144 KB gzipped, 92 site files, the five bindings and
  variables as `wrangler.toml` states them, `env.LOG (reverie-log)` on
  the real id); `npm run d1:migrate` applies the migrations locally with
  none pending. On the account (2026-09-26, through the connector): the
  `reverie-log` database answers `SELECT name, type FROM sqlite_master`
  with `d1_migrations`, `events` and `events_kind_at`, and
  `d1_migrations` holds `0001_events.sql`. The Deploy workflow's YAML
  parses; it has not run (the secrets are the owner's to set).
- The dev tools brought current (2026-09-27): typecheck; 468 tests under
  vitest 5 (36 files, 7 s); `npm run build:play` under vite 8 and the
  stage (the same 40 files, `index.html` equal modulo hashes); `npm run
  bench` (tick 1.5 ms, frames 6.2, shared 10.1, old 26.5 mean on this
  container; see Done for why these read higher than the earlier rows);
  the session smoke PASS and the Movement I smoke PASS on a fresh world
  under wrangler 4.141 (bot 79 s, 1530 words, 8 decisions, 16.8 min
  estimate); the render check PASS at `RENDER_MIN_FPS=5` (8.8 fps,
  desktop and phone); the deploy dry run unchanged (558 KB, 147 KB
  gzipped, 94 site files). One local note: `wrangler dev` reloads on a
  `package.json` change as it does on a `site/` change (a touch of a doc,
  a `src/` file or a vitest run does not), and the reload drops the
  object mid-run; the first Movement I run of the day failed at its first
  step ("socket closed") because a script edit landed during it, and the
  second run, left alone, passed.
- The Deploy workflow's `check` mode (2026-09-27): its YAML parses (ten
  steps, the job gated on `deploy` or `check`), and its five steps run
  here in sequence as the runner would run them, from a clean `npm ci`
  (the lockfile now naming `sharp`): typecheck, 468 tests, the client
  build under `VITE_BASE=/play/`, the stage, `wrangler deploy --dry-run`
  into `.wrangler/check` (558 KB, 147 KB gzipped, 94 site files); 33 s
  in all. Not run on GitHub: the dispatch through the GitHub connector
  on this branch answered 404, and `list_workflows` reports none, because
  GitHub registers workflows from the default branch only and `main`
  carries no `.github` at all; the first run waits on the branch reaching
  `main` (Backlog 2).
- `/health` naming the release (2026-09-27): typecheck; 469 tests (one
  new: a release read once through the binding and remembered, none
  without a staged file, a malformed file, a binding that throws); the
  build and the play build staged; against the local Worker on a fresh
  world, `GET /health` answers the staged `release.json` byte for byte
  and the session smoke PASS with that check in it; the Movement I smoke
  PASS on a fresh world (bot 106 s with 56 s of fights, 1530 words, 8
  decisions, 16.9 min estimate); the workflow's last step rehearsed by
  hand against the local Worker (the staged commit accepted, a foreign
  one refused); the render check PASS at `RENDER_MIN_FPS=5`
  (8.1 fps). The workflow's YAML parses with the new last step.
- The review fixes (2026-09-27, later): typecheck; 469 tests (the
  health test now counts the binding's asks: one for a good read, one
  for a 404, one for a malformed file, two for a binding that throws
  and two for a 503); the build; `npm run bench` without the warning
  (frames 5.4 ms); the workflow's YAML parses; the polling revision
  check rehearsed by hand against the local Worker (the staged commit
  accepted on the first try, a wrong one refused after the tries, and
  an unreachable city refused with "names nothing" on every try); the
  session smoke PASS against the default origin and against
  `http://localhost:8788`, the release check running for both; the
  Movement I smoke PASS on a fresh world (bot 71 s, 1525 words, 8
  decisions, 16.7 min estimate); the render
  check PASS at `RENDER_MIN_FPS=5` (8.2 fps).
- The HUD's markup for assistive technology (2026-09-27, later):
  typecheck; 473 tests (four new, reading the dialogs, the live regions,
  the meters and the labels off `index.html`); the build and the play
  build staged; the render check PASS at `RENDER_MIN_FPS=5` (7.9 fps)
  with its new reading of the live attributes in the browser: the
  dialogue a dialog, the notices live, the connection chip a status,
  the four meters named with values equal to the numbers shown (HP
  72/100, Aura 0/100, Restraint 61/100, Readiness 0/100 in that run;
  the dialogue happened to be closed, so the speaker naming was read by
  the markup test alone). The load check re-read is in Done and ZONES.
- The map in text (2026-09-27, later): typecheck; 475 tests (two new on
  the sentence: another district named, here, no objective, a freeze);
  the build and the play build staged; the render check PASS at
  `RENDER_MIN_FPS=5` (8.1 fps) reading the label in the browser: "City
  map. You are in Nave of Tubes. The objective, Your name in the ledger,
  is here."
- The render check's exchange (2026-09-27, later): typecheck, 475 tests
  and the build unchanged (the minimap's reduced-motion branch has no
  unit test; it reads `matchMedia` once); the render check PASS at
  `RENDER_MIN_FPS=5` (7.2 fps) on a fresh world, its walk ending at a
  yield node (prompt "YIELD NODE, E EXTRACT, Q KEEP"), EXTRACT answered
  by a notice, HP untouched at 100 (the old walk met the clerk and read
  72–86), the map's label "lies south-east, 9 tiles" from there.
- Keyboard reach (2026-09-27, later): typecheck; 479 tests (four new on
  who owns a press); the build and the play build staged; the render
  check PASS at `RENDER_MIN_FPS=5` (8.3 fps) walking the path in the
  browser: Shift+Tab from the canvas focused the stance button, another
  Shift+Tab the journal's tab, Escape left focus on the game; the
  exchange and the map's label as before.
- Dialogue focus and the canvas under reduced motion (2026-09-28):
  typecheck; 490 tests (eleven new: the media query read live and
  absent, `stillTween` keeping the fade and dropping the movement,
  `pulseAt` holding its mean, `escapeDoes` and `focusAfterClose`, the
  dialogue's `tabindex`); the build and the play build staged. A browser
  probe (scratchpad, five runs) before the check was rewritten: the
  dialogue took focus with the focus ring visible, Tab reached the first
  of three choices, Enter took it and the next line handed focus back to
  the panel, Escape closed it and focus went to the game; with the
  prompt's verb button focused at open time, focus first failed to
  return to it (the fix above) and returns after it. The render check
  PASS twice in a row at `RENDER_MIN_FPS=5` (8.0 and 8.1 fps) with the
  new route: "a dialogue after SPEAK", the dialog open and named, the
  focus path as above, the node's EXTRACT answered by "Yield. 8 Bestand
  after the tax of 10" and the ledger reading 8 (the second run found
  the node spent and KEEP answered "You leave it unspent"), Shift+Tab
  focusing a verb button or the stance, another moving on. Before the
  rewrite the old blind walk failed once on the first run after a fresh
  Worker (nothing in reach) and passed on the rerun; the new route is
  planned from the map and nudged, and has not missed in seven walks.
  The reduced-motion branches of `Fx` and `Entities` are read by unit
  tests of their decisions; the render check's phone pass sets the query
  in a browser since later that day (below).
- The lock, the credits and the title (2026-09-28, later): typecheck;
  490 tests (the markup test reads two more attributes); the build and
  the play build staged;
  the render check PASS at `RENDER_MIN_FPS=5` (7.3 fps) with the dialogue
  path unchanged through the shared keeper. A browser probe (scratchpad
  `lock-probe.mjs`): the title's Enter button had focus at load; the
  browser entered as a guest, the campaign bot played that session to
  the guest lock (`SMOKE_COOKIE`, `SMOKE_STOP=lock`; the browser read
  "open in another tab" and, as designed, did not reconnect on its own),
  and after a reload on the same cookie the lock panel appeared and took
  focus with the ring visible, Tab reached the wallet button, Escape
  handed the keys back, Shift+Tab returned to the HUD, and "remain in the
  Nave" pressed with Enter hid the panel and sent focus to the game. The
  credits' focus is the same keeper and is not read in a browser here (a
  whole campaign stands before them).
- The Movement I smoke after the smoke script's two switches (2026-09-28,
  later): `npm run test:campaign` PASS on the lived-in local world (bot 91
  s: walk 44 s, fights 43 s; 1531 words; 8 decisions; 16.9 min estimate,
  in the 15–20 target), the default path untouched by `SMOKE_COOKIE` and
  `SMOKE_STOP`. Read on the way: no content effect moves Nara's, Quill's
  or Ord's shared position (their moves are personal overrides keyed on
  the viewer's flags), so a fresh guest finds Nara at her home on any
  world, and the render check's first exchange does not depend on what
  other players did.
- Reduced motion in the browser (2026-09-28, later): typecheck; 490
  tests (the markup test reads the journal's labels too); the build and
  the play build staged; the render check PASS at `RENDER_MIN_FPS=5` (7.8
  fps; 64 s wall clock for the whole check) with the phone pass under
  reduced motion: "query seen; marquee animation none", a strike and a
  dodge run under it with no phone-only script error, the HUD's boxes
  unchanged (0 off the screen, 0 stacked). The desktop pass stays
  without the query, so both branches of the canvas run in one check.
- The node exchange on a lived-in world (2026-09-28, later): the render
  check PASS five times in a row at `RENDER_MIN_FPS=5` after the fix:
  the fourth node EXTRACT, then KEEP, then three runs on the first node
  ("the fourth offered nothing"), each with a heard line and the ledger
  reading 8; Nara's dialogue and the focus path every time. Before the
  fix, the third run in a row failed on a stale WATCH read off the hidden
  prompt, and one run missed Nara's reach (the leg walked long).
- One-stick mobile (2026-09-28, later): typecheck; 499 tests (nine new
  on the stick's decisions: the dead zone, the four directions, the
  diagonals' sectors, the drag's length, the knob's clamp, a tap, the
  dodge direction, the merge; the dodge chip's touch label joins an
  existing one); the build and the play build staged; the session smoke
  PASS. A phone-sized browser probe with CDP touch events first (the
  stick planted, the knob at 0, −40 during the drag, seven tiles walked
  north in 1.5 s, hidden on lift, the dodge button's cooldown running,
  no page error), then the render check PASS twice in a row at
  `RENDER_MIN_FPS=5` with the touch step and the wall-anchored walks:
  Nara's dialogue and the focus path both runs, the node's answer both
  runs (the first node, the fourth having been left kept and empty by
  the runs before), the phone pass under reduced motion with "coarse
  true, touch points 1", the stick planted and lifted, the drag walked,
  the dodge chip pressed to "STEP · 0.4s". Three probe runs of the
  anchored Nara leg read the same prompt and bearing each time.
- The heavy by touch (2026-09-28, later): typecheck; 500 tests (one new
  on the second finger's decision at 0, 349, 350 and 2000 ms); the build
  and the play build staged; the render check PASS at `RENDER_MIN_FPS=5`
  with the wire read on the phone: "second finger held → sent [heavy],
  lifted → sent []; tap → sent [strike]", the stick planted and lifted,
  the drag walked, the dodge chip to "STEP · 0.4s", no phone-only script
  error.
- The gates on GitHub (2026-10-01): the push of `d217e34` started run 1
  of **The gates** on `ubuntu-latest` by itself (the repository's first
  workflow run), and every step passed in 30 s: `npm ci` 9 s, the
  typecheck 5 s, the tests 6 s (40 files, 500 tests, the same count as
  here), the client build 0.8 s and the stage, the dry-run bundle 2 s
  (558.62 KiB, 147.16 KiB gzipped, 93 site files, the bindings WORLD,
  LOG, ASSETS, `MOCK_LINK "0"`, the `ANGEL_*` variables empty). Read
  through the GitHub connector (the run's jobs and its log). The
  follow-up push carries this entry and the v5 actions; the Actions tab
  holds its run. Locally the same day: typecheck, 500 tests, the build.
- The generated manifest's 404 ended (2026-10-02): typecheck, 502 tests
  (the committed manifest's bytes and its empty load; the pull rehearsal
  overwriting it, and a pull of nothing writing it back byte for byte), the
  build; the staged client under the local Worker answers
  `/play/assets/gen/manifest.json` with 200 `application/json` and the
  empty manifest. The render check at `RENDER_MIN_FPS=5` on that stage
  passed (desktop: the landing page's 8 log lines, a dialogue after SPEAK
  with focus, keyboard reach, a11y, 8.4 fps under SwiftShader; the phone:
  the HUD in its screen, the stick, the heavy, the tap, the dodge chip),
  and its page errors are now the proxy's certificate refusal on Google
  Fonts, twice, each with its URL, and nothing else, on both passes. The
  same check against the stage with `manifest.json` deleted failed as the
  new rule means it to: `FAIL: the city failed to serve 1 file(s) the
  client asked for: http://127.0.0.1:8788/play/assets/gen/manifest.json`
  (wrangler dev answered 500 for a file removed from under its asset list;
  a stage that never had it answers 404; the rule catches both).
- The dependency refresh (2026-10-02, wrangler 4.146, vite 8.3.2, vitest
  5.0.3, sharp 0.35.5, the workers types): `npm audit` 0, typecheck, 502
  tests, the build; the local Worker restarted on a fresh world under
  wrangler 4.146 (its `/health` names the head commit after the stage);
  the session smoke passed (health, hello v3, fast and slow frames, live
  ticks, movement, the timed dodge, junk ignored, saved reconnect, guest
  identity, single-tab ownership); the dry-run bundle is unchanged (558.62
  KiB, 147.16 KiB gzipped, the same bindings); the render check at
  `RENDER_MIN_FPS=5` passed on desktop and phone (9.4 fps under
  SwiftShader; the two font refusals the only page errors). Movement I
  over the wire (`npm run test:campaign`) passed on a fresh world with the
  Worker to itself (8 decisions, 1525 words shown, the intake fight 7.1 s,
  Desk Three 31.6 s, link 7777, the going-under into the Care). A first
  run of it, started while the render check drove its own body on the
  same world, failed at the intake (the bot 159 px short of a clerk at
  full hp after 40 s, nothing hit): the two checks share one city and
  one CPU, so the smokes run one at a time from now on; the rerun alone
  is the measure.
- TypeScript 7 (2026-10-02): `npx tsc --version` 7.0.2; the typecheck of
  both configs clean in 1.55 s against 6.9 s under 5.9.3 on the same
  tree (timed back to back); 502 tests; the build; `npm audit` 0; `npm ls
  typescript` shows the root as its only dependent. The push's gates run
  on GitHub is the proof that `npm ci` on a clean Linux runner picks the
  platform package and the typecheck passes there too.
- Phaser 4 (2026-10-02): the typecheck against the 4.2.1 types, zero
  errors; 502 tests; the play build and its stage; the render check at
  `RENDER_MIN_FPS=5` passed on desktop (the landing page's 8 log lines, a
  dialogue after SPEAK with focus, keyboard reach, the a11y read, 10.0 fps
  under SwiftShader, the two font refusals the only page errors) and on
  the phone (the HUD in its screen under reduced motion, the stick, the
  heavy, the tap, the dodge chip); the screenshots read by eye (above);
  the bundles measured back to back on the same tree (3.90 then 4.2.1,
  the lockfile returning to the same bytes); `npx wrangler deploy
  --dry-run` 558.62 KiB, unchanged. Not run: the campaign smokes (the
  server and the protocol did not change; the smokes drive the wire, not
  the renderer).
- The live checks on GitHub's runner (2026-10-02): the push of `d46e2f4`
  ran both jobs of **The gates**, `gates` and `live`, green on the first
  try. In `live`, read through the connector: `0001_events.sql` applied to
  the runner's local D1; the Worker answered `/health` on the second poll
  (about four seconds) naming the pushed commit; the session smoke passed
  over the wire (31 s); the runner image's Google Chrome 154.0.8037.57 was
  found by path and the render check passed in 52 s at 11.9 fps under
  SwiftShader with no page error at all (the fonts load there; the two
  certificate refusals are this container's proxy), the landing page
  showing 0 log lines because the runner's log is empty; the `render-check`
  artifact uploaded 8 files (5.8 MB: the seven screenshots and the Worker's
  log). The rehearsal here beforehand: the same steps in this container,
  the Worker up in six seconds, the smoke and the render check passing
  with the browser named by path (10.8 fps). One warning to carry: the
  runner forces `actions/upload-artifact@v5` from Node 20 to 24; a later
  major of that action will end it.
- The campaign bot's fall recovery and facing (2026-10-02). The
  rehearsal `SMOKE_FALL_AT_INTAKE=1 npm run test:campaign` on a fresh
  world: the bot fell on purpose and woke at the spawn (264,2040), the
  step walked the lane back, the second try felled a clerk reset to 176
  hp and Movement I passed (the intake 21.3 s with the detour, Desk Three
  1.1 s, the Runner 11.4 s; bot 80 s). Two earlier rehearsals, kept for
  the record, failed as described in Done: with the body walking at the
  clerk inside the dead zone it struck nothing (clerk 176 after the
  budget); walking at it with no dead zone it landed half (clerk at 22
  when the bot fell again). Then the whole spine over the wire (`npm run
  test:campaign:4`, a fresh world, the Worker to itself): I bot 62.9 s
  (walk 47.7, fights 12.2: intake 6.2 s, Desk Three 1.2 s, the Runner
  4.9 s), 1520 words, 8 decisions, estimate 16.8 min; II 1367 words / 4
  decisions / 12.5 min; III 1157 / 3 / 11.5; IV 851 / 3 / 7.4 with the
  Passing `failed` as designed and the credits reached; about 48 min of
  a first playthrough on the spine, 18 decisions, as before. The two
  failed spine runs of the day before this change (14:04 and 14:20,
  each at the intake) are the reason for it.
- The load check re-read under wrangler 4.146 (2026-10-02, a fresh world):
  at 20 bots the interval mean 49.8 ms (p95 61, p99 105), the alarm 5.8 ms
  late on average, the checkpoint 0.81 ms, 3764 B per fast frame; at 40
  bots the interval mean 51.2 ms (p95 64, p99 73), the alarm 4.5 ms late
  on average, the checkpoint 0.91 ms, 6050 B per fast frame. The bytes
  and the checkpoint are unchanged; the timing at 40 bots is far better
  than under 4.141 (a 91 ms mean and 76 ms of lateness then), the new
  runtime's doing. The worst-alarm and stall bars fail on this
  container's hiccups as they always have (one 369 ms alarm and a stall
  at 20; a 352 ms alarm and two stalls at 40); nothing is a regression.
  The numbers are in `.rebuild/ZONES.md`. The same check on GitHub's
  runner, from the push of `c0be78d` (the live job's summary and its
  log): 20 bots at 20 Hz, PASS outright, the interval mean 50.8 ms (p95
  56, p99 58), the alarm 2.4 ms late on average with a 50 ms worst and
  no stall, the checkpoint 0.34 ms, 3865 B per fast frame; so every bar
  the container misses, a clean machine holds. The render check there
  ran at 15.2 fps this time.
- The fonts self-hosted (2026-10-02): typecheck, 503 tests (the new lint
  test among them), the play build (Vite rewrote the link to
  `/play/fonts.css` and copied `fonts/` into `dist`), the stage; the
  local Worker answers `/play/fonts.css` as `text/css` and the woff2
  files as `font/woff2`; the render check at `RENDER_MIN_FPS=5` passed on
  desktop and phone (11.3 fps) and, for the first time in this container,
  printed no page error at all on either pass: the two certificate
  refusals on Google Fonts that stood as the known errors since
  2026-09-26 are gone because nothing asks Google anything. The landing
  page's screenshot shows the display face at last (the title and the
  section heads in Anton, the body in Space Grotesk), where every earlier
  shot here had the fallbacks.
- Backlog A, Phase A, Movement I (2026-10-02, evening): typecheck, 506
  tests in 41 files (three new: Caul's presence rules, the pinned figure
  and the waking hint, the labels module), the play build and the stage;
  on a fresh local world the session smoke passed, the Movement I
  campaign smoke passed end to end (intake, nodes, Ord, Quill, Nara, the
  recorder, the burial, the weather named, the guest lock, the link, the
  going-under into the Care and Movement II), and the render check at
  `RENDER_MIN_FPS=5` passed on desktop and phone (11.2 fps). The render
  check's first run, started straight after the campaign smoke on the
  same world, failed its dialogue step with an empty prompt at Nara's
  home; the re-run alone passed, the same CPU-load flake noted before
  (the smokes run one at a time here).
- Backlog A, Phase A, Movement II (2026-10-02, later): typecheck, 506
  tests in 41 files, the play build and the stage; on a fresh local
  world the session smoke passed, the Movement II campaign smoke passed
  end to end (the shrine, Pim Ashe at the wake, the hall, Corvin Slate in
  the corridor, the freeze refused, the tithe decided, the history faced,
  the board read, the private yield taken through Vesper's dialogue with
  the oval's line opening after it, into Movement III), and the render
  check at `RENDER_MIN_FPS=5` passed on desktop and phone, run alone.
- `SCRIPT.md` (2026-10-02, evening): typecheck, 506 tests in 41 files
  with the content lint reading the script, the client build. Words
  only; no server, client or content code touched, so no smoke and no
  render check. Fifteen shipped lines picked at random from the script
  were found word for word in the code.
- Backlog A, Phase A, Movement III (2026-10-02, night): typecheck, 507
  tests in 41 files, the build, the play build and the stage; on a
  fresh local world the Movement III campaign smoke passed end to end
  (the Strait, the Foundry, the Cable, Ord's map, the garden buried,
  the bell, last season in the glass, the copy spotted, into Movement
  IV; 100.6 s of bot time, 1,379 words shown), and the render check at
  `RENDER_MIN_FPS=5` passed on desktop and phone, run alone.
- Backlog A, Phase A, Movement IV (2026-10-02, night): typecheck, 507
  tests in 41 files, the build, the play build and the stage; on a
  fresh local world the whole spine passed over the wire (Movements I
  to IV: Ione's last word, the ring prepared, the Passing failed at
  readiness 52 as the bot's path earns, the credits; 22.3 s of bot
  time in the fourth hour, 1,086 words shown), and the render check at
  `RENDER_MIN_FPS=5` passed on desktop and phone, run alone.
- Backlog A, Phase B, first beats (2026-10-02, late): typecheck, 507
  tests in 41 files (the Movement III walk now goes through the room on
  both runs: the reader's post on one, the light put out on the other,
  the window handed to Ord and back, the step waiting for the question,
  a reader never offered the light, the dark light counted and Halla at
  the glass), the build, the play build and the stage; on a fresh local
  world the Movement III campaign smoke passed through the room (the
  bot took the reader's post and heard the question; Movement III now
  shows 2,206 words, 1,520 of dialogue), and the render check at
  `RENDER_MIN_FPS=5` passed on desktop and phone, run alone; all of it
  re-run on the tree after the review's fixes.
- Backlog A, Phase B, the forge (2026-10-03, night): typecheck, 517 tests
  in 41 files (ten new: the print posted on the Grid without passing
  through the hand, the fee spent at the tray or kept back and taken from
  the sale or charged on the cancel with its figure spoken, a guest
  listing nothing, the ids from the world counter, the decayed listing
  leaving the board, the seller's rows the cut left out and the fee off
  the wire, the saved rows rebuilt, the tray's Q on the board, the van
  hour on a street already hot, a guest and an early Angel at the tray;
  the spine's two runs through the forge, the listing climbing and the
  pull easing the Clearing's price and setting the hot street, Quill's
  later line after a sale, a cancel and the tray), the build, the play
  build and the stage; on a fresh local world the Movement III campaign
  smoke pulled the print and saw the hot street on the wire and the
  Clearing's price eased (Movement III now shows 2,238 words, 1,540 of
  dialogue), and the render check at `RENDER_MIN_FPS=5` passed on desktop
  and phone, run alone; all of it re-run on the tree after the review's
  fixes.
- Backlog A, Phase B, the lip (2026-10-03, small hours): typecheck, 519
  tests in 41 files (the Movement IV walk now reads Caul's silence
  before the hole is kept, the line for the hour sold at the desk on one
  run and the form on the other, with a fork that signs and sees Cold
  claim the hour by the lip's key, Ord naming the gate and Caul's
  thanks said once, and the walk refusing for a little readiness and
  silence after; his word after every outcome, Safety's form included;
  a strike and a heavy at the lip answering with the guest line and
  striking nothing, for an Angel and for a guest on the Grid, while a
  body beside him keeps the sweep's own answer; the resolver's two keys
  and Cold's precedence as pure cases; the content test reads the
  routing for every combination of the hole, the rite, the season, the
  desk, the key and the guest), the build, the play build and the stage;
  on a fresh local world the Movement IV campaign smoke read Caul's
  silence on the way to the Care, his line for the sold hour once the
  hole was kept, and his word after the rite (the bot's rite failed at
  readiness 52, as the fourth hour's bot does without the side hours;
  Movement IV shows 1,197 words, 814 of dialogue), and the render check
  at `RENDER_MIN_FPS=5` passed on desktop and phone, run alone; all of it
  re-run on the tree after the review's fixes.
- Backlog A, Phase B, the remainders (2026-10-03, small hours): typecheck,
  521 tests in 41 files (the spine's runs read the marked Angel's own
  sky at both altars after a Cold claim under the floor, with the room's
  hint withheld and the shared altar still lit, the Appearance with the
  serial after the lip's signature at the floor, Safety's district after
  Safety's claim, and the catalog for a second body at the same altar
  and for the unclaimed; Nara at the ring through the credits after an
  Absence, home after a trace; the rite's writes as pure cases, the
  trace at the floor and one under it, Safety's keys, none on an
  unclaimed rite, and the mark standing through a later season's
  absence; the content test reads the reel for every recorded claim,
  the resolver's and the readiness fallbacks for a body marked before
  the record, the reel surviving a later absence, the altars' Winke
  withheld from the marked and given to the rest, and Nara's station
  for the four outcomes and a sexton who walked), the build, the play
  build and the stage; on a fresh local world the Movement IV campaign
  smoke passed as before (the bot's rite fails at readiness 52, so the
  reel and the stay are in-process coverage only; Movement IV shows 1,197
  words, 814 of dialogue), and the render check at `RENDER_MIN_FPS=5`
  passed on desktop and phone, run alone; all of it re-run on the tree
  after the review's fixes.
- Backlog A, Phase B, the hour (2026-10-03, small hours): typecheck,
  524 tests in 41 files (the content test reads the bell's verb, its
  line, its effect and its guest policy, the node's shape, its text and
  its silence, and that no other verb on the bell opens it; the walked
  side hours drive the bought hour's wait for an Angel, the window whole
  in the snapshot, closed with nothing after it, the step advanced and
  the verb gone from the prompt, and for a guest the same words and no
  Wink; the every-side-hour walk still passes through the wait with the
  window open), the build, the play build and the stage. After the
  review's fixes: 527 tests in 41 files (the HUD's `heardStep` cases:
  a line up and armed at once with no window, held under a window
  however long it stays and armed once the frame it closes, a newer
  line under the window replacing the held one, an empty or stale line
  putting nothing up, a window opening over a line already fading
  changing nothing), the typecheck, both builds and the stage; and,
  since the client changed, the render check at `RENDER_MIN_FPS=5` on
  a fresh local world passed on desktop and phone, run alone (it walks
  a guest in the Nave and does not reach the Kerb, so the hold itself
  is covered by the pure cases only). A second review pass over the
  HUD hold was cut off before any reader returned; checked by hand
  instead: the client's kept slow state carries `dialogue` into every
  merged snapshot, so the hold sees the window on every frame, and
  before the first slow frame it reads as closed. No server or protocol
  change, so the Wrangler smokes were not re-run.
- Backlog A, Phase C, the weave (2026-10-03, morning): typecheck, 534
  tests in 41 files (the darkening through the real verb stamps the
  world's moment, a guest's snapshot and the actor's carry it, the news
  reads the revised line, and a dark Foundry offers no second darkening;
  the rake flickers when the body raked it out, and a Foundry already dark
  closes the step with no flicker and no raked news; the Cable's line,
  the darken verb's effects in order, Ord's figure posted once for the
  city; the Appearance's two lines in order, the tape naming an alone
  angel plainly, no tape on another outcome; `flickerDue` and
  `flickerTween` cases), the build, the play build and the stage; on a
  fresh local world the session smoke (which now checks the slow frame
  carries `flicker`) and the render check at `RENDER_MIN_FPS=5` passed,
  each run alone. The flicker's own pulse is covered by the pure cases
  only: the render check does not darken the Foundry. The Movement III
  campaign smoke and a review of the diff were still running at that
  commit; their results are the next entry.
- Phase C, the weave, after the review (2026-10-03, morning): the
  Movement III campaign smoke on a fresh local world passed on the first
  commit (the Strait, the Foundry, the Cable, Ord's map, the garden, the
  glass, the print pulled, on to Movement IV); after the review's fixes,
  typecheck, 536 tests in 41 files (`flickerStep` waiting for a moment
  ahead of the clock and playing it once the clock arrives, a stale
  moment marked seen unplayed; the Cable's line with the Foundry lit and
  dark; the rake raced by another body's darkening, with one flicker and
  no raked news), the build, the play build and the stage, and on a
  fresh local world the session smoke and the render check again, each
  run alone. The GitHub gates passed on the first commit.
- Backlog A, Phase C, the date (2026-10-03, morning): typecheck, 542
  tests in 42 files (the new `launch.test.ts`: this season's moment
  while ahead and the next season's from it on, a late-started season's
  own calendar, the date's format, the count's format, its part second
  and its floor at zero, the threshold withholding from seven and not at
  six; the content test reads the glass before the Organs and after,
  with the date and the exact count, the next season's after this
  season's moment, the dark line with its count and no date, the
  reader's "a date" and its dark variant, Halla's "the date went thin",
  and Caul's address the same for every body in a world, with its dark
  variant; the walked bought hour reads his address through the world),
  the build, the play build and the stage. No server or protocol change,
  so the Wrangler smokes and the render check were not re-run. A review
  of the diff was still running at that commit; after its fixes,
  typecheck, 542 tests in 42 files (Halla's line light and dark; his
  address compared across every body in each world) and the build. The
  GitHub gates passed on the first commit.
- Backlog A, Phase C, the launch (2026-10-03, morning): typecheck, 547
  tests in 42 files (the window's pure cases: the hour's edges, open
  only once this season's opening is recorded, dark only while open,
  the opening owed once, the first point at once and the next an
  interval later, the bound, the stop short of meltdown, nothing owed
  dark or after the hour; the walked window through the real tick: the
  opening sets the hot street, posts the news once and opens Caul's
  oval line for the Angel on the Kerb and not the guest in the Nave, the
  weather climbs, the glass reads now, the altar's reel and his voice,
  the board's line and label name the buyer, the next season's date
  after the hour; dark: no hot street, the vans' news, his dark line, no
  climb, the dark altar with no voice; a body already in a conversation
  is not interrupted), the build, the play build and the stage, and on
  a fresh local world the session smoke and the render check, each run
  alone. The window itself cannot be reached over the wire in a smoke:
  it opens six days of world time into a season. Reviewed by one reader
  after the commit; folded in the next: the climb could carry the
  weather into the HUD's meltdown band (which starts above 90, a point
  below the rules' 91) from any fraction short of the old cap, so the
  ceiling is now the fat band's top, 90 (`LAUNCH_CEILING`,
  `launchClimb`); a point the cap blocked was saved and paid back in a
  burst when the city cooled the weather, so a blocked point is now
  spent with nothing climbed; Caul's window opened on a body fighting a
  clerk on the Kerb and stopped it mid-fight (a body with a clerk on
  it, a heavy winding up or a duel now gets the ovals as a notice); the
  test of the first point passed on the drift alone (it now pins a
  whole point); the House of Sky read "the drift is down" beside "now"
  (during a lit window it reads the launch's climb); stale docs. After
  the fixes: typecheck, 550 tests in 42 files (the ceiling from
  fractions, the blocked point spent, a cooled city climbing one point
  and no burst, the fighter's notice), the build, the play build and the
  stage, and on a fresh local world the session smoke and the render
  check, each run alone.
- Backlog A, Phase C, the launch's remainder (2026-10-03, morning):
  typecheck, 555 tests in 42 files (through the real tick: the cable
  enforcer's post moved to the node at a lit opening and set down there
  idle, the Cable's study reading the shift, the post back at its desk
  after the hour and the shift's flag cleared, no shift in a dark
  window; an enforcer in a fight at the opening and at the close kept in
  it and set down at its post after, and a world restored mid-window
  and after it put right; the van's look and Quill's station outside
  every Grid enforcer's aggro and reach; the van's look shut before the
  hour and open through a lit
  and a dark window to a guest; Quill at `quill-vans` with `ring` for a
  prepared Movement IV body through the hour, her two choices and
  `margin` with its Wink, and not before the hour, after it, after the
  rite or without the hole kept; the map's reachability with the new
  POI and station), the build, the play build and the stage, and on a
  fresh local world the session smoke and the render check, each run
  alone.
- Backlog A, Phase C, the clerks' descent (2026-10-03, morning):
  typecheck, 561 tests in 43 files (the stair walkable end to end inside
  the Kerb with the clerk sprite; no clerks and the same world back when
  no light is out; through the real tick the three filed out five
  seconds apart, walking down the stair inside the leash and seen in a
  viewer's snapshot, and gone after the hour; one in a fight kept until
  it ends, a fallen one gone with the rest; a second light keeping them
  down past the first hour; a restored world filed out again; the
  oval's say, its flag an hour on, and Caul's two lines; in the spine's
  dark fork the flag, the first clerk on the next tick, his `dark` and
  his `after`), the build, the play build and the stage, and on a fresh
  local world the session smoke, the Movement III campaign smoke and the
  render check, each run alone. The campaign smoke takes the reader's
  post at the glass, so the descent itself is verified in the sim, not
  over the wire.
- Backlog A, Phase C, the hot street's cool-down (2026-10-03, late
  morning): typecheck, 564 tests in 43 files (`launchClosing` owed once
  the hour of a window opened this season is out, not inside it, not
  once taken, not when no window opened; through the real tick a lit
  window's street hot through the hour and quiet at its close for every
  viewer, the close taken once and a street heated after it left hot, a
  dark window's close cooling a street a pull made hot, no close before
  any window; after the close the van hour's wave reopened and parking
  with its line), the build, the play build and the stage, and on a
  fresh local world the session smoke, the Movement IV campaign smoke
  and the render check, each run alone.
- Backlog A, Phase C, the journal line for readers (2026-10-03,
  midday): typecheck, 568 tests in 43 files (`glassRows`: nothing for
  no reader, the count run down and stopped at zero, "now", "no date"
  with the lights out; through the real tick a reader's glass "now"
  through a lit window, "no date" through a dark one, the next season's
  date after the hour, and null for a non-reader and a guest; in the
  spine's reader fork the date, a count ahead, the figure and the hole,
  and null in the dark fork), the build, the play build and the stage,
  and on a fresh local world the session smoke (`glass` null in a fresh
  body's first slow frame), the Movement III campaign smoke (over the
  wire the reader's post brings the glass with a date, a count ahead,
  the figure and the hole) and the render check, each run alone; the
  journal's glass block rendered in Chromium from the real markup and
  `hud.css` (a scratchpad screenshot; the render check's bot is no
  reader).
- Backlog A, Phase D, the side hours re-pointed (2026-10-03,
  afternoon): typecheck, 577 tests in 43 files (every side hour still
  walked end to end, the third altar's now lighting `crt-altar-3` and
  leaving `crt-altar-2` dark; the bell's three waits and the contest's
  three stands in order; the Cable's hour refusing a keep on the Kerb,
  taking one in the Organs, and taking one anywhere while all three
  Organs nodes stand kept by others; the desk's close offered and
  closing the hour after a sale shut the desk; the copy at the live
  price; twelve found under its name with the shortened notice; the
  ground before the glass, at the hole and after the glass; the
  satisfier table with the close on its flag and the Organs keep; every
  POI still offering a verb, its own or a side hour's), the build, the
  play build and the stage, and on fresh local worlds the session
  smoke, the Movement I, II and III campaign smokes and the render
  check, each run alone. A Movement III run made while the review
  workflow's agents were working beside it lost its socket when the
  local Worker reloaded; run again alone it passed.
- Backlog A, the movements audit (2026-10-03, evening): typecheck, 591
  tests in 43 files (the new: every altar after an Appearance and the
  notice to the Nave; the altars after an Absence and after the
  credits; Caul's crew and oval before his lip line in both spine
  runs; the glass after the credits, lit and dark; Vesper after the
  rite; Ord at the Strait, in the room and the way back; the funeral
  desk's three lines; the garden's two; the Officer after the rite;
  the forge's sale line; the falls heard; the credits' rows; the lock
  and credits markup; every step's key against its place), the build,
  the play build and the stage, and on a fresh local world the
  session smoke, the whole spine over the wire (`test:campaign:4`,
  Movements I–IV, outcome failed at readiness 52), and the render
  check; the credits roll read in Chromium from the staged page (the
  mark, the title, seven lines of prose).
- The movements audit's review (2026-10-03, evening): typecheck, 591
  tests in 43 files (the forge's mark through list, buy, migrate and the
  wire; Quill's two cases; every side step's key against the live verb
  at that step, 40-plus checked; the spine's 20-plus keys), the build,
  the play build and the stage, and on a fresh local world the session
  smoke, `test:campaign:4` (Movements I–IV, outcome failed at readiness
  52) and the render check. The reduced-motion credits read in Chromium
  from the staged page, entered past the title, at 1366×657, 360×640,
  375×553, 320×568 and 1920×969: the last line on the screen and clear
  of the hint at each, by End's scroll at 320×568.
- The key audit (2026-10-03, night): typecheck, 601 tests in 44 files
  (the new keys.test.ts: the brink before and after the gate, the duel
  answered past a nearer wreckage, the flagged street and strike, the
  tax hour and Form 9 in both orders, the garden, the tray, the shrine;
  paperToUse in the HUD's keys tests; the fairness tests for both flag
  lines), the build, the play build and the stage, and on a fresh local
  world the session smoke, `test:campaign:4` (Movements I–IV) and the
  render check.
- The dead-end audit (2026-10-03, night): typecheck, 607 tests in 45
  files (deadends.test.ts: the rite after the stance, the ground
  prepared again once the hole closed, the setting ground's look, the
  two hubs' report-backs among the first four and no hub past nine; the
  guest's sexton in economy.test.ts), the build, the play build and the
  stage, and on a fresh local world the session smoke, `test:campaign:4`
  (Movements I–IV) and the render check; a nine-line dialogue read in
  Chromium at 1366×657, 375×553 and 360×640: on the screen, its body
  scrolling on the phones.
- The reach audit (2026-10-03, night): typecheck, 610 tests in 45
  files (spine.test.ts holds the reach check after every action and
  tick of every run, and walks an Angel linked before the first step
  through Movement I into the Care; map.test.ts the Care's two doors;
  migrate.test.ts the restored body behind a shut door), the build, the
  play build and the stage, and on a fresh local world the session
  smoke, `test:campaign:4` (Movements I–IV: 17.6, 13.3, 18.5 and 9.6
  min, the outcome `failed` at readiness 52 as before) and the render
  check. Each new check was seen to fail on the code it guards against:
  the map test and the restore test on the old door and the old
  restore, the reach check on a Kerb shut behind `m3` (five side-hour
  steps named).
- The numbers audit (2026-10-04, small hours): typecheck, 615 tests in
  46 files (numbers.test.ts: every costed verb's label and line against
  its cost, the kits', truce's and desk's numbers, the freeze's half
  hour, and the Blitz's last eight, which fails on the old snapshot),
  the build, the play build and the stage, and on a fresh local world
  the session smoke, `test:campaign:4` (Movements I–IV, `failed` at
  readiness 52 as before) and the render check.
- The player-defect sweep (2026-10-04, small hours): typecheck, 638 tests in 47 files
  (sweep.test.ts and the new cases in session, economy, migrate, events,
  hud and wallet; the server's three unseal tests fail on the old join,
  the weather-band case on the old band, the render check's new ledger
  step fails on the old HUD), the build,
  the play build and the stage, and on a fresh local world (from a
  worktree: its local log database migrated first) the session smoke,
  `test:campaign:4` (Movements I–IV, `failed` at readiness 52) and the
  render check, which now presses L and reads the filled ledger. Of six
  campaign runs one failed in Movement I at "the slip was read at the
  naming" and one stalled in Movement II waiting for a snapshot (the
  first run in the worktree, its log table missing); neither recurred in
  four more runs, and the slip's assertion now prints what the bot heard
  so a recurrence names its cause. After the last three fixes (the
  offered body's duel row, the weather band, the Face row's window) the
  first `test:campaign:4` ran out the intake hunt's 40 s with the bot at
  86 hp, 31 px from a clerk at 132 of 176. The cause was the run's
  own harness and me: a `stage-play` started a few seconds into the run
  rewrote `site/play`, `wrangler dev` reloaded and closed every socket,
  and `settle` swallowed the stall, so the hunt read as "did not
  complete" a second into the fight (a run with its intake budget cut to
  1.2 s ends in that same state; the hunt's steering driven in-sim
  against the real clerk always finishes). `settle` now resolves false
  only for its own timeout and rethrows a stall or a closed socket with
  its reason (a file touched under `site/` mid-run now fails "intake
  clerk falls: socket closed"), and a hunt that does run out prints its
  last eight seconds. Movement I alone and then `test:campaign:4` on
  fresh worlds passed, and the render check after.
- The player-defect sweep, round two (2026-10-04, morning): typecheck, 652 tests in
  48 files (sweep2.test.ts's eleven cases, each failing on 857e4a9, and
  the new cases in spine, economy, side, ledger and keys), the build, the
  play build and the stage, and on a fresh local world (from a worktree)
  the session smoke, `test:campaign:4` (Movements I–IV; once before the
  side-hour and client fixes and once after all of them) and the render
  check, whose new pointer step fails on a HUD without the release (run
  both ways). The enemy changes were also driven in-sim before the wire:
  Desk Three leashed against its row's pillar is set down whole at its
  desk, and two cold desks on one felled body both walk back.
- The player-defect sweep, round three (2026-10-04, afternoon): typecheck,
  653 tests in 49 files, the build. By hand, against the spine's own
  walker (src/sim/spine.test.ts's helpers, copied into probes and
  deleted): every House and messenger a serial can give (serials 1 to
  12) walks Movements I to IV through every Passing outcome and the
  credits; the only differences are authored (an Earth Angel's hall step
  passes on the shrine because the hall is behind the Organs door; a
  Sky or Ruin-angel sees last season's failed hole without Storm). A
  second Angel walking the whole spine in the world the first already
  walked finishes it, the credits included: it waits out Desk Three's
  and the Runner's respawn, its link refuses the first Angel's serial
  (one body per Angel), and at the ring it joins the first's open hole
  and keeps it with them; world counts and the Clearing's price move
  for both, as they should. The six kits read against DESIGN's table:
  only the Dweller's misbehaved. The client's message checks refuse
  every malformed field (types, non-finite numbers, long strings,
  polluted keys, unknown ops), and the socket backs off to 10 s and
  stops on 4001.
- Not verified: a deploy (the Cloudflare API is denied by the network
  policy and the connector cannot upload a Worker), the Stage B assets
  (results host denied), rendered play on real hardware (a screen
  reader included), the Deploy workflow's own deploy steps on GitHub's
  runner (its check steps are the gates workflow's, which ran, above),
  and so the revision check at the end of a real deploy.

## Backlog

Prioritized. The autonomous routine takes the top unfinished item, finishes it
with tests, runs the gates, commits, pushes, and moves it to Done. Add items as
they are discovered; keep this list honest. As of 2026-10-02 items 1–8 and
10–12 are the owner's, a real device's or the network's to finish, and 9 is
done; item A is the owner's new direction and the routine's work from now
on; after it, the routine takes whatever it discovers, and adds what it finds.

A. **The rebuild around `SYNOPSIS.md`** (the owner's brief of 2026-10-02:
   a story of the quality the master brief asks for, the enemy a shadow
   company with a psychopathic chief, the themes embodied and never named,
   the existing art reused). The synopsis is written and is the script the
   rebuild follows; where it and `PROMPT.md` or `DESIGN.md` disagree about
   what happens on screen, the synopsis wins. `SCRIPT.md` is its every
   spoken line, tagged shipped, revised or new: Phases A, B and D land
   it line by line (a beat's header there says which step, flag, gate
   or station the lines need, and the rebuild adds nothing the script
   does not say), and a line the script tags shipped must stay as it
   is. Its §10 lists the phases;
   take them in order, one movement at a time, each landing with the
   gates, the session smoke, the campaign smoke for the movement touched
   and the render check, and each recorded here:
   - **Phase A, the company in the mouth of the city** (content only;
     done: all four movements landed 2026-10-02, see Done; what is
     listed below and not yet in the code is Phase B's or C's, and the
     script's tags say which): the
     company (the Concern) and its chief (Anselm Caul) named in the lines of
     Ord, Quill, Corvin Slate and Vesper Hale, on the clerks' badges and the
     vans' HUD labels, on the freeze form, the hall's lease plaque, the
     forecast glass and the news; Caul as an NPC body that is a guest in
     every rule the server already has (the guest sprite and portrait, aura
     0, not loot, barred by the personal gates), at the back of the Nave's
     altar aisle in Movement I, in the room behind the forecast glass in
     III and at the lip of the Clearing in IV, and as a voice at the altar,
     at the hour and in Vesper's office; Nara's refusal of the purse and
     her confession at the plate; Ord's figure at the glass; Quill's margin
     on the listing and the serial in the player's own print; the
     recorder's voice as Ione Kade's and the first hint moved from the lip
     to the waking in the Care (a guest hears none); Halla's hour played as
     the product; "reverie" in both of its senses.
   - **Phase B, the new beats** (one beat at a firing, each from
     `SCRIPT.md`'s lines tagged new or Phase B, with the beat's header
     there naming the step, flag, gate or station it needs; landed so
     far: the altar's reel (I.9), the room behind the glass (III.7), the
     forge's listing or pull (III.8), the lip (IV.6, with Caul's word
     after the rite) and the rite's remainders (Nara kept at the ring
     after an Absence, the marked Angel's own sky on the altars), see
     Done, and the hour (II.9, Caul through every oval on the Kerb when
     a bought hour does not come); Quill's `ring` and `margin` at the
     vans landed with Phase C's launch, so Phase B is done):
     never inserted between shipped steps (a
     saved body's progress is a step index); they enter as verbs and
     dialogue on existing steps or at a movement's end. The altar as a
     readable POI in the Nave (I.9); the oval's line by serial, branched
     on the hour sold, in Vesper's office (II.10); the room behind the
     glass on the Kerb, the reader's post (perception, no Bestand) or the
     light put out as a POI verb (III.7); the catalog reversal at the
     forge, a listing through the market or a pull that moves the price
     (III.8); the recorders at the Grid's gate with Caul's last offer, its
     own key beside the operator's, no payment (IV.6); Hijack written as
     whatever would have crossed, with a margin; Nara kept at the ring
     after an Absence; the Hijack reel per viewer and a news line.
   - **Phase C, the shared-world weave and two named systems** (begun;
     landed so far: the weave, see Done: the altars' flicker for
     everyone, Ord's figure and the blank tape on the news; the date on
     the glass with its count and the dark-light threshold that
     withholds it (the switch is the city's for good; the owner may
     want it per season); next the launch window, which should also
     settle whether the city's figure moves the hour as Caul says (the
     window itself has landed with its remainder: see Done, "the
     launch" and "the launch's remainder"; the clerks' descent has
     landed too, and the hot street's cool-down and the journal line
     for readers, see Done; what is left of Phase C waits on the owner:
     the Houses' lost hour at Ord's map (which House is the water's,
     the heat's and the light's, and what a House's hour is: a hold of
     the House war, or standing) and the listing's seller exposed by
     Quill (her line is written; "for everyone who asks" needs the
     choice that asks): the
     Cable's darkening flickering the altars server-wide; the listing's
     seller exposed by Quill; Ord's figure on the news; the count of dark
     lights on the Kerb as world state carried in the snapshot, the
     glass's date withheld past a threshold; the launch as a world window
     (a flag and a timer in the tick, once a season at the hour on the
     glass: the weather raised by a bounded amount and never past meltdown
     on its own, the hot street set hot, the listing's buyer named, skipped
     all but the vans when the lights are dark); the Appearance's blank
     tape as a news line naming the angel.
   - **The movements audit** (done 2026-10-03, see Done): the script's
     four movements read against the code; the script corrected where it
     was wrong, the code where it had not yet said the script's words.
     The appendix (the side hours, from line 1630) was audited with
     Phase D.
   - **Phase D, the side quests re-pointed** (done 2026-10-03, see Done:
     every appendix line tagged revised ships, the third altar has its
     own screen, and the audit's bugs are fixed): ids kept, one change each,
     the company behind every clerk, desk, van, hour and copy they touch.
   The rules that do not move: persistent ids stay; the server owns every
   number; no new art (Caul is the guest's art and must never get more);
   nothing from outside the game anywhere (the content lint says what); no theory named; the fairness
   tests, the guest lock and the four Passing outcomes as they are.

1. **Generated assets (Stage B).** 68 results exist in the owner's Higgsfield
   account (manifest: `.rebuild/generated-manifest.tsv`, pull script:
   `scripts/pull-generated.mjs`). Blocked until `d8j0ntlcm91z4.cloudfront.net`
   is reachable from the container. The slots are built (see Done: the
   manifest gate, portraits, sprites, seals, badges, plates, loops, props, and
   the whole audio system), and the pull script is rehearsed against a
   stub host (2026-09-27, see Done), so the remaining work is: `node
   scripts/pull-generated.mjs`, review each result in the render check's
   screenshots and drop anything off-style (delete the file; the manifest is
   rewritten from disk), then the leftovers with no slot yet: grave slabs and
   planted seeds (entities draws them), the credits plate, the seal on the
   minimap legend, the `coin-reverie` and `lockup-game` marks (the landing
   page), the four trailer clips (79–82) as extra loops, and the 30 s trailer
   (83) on the landing page in `site/`. Remaining Higgsfield budget after the
   music and trailer: about 255 credits, for replacements only.
2. **Deploy: one step left, and two ways to take it.** The database side
   is done (2026-09-26, through the owner's Cloudflare connector, which
   reaches the account although `api.cloudflare.com` is denied from the
   container): the D1 database `reverie-log` exists
   (`7243c40d-ba27-40cc-bc48-f9a786980442`), `0001_events.sql` is applied
   and recorded in its `d1_migrations` table, and the id is in
   `wrangler.toml`. The account's Worker `reverie-the-game` still runs the
   build deployed on 2026-09-25, before the log, the wallet challenge, the
   frames and the campaign density work. What remains is the bundle
   upload, which the connector cannot do and the container's network
   denies. Either: (a) the owner sets the repository secrets
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the values in the
   session scratchpad `cf.env`; never in the repo) and runs the **Deploy
   the city** workflow on this branch, typing `deploy`; it runs the
   gates, `npm run d1:migrate:remote` (none pending) and `npm run
   deploy`. One step before that: GitHub registers workflows from the
   default branch only, and `main` has none, so the file must reach
   `main` before the Actions tab or the API can start it (the routine
   tried a dispatch on this branch through the GitHub connector on
   2026-09-27 and the API answered 404, as it does for any workflow
   absent from the default branch). `main` (`b5062cb`) is an ancestor of
   this branch, so `git push origin claude/game-rebuild-fable-ccwl6i:main`
   fast-forwards it with nothing to merge; the routine never pushes
   `main`, so that push is the owner's. Once there, typing `check` first
   runs the install, the gates, the client build and a dry-run bundle on
   GitHub's runner with no secrets and deploys nothing (its steps pass
   here; see Verified; since 2026-10-01 the same steps run by themselves
   on every push from `gates.yml`, which needs no step on `main`, so
   `check` adds only a hand-run); then `deploy`; or (b) the network policy allows
   `api.cloudflare.com` and the routine runs `npm run deploy` here; or
   (c) from any machine where `wrangler` is logged in to the account (the
   account's other Workers were deployed on 2026-09-26, so one exists):
   `git checkout claude/game-rebuild-fable-ccwl6i && npm ci && npm run
   d1:migrate:remote && npm run deploy`. The
   dry run with the real id builds the same bundle (2026-09-27, after the
   day's server changes: 558 KB, 147 KB gzipped; 94 site files; bindings
   WORLD, LOG, ASSETS; `MOCK_LINK "0"`, `ANGEL_*` empty). After the
   deploy: `GET /health` → `{ ok: true, v: 3, release: { revision,
   builtAt } }` with `revision` the commit deployed (the workflow's last
   step checks this itself; by hand, compare with `git rev-parse HEAD`),
   then `scripts/smoke-world.mjs <origin>`, then the load knee (Backlog 4).
3. **Angel holders from the contract.** The chain read is built and tested
   (`server/src/holders.ts`); it waits on the ERC-721 itself. At deploy, set
   `ANGEL_CONTRACT`, `ANGEL_RPC_URL` (an endpoint the Worker may call) and
   `ANGEL_TOKEN_OFFSET` in `wrangler.toml`, then link one real wallet against
   the deployed city. Until then `ANGEL_HOLDERS` is the only source. One
   Angel active per body stays the rule (`applyLink` already refuses a serial
   that is walking). Not built: reading beyond the first token of a wallet
   that holds several (the first is the one that walks).
4. **Past 40 bodies, then zones: the object's side is done; the knee
   needs another machine.** The diet, its second pass, the step's
   shared views and the viewer's own side are in (see Done): one
   broadcast to 80 viewers in one area of interest costs about 5 ms of
   compute in one process on this container (`npm run bench`; the
   viewer-by-viewer path costs four times that), and the local 40-bot
   check passes more often than not. What the local check cannot say is
   where the knee is now: at 80 bots the bots and the Worker share one
   CPU and `wrangler dev`'s proxy drops writes (`.rebuild/ZONES.md` has
   the runs). The next measure is `scripts/load-check.mjs --bots=80`
   (then 120, 160) against a deployed city from a second machine, once
   the deploy is possible; only that run decides whether zone objects
   are needed at all. The in-process curve is known (2026-09-26,
   `BENCH_BODIES=N npm run bench`, `.rebuild/ZONES.md`): with N bodies
   walking in one area of interest the step (tick and one broadcast to
   every viewer) is 4.7 ms at 80, 9.4 ms at 120 and 15.0 ms at 160
   (99th percentile 9, 18 and 29 ms), the tick alone 1.2, 2.1 and 4.0
   ms; the broadcast grows with the square of the bodies in view, and
   compute alone would cross the 50 ms step near 250–300 bodies in one
   area, where the wire (about 3 MB per step at 160) binds long before.
   So the object's compute is not the knee at any population one area
   could hold; the area of interest and the wire are, and that is what
   the deployed run measures. No per-viewer compute lever is left that is
   worth a change before that run: what remains per viewer is the fast encode
   (the fan-out itself, 79 fragments joined per viewer) and, for Angels
   in a mob, the prompt's candidates; at that density the broadcast is
   847 KB per step (17 MB/s), so the wire binds first, which argues for
   zones or a smaller area of interest, not for more diet. Zone objects
   with handoff at the gates stay behind `ZONES=0`, designed in
   `.rebuild/ZONES.md`, and only when a real population asks.
5. **Opening density.** Re-measured 2026-10-03 after Backlog A (the
   movements audit, two fresh-world runs of `test:campaign:4`): estimate
   17.5–17.7 min, 1665 words (dialogue 818, spoken 278, journal 416,
   notices 153), eight decisions; inside the 15–20 target. Earlier:
   measured 2026-09-26 after the Annex Runner courier
   beat (`scripts/smoke-campaign.mjs` prints `measure:` lines; a later fight
   is floored at 25 s of a person's time, the first at 45 s; keep only runs
   without a `spent` note): bot 67 s (walk 48 s, three fights 16 s, talk
   1.8 s), 1524 words on the critical path (dialogue 725, spoken 228, journal
   416, notices 155), eight decisions; estimated first playthrough 16.7–16.8
   min, inside the 15–20 target (was 15.0 before the courier, 10.2 before the
   opening beats). The Runner is optional and respawns 60 s after a fall, so
   a run right after another may note it was not met. Nothing further is
   planned here; re-measure after any change to Movement I and keep the
   numbers here. One observation for the owner (2026-09-27), not a
   change: there is no passive regen and no heal on the route between
   the intake and Desk Three, so a body that took the intake's hits
   reaches the desk at about 44 hp against a clerk with 44 hp that hits
   for 14; the bot, which does not dodge, falls there about one run in
   five (the smoke now walks back and finishes), while a player who
   strikes first (22 a strike, two to fell it) or dodges the 0.6 s
   telegraph wins. If that is meant as the opening's first real test, it
   stands; if it is meant to be gentler, the first node's `keep` could
   carry a `heal` effect like the shrine's, a one-line content change.
   A second observation (2026-10-02): the intake itself can take a body
   that lets the clerk get behind it (a strike lands only in front), and
   a body that falls there wakes at the spawn on the clerk's own row
   while the clerk, with no fresh arrival near, resets to full hp (the
   abandoned-shift rule) — so the second try is the whole fight again, at
   100 hp, against 176. The bot now walks the lane back and faces what
   it strikes (Done); for a player that is the design as written.
6. **Movement II density: at target.** Re-measured 2026-10-03 after
   Backlog A: 13.2 min on the spine alone, 1497 words, four decisions,
   77 s of bot walking; inside 12–15. Earlier: measured 2026-09-26 over the wire
   after the sexton, Officer and tax-window beats: 12.6 min on the spine
   alone (was 7.0), 1369 words, four decisions (the corridor, the freeze,
   the tithe, the yield); 78 s of bot walking. Inside the 12–15 min target
   with four decisions. The last candidate is in (see Done): the board
   puts the resistance's Clearing on the Grid, priced, and the price
   moves with the yield decision and every Passing, so the "resistance"
   has a number you can watch in the ledger and the news. Nothing further
   is planned here; re-measure after any change to Movement II and keep
   the numbers here.
7. **Movement III density: over its proposal since the script landed.**
   Re-measured 2026-10-03 after Backlog A: 18.3–18.4 min on the spine
   alone, 2221–2242 words (dialogue about 1520), four decisions (the
   glass is now one), 110 s of bot walking. The 10–12 min proposal below
   was set before `SCRIPT.md`: the room behind the glass, Caul, the
   catalog's reversal at the forge and the lines that name the Concern
   added about a thousand words. The synopsis wins, so nothing is cut;
   whether Movement III's target moves to the script's length or the
   script's third hour is trimmed is the owner's call (noted in the
   status block). Earlier: measured 2026-09-26 over the wire
   after the cut, the plate and the bell (`npm run test:campaign:3`): 11.5
   min on the spine alone (was 7.5), 1157 words (was 723), three decisions
   (Ord's cut, Nara's plate, Quill's forge; was one), 103 s of bot walking
   with a stop in each long crossing. Inside the 10–12 min proposal with
   three decisions; no target is written in DESIGN for it, so that proposal
   stands as the target. Movement III has eight steps. The Strait's "refuse
   the feed" and the Foundry's "darken" still stand as optional verbs off
   the spine; Ord's cut now points at them without forcing them. Nothing
   further is planned here; re-measure after any change to Movement III and
   keep the numbers here. Movement IV is measured (Backlog 8).
8. **Movement IV density: over its 6–8 min shape since the script, and the
   spine alone still cannot reach
   the rite, and says so.** Re-measured 2026-10-03 after Backlog A:
   9.6–9.8 min on the spine alone, 1176–1197 words, three decisions, the
   Passing `failed` at readiness 52 as before; the whole campaign is now
   about 59 minutes of a first playthrough on the spine alone (I 17.5, II
   13.2, III 18.3, IV 9.8) with 19 decisions. Earlier: measured 2026-09-26 over the wire after the
   readiness read, the stance step, Nara at the brink and Ord at the Care
   gate (`npm run test:campaign:4`, fresh local world): 7.3 min on the
   spine alone (was 3.0), 851 words (was 309), three decisions (the last
   word, the party, the stance; was one), and the Passing wrote `failed`
   at readiness 52 (was 36), told beforehand by Nara, Ord and the journal,
   with where the rest is. Inside the 6–8 min, three-decision target the
   other movements' shape set. The readiness a spine-only first
   playthrough can reach is 52 with the party (the yield refused instead
   of taken would make it 62 and cross the floor of 60: refuse 10 against
   the take's 0), so the honest ending of a taking, spine-only run is
   `failed` by design, and a refusing Angel crosses it; alone trades the
   4 readiness for 8 restraint against the Safety hijack. Nothing further
   is planned here; re-measure after any change to Movement IV and keep
   the numbers here. Every movement is now measured over the wire: I
   16.7 min / 8 decisions, II 12.5 / 4, III 11.5 / 3, IV 7.3 / 3; the
   whole campaign is about 48 min of a first playthrough on the spine
   alone, with 18 decisions.
9. **The majors: taken** (2026-10-02, two commits; see Done). TypeScript 7
   typechecks the tree unchanged, 4.4× faster; Phaser 4.2.1 ports with no
   code change, the render check and its screenshots holding on desktop
   and phone, the client bundle 11% larger gzipped for the new renderer.
   `npm outdated` now lists nothing outside its range; `npm audit` is worth
   a look each firing. The number stays so older entries that cite it
   still read.
10. **Assistive technology, the rest.** The markup says what it is, the
   map speaks, the HUD's controls have keyboard reach, the dialogue, the
   guest lock and the credits take focus when they appear and give it
   back, the title's way in has focus at boot, and the HUD, the minimap
   and the canvas all honour `prefers-reduced-motion` (Done, 2026-09-27
   and 28; `.rebuild/CLIENT.md` has the list). Left: a pass with a screen
   reader on real hardware, which this container cannot do (the journal
   is a named landmark with a named quest list since 2026-09-28).
11. **One-stick mobile, the rest.** The stick, the tap, the second
   finger's strike and heavy (a hold of 350 ms) and the dodge button are
   in (Done, 2026-09-28) and the render check drives them with real touch
   events and reads what they send. Left: a pass on a real phone, which
   this container cannot do (Chromium's touch emulation is what the check
   has; the heavy's hold length in particular wants a thumb's judgement).
12. Mainnet stays disarmed: no mint, no `$REVERIE` settlement, claims desk banks
   into `banked` only. Keep the fairness tests green.

## Rules

- The server owns every number. `damageFor` is a constant.
- Guests: Movement I only, lock at the going-under, no claims, no flags, no
  Winke, no Care / Clearing / Organs.
- Every earner ships a sink. No yield promises anywhere.
- This is a standalone game. Nothing but the game appears in code, copy, site,
  docs or asset names. Credits name only the game.
- Reuse the existing art in `public/assets/`. Higgsfield generation was
  authorized by the owner on 2026-09-25 for a third of the account's credits;
  spend only the remaining budget noted in the Backlog, and only on
  replacements conditioned on the existing plates. No acid green in the world,
  no gold in the HUD. No Square Enix names or silhouettes.
- Never touch WALL STREET, Meltdown, METROPHAGE, Mafia or Solana Seas.
- Agents do not commit or push; the session owner handles git.
- Keep `npm run typecheck`, `npm test` and `npm run build` green before handing off.
