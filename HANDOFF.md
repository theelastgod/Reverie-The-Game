# HANDOFF — Reverie: The Game (rebuild)

State of the rebuild. Read `DESIGN.md` first, then `.rebuild/CONTRACTS.md`
(shared-sim signatures) and `.rebuild/CLIENT.md` (client contract). The master
brief is `PROMPT.md`. This document replaces the stage log of the prototype.

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
  bodies by linking while the others are offline).
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
- The deploy bundle: `npx wrangler deploy --dry-run` builds it without
  the API (541 KB, 142 KB gzipped, 92 site files, the five bindings and
  variables as `wrangler.toml` states them); `npm run d1:migrate` applies
  the migrations locally with none pending.
- Not verified: a deploy (the Cloudflare API is denied by the network policy),
  the Stage B assets (results host denied), rendered play on real hardware.

## Backlog

Prioritized. The autonomous routine takes the top unfinished item, finishes it
with tests, runs the gates, commits, pushes, and moves it to Done. Add items as
they are discovered; keep this list honest.

1. **Generated assets (Stage B).** 68 results exist in the owner's Higgsfield
   account (manifest: `.rebuild/generated-manifest.tsv`, pull script:
   `scripts/pull-generated.mjs`). Blocked until `d8j0ntlcm91z4.cloudfront.net`
   is reachable from the container. The slots are built (see Done: the
   manifest gate, portraits, sprites, seals, badges, plates, loops, props, and
   the whole audio system), so the remaining work is: `node
   scripts/pull-generated.mjs`, review each result in the render check's
   screenshots and drop anything off-style (delete the file; the manifest is
   rewritten from disk), then the leftovers with no slot yet: grave slabs and
   planted seeds (entities draws them), the credits plate, the seal on the
   minimap legend, the `coin-reverie` and `lockup-game` marks (the landing
   page), the four trailer clips (79–82) as extra loops, and the 30 s trailer
   (83) on the landing page in `site/`. Remaining Higgsfield budget after the
   music and trailer: about 255 credits, for replacements only.
2. **Deploy.** `npm run deploy` with the credentials in the session scratchpad
   (`cf.env`, never in the repo). Blocked until `api.cloudflare.com` is reachable.
   Verified without the API (2026-09-26): `npx wrangler deploy --dry-run
   --outdir=<tmp>` builds the Worker bundle (541 KB, 142 KB gzipped; 92
   site files; bindings WORLD, LOG, ASSETS; `MOCK_LINK "0"`, `ANGEL_*`
   empty) and `npm run d1:migrate` applies the migrations locally with
   none pending. At deploy: `wrangler d1 create reverie-log`, its id into
   `wrangler.toml` (the zero id is a placeholder), `npm run
   d1:migrate:remote`, then `npm run deploy`.
3. **Angel holders from the contract.** The chain read is built and tested
   (`server/src/holders.ts`); it waits on the ERC-721 itself. At deploy, set
   `ANGEL_CONTRACT`, `ANGEL_RPC_URL` (an endpoint the Worker may call) and
   `ANGEL_TOKEN_OFFSET` in `wrangler.toml`, then link one real wallet against
   the deployed city. Until then `ANGEL_HOLDERS` is the only source. One
   Angel active per body stays the rule (`applyLink` already refuses a serial
   that is walking). Not built: reading beyond the first token of a wallet
   that holds several (the first is the one that walks).
4. **Past 40 bodies, then zones: the object's side is done; the knee
   needs another machine.** The diet, its second pass and the step's
   shared views are in (see Done): one broadcast to 80 viewers costs 4.8
   ms of compute in one process (`npm run bench`), a fifth of before, and
   the local 40-bot check passes more often than not. What the local
   check cannot say is where the knee is now: at 80 bots the bots and the
   Worker share one CPU and `wrangler dev`'s proxy drops writes
   (`.rebuild/ZONES.md` has the runs). The next measure is
   `scripts/load-check.mjs --bots=80` (then 120, 160) against a deployed
   city from a second machine, once the deploy is possible; only that run
   decides whether zone objects are needed at all. The per-viewer work
   that remains is the NPC views (personal overrides and offers, ~10 per
   viewer per step) and the slow sections a viewer sees differently
   (npcs, nodes, wreckage, graves, objective, side objectives), still
   stringified per viewer every fifth step. Zone objects with handoff at
   the gates stay behind `ZONES=0`, designed in `.rebuild/ZONES.md`, and
   only when a real population asks.
5. **Opening density.** Measured 2026-09-26 after the Annex Runner courier
   beat (`scripts/smoke-campaign.mjs` prints `measure:` lines; a later fight
   is floored at 25 s of a person's time, the first at 45 s; keep only runs
   without a `spent` note): bot 67 s (walk 48 s, three fights 16 s, talk
   1.8 s), 1524 words on the critical path (dialogue 725, spoken 228, journal
   416, notices 155), eight decisions; estimated first playthrough 16.7–16.8
   min, inside the 15–20 target (was 15.0 before the courier, 10.2 before the
   opening beats). The Runner is optional and respawns 60 s after a fall, so
   a run right after another may note it was not met. Nothing further is
   planned here; re-measure after any change to Movement I and keep the
   numbers here.
6. **Movement II density: at target.** Measured 2026-09-26 over the wire
   after the sexton, Officer and tax-window beats: 12.6 min on the spine
   alone (was 7.0), 1369 words, four decisions (the corridor, the freeze,
   the tithe, the yield); 78 s of bot walking. Inside the 12–15 min target
   with four decisions. One candidate left, optional: the listing board
   with a second listing that moves the market (a world listing effect the
   engine does not have yet), so the "resistance" has a price you can watch.
7. **Movement III density: at target.** Measured 2026-09-26 over the wire
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
8. **Movement IV density: at target; the spine alone still cannot reach
   the rite, and says so.** Measured 2026-09-26 over the wire after the
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
9. Mainnet stays disarmed: no mint, no `$REVERIE` settlement, claims desk banks
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
