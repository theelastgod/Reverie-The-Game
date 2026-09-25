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
export function validLink(serial: number, sig: string): boolean; // Number.isInteger, 1..ANGEL_SUPPLY, sig === MOCK_SIG
export function serialHistoryMark(serial: number): HistoryMark | null; // 7777 -> mark at POSITIONS["history:7777"], else null
```

## world.ts
```ts
export function emptyWorld(): WorldState;                  // gestell GESTELL_START, nodes initialNodes(), enemies initialEnemies(), npcs from NPC_HOMES (present, state "home"), pois every id in POI_STATES at its first state, houses initialHouses(), clearing initialClearing(), passing initialPassing(), rng 0x9e3779b9
export function spawnGuest(id: string, now?: number): Player; // at GUEST_SPAWN, guest, aura 0, restraint RESTRAINT_START, stance "restraint", movement 1, party {nara:"none",quill:"none",ord:"none"}, respawn GUEST_SPAWN
export function tickWorld(w: WorldState, dt: number): WorldState; // now+=dt, tick++, step every player (movement, timers, district), tickEnemies, tickNodes, tickMarket, tickHouseWar, tickClearing, drift aura/gestell/restraint, expire wreckage/graves/notices, then tickQuests for every player
export function stepPlayer(p: Player, intent: Intent, dt: number): Player; // SPEED, dodge dash, substep collision via circleHitsWalls(x,y,BODY_R,p); no movement while dead or in dialogue? (dialogue does NOT freeze movement; heavyWindup does)
export function damageFor(p: Player): number;              // STRIKE_DAMAGE, constant
export function heavyFor(p: Player): number;               // HEAVY_DAMAGE, constant
export function updateDistrict(p: Player): Player;         // p.district = districtAt(p.x,p.y)
export function say(p: Player, text: string, now: number): Player;      // sets heard/heardAt
export function wink(p: Player, text: string, now: number): Player;     // guests: no-op; aura < AURA_DIM or restraint < RESTRAINT_WINK_MIN: no-op; else sets wink/winkAt
export function notice(p: Player, text: string, now: number, tone?: Notice["tone"]): Player; // push, keep NOTICE_KEEP
export function pushNews(w: WorldState, text: string): WorldState;      // keep NEWS_KEEP
export function nextRand(w: WorldState): [number, WorldState];          // xorshift32 -> [0,1)
export function killPlayer(w: WorldState, victimId: string, killerId: string, cause: string): WorldState;
  // drops UNBANKED_DROP of bestand + each exhibition item with EXHIBITION_DROP_CHANCE (never cult, never banked) onto a Wreckage at the body; aura -= AURA_WOUND but not below auraSeed for Angels (guests stay 0); deaths++; dead=true then immediately respawn at respawnPoint (hp MAX_HP, insured resets to false if it was used: insured -> respawn where they died instead, keeping bestand); heard = cause; history untouched
export function respawnPoint(p: Player): Vec & { district: DistrictId }; // p.respawn
```

## enemies.ts
```ts
export function initialEnemies(): Enemy[];                 // one per ENEMY_SPAWNS, state "idle"
export function spawnEnemy(spawn: EnemySpawn, now: number, name?: string): Enemy;
export function enemyStats(kind: EnemyKind): typeof ENEMY[EnemyKind];
```

## combat.ts
```ts
export function tickEnemies(w: WorldState, dt: number): WorldState;
  // idle: nearest living, unlocked, non-dead player within aggro -> aggro; aggro: walk toward target at speed (collision), when within reach -> telegraph (t=telegraph, keep targetId); telegraph: t-=dt; at 0: if target still within reach*1.25 and not dodging -> damage (kill via killPlayer if hp<=0, cause "<name> did their job."), if dodging -> target.heard = LINES.DODGE_COPY; then recover (t=recovery); recover -> aggro; leash: farther than ENEMY_LEASH from home -> return (walk home, heal to max when home) ; dead: respawnAt<=now -> respawn at home (intake: only when a fresh arrival without F.INTAKE is within 240 px); dummy: never moves or attacks, hp resets on death instantly
export function tickCombatTimers(p: Player, dt: number): Player; // strikeCd, heavyCd, heavyWindup (fires the heavy hit when it reaches 0 — see applyHeavy), hitStop, dodgeT, dodgeCd, kitCd, kit expiry
export function applyDodge(w, id, dx: number, dy: number): WorldState; // signs only; refuse if dead, locked, dodgeCd>0, heavyWindup>0, dialogue open; dodgeT = DODGE_DURATION (+RESTRAINT_DODGE_BONUS in restraint stance), dodgeCd = DODGE_COOLDOWN
export function applyStrike(w, id): WorldState;             // refuse if dead/locked/strikeCd>0/dodgeT>0/heavyWindup>0; hits every enemy within STRIKE_RANGE (in front: dot(facing, dir) > -0.2 or facing zero) and every player within range subject to pvpBlockReason; on any hit: strikeCd = STRIKE_COOLDOWN + HIT_STOP, hitStop = HIT_STOP; damage = damageFor(p) scaled by storm rules (see §stances); enemies: participants add attacker; enemy death -> wreckage(fromId enemy id, fromName, no drops) + F.INTAKE for participants when it is the intake clerk + respawnAt = now + respawn; dummy respawns instantly and says LINES.ARENA_HIT
export function applyHeavy(w, id): WorldState;              // start heavyWindup = HEAVY_WINDUP (refuse if heavyCd>0 or dodging/dead/locked); when windup reaches 0 in tickCombatTimers the hit resolves via resolveHeavy(w, id): HEAVY_RANGE, heavyFor(p); an enemy in "telegraph" that is hit is interrupted: state "recover", t = recovery*1.5, attacker.heard = LINES.INTERRUPT
export function resolveHeavy(w, id): WorldState;
export function applyStance(w, id): WorldState;             // toggle; guests may toggle (style only) but storm bonuses need !guest
export function applyKit(w, id, targetId?: string): WorldState; // guest: say LINES.KIT_GUEST; kitCd>0: say cooldown; herald: nearest kept node within 200 -> announcedUntil = now+KIT_DURATION; witness: kit = {verb:"witness", until: now+BLITZ_DURATION} (snapshot reveals last BLITZ_COUNT wreckage incl. expired-within-10min? keep simple: all current wreckage in AOI regardless of visibility rules); ruin: kit until now+FACE_DURATION (storm burns no restraint); dweller: applyNode(w,id,nearest node within 96,"seed") else say need; cybernetic: kit until now+KIT_DURATION (nodes carry yieldHint/chargesHint); iridescent: kit until now+KIT_DURATION (listing fee 0, aura counts +10 for address); kitCd = KIT_COOLDOWN
export function applyFlag(w, id): WorldState;               // guests/locked: say LINES.FLAG_GUEST; district not flagLegal: say LINES.FLAG_WHERE; truce active: refuse; toggle flagged; news when flagged in wet
export function applyTruce(w, id): WorldState;              // nearest flagged Angel within 96 -> both truceUntil = now+TRUCE_SECONDS, both unflagged
export function pvpBlockReason(a: Player, b: Player, w: WorldState): string | null; // guests/locked either side -> LINES.GUEST_GRIEF; truce -> LINES.TRUCE_ACTIVE; either inside patch-arena -> LINES.PRACTICE_SAFE; !a.flagged||!b.flagged -> LINES.PVP_FLAG_REQUIRED; else null
export function stormMultiplier(a: Player, b: Player, w: WorldState): number; // 1; storm & !guest & !kit-face: geared target (b.bestand >= STORM_GEARED_BESTAND) -> 1+STORM_GEARED_BONUS; target already has live wreckage of their own (fallen) -> 1-STORM_FALLEN_PENALTY
```
PvP kill: spoils = floor(victim.bestand*UNBANKED_DROP) to killer (earner "spoils"), exhibition drop chance, wreckage with killerId; ruin duel = both within RUIN_DUEL_RADIUS of a live wreckage -> spectators (other Angels within SPECTATE_RADIUS, spectated < SPECTATE_CAP) aura+AURA_SPECTATE_GAIN; camping: killer.lastKillId===victim && now-lastKillAt < CAMP_WINDOW -> gestell += GESTELL_CAMP, killer.aura -= AURA_CAMP_PENALTY, campCount++; restraint -= RESTRAINT_CHAIN_KILL_PENALTY if killer killed within 30 s before; kills++; history looted++ when spoils>0.

## economy.ts
```ts
export const EARNER_SINKS: Record<(typeof EARNERS)[number], (typeof SINKS)[number]>; // node->tax, spoils->repair, craft->listing, bounty->tithe, claim->bank, stipend->upkeep, operator->door
export function initialNodes(): YieldNode[];                // from NODE_LIST, charges NODE_CHARGES
export function tickNodes(w, dt): WorldState;               // regen one charge per NODE_REGEN when charges < NODE_CHARGES; announcedUntil expiry
export function gestellTax(gestell: number): number;        // floor(clamp(g,0,100)/4) percent
export function nodeYield(w, p, node): number;              // NODE_YIELD * (fat ? NODE_FAT_MULT : 1) * (restraint stance ? NODE_RESTRAINT_MULT : 1) minus tax%, floored; frozen district -> 0
export function applyNode(w, id, nodeId, op: "extract"|"keep"|"announce"|"seed"): WorldState;
  // extract: within 56 px, charges>0, district not frozen (say LINES.FROZEN), guests allowed (in-instance bestand); charges--, bestand += yield (earner "node"), gestell += GESTELL_EXTRACT, p.extracted++, extractedSinceFuneral++, world EXTRACTIONS++, kept=false; if extractedSinceFuneral >= NARA_THRESHOLD and party.nara==="with" -> party.nara="gone", say LINES.NARA_LEAVES
  // keep: within 56, !kept; kept=true keptBy=id, readiness += READINESS_KEEP, restraint += RESTRAINT_KEEP_GAIN, gestell += GESTELL_KEEP, p.kept++
  // announce/seed: see combat kit; seed sets node.seed=true and clearing.seeds push
export function earn(w, id, amount, earner): WorldState;     // bestand += amount, world flag `earned:<earner>` += amount
export function spend(w, id, amount, sink): WorldState | null; // null when bestand < amount (caller says LINES.CANT_AFFORD); world flag `sunk:<sink>` += amount
export function addItem(p, item: Item): Player; export function removeItem(p, id, qty?): Player; export function hasItem(p, id, qty?): boolean;
export function applyUse(w, id, itemId): WorldState;        // paper:insurance -> insured=true; paper:repair -> hp=MAX_HP; others: say LINES.CANT_USE
export function applyClaims(w, id, op: "file"|"bank"|"take", claimId?: string): WorldState;
  // guest -> say LINES.CLAIMS_GUEST, no claim. file: claimsFiled < CLAIM_CAP and bestand >= CLAIM_AMOUNT -> move CLAIM_AMOUNT purse into a Claim {readyAt: now+CLAIM_HOLD}; bank: banked += floor(bestand*(1-BANK_FEE)), bestand=0 (sink "bank"); take: claim readyAt<=now && !settled -> settled=true, banked += amount (earner "claim"); never real value; idempotent
export function applyMarket(w, id, op, args: { itemId?: string; listingId?: string; price?: number }): WorldState;
  // list: exhibition item only, price 1..999, fee LISTING_FEE (0 with iridescent kit) sink "listing"; buy: pay price to seller (banked), item to buyer; cancel: own listing back
export function tickMarket(w, dt): WorldState;              // every EXHIBIT_DECAY an exhibition item's value-- (min 0) for listings and player items
export function applyForge(w, id, op: "craft"|"spot"|"sell"): WorldState; // craft: FORGE_COST -> item "copy:wink" exhibition value COPY_PRICE and fakeWinke++ ; spot: reveals copies (removes fakeWinke, aura +1), sell: list copy
```

## houses.ts
```ts
export function initialHouses(): WorldState["houses"];      // standing 0s, tithe 0, war inactive with startsAt = WAR_PERIOD, site "clearing-ring"
export function hallFor(house: Fourfold): string;           // "hall-mortals" etc
export function tickHouseWar(w, dt): WorldState;            // windows: at startsAt -> active, endsAt = startsAt+WAR_HOLD, alternate site between "clearing-ring" and "hot-street"; count seconds per house for Angels (not guest/locked/dead, house set) within WAR_RADIUS of the site; at end: winner = max held (ties none), standing[winner] += 3, tithe cut: winner house players get news + world flag `omen:<house>`; next startsAt = endsAt + WAR_PERIOD
export function applyStanding(w, house, delta): WorldState;
export function perception(p: Player): { wreckageBonus: number; forecast: boolean; winkDensity: number; groundResist: number; funeralSight: boolean };
  // mortals: wreckageBonus WRECKAGE_TTL_BONUS, funeralSight; sky: forecast; divinities: winkDensity 2; earth: groundResist 2 (tax -2 percent points on ground nodes); ruin messenger also wreckageBonus
export function applyTithe(w, id): WorldState;              // at own hall: TITHE_COST (sink "tithe") -> standing[house] += 1, tithe pool += cost; guests refused
export function applyBounty(w, id): WorldState;             // at own lit hall: if tithe pool >= 5 and standing[house] > 0 -> pay 5 from pool (earner "bounty"), once per WAR_PERIOD per player (flag `bounty:at`)
```

## clearing.ts
```ts
export function initialClearing(): ClearingState;           // closed, reserve CLEARING_RESERVE
export function initialPassing(): PassingState;
export function tickClearing(w, dt): WorldState;            // heldBy = Angels within CLEARING_RADIUS of clearing-ring (alive); while open: gestell += GESTELL_CLEARING_HOLD*dwellers*dt, dwellers aura += AURA_DWELL_GAIN*dt (cap AURA_MAX); contest timer: at endsAt resolve keep vs extract -> lastOutcome, pois["clearing-ring"].state = "held" or "closed", news
export function applyClearing(w, id, op: "open"|"keep"|"extract"|"pass"): WorldState;
  // open: Angel within radius, reserve>0, pois state "closed" -> "open", openedAt, contest {active, keep 0, extract 0, endsAt now+WAR_HOLD}; keep: contest.keep += 1 (readiness += READINESS_KEEP*2, restraint +), extract: contest.extract += 1, reserve -= CLEARING_EXTRACT, bestand += CLEARING_EXTRACT (earner "node"), aura -= 2, gestell += 2; pass: choice only
export function partyWilling(p: Player): boolean;           // party.nara !== "gone" && party.ord !== "gone"
export function resolvePassing(w, p): PassingOutcome;       // pure: if !partyWilling or readiness < READINESS_PASSING_MIN or !flags[F.MORTALITY] -> "failed"; if gestell >= GESTELL_MELTDOWN && clearing.heldBy.length < CLEARING_HOLD_ANGELS -> "failed"; if (choices[C.OPERATOR]==="take" && current==="cold") -> "hijack" (cold); if choices[C.FREEZE]==="signed" && flags[F.PREPARE] && restraint < 50 -> "hijack" (safety); if readiness >= READINESS_APPEARANCE_MIN -> "appearance"; else "absence"
export function applyPassing(w, id): WorldState;            // at the ring, prepared; resolve; write choices[C.PASSING], flags[F.PASSING], history passings++ + outcome, passing.count++, lastOutcome/lastBy/lastAt/hijackedBy, appearanceUntil = now+SEASON_LENGTH on appearance (aura drift halves), stipend PASSING_STIPEND on appearance (earner "stipend"), failed -> push FailedPassing at "failed-1" for the season, pois["clearing-ring"] -> "failed"; news; movement 5 after credits handled by quests
```

## quests.ts
```ts
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
export function openNode(w, id, npcId, nodeId): WorldState; // resolves text/wink/choices (filter `when`), applies node.effects, sets p.dialogue = DialogueView (portrait from NpcDef, speaker name); wink filtered by world.wink rules; choices[] empty when node has none
export function applyChoose(w, id, choiceId): WorldState;   // dialogue open, choice valid; apply choice.effects; if choice.next -> openNode else close
export function applyClose(w, id): WorldState;              // if node.next (when no choices) -> openNode(next) else dialogue = null
```

## effects.ts
```ts
export function applyEffects(w: WorldState, id: string, effects: Effect[] | ((ctx: Ctx) => Effect[]) | undefined): WorldState;
  // one switch over Effect.kind; delegates to economy (bestand/banked/node/claim/item/insure/heal), world (say/wink/notice/news/killPlayer), houses (standing), clearing (clearing/passing), quests (quest), dialogue (dialogue), combat/enemies (spawn); "under": guest -> lock (locked=true, say LINES.GUEST_LOCK); Angel -> flags[F.UNDER]=1, teleport to POSITIONS["care-shrine"], respawn there, hp MAX, aura = max(aura, auraSeed), movement 2, notice; "lock": locked=true; "teleport": to POSITIONS[to]; "respawnAt": respawn = POSITIONS[poi]; "freeze": w.frozen[district] = now+seconds, world FREEZES++; "movement": p.movement; "party"; "npc" (merge into w.npcs[id]); "poi" (state, by, at, count++); "wreckage" bury/loot nearest within 64: bury -> buried=true, graves push, readiness += READINESS_BURY, restraint += RESTRAINT_BURY_GAIN, gestell += GESTELL_BURY, extractedSinceFuneral=0, history buried++, world BURIALS++, if party.nara==="gone" -> "waiting"; loot -> bestand += wreckage.bestand, items, aura -= AURA_LOOT_PENALTY, looted=true, history looted++ ; "history" merges into p.history
```

## interact.ts
```ts
export function applyInteract(w, id, targetId, choice: string): WorldState;
  // targetId is a POI id (POI_CONFIGS), a node id (choice "extract"|"keep"), a wreckage id (choice "bury"|"loot"), or an npc id (choice "talk" -> applyTalk). Reach: POI reach (default 56). Verb lookup by choice; check when(ctx); guest policy: "deny" -> say LINES.GUEST_LOCK; "spectate" -> say LINES.SPECTATOR; cost via spend (null -> say LINES.CANT_AFFORD); once flag (skip if set, say LINES.ALREADY); then applyEffects(effects) and say(say)
export function verbsFor(ctx: Ctx, targetId: string): PromptVerb[]; // available verbs for prompts (respecting when/once/guest policy: deny shows the verb greyed? -> omit)
```

## snapshot.ts
```ts
export function snapshotFor(w: WorldState, viewerId: string): Snap;
export function publicPlayer(p: Player, now: number): PublicPlayer;
export function promptFor(ctx: Ctx): Prompt | null;         // nearest of: npc (personal position, 72px, verbs [F Speak]), poi (reach), node (56: E Extract / Q Keep; hidden if frozen), wreckage (64: F Bury, E Loot [Angels only]), player (96: V Flag/Unflag, T Truce when flagged) — choose the closest; POIs whose verbsFor is empty are skipped
export function visibleWreckage(w, p): Wreckage[];          // until + perception(p).wreckageBonus (+ storm) ; witness blitz shows all in AOI
export function npcView(ctx, npc: NpcState): NpcView | null; // apply NPCS[id].personal override; null when not present for this viewer
```

## actions.ts
```ts
export function applyAction(w: WorldState, id: string, msg: ClientMsg): WorldState; // validate every field (finite numbers, string length <= 64, enums), then dispatch: intent -> w.intents; dodge; strike; heavy; stance; kit; interact; talk; choose; close; link -> applyLink; flag; truce; use; market
export function applyLink(w, id, serial: number, sig: string): WorldState; // validLink; refuse if another connected player has the serial (say LINES.LINK_ELSEWHERE); guest=false, serial, name formatSerial, house/messenger/winkSchool, auraSeed, aura = max(aura, seed), flags[F.ANGEL]=1, locked=false, linkedAt, history mark push if serialHistoryMark; if locked at the threshold, the "under" effect is NOT applied automatically (player uses the threshold again)
```

## content/index.ts (owned by the integrator)
```ts
export const NPCS: Record<string, NpcDef>;       // party (npcs.ts) + secondary (side-npcs.ts)
export const POI_CONFIGS: Record<string, PoiConfig>; // pois.ts merged with SIDE_POI_VERBS (verbs appended)
export const QUESTS: Quest[];                    // [...SPINE, ...SIDE]
export * as LINES from "./lines";
export { NEWS } from "./news";
```

## content/lines.ts (constants the engine references by name)
GUEST_LOCK, SPECTATOR, ALREADY, CANT_AFFORD, CANT_USE, FROZEN, DODGE_COPY, DODGE_WHIFF, INTERRUPT, HIT_COPY, ARENA_HIT, GUEST_GRIEF, TRUCE_ACTIVE, PRACTICE_SAFE, PVP_FLAG_REQUIRED, FLAG_GUEST, FLAG_WHERE, FLAG_ON, FLAG_OFF, TRUCE_COPY, SPOILS_COPY, CAMP_COPY, DUEL_COPY, SPECTATE_COPY, STORM_PRESS, STORM_FALLEN, KIT_GUEST, KIT_COOLDOWN, KIT_NEED (per messenger record), KIT_COPY (per messenger record), CLAIMS_GUEST, CLAIMS_FILED, CLAIMS_HELD, CLAIMS_TAKEN, CLAIMS_CAP, BANKED, LINK_ELSEWHERE, LINK_COPY(serial, house, messenger), NARA_LEAVES, NARA_WAITS, LOOT_COPY, BURY_COPY, DEATH_BY(name), INSURANCE_USED, WEATHER_LABELS, WINKE: Record<Exclude<WinkSchool,"">, string[]> (at least 6 lines each), CREDITS: string[] (names only the game).
