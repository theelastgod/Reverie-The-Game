# Module API contracts (src/sim)

Every module below is implemented against these exact exported names and
signatures. Reducers are pure: `(w: WorldState, ...) => WorldState`, never
mutate inputs, always return a new object when anything changed (returning `w`
unchanged is fine when nothing happened). `players`/`intents` are `Map`s; copy
them (`new Map(w.players)`) before setting. Everything else is plain JSON.

Shared imports: `./constants`, `./types`, `./map`, `./protocol`, `./content/ids`,
`./content` (index: `NPCS`, `POI_CONFIGS`, `QUESTS`, `LINES`, `NEWS`).

Cycles: `effects.ts` imports `economy`, `clearing`, `houses`, `world`,
`combat`, `dialogue`, `quests`; `dialogue`/`quests`/`interact` import
`effects`. That cycle is allowed (only function declarations, no top-level
calls into the other module).

## identity.ts
```ts
export const HOUSES: readonly Fourfold[];                 // ["earth","sky","mortals","divinities"]
export const MESSENGERS: readonly Exclude<Messenger,"">[]; // herald, witness, ruin, dweller, cybernetic, iridescent
export const SCHOOLS: readonly Exclude<WinkSchool,"">[];   // hint, wreckage, omen, dwelling, process, surface
export function houseFor(serial: number): Fourfold;        // HOUSES[(serial-1) % 4]; 7777 -> "mortals"
export function messengerFor(serial: number): Exclude<Messenger,"">; // MESSENGERS[(serial-1) % 6]; 7777 -> "herald"
export function winkSchoolFor(serial: number): Exclude<WinkSchool,"">; // SCHOOLS[(serial-1) % 6]
export function auraSeed(serial: number): number;          // 8 + (serial % 13)
export function isWinkSeed(serial: number): boolean;       // palindromes, 777, 1111, 707, 4077
export function formatSerial(serial: number | null): string; // "#0042"; null -> "GUEST"
export function houseName(h: House): string;               // "House of Mortals" | "Unsealed"
export function messengerName(m: Messenger): string;       // "Ruin-angel" etc | "Unsealed"
export function kitVerb(m: Messenger): string;             // "Announce" | "Blitz" | "Face the wreckage" | "Keep" | "Read the Gestell" | "Glamour" | ""
export function schoolName(s: WinkSchool): string;
export type LinkProof = { kind: "mock" } | { kind: "wallet"; address: string }; // in types.ts; the server builds a wallet proof only after verifying the signature
export function proofOf(sig: unknown): LinkProof | null;                // sig === MOCK_SIG → mock; anything else null (clients never carry wallet proofs)
export function validLink(serial: number, proof: LinkProof | string): boolean; // Number.isInteger, 1..ANGEL_SUPPLY, mock or a lowercase 0x address
export function serialHistoryMark(serial: number): HistoryMark | null; // 7777 -> mark at POSITIONS["history:7777"], else null
export function historyMarkFor(serial: number, log: HistoryLog, deaths?: number): HistoryMark | null; // the serial's written-back log as a mark at POSITIONS["history:mark"]: null when passings+buried+looted+deaths is 0; line from the last outcome, else what the hands did
```

## world.ts
```ts
export function emptyWorld(): WorldState;                  // gestell GESTELL_START, nodes initialNodes(), enemies initialEnemies(), npcs from NPC_HOMES (present, state "home"), pois every id in POI_STATES at its first state, houses initialHouses(), clearing initialClearing(), passing initialPassing(), failed: one FailedPassing per FAILED_PASSING_MARKS at season 0 (last season's hole exists on every shard), rng 0x9e3779b9
export function spawnGuest(id: string, now?: number): Player; // at GUEST_SPAWN, guest, aura 0, restraint RESTRAINT_START, stance "restraint", movement 1, party {nara:"none",quill:"none",ord:"none"}, respawn GUEST_SPAWN
export function tickWorld(w: WorldState, dt: number): WorldState; // now+=dt, tick++, step every player (movement, timers, district), tickEnemies, tickNodes, tickMarket, tickHouseWar, tickClearing, season roll (now - season.startedAt >= SEASON_LENGTH: season.id++, clearing back to initialClearing() keeping seeds, ring "closed", omen:* flags cleared, failed keeps only the ended season's marks when it has any), drift aura/gestell/restraint, expire wreckage/graves/notices, announce a climate band once when the weather crosses into clear/fat/meltdown (world flag `weather:band`), then tickQuests for every player
export function stepPlayer(p: Player, intent: Intent, dt: number): Player; // SPEED, dodge dash, substep collision via circleHitsWalls(x,y,BODY_R,p); no movement while dead or in dialogue? (dialogue does NOT freeze movement; heavyWindup does)
export function damageFor(p: Player): number;              // STRIKE_DAMAGE, constant
export function heavyFor(p: Player): number;               // HEAVY_DAMAGE, constant
export function updateDistrict(p: Player): Player;         // p.district = districtAt(p.x,p.y)
export function say(p: Player, text: string, now: number): Player;      // sets heard/heardAt
export function addressAura(p: Player, now: number): number;             // guests 0; else aura + AURA_ADDRESS_GLAMOUR while the iridescent kit is active
export function canSeeWink(p: Player, now: number, gestell?: number): boolean; // guests never; addressAura < AURA_DIM or restraint < RESTRAINT_WINK_MIN never; with gestell: Divinities blind at >= GESTELL_MELTDOWN, and at >= GESTELL_FAT the late Winke (movement >= 3) dim for addressAura < AURA_PRESENT
export function wink(p: Player, text: string, now: number, gestell?: number): Player; // empty text or !canSeeWink: no-op; else sets wink/winkAt
export function notice(p: Player, text: string, now: number, tone?: Notice["tone"]): Player; // push, keep NOTICE_KEEP
export function pushNews(w: WorldState, text: string): WorldState;      // keep NEWS_KEEP
export function nextRand(w: WorldState): [number, WorldState];          // xorshift32 -> [0,1)
export function killPlayer(w: WorldState, victimId: string, killerId: string, cause: string): WorldState;
  // drops UNBANKED_DROP of bestand + each exhibition item with EXHIBITION_DROP_CHANCE (never cult, never banked) onto a Wreckage at the body (fromHistory = the victim's passings/buried/looted); aura -= AURA_WOUND but not below auraSeed for Angels (guests stay 0); deaths++; dead=true then immediately respawn at respawnPoint (hp MAX_HP, insured resets to false if it was used: insured -> respawn where they died instead, keeping bestand); heard = cause; history untouched
export function respawnPoint(p: Player): Vec & { district: DistrictId }; // p.respawn
```

## enemies.ts
```ts
export function initialEnemies(): Enemy[];                 // one per ENEMY_SPAWNS, state "idle"; leg 0 when the spawn has a route
export function spawnEnemy(spawn: EnemySpawn, now: number, name?: string): Enemy;
export function enemyStats(kind: EnemyKind): typeof ENEMY[EnemyKind]; // kinds: clerk, intake, warden, enforcer, dummy, courier (aggro 0: never starts a fight, answers its striker)
export function routeOf(e: { id }): Vec[] | null;          // ENEMY_SPAWNS[id].route: px points walked as a cycle from home while idle; content, never saved with the world
export function anchorOf(e: Enemy): Vec;                   // the route point in hand (route[leg]) or home: where a return walks to
export function strayOf(e: Enemy): number;                 // distance from the route polyline (home + route, cyclic) or from home; the leash (ENEMY_LEASH) reads this
// map.ts STAIR_SPAWNS: hour-clerk-stair-1..3 (clerk, "Hour Clerk", the Kerb), home at the head of the stair below the glass room's door, routed down past the glass to the Grid's gate and back; not in initialEnemies; SPAWN_BY_ID carries them so routeOf finds their route
```

## descent.ts (Phase C: the clerks' descent, III.7)
```ts
export const descentUntil = (w) => w.flags[W.CLERKS_DESCENT] ?? 0;  export const descentLive = (w) => w.now < descentUntil(w);
export const descentFrom = (now) => now + DESCENT_WINDOW;  // what the oval's Q writes (a worldFlag effect); a second light while live keeps them down an hour from it
export function reconcileDescent(w): WorldState;           // world.ts, every tick after tickLaunch: while live, STAIR_SPAWNS[i] spawned at its home once now >= until - DESCENT_WINDOW + i * DESCENT_FILE; after, each stair clerk not in aggro/telegraph/recover removed; the same world back when nothing changes. Never saved (migrate restores base.enemies); a restored world is filed out again
// read by npcs.ts: Caul's `after` for the one who put the light out ("The clerks are still on the stair. They will be, for the hour." while live, the light's line after)
```

## combat.ts
```ts
export function tickEnemies(w: WorldState, dt: number): WorldState;
  // idle: nearest living, unlocked, non-dead player within aggro -> aggro; aggro: walk toward target at speed (collision), when within reach -> telegraph (t=telegraph, keep targetId); telegraph: t-=dt; at 0: if target still within reach*1.25 and not dodging -> damage (kill via killPlayer if hp<=0, cause "<name> did their job."), if dodging -> target.heard = LINES.DODGE_COPY; then recover (t=recovery); recover -> aggro; leash: farther than ENEMY_LEASH from home -> return (walk home, heal to max when home) ; dead: respawnAt<=now -> respawn at home (intake: only when a fresh arrival without F.INTAKE is within 240 px); dummy: never moves or attacks, hp resets on death instantly
export function tickCombatTimers(p: Player, dt: number, now?: number): Player; // strikeCd, heavyCd, heavyWindup (fires the heavy hit when it reaches 0 — see applyHeavy), hitStop, dodgeT, dodgeCd, kitCd; with now: kit and duel expiry
export function applyDodge(w, id, dx: number, dy: number): WorldState; // signs only; refuse if dead, locked, dodgeCd>0, heavyWindup>0, dialogue open; dodgeT = DODGE_DURATION (+RESTRAINT_DODGE_BONUS in restraint stance), dodgeCd = DODGE_COOLDOWN
export function applyStrike(w, id): WorldState;             // refuse if dead/locked/strikeCd>0/dodgeT>0/heavyWindup>0; hits every enemy within STRIKE_RANGE (in front: dot(facing, dir) > -0.2 or facing zero) and every player within range subject to pvpBlockReason; a player target with dodgeT > 0 is missed (attacker hears LINES.DODGE_WHIFF, target LINES.DODGE_COPY, no hit); on any hit: strikeCd = STRIKE_COOLDOWN + HIT_STOP, hitStop = HIT_STOP; damage = damageFor(p) scaled by storm rules (see §stances); enemies: participants add attacker; enemy death -> wreckage(fromId enemy id, fromName, no drops) + F.INTAKE for participants when it is the intake clerk + respawnAt = now + respawn; dummy respawns instantly and says LINES.ARENA_HIT
export function applyHeavy(w, id): WorldState;              // start heavyWindup = HEAVY_WINDUP (refuse if heavyCd>0 or dodging/dead/locked); when windup reaches 0 in tickCombatTimers the hit resolves via resolveHeavy(w, id): HEAVY_RANGE, heavyFor(p); an enemy in "telegraph" that is hit is interrupted: state "recover", t = recovery*1.5, attacker.heard = LINES.INTERRUPT
export function resolveHeavy(w, id): WorldState;
export function applyStance(w, id): WorldState;             // toggle; guests may toggle (style only) but storm bonuses need !guest
export function applyKit(w, id, targetId?: string): WorldState; // guest: say LINES.KIT_GUEST; kitCd>0: say cooldown; herald: nearest kept node within 200 -> announcedUntil = now+KIT_DURATION; witness: kit = {verb:"witness", until: now+BLITZ_DURATION} (snapshot reveals last BLITZ_COUNT wreckage incl. expired-within-10min? keep simple: all current wreckage in AOI regardless of visibility rules); ruin: kit until now+FACE_DURATION (storm burns no restraint); dweller: applyNode(w,id,nearest node within 96,"seed") else say need; cybernetic: kit until now+KIT_DURATION (nodes carry yieldHint/chargesHint); iridescent: kit until now+KIT_DURATION (listing fee 0, aura counts +10 for address); kitCd = KIT_COOLDOWN
export function applyFlag(w, id): WorldState;               // guests/locked: say LINES.FLAG_GUEST; district not flagLegal: say LINES.FLAG_WHERE; truce active: refuse; toggle flagged; news when flagged in wet
export function applyTruce(w, id): WorldState;              // nearest flagged Angel within 96 -> both truceUntil = now+TRUCE_SECONDS, both unflagged
export function pvpBlockReason(a: Player, b: Player, w: WorldState): string | null; // guests/locked either side -> LINES.GUEST_GRIEF; truce -> LINES.TRUCE_ACTIVE; either inside patch-arena -> LINES.PRACTICE_SAFE; either in an accepted live duel with someone else -> the duel-closed line; !(a.flagged&&b.flagged) unless gestell >= GESTELL_MELTDOWN and both stand in "wet" (the street flags itself) -> LINES.PVP_FLAG_REQUIRED; else null
export function stormMultiplier(a: Player, b: Player, w: WorldState): number; // 1; storm & !guest: target already has live wreckage of their own (fallen) -> 1-STORM_FALLEN_PENALTY; geared target (b.bestand >= STORM_GEARED_BESTAND) -> 1+STORM_BAND_BONUS[weatherBand(gestell)] (mixed = STORM_GEARED_BONUS); no messenger, House, serial or kit term (a Ruin-angel wearing the Face burns no restraint in world.driftPlayer and hits the same number)
export function duelWreckageFor(w, a: Player, b: Player): Wreckage | null; // the live wreckage both stand within RUIN_DUEL_RADIUS of
export function duelBlockReason(p: Player, other: Player, w): string | null; // guests/locked, dead, truce, not both flagged, no shared wreckage, either already in a live duel
export function applyDuel(w, id, targetId): WorldState;      // at a shared wreckage: sets p.duel = {with, until: now+DUEL_CHALLENGE_SECONDS, accepted:false} and notices the target; the same press from the target while offered accepts: both duel = {with, until: now+DUEL_SECONDS, accepted:true}, news; a fall or the timer clears both; interact(playerId, "duel") routes here and the player prompt offers it as F
```
PvP kill: spoils = floor(victim.bestand*UNBANKED_DROP) to killer (earner "spoils"), exhibition drop chance, wreckage with killerId; ruin duel = both within RUIN_DUEL_RADIUS of a live wreckage -> spectators (other Angels within SPECTATE_RADIUS, spectated < SPECTATE_CAP) aura+AURA_SPECTATE_GAIN; camping: killer.lastKillId===victim && now-lastKillAt < CAMP_WINDOW -> gestell += GESTELL_CAMP, killer.aura -= AURA_CAMP_PENALTY, campCount++; restraint -= RESTRAINT_CHAIN_KILL_PENALTY if killer killed within 30 s before; kills++; history looted++ when spoils>0.

## economy.ts
```ts
export const EARNER_SINKS: Record<(typeof EARNERS)[number], (typeof SINKS)[number]>; // node->tax, spoils->repair, craft->listing, bounty->tithe, claim->bank, stipend->upkeep, operator->door
export function initialNodes(): YieldNode[];                // from NODE_LIST, charges NODE_CHARGES
export function tickNodes(w, dt): WorldState;               // regen one charge per NODE_REGEN when charges < NODE_CHARGES; announcedUntil expiry
export function gestellTax(gestell: number): number;        // floor(clamp(g,0,100)/4) percent
export function nodeYield(w, p, node): number;              // NODE_YIELD * (fat ? NODE_FAT_MULT : 1) * (restraint stance ? NODE_RESTRAINT_MULT : 1) * (Angel with aura < AURA_DIM ? 1+AURA_DARK_YIELD_BONUS : 1) minus tax%, floored; frozen district -> 0
export function applyNode(w, id, nodeId, op: "extract"|"keep"|"announce"|"seed"): WorldState;
  // extract: within 56 px, charges>0, district not frozen (say LINES.FROZEN), guests allowed (in-instance bestand); charges--, bestand += yield (earner "node"), gestell += GESTELL_EXTRACT, p.extracted++, extractedSinceFuneral++, world EXTRACTIONS++, kept=false; if extractedSinceFuneral >= NARA_THRESHOLD and party.nara==="with" -> party.nara="gone", say LINES.NARA_LEAVES
  // keep: within 56, !kept; kept=true keptBy=id, readiness += READINESS_KEEP, restraint += RESTRAINT_KEEP_GAIN, gestell += GESTELL_KEEP, p.kept++, p.flags[keptIn(node.district)]++ (content/ids.ts keptIn(d) = "kept:<d>"; the side hours count a district's keeps from it: Cable quiet counts the Organs', and while all three Organs nodes stand kept a keep anywhere)
  // announce/seed: see combat kit; seed sets node.seed=true and clearing.seeds push
export function earn(w, id, amount, earner): WorldState;     // bestand += amount, world flag `earned:<earner>` += amount
export function spend(w, id, amount, sink): WorldState | null; // null when bestand < amount (caller says LINES.CANT_AFFORD); world flag `sunk:<sink>` += amount
export function addItem(p, item: Item): Player; export function removeItem(p, id, qty?): Player; export function hasItem(p, id, qty?): boolean;
export function applyUse(w, id, itemId): WorldState;        // paper:insurance -> insured=true; paper:repair -> hp=MAX_HP; others: say LINES.CANT_USE
export function applyClaims(w, id, op: "file"|"bank"|"take", claimId?: string): WorldState;
  // guest -> say LINES.CLAIMS_GUEST, no claim. file: claimsFiled < CLAIM_CAP and bestand >= CLAIM_AMOUNT -> move CLAIM_AMOUNT purse into a Claim {readyAt: now+CLAIM_HOLD}; bank: banked += floor(bestand*(1-BANK_FEE)), bestand=0 (sink "bank"); take: claim readyAt<=now && !settled -> settled=true, banked += amount (earner "claim"); never real value; idempotent
export function applyMarket(w, id, op, args: { itemId?: string; listingId?: string; price?: number }): WorldState; // buy of a city listing (sellerId CITY_SELLER) -> say "A price, not a sale."; nobody cancels one
export function listOwn(w, id, item: Item, price): WorldState; // the `list` effect: the player's own thing posted on the Grid without passing through their hands (Quill's print of their hint); guest -> nothing; price clamped 1..999; the fee (LISTING_FEE, 0 with iridescent kit) spent now when the purse has it (sink "listing"), else kept back on the Listing (`fee?: number`) and taken from the sale or charged on the cancel as far as the purse goes; no aura touched (the node that lists says what it costs). Listing ids come from a world counter (flags "market:seq"), never from the board's length
export const CITY_SELLER = "";  export function applyListing(w, e: { id; seller?; item?; price?; delta? }): WorldState; // a listing the city posts (seller, item, price; once per id, a repost leaves the price) or re-prices (delta, clamped 1..999; nothing before it is posted); the news carries the posting and every move; no change, same world object
// content/market.ts: CLEARING_LISTING "listing:city:clearing", RESISTANCE, CLEARING_ITEM, clearingPrice(w) | null, listClearing() (the board read), moveClearing("taken"|"refused"|"appearance"|"absence"|"hijack"|"failed") with CLEARING_PRICE_MOVE; the Passing re-prices it by its outcome in clearing.applyPassing; the snapshot's market puts city listings first
  // list: exhibition item only, price 1..999, fee LISTING_FEE (0 with iridescent kit) sink "listing", seller aura -AURA_CRAFT_WITHER; buy: seller must be in w.players (else the seller-away line, nothing moves), pay price less any kept-back fee to seller (banked; the fee sunk "listing" and the seller hears the figure), item to buyer, seller flags `sold:<itemId>`++; cancel: own listing back, a kept-back fee charged as far as the purse goes with the figure in the line
  // the snapshot's market strips `fee` (the seller's business with the stall) and shows a seller their own rows the top-12 cut left out, so what they owe on can always be cancelled
export function tickMarket(w, dt): WorldState;              // every EXHIBIT_DECAY an exhibition item's value-- (min 0) for listings and player items; a player's listing at value 0 leaves the board (a kept-back fee forgiven; the city's rows stand)
export function applyForge(w, id, op: "craft"|"spot"|"sell"): WorldState; // craft: FORGE_COST -> item "copy:wink" exhibition value COPY_PRICE and fakeWinke++, every craft past the first inside a KIT_DURATION window withers aura by AURA_CRAFT_WITHER (personal flags craft:windowAt / craft:windowN); spot: reveals copies (removes fakeWinke, aura +1), or with nothing in hand takes the player's own copy:wink listing off the board (the kept-back fee charged as a cancel's is, aura +1); sell: list copy (the listing withers the aura)
```

## houses.ts
```ts
export function initialHouses(): WorldState["houses"];      // standing 0s, tithe 0, war inactive with startsAt = WAR_PERIOD, site "clearing-ring"
export function hallFor(house: Fourfold): string;           // "hall-mortals" etc
export function tickHouseWar(w, dt): WorldState;            // windows: at startsAt -> active, endsAt = startsAt+WAR_HOLD, alternate site between "clearing-ring" and "hot-street"; count seconds per house for Angels (not guest/locked/dead, house set) within WAR_RADIUS of the site; at end: winner = max held (ties none), standing[winner] += 3, tithe cut: winner house players get news + world flag `omen:<house>`; next startsAt = endsAt + WAR_PERIOD
export function applyStanding(w, house, delta): WorldState;
export function perception(p: Player, gestell?: number): { wreckageBonus: number; forecast: boolean; winkDensity: number; groundResist: number; funeralSight: boolean };
  // mortals: wreckageBonus WRECKAGE_TTL_BONUS, funeralSight; sky: forecast; divinities: winkDensity 2 (0 when gestell >= GESTELL_MELTDOWN is given); earth: groundResist 2 (tax -2 percent points on ground nodes); ruin messenger also wreckageBonus
export function applyTithe(w, id): WorldState;              // at own hall: TITHE_COST (sink "tithe") -> standing[house] += 1, tithe pool += cost; guests refused
export function applyBounty(w, id): WorldState;             // at own lit hall: if tithe pool >= 5 and standing[house] > 0 -> pay 5 from pool (earner "bounty"), once per WAR_PERIOD per player (flag `bounty:at`)
```

## clearing.ts
```ts
export function initialClearing(): ClearingState;           // closed, reserve CLEARING_RESERVE
export function initialPassing(): PassingState;
export function tickClearing(w, dt): WorldState;            // heldBy = Angels within CLEARING_RADIUS of clearing-ring (alive); while open: gestell += GESTELL_CLEARING_HOLD*dwellers*dt, dwellers aura += AURA_DWELL_GAIN*dt (cap AURA_MAX); closed and below CLEARING_RESERVE: reserve +1 per NODE_REGEN (world flag clearing:regenAt); live contest: keep/extract recounted every tick from contest.votes of Angels in heldBy (a body that leaves the ring withdraws its vote); at endsAt resolve keep >= extract -> "kept" (open stays) else "extracted" (closed) -> lastOutcome, pois["clearing-ring"].state = "held" or "closed", news
export function applyClearing(w, id, op: "open"|"keep"|"extract"|"pass"): WorldState;
  // open: Angel within radius; refused while a contest is live or the ring is "open" (LINES.ALREADY), reserve<=0, or openedAt>0 and now-openedAt < WAR_PERIOD; else from "closed"/"held"/"failed": open, openedAt, ring "open", contest {active, keep 0, extract 0, votes {}, endsAt now + WAR_HOLD*CLEARING_HOLD_SCALE[band]}; keep: votes[id]="keep" (one stance per Angel; switching back and forth is free) and once per contest (personal flag clearing:kept:<openedAt>) readiness += READINESS_KEEP*2, restraint += RESTRAINT_KEEP_GAIN; extract: votes[id]="extract", reserve -= min(CLEARING_EXTRACT, reserve) paid as bestand (earner "node"), aura -= 2 and gestell += 2 only when something was paid; pass: choice only
export function passedThisSeason(w, p): boolean;             // p.flags[seasonPassingFlag(w.season.id)] > 0
export function partyWilling(p: Player): boolean;           // party.nara !== "gone" && party.ord !== "gone"
export function resolvePassing(w, p): PassingOutcome;       // pure: if !partyWilling or readiness < READINESS_PASSING_MIN or !flags[F.MORTALITY] -> "failed"; if gestell >= GESTELL_MELTDOWN && clearing.heldBy.length < CLEARING_HOLD_ANGELS -> "failed"; if ((choices[C.OPERATOR]==="take" || choices[C.LIP]==="signed") && current==="cold") -> "hijack" (cold: the hour sold at the desk or signed for at the lip, two keys one door); if choices[C.FREEZE]==="signed" && flags[F.PREPARE] && restraint < 50 -> "hijack" (safety); if readiness >= READINESS_APPEARANCE_MIN -> "appearance"; else "absence"
export function applyPassing(w, id): WorldState;            // at the ring, prepared, once per Angel per season (passedThisSeason); resolve; write choices[C.PASSING], flags[F.PASSING] and flags[seasonPassingFlag(season)], on a hijack flags[F.HIJACKED_COLD]/[F.HIJACKED_SAFETY] (1 or 0, who claimed it) and flags[F.HIJACK_TRACE] (readiness at READINESS_APPEARANCE_MIN when taken), history passings++ + outcome, passing.count++, lastOutcome/lastBy/lastAt/hijackedBy, appearanceUntil = now+SEASON_LENGTH on appearance (aura drift halves), stipend PASSING_STIPEND on appearance (earner "stipend"), failed -> push FailedPassing at "failed-1" for the season, pois["clearing-ring"] -> "failed" (open again after WAR_PERIOD); news; movement 5 after credits handled by quests
```

## quests.ts
```ts
export function npcOffers(ctx, def: NpcDef): boolean; // a line in the person's tree whose gate passes and whose effects (own or the node it opens) start a side quest the viewer has not started and may hold; candidates cached per person
export const QUESTS: Quest[];                               // [...SPINE, ...SIDE] from content
export function questById(id: string): Quest | undefined;
export function questProgress(p, id): { started: boolean; step: number; done: boolean };
export function tickQuests(w: WorldState, id: string): WorldState; // for one player: start every quest whose available(ctx) is true and not started (spine only in movement order; side quests may start freely), apply onStart; for each active quest evaluate current step done(ctx): apply onComplete, advance; when steps exhausted apply onFinish once; loop at most 8 advances per tick
export function objectiveFor(ctx: Ctx): Objective | null;   // current step of the active spine quest, else the most recently started active side quest, else null; target resolved through POSITIONS / NPC personal position
export function activeQuests(ctx): { quest: Quest; step: QuestStep }[];
```

## dialogue.ts
```ts
export function applyTalk(w, id, npcId): WorldState;        // npc present for this viewer (personal override) and within 72 px, player not dead; opens NPCS[npcId].entry(ctx) via openNode
// content/caul.ts: caulAtLip(p) = movement >= 4 || (guest && district === "wet"): where Anselm Caul stands on the lip (station caul-lip) for this viewer; coldClaimed(p): the rite's own record (F.HIJACKED_COLD / F.HIJACKED_SAFETY) first, else the resolver's rule, read by Ord's and Caul's hijack lines and by the altars (pois.ts hijackReel: a body whose C.PASSING is hijack sees on both CRT altars the Appearance with its name in the margin when F.HIJACK_TRACE, else an empty sky with its name, or Safety's district holding still; everyone else the catalog); Nara's `personal` keeps her at station nara-clearing while C.PASSING is absence and she is not gone, before the movement-5 release; npcs.ts routes him there (caulLip: guest -> lip-guest; this season's rite passed (flags[seasonPassingFlag(season)]) -> the outcome's lip-* line once (personal flag caul:lip:said:<season>), then lip-silent; a later season, or before F.PREPARE -> lip-silent; C.OPERATOR take or C.LIP signed -> lip-sold; C.LIP refused -> lip-silent; else the offer `lip`), and combat.ts answers a strike or heavy that neither hit nor spoke (the attacker's record untouched by the sweep) and would reach the lip with him on it with LINES.GUEST_GRIEF; the Kerb's bell verb `side:hours:wait` (side-pois.ts, once on SF.HOURS_WAITED, a guest's to press) opens his `oval-hour` through a `dialogue` effect (one text for every body, no serial, no Wink, nothing after it) and says the bell's line, the Concern's schedule, in the same step; the HUD holds a heard line's fade while a window is open (src/ui/format.ts heardStep), so the line is read when his window closes
export function resolveWink(ctx, authored: WinkText | ((ctx) => WinkText) | undefined): string; // a string is heard as written; a WinkBySchool picks [p.winkSchool] else .default; the House of Divinities (winkDensity 2) and Wink-seed serials also hear one of LINES.WINKE[school] after it, chosen by a hash of the line and the serial
export function openNode(w, id, npcId, nodeId): WorldState; // resolves text/wink (resolveWink)/choices (filter `when`), applies node.effects, sets p.dialogue = DialogueView (portrait from NpcDef, speaker name); wink filtered by world.canSeeWink(p, now, gestell); choices[] empty when node has none
export function applyChoose(w, id, choiceId): WorldState;   // dialogue open, choice valid; apply choice.effects; if choice.next -> openNode else close
export function applyClose(w, id): WorldState;              // if node.next (when no choices) -> openNode(next) else dialogue = null
```

## launch.ts (Phase C: the Concern's launch as the forecast glass shows it; pure)
```ts
export function nextLaunch(w: { now; season }): { season: number; at: number }; // w.season.startedAt + LAUNCH_OFFSET (the first hour of the seventh day) while ahead, else the next season's
export function launchDate(season: number, offset = LAUNCH_OFFSET): string;      // "season 2, day 7, 00:00", the season's own calendar (world time only runs while the city is live, so no wall clock)
export function countdown(seconds: number): string;                             // "6d 23:59:12", floored at "0d 00:00:00"
export const darkLights = (w) => w.flags[W.DARK_LIGHTS] ?? 0;  export const glassDark = (w) => darkLights(w) >= DARK_LIGHTS_THRESHOLD; // 7
export const launchMoment = (w) => w.season.startedAt + LAUNCH_OFFSET;  export function inLaunchHour(w): boolean; // [moment, moment + LAUNCH_WINDOW)
export const launchOpen = (w) => inLaunchHour(w) && w.flags[W.LAUNCH_SEASON] === w.season.id;  export const launchDark = (w) => launchOpen(w) && w.flags[W.LAUNCH_DARK] > 0;
export function launchDue(w): "open" | "climb" | null; // the tick's debt: open once a season inside the hour; else (lit) a point owed just after the opening and one per LAUNCH_CLIMB_EVERY, LAUNCH_CLIMB_MAX in all
export function launchClosing(w): boolean; // the close is owed: W.LAUNCH_SEASON is this season, W.LAUNCH_CLOSED is not, and now >= moment + LAUNCH_WINDOW
export const LAUNCH_CEILING = GESTELL_MELTDOWN - 1;  export const launchClimb = (g) => Math.max(g, Math.min(g + 1, LAUNCH_CEILING)); // the launch alone never reaches the HUD's meltdown band (> 90); a point the ceiling blocks is spent, not saved
// world.ts tickLaunch (after tickSeason): reconcileShift; then, when launchClosing, closeLaunch: the hot street quiet (by "", at now) whoever made it hot, W.LAUNCH_CLOSED = season, nothing said; on "open" records W.LAUNCH_SEASON, W.LAUNCH_DARK (glassDark at the opening) and W.LAUNCH_CLIMBED; lit: hot-street hot (by ""), news "The launch. ..."; dark: news "The vans are on the Grid. ..."; then openNode(caul, oval-launch | oval-launch-dark) for every body on the Kerb not dead and with no dialogue open, except a body in a fight (an enemy targeting it in aggro/telegraph/recover, a heavy winding up, a duel), which gets a notice instead; lit, W.LAUNCH_SHIFT = SHIFT_ON (1); reconcileShift (every tick, before launchDue) moves the cable enforcer's home to POSITIONS["organ-node-cable"] while on shift and to its ENEMY_SPAWNS post once the hour is over (SHIFT_BACK, 2), sets an idle or returning body away from its post down there whole (a fight or a dead wait is kept; a dead one respawns at home), and clears the flag to 0 once back and settled; a restored world is put right the same way; on "climb" gestell = launchClimb(gestell), LAUNCH_CLIMBED + 1
// read by pois.ts (the forecast glass's calendar line and, during the window, its "now", Sky's drift, both altars' reel, the board's buyer, the Cable's shift line and the `armored-van` look) and npcs.ts (Caul's reader and oval-hour; Quill's quillAtVans: station quill-vans and `ring` -> `margin` for a prepared Movement IV body not yet passed). The glass's calendar line: the next hour, the launch from Movement III, with date and count; past the threshold no date and the count of lights out
```

## effects.ts
```ts
export function applyEffects(w: WorldState, id: string, effects: Effect[] | ((ctx: Ctx) => Effect[]) | undefined): WorldState;
  // one switch over Effect.kind; delegates to economy (bestand/banked/node/claim/item/insure/heal/listing/list -> listOwn), world (say/wink/notice/news/killPlayer), houses (standing), clearing (clearing/passing), quests (quest), dialogue (dialogue), combat/enemies (spawn); "under": guest -> lock (locked=true, say LINES.GUEST_LOCK); Angel -> flags[F.UNDER]=1, teleport to POSITIONS["care-shrine"], respawn there, hp MAX, aura = max(aura, auraSeed), movement 2, notice; "lock": locked=true; "teleport": to POSITIONS[to]; "respawnAt": respawn = POSITIONS[poi]; "freeze": w.frozen[district] = now+seconds, world FREEZES++; "movement": p.movement; "party"; "npc" (merge into w.npcs[id]); "poi" (state, by, at, count++); "flicker": w.flags[W.ALTARS_FLICKER] = now (every altar in the Nave flickers once, for everyone: Snap.flicker carries it on the slow frame, and the client's floors pulse the Nave's altars when render/motion.ts flickerDue says the moment is new and within FLICKER_FRESH seconds; one slow dip under reduced motion); "wreckage" bury/loot nearest within 64: bury -> buried=true, graves push, readiness += READINESS_BURY, restraint += RESTRAINT_BURY_GAIN, gestell += GESTELL_BURY, extractedSinceFuneral=0, history buried++, world BURIALS++, if party.nara==="gone" -> "waiting"; loot -> bestand += wreckage.bestand, items, aura -= AURA_LOOT_PENALTY, looted=true, history looted++ ; "history" merges into p.history
```

## interact.ts
```ts
export function applyInteract(w, id, targetId, choice: string): WorldState;
  // targetId is a POI id (POI_CONFIGS), a node id (choice "extract"|"keep"), a wreckage id (choice "bury"|"loot"), an npc id (choice "talk" -> applyTalk), or another player's id (choice "duel" -> combat.applyDuel). Reach: POI reach (default 56). Verb lookup by choice; check when(ctx); guest policy: "deny" -> say LINES.GUEST_LOCK; "spectate" -> say LINES.SPECTATOR; once flag (skip if set, say LINES.ALREADY); an open dialogue is closed before the verb fires; cost via spend (null -> say LINES.CANT_AFFORD); then applyEffects(effects) and say(say)
export function verbsFor(ctx: Ctx, targetId: string): PromptVerb[]; // available verbs for prompts by id, whatever the kind (respecting when/once/guest policy: deny -> omit); dispatches to the kind's own:
export const npcVerbs = (): PromptVerb[];  export function nodeVerbs(ctx, node: YieldNode); wreckageVerbs(ctx, wreck: Wreckage); playerVerbs(ctx, other: Player); poiVerbs(ctx, cfg: PoiConfig): PromptVerb[]; // the prompt, which has the thing, calls these; a player target: F "Ruin duel"/"Answer the duel" when duelBlockReason is null, V flag, T truce; nothing between guests, the locked or the fallen
```

## snapshot.ts
```ts
export function snapshotFor(w: WorldState, viewerId: string, step = stepViews(w)): Snap; // while the viewer's ruin kit (Face) is active: you.kitReadout = their own marks' lines + counts + last outcome, and each visible Angel wreckage carries passings from its fromHistory
export function framesFor(w: WorldState, viewerId: string, step = stepViews(w)): { fast: FastFrame; slow: () => SlowFrame }; // what the object sends: the fast frame now, the slow frame only when asked (due every fifth step, after an action, for a new socket, or when the bodies in view changed); on the steps between the viewer's slow side (NPC offers, nodes, wreckage, graves, marks, objectives, kitReadout) is not built. Byte for byte splitSnap(snapshotFor(...)); fast.you keeps the slow keys as undefined (one native copy; JSON leaves them out), so the frame is encoded, never merged in-process.
export function stepViews(w: WorldState): StepViews;         // what every viewer of one step shares: public shapes by id, alive enemy views, node views, pois, frozen, market, news, clearing, passing, history by serial, and the frames' cache (frames.ts). A section that reads one unchanged world section keeps its identity across steps (the sim never mutates a world in place; the object replaces its collections); a body's roster entry keeps its identity while its roster fields stand. The object makes one per broadcast.
export function glassFor(w, p, shared: { figure(): number }): GlassView | null; // Snap.glass (a slow key): for a reader (C.GLASS "read") only: { launch: launchDate | "now" (lit window) | "no date" (dark window or past the threshold), at: the moment the count runs to (0 when none), dark: darkLights, figure: cityFigure (summed once a step, lazily, StepViews.figure), hole: heldBy.length }; null for anyone else
export function publicPlayer(p: Player, now: number): PublicPlayer;
export function promptFor(ctx: Ctx, npcs: NpcPlace[] = the viewer's NPC standings): Prompt | null; // nearest of: npc (personal position, 72px, verbs [F Speak]), poi (reach), node (56: E Extract / Q Keep; hidden if frozen), wreckage (64: F Bury, E Loot [Angels only]), player (96: V Flag/Unflag, T Truce when flagged). Everything in reach is gathered by distance first (a viewer who is a guest or locked gathers no bodies), then verbs (and a POI's label) are read nearest first until one has a verb to offer; a thing without verbs is passed over for the next
export function visibleWreckage(w, p): Wreckage[];          // until + perception(p).wreckageBonus (+ storm) ; witness blitz shows all in AOI
export function npcView(ctx, npc: NpcState): NpcView | null; // apply NPCS[id].personal override; null when not present for this viewer; offers = npcOffers(ctx, def)
```

## actions.ts
```ts
export function applyAction(w: WorldState, id: string, msg: ClientMsg): WorldState; // validate every field (finite numbers, string length <= 64, enums), then dispatch: intent -> w.intents; dodge; strike; heavy; stance; kit; interact; talk; choose; close; link -> applyLink; flag; truce; use; market
export function applyWallet(w, id, address: string, line?: string): WorldState; // binds a verified lowercase address to a body without sealing it; says `line` when given
export function applyLink(w, id, serial: number, proof: LinkProof | string): WorldState; // validLink; a wallet proof also sets player.wallet; refuse if another connected player has the serial (say LINES.LINK_ELSEWHERE); guest=false, serial, name formatSerial, house/messenger/winkSchool, auraSeed, aura = max(aura, seed), flags[F.ANGEL]=1, locked=false, linkedAt, history mark push: serialHistoryMark(serial) ?? historyMarkFor(serial, p.history, p.deaths); if locked at the threshold, the "under" effect is NOT applied automatically (player uses the threshold again)
```

## assets/gen.ts, assets/slots.ts, ui/loops.ts (client; generated files, always optional)
```ts
export type GenManifest = { v: number; targets: Record<string, { w: number; h: number }> }; // public/assets/gen/manifest.json, written by scripts/pull-generated.mjs; committed empty ({ v: 1, targets: {} }) until the pull lands, so the request succeeds
export function loadGenManifest(fetcher, url = genUrl("manifest.json")): Promise<GenManifest>; // 404 / junk / wrong shape → EMPTY_MANIFEST, never throws
export const hasGen = (m, target) => boolean;  export const pickGen = (m, target | null, fallback) => string;
export const gen: { load(fetcher?): Promise<GenManifest>; current; has(target); url(target, fallback); set(m) }; // one registry, loaded in main.ts before Phaser boots
export const portraitFor = (npcId) => "portraits/<id>.jpg" | null;   // officer, omen, keeper, sexton, desk
export function spriteFor(e: { kind; id }): "sprites/warden.png" | "sprites/enforcer.png" | "sprites/hour-clerk.png" | null;
export const sealFor = (house) => "seals/<house>.png" | null;  export const badgeFor = (messenger) => "badges/<m>.png" | null;
export function plateFor(district, hot = false): "plate-kerb.jpg" | "plate-nave.jpg" | "plate-hot-street.jpg" | null;
export const loopFor = (name: LoopName) => "video/<name>.mp4";  export function passingLoopFor(outcome): string | null;  export function ambientFor(district): string | null;
export function staticPropSlots(): { kind: PropKind; id; x; y }[]; // from NODE_LIST, POI_LIST (shrine, bell, stall, desk, board, organ-foundry) and the hot-street patch; PROP_SIZE per kind
export const genTex = (target) => `gen:${target}`;             // scenes/BootScene.ts: the boot loads GEN_TEXTURES (sprites, props) the manifest names
export class LoopSlot { constructor(parent, className, before?); set(target | null); destroy() }; // ui/loops.ts: a muted looping inline <video>, only when the manifest has it and motion is allowed
export function overlayLoop(root, target, ms = 6000): HTMLVideoElement | null; // a full-screen loop for a moment
```

## protocol v3 frames (protocol.ts, frames.ts; the server splits, the client folds)
```ts
export const PROTOCOL_VERSION = 3;  export const SLOW_EVERY_TICKS = 5;
export type EnemyView = Pick<Enemy, "id"|"kind"|"name"|"x"|"y"|"hp"|"maxHp"|"state"|"t"|"tint"|"targetId">; // Snap.enemies; positions and timers to a tenth
export const FAST_KEYS = ["now","tick","you","players","enemies","prompt"];  export const SLOW_KEYS = [/* every other Snap key */];  // Snap.flicker: number, the world time of the last altar flicker (W.ALTARS_FLICKER), 0 = never; a slow key since Phase C, the weave (old clients ignore it)
export type PlayerMotion = Pick<PublicPlayer, "id"|"x"|"y"|"facing"|"hpFrac"|"dead"|"dodgeT"|"heavyWindup"|"hitStop">;  export type PlayerRoster = Omit<PublicPlayer, motion keys but id>;
export type FastFrame = { t: "fast"; v } & Pick<Snap, FastKey> with players: PlayerMotion[];   // every step
export type SlowFrame = { t: "slow"; v } & Partial<Pick<Snap, SlowKey>> & { roster?: PlayerRoster[]; youSlow?: Partial<YouView> }; // only what changed; roster entries only when new to the viewer or changed
export const YOU_SLOW_KEYS = ["quests","flags","choices","party","items","claims","history","respawn","wallet","dialogue","kitReadout"]; // ride the slow frame as youSlow; fast.you carries the rest. export const YOU_OFF_WIRE = ["notices"]; // never in the wire's you: Snap.notices is their section (YouView.notices is optional and absent on the wire)
export function splitSnap(snap, cache?: FrameCache): { fast, slow };  export function mergeFrames(slow: SlowState, fast): Snap; // you = youSlow under the defined keys of fast.you (a slow key the fast you carries as undefined never covers the record); a body without a roster entry is left out until it arrives
export function applySlow(slow: SlowState, frame): SlowState;   // sections replace; the roster merges by id; youSlow replaces
export type FrameCache = { split: Map<id, {p, motion, roster}>; fragments: Map<object, string>; prev: Map<id, split> | null };  export const newFrameCache = (last?: FrameCache): FrameCache; // one per step (stepViews(w).frames): a body's split and every object's JSON, shared by the step's viewers; plain Maps, dropped with the step; `prev` is the last step's splits, and a body whose roster fields all stand keeps its roster entry object from it
export function encodeFast(fast, cache?): string;  // byte for byte JSON.stringify(fast); each body's and enemy's fragment from the cache
// Body ids: the object gives a new body twelve hex characters (bodyId()); saved bodies keep the id they were given.
export class SlowTracker { fresh(viewer); rosterDue(viewer, fast); youDue(viewer, you: YouView); diff(viewer, slow, cache?): SlowFrame | null; forget(viewer) } // a section that is the object it sent last is unchanged without a stringify; youSlow likewise by its records' identity; a roster whose every entry is the object seen last is unchanged without a rebuild; youDue is true the step one of the viewer's record fields (the slow keys but kitReadout) is a new object, asked every step
// The object: fast every broadcast; slow when force (after an action, a join, a close) || tick % 5 === 0 || fresh || rosterDue || youDue (a dialogue the tick closed at a death, a print decayed, a quest the tick advanced: at once, not at the fifth step). mergeFrames skips a fast-you key carried as undefined. WorldSocket folds; a new socket starts empty.
```

## server/src/load.ts (the object's load meter; `/world` → `load`)
```ts
export type LoadReport = { sessions; bodies; lateMs; maxLateMs; catchUp; maxCatchUp; stalls; broadcastChars; charsPerViewer; alarms; checkpointMs; maxCheckpointMs; dropped; swept; refused };
export class LoadMeter { alarmed(lateMs, steps, capped, at); broadcasted(chars, viewers); checkpointed(ms, at); dropped(); swept(n); refused(); report(sessions, bodies, at): LoadReport } // EMA + 10 s windowed max; Workers freeze the clock during compute, so lateness and catch-up are the signal, not step time; dropped counts messages a socket sent past its budget or over MAX_MESSAGE since the meter began; swept the saved guest bodies the sweep deleted; refused the joins the object's bucket turned away
// The world record (index.ts, serializeCity): `world:v2` is the city without its bodies (`players: []`), so it stays the size of the city and not of its population. Saved bodies: `player:v2:<token>` is the Player, written by a checkpoint only when the body's object is not the one last written (the sim keeps a body's object when nothing changed) and by the close; `seen:v2:<token>` the wall clock its session was last seen live (written by the first checkpoint of a session in an instance and by the close, whether or not the body's record is), which is what the sweep reads. The constructor restores every hibernated socket's body from its record, through migratePlayer as every read of a record is (join() too), in the one multi-get that also reads the world and the sweep's clock; a world saved before this, bodies embedded, is the fallback, and such a body is written to its record at the next checkpoint. A body back from its record counts as written (the migration is the same on every read), so neither the constructor's nor a join's checkpoint rewrites it; the close writes the leaving body only when it changed, and its stamp always; `saved` and `stamped` are updated after the put lands, so a put that threw leaves every body owed to the next checkpoint. Once per SWEEP_EVERY_MS (an hour), after the next alarm is armed and inside a try, the alarm sweeps one page (SWEEP_PAGE = 64, a cursor that wraps) of saved bodies: a live token is skipped, a record without a stamp is stamped now, and a guest with no wallet bound unseen for SAVED_TTL_MS (30 days) is deleted with its stamp. An Angel's body and a bound wallet's are never swept. The clock and the cursor live in `sweep:v2` → { at, after? }, so an evicted instance carries on; a new city waits an hour before its first sweep. The object is SQLite-backed (wrangler.toml new_sqlite_classes), so the KV API's 128-key put and delete limits do not apply.
// The object's budgets (index.ts, draw(budget, burst, rate, now)): a token bucket per socket, MESSAGE_BURST = 120 deep, refilled at MESSAGES_PER_SECOND = 60; a message past it, or over MAX_MESSAGE, is dropped unread and counted; a replaced socket's bucket goes with it. Joins: a bucket per address (CF-Connecting-IP, "local" without it; JOIN_BURST = 30 refilled at JOINS_PER_SECOND = 10) drawn first, then the city's own (CITY_JOIN_BURST = 60 at CITY_JOINS_PER_SECOND = 30, the backstop on the object's compute), both in join(token, server, address): past either join returns null, fetch answers 429 with Retry-After, and the load counts refused. Address buckets that are full again are forgotten once the map is past JOIN_ADDRESSES_MAX = 1024. An action's checkpoint and forced broadcast happen at most once per ACTION_BROADCAST_MIN_MS = 20 of the last action's: inside the window the object sets `pending`, and the next alarm reads it, checkpoints first, then broadcasts forced (any broadcast clears it). A message that changed nothing (applyAction returned the same world) costs nothing past its token. A join's or a close's broadcast opens no window.
// SimulationClock.lastCapped: true when the last advance dropped time (MAX_CATCHUP_MS). scripts/load-check.mjs reads all of this; .rebuild/ZONES.md keeps the numbers and the scale design.
```

## server/src/holders.ts (the Worker only; the client never calls a chain)
```ts
export type HoldersEnv = { ANGEL_HOLDERS?: string; ANGEL_CONTRACT?: string; ANGEL_RPC_URL?: string; ANGEL_TOKEN_OFFSET?: string };
export type HolderCache = Map<string, { serial: number | null; at: number }>; // per object, CACHE_TTL_MS = 5 min, CACHE_MAX = 1000
export function encodeCall(selector: string, address: string, index?: bigint): string; // balanceOf 0x70a08231, tokenOfOwnerByIndex 0x2f745c59
export function decodeUint(hex: unknown): bigint | null;
export function serialFromChain(address, env, fetcher, nowMs, cache): Promise<number | null | undefined>; // number = holds this serial; null = no Angel (or outside 1..ANGEL_SUPPLY); undefined = the chain could not be read (never cached)
export function serialFor(address, env, fetcher, nowMs, cache): Promise<number | null | undefined>; // ANGEL_HOLDERS wins; then the chain when ANGEL_CONTRACT + ANGEL_RPC_URL are set; else null. /wallet/link answers 503 { reason: "chain" } on undefined
```

## content/index.ts (owned by the integrator)
```ts
export const NPCS: Record<string, NpcDef>;       // party (npcs.ts) + secondary (side-npcs.ts)
export const POI_CONFIGS: Record<string, PoiConfig>; // pois.ts merged with SIDE_POI_VERBS (the hour's verbs first, so a live step-gated verb wins its key)
export const QUESTS: Quest[];                    // [...SPINE, ...SIDE]
export * as LINES from "./lines";
export { NEWS } from "./news";
```

## content/lines.ts (constants the engine references by name)
GUEST_LOCK, SPECTATOR, ALREADY, CANT_AFFORD, CANT_USE, FROZEN, DODGE_COPY, DODGE_WHIFF, INTERRUPT, HIT_COPY, ARENA_HIT, GUEST_GRIEF, TRUCE_ACTIVE, PRACTICE_SAFE, PVP_FLAG_REQUIRED, FLAG_GUEST, FLAG_WHERE, FLAG_ON, FLAG_OFF, TRUCE_COPY, SPOILS_COPY, CAMP_COPY, DUEL_COPY, SPECTATE_COPY, STORM_PRESS, STORM_FALLEN, KIT_GUEST, KIT_COOLDOWN, KIT_NEED (per messenger record), KIT_COPY (per messenger record), CLAIMS_GUEST, CLAIMS_FILED, CLAIMS_HELD, CLAIMS_TAKEN, CLAIMS_CAP, BANKED, LINK_ELSEWHERE, LINK_COPY(serial, house, messenger), NARA_LEAVES, NARA_WAITS, LOOT_COPY, BURY_COPY, DEATH_BY(name), INSURANCE_USED, WEATHER_LABELS, WINKE: Record<Exclude<WinkSchool,"">, string[]> (at least 6 lines each), CREDITS: string[] (names only the game).
