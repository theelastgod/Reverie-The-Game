# Reverie: The Game — rebuild design

This document is the working contract for the rebuilt game. `PROMPT.md` is the
master brief; this file says how the rebuilt code satisfies it. Everything here
is a standalone game. There is no studio, film, director, collective, screening,
dispatch, production still or film-access room anywhere in the game, its site or
its docs. Credits name only the game.

Read this before touching any file under `src/`, `server/`, `site/` or `scripts/`.

## 1. Shape

- **Client:** Phaser 3 + Vite + TypeScript. DOM HUD over the canvas. The client
  sends intents and renders snapshots. It never computes a number that matters.
- **Shared sim:** `src/sim/**` is DOM-free TypeScript imported by both the client
  (types, map, labels) and the Worker (authoritative reducers).
- **Server:** one Cloudflare Worker, one Durable Object shard (`ReverieWorld`),
  20 Hz fixed step, cookie sessions, checkpointed state, per-viewer snapshots
  sent as protocol v3 frames: what moves every step, what changed only when
  it changed (`src/sim/frames.ts`; the scale notes are in `.rebuild/ZONES.md`).
- **Persistence:** DO storage keys `world:v2` and `player:v2:<token>`. Older
  prototype saves are ignored.

```
src/sim/constants.ts   tuning numbers (single source)
src/sim/types.ts       every shared type
src/sim/map.ts         the city: districts, walls, gates, floor patches, POI/NPC/enemy/spawn positions
src/sim/protocol.ts    ClientMsg (client→server) and Snap (server→client)
src/sim/identity.ts    serial → house / messenger / wink school / aura seed; names
src/sim/world.ts       emptyWorld, spawnGuest, tickWorld, movement, death, respawn, wreckage, aura/gestell/restraint ticks, news
src/sim/combat.ts      strike/heavy/dodge/stance/kit; enemy AI; PvP rules; spoils; ruin duel; camping
src/sim/enemies.ts     enemy archetypes and spawns
src/sim/economy.ts     nodes, tax, sinks, items, claims desk (disarmed), market
src/sim/houses.ts      halls, standing, tithe, bounties, house war, perception bonuses
src/sim/clearing.ts    clearing open/close/reserve/contest/seed, passing resolution, season
src/sim/quests.ts      quest engine (steps, predicates, effects, objectives)
src/sim/dialogue.ts    dialogue engine (open/choose/close, node resolution, Wink filtering)
src/sim/effects.ts     applyEffects(w, id, effects) — the one place effects mutate state
src/sim/interact.ts    applyInteract(w, id, targetId, choice) over POI configs
src/sim/actions.ts     applyAction(w, id, ClientMsg) — validation + dispatch
src/sim/snapshot.ts    per-viewer Snap: area of interest, visibility rules, prompt, objective
src/sim/content/       all authored content (see §6)
server/src/index.ts    Durable Object shell, sessions, clock, checkpoint, broadcast
server/src/clock.ts    elapsed-time fixed-step clock (kept from the prototype)
src/scenes/*.ts        Boot, City
src/render/*.ts        floors/walls/props, entities/fx
src/ui/*.ts            hud, dialogue, journal, minimap, lock, title
src/net/worldSocket.ts protocol client with reconnect + single-tab ownership
```

All state is immutable-style: reducers return a new `WorldState`. `players` and
`intents` are `Map`s; everything else is plain JSON so it can be checkpointed.

## 2. Non-negotiables enforced in code (tests exist for each)

1. `damageFor(player)` returns a constant. No serial, house, messenger, aura,
   Bestand, `$REVERIE`, item or claim appears in it. `stormMultiplier` reads
   only the attacker's stance, the target's purse or fallen state and the
   climate band; never a kit. Traits change perception, verbs and style only.
2. Guests: aura 0; `wink` always empty; cannot `claim`, `flag`, `link` anyone
   else, enter the Care, the Clearing or the Organs; locked at going-under;
   cannot hurt or be hurt by other players; can fight enemies and the practice
   dummy.
3. Every earner has a sink in the same module. `economy.ts` exports the
   `EARNER_SINKS` table and a test asserts each earner id has a sink id; the
   private yield keeps the Organs door's price back into `door` on both paths,
   a market buy needs the seller on the Grid (Bestand never leaves the sim),
   and the Clearing contest is one stance and one readiness per Angel per contest.
4. Claims desk is disarmed: `file` creates a claim with a hold, `take` after the
   hold settles into `banked` Bestand only, never real value; idempotent by
   claim id; guests refused; no double settle.
5. Death: unbanked Bestand drops a percentage, exhibition items may drop, cult
   items and `banked` never drop, aura wounds toward seed (Angels never to 0),
   wreckage is left, respawn at the last Care shrine / House hall or the Nave.
6. Gestell ≥ 91 fails a Passing unless the Clearing is held by enough dwelling
   Angels. A solo hero cannot force it.
7. PvP needs both flags (meltdown weather flags the Wet Grid itself), no
   truce, not on the practice ground, and never into a live ruin duel from
   outside it; kills leave wreckage; camping the same body is Gestell+ and
   aura− for the camper.
8. Persistent ids (quests, POIs, districts, protocol) do not change once shipped.

## 3. The city (`src/sim/map.ts`)

One continuous top-down map, 104 × 80 tiles of 48 px (4992 × 3840 px). Districts
are organs of one city, separated by 3-tile wall bands with 3-tile gates.
Some gates are personal: the server treats a gate as a wall for a player who
lacks its flag (`gateBlocks(player, tx, ty)`).

| id | Name (HUD) | Fourfold | Floor texture | Rect (tiles) | Loop |
|---|---|---|---|---|---|
| `nave` | Nave of Tubes | Gestell / Earth-corrupted | `tiles/nave-v2.png` | x 2–33, y 29–54 | Movement I, yield nodes, guest start, arena, funeral street, going-under threshold |
| `wet` | Wet Grid | Mixed / Iridescent | `tiles/wet.jpg` | x 37–68, y 29–54 | market, stalls, forge tray, claims desk, listing board, Vesper's office, hot street (flagged PvP) |
| `care` | The Care | Mortals | `tiles/care.jpg` | x 2–33, y 58–77 | Care shrine (respawn), clinic, funeral desk, wreckage garden, House of Mortals hall, Ione |
| `annex` | Safety Annex | Katechon | `tiles/annex.jpg` | x 2–33, y 2–25 | freeze desk, tax window, wardens, Officer of Safety |
| `kerb` | Kerb of Hours | Sky | `tiles/m3.jpg` | x 37–68, y 2–25 | omen terrace, hour bell, forecast glass, House of Sky hall |
| `ring` | Gold Ring | Divinities | `tiles/shrine.jpg` | x 72–101, y 2–25 | three shrines, mute bell, last-god trace, cult vault, House of Divinities hall |
| `organs` | The Organs | Earth (Strait / Foundry / Cable) | `nave.jpg` / `forge.jpg` / `cable.jpg` | x 72–101, y 29–54 | Movement III travel, House of Earth hall, cold desks |
| `clearing` | The Clearing | Event | `tiles/clearing.jpg` | x 37–68, y 58–77 | contest ring, seeds, Passing ground, failed Passings |

Gates: `nave↔annex`, `nave↔wet`, `annex↔kerb`, `wet↔kerb`, `kerb↔ring`,
`nave↔care` (requires `under`), `wet↔clearing` (requires `angel`),
`care↔clearing` (requires `angel`), `wet↔organs` (requires `m3`),
`ring↔organs` (requires `m3`).

Floor patches (sub-areas with their own texture) mark places: burial street,
arena, going-under threshold, stalls, claims room, Vesper's office, garden,
House halls, shrines, canal bridges. Props (CRT altars, ovals, bells) are
visual only and never collide.

`map.ts` is the level file: every POI, NPC home, enemy home, spawn point and
floor patch has its position there. A test asserts every position is on floor
and reachable from the guest spawn (through gates a fully-flagged Angel can pass).

## 4. Player, world, and what the client sees

See `src/sim/types.ts`. Summary:

- `Player` holds identity (guest/serial/house/messenger/winkSchool), body
  (x, y, facing, hp, dodge, cooldowns, stance), resources (aura, bestand,
  banked, winke, readiness, restraint), campaign (`movement`, `quests`,
  `flags`, `choices`, `party`), PvP (`flagged`, `truceUntil`, `lastKillId`,
  `campCount`), inventory (`items`, `claims`, `insured`), presentation (`heard`,
  `wink`, `notices`, `dialogue`), history (writeback log).
- `WorldState` holds gestell, season, players, intents, npcs, enemies, nodes,
  wreckage, graves, pois (states), flags (shared), houses (standing, war, tithe
  pool), clearing, passing, market, news.
- `Snap` is per viewer: full `you`, public others within the area of interest,
  enemies/nodes/wreckage nearby with visibility rules, all NPCs (with personal
  overrides), POI states, world summary, `prompt` (nearest interaction and its
  keys) and `objective` (journal). Winke are never sent to guests. History marks
  are sent only to their owner. Failed Passings only to Ruin-angels, Storm
  stance, or House of Sky.

## 5. Controls (client) and actions (protocol)

| Input | Message | Server rule |
|---|---|---|
| WASD / arrows | `intent` | 170 px/s, wall collision with substeps, personal gates |
| Shift + direction | `dodge` | 0.18 s at 440 px/s, 0.9 s cooldown, +0.06 s window in Restraint; i-frames only during the dash, against clerks and against people; no attacks during it |
| click / Space | `strike` | light: 22 dmg, 56 px reach, 0.42 s; hit-stop extends cooldown by 0.08 s |
| R / Shift+click | `heavy` | 34 dmg, 64 px reach, 1.1 s; 0.25 s windup during which the player cannot dodge; interrupts an enemy telegraph and forces recovery |
| Tab | `stance` | toggle Restraint ⇄ Storm. Storm burns restraint 1/s, shows wreckage, presses "geared" targets (bestand ≥ 60 unbanked) by the climate band (+15% clear, +25% mixed, +35% fat, +40% meltdown), −25% vs the already-fallen; no kit, messenger, House or serial term. Restraint: see Winke, better dodge, −20% node yield |
| K | `kit` | messenger verb: Herald *Announce* (mark a kept node safe for allies 60 s), Witness *Blitz* (reveal last 8 wreckages 20 s), Ruin-angel *Face* (Storm stance costs no restraint 20 s), Dweller *Keep* (plant a Clearing seed on the current tile), Cybernetic *Read* (see node charges/yield 60 s), Iridescent *Glamour* (listing fee 0 and aura counts as +10 for NPC address 60 s). Guests: nothing. 30 s cooldown. Never damage |
| F | `interact` (verb `F`) / `talk` | primary verb of the nearest thing (speak, read, bury, enter, sign, file…); on a flagged Angel at a shared wreckage: offer or answer a ruin duel (`interact(playerId, "duel")`) |
| E / Q | `interact` (verb `E` / `Q`) | secondary verbs (extract / keep, take / refuse, spot / sell, loot / bury) |
| 1–4 | `choose` | dialogue choice |
| Esc | `close` | close dialogue |
| V | `flag` | toggle PvP flag; only Angels, only in flag-legal areas |
| T | `truce` | request a 20 s truce with the nearest flagged Angel; unflags both |
| I | `use` | use the first paper item (insurance / repair) |
| M | (client) | minimap toggle |
| J | (client) | journal toggle |

## 6. Content (`src/sim/content/`)

Authored data with small predicates. Content never mutates state directly; it
returns `Effect[]` that `effects.ts` applies.

- `npcs.ts` — roster: id, name, role, home (from map), portrait, sprite key,
  `personal(ctx)` override (position/presence for this viewer), `entry(ctx)`
  dialogue node.
- `pois.ts` — `PoiConfig` per POI id: label, verbs (key, label, `when`, guest
  policy, cost + sink, effects, `once` flag, spoken line).
- `spine.ts` — the four movements as quests (`kind: "spine"`).
- `side.ts` — 24+ side quests (`kind: "side"`), each changing one of: a POI, an
  NPC schedule, a cult object, a House standing.
- `dialogue/*.ts` — nodes per NPC.
- `lines.ts` — Winke by school, death/spoils/guest copy, weather names, HUD strings.
- `news.ts` — marquee lines keyed by world events.

### Party (always authored, may walk the city)
- **Nara Vale** — sexton, Mortals / Readiness. Buries wreckage. Leaves the party
  if you feed Gestell past a threshold without a funeral (`party.nara = "gone"`
  until you bury the garden). The conscience; not a saint.
- **Quill** — forger, Iridescent / Wet Grid. Explains the market as glamour.
  Teaches you to spot copies, or sells them.
- **Ord** — ex-Safety, Cold God / Cybernetic. Reads yield nodes. The extraction
  path. Wants the numbers honest even when honesty is horror.
- **Vesper Hale** — concentrated operator (Movement II). Private yield.
- **Ione Kade** — the last word (Movement IV). Does not return.
- Officer of Safety (Annex), omen-reader (Kerb), keeper (Ring), sextons (Care),
  cold desk (Organs): secondary, named by the writers, no real-world names.

### Spine (hour bands are budgets; each hour has a reversal, a name, a world change)
**I — Diagnosis (guest-legal).** Arrive unsealed → Intake Clerk (learn strike,
dodge, heavy) → first node: extract (Bestand, Gestell +1) or keep (Readiness) →
Desk Three (the second fight: wait for the red, interrupt) → second node (the
city reads the pair) → Quill at the Wet gate (print your face, or keep the
name) → Ord at the Annex gate (enter the honest ledger, or stay off it) → Nara
on the funeral street: hear the memorial recorder, then preserve the voice /
dismantle the copper, burial → (optional) the Annex Runner on the west
corridor, a courier that never starts a fight, carrying Safety's real number
for the hour on a slip → name the
weather at the Safety plaque (stability / the process / the end of world as
world; with the slip, stability folds it away and either other name pins the
number under the word for everyone) → the going-under threshold: guests lock
("A guest cannot prepare the ground."), Angels die-as-death and wake in the
Care.

**II — Techno-Feudal.** The Care shrine → Pim Ashe at the wake (the Care's
own book; you are a line in it) → your House hall (tax, who owns the nodes) →
Corvin Slate in the Annex corridor: say what you want the weather to be, held
or hungry → Safety desk: sign a freeze (protects the Nave, starves the
Passing) or refuse; the desk says so when the signature contradicts the
corridor → the tax window: pay this hour's tithe now into your House's
standing, or let the weather take it at the node → serial history as wreckage
only you see → the listing board: the
"resistance" is already pricing Clearings → Vesper Hale: take the private yield
(Cold; opens the Organs door with Bestand) or refuse (Readiness; opens it through
the wreckage garden burial).

**III — Geopolitics.** Strait → Foundry → Cable; extraction here lights a factory
there (Ord's map), and Ord asks where you would cut it: the water, the heat, the
light, or nowhere; the cold desk posts that organ's hour first → the node you
extracted in I is the wreckage garden now; Nara will not speak until you bury it,
then kneels at the plate: a number in the Care's book, or blank → the hour bell
on the Kerb, struck once on the way (the House of Sky's hour opens on it) → a
failed Passing from last season, visible to Ruin-sight → Quill: a Wink can be
forged; spot copies or sell them.

**IV — The Turn.** Mortality act (watch, burial, or the last word with Ione
Kade, who will not return) → Ord at the Care gate: the party stands in the ring
with you (readiness) or you stand alone (restraint; the news says so) → Nara at
the ring before it is a ring, reading the readiness against the floor (the
journal and Ord read it too) → prepare the Clearing with the party willing →
the first stance: keep the hole or extract it
→ the Passing (server-aware): Appearance / Absence / Hijack (Cold or Safety) /
Failed (short of the floor, Gestell maxed, Clearing not held). All four are
written. Credits name only the game. Then the MMO.

## 7. Art map (existing Imagine assets only; nothing new is generated)

Sprites (256², transparent): `guest` (unsealed body), `angel` (linked body),
`clerk` (Gestell clerk / warden / enforcer tinted), `nara`, `quill`, `ord`,
`ione`, `vesper`, `fx-aura` (aura ring under Angels), `fx-strike` (hit flash),
`fx-wreckage` (wreckage marker). In-world size 56 × 72.

Floors (1024²): listed in §3, plus patches `burial`, `arena`, `under`, `stall`,
`claims` (256²), `operator`, `garden`, `hall`, `organ` (canal), `forge`, `cable`
(renamed from the old screening texture; it is a neutral cable surface), `wall`
(wall face). `tiles/crt.jpg` is a prop drawn with additive blending.

Portraits (dialogue): `nara.jpg`, `quill.jpg`, `ord.jpg`, `vesper.jpg`,
`ione.jpg`, `guest.jpg` (you, unsealed), `serial-wreckage.jpg` (Ruin-angel /
history), `safety-annex.jpg` (Officer of Safety), `shrine-upkeep.jpg` (keeper).

Plates (journal): `plate-burial` (burial), `plate-care` (the Care), `plate-under`
(going-under), `plate-claims` (claims desk), `plate-forge` (forge tray),
`plate-operator` (Vesper), `plate-arena` (practice), `plate-ione` (last word /
absence), `plate-m3` (the Organs door), `plate-vesper` (the Foundry organ),
`house-hall` (halls), `house-war` (House war), `clearing-ring` (the Clearing),
`clearing-stall` (listing board), `failed-passing`, `serial-wreckage`,
`wreckage-garden`, `safety-annex`, `shrine-upkeep`, `stall-surface`,
`wet-grid-cult`, `organ-strait`, `organ-foundry-dark`, `organ-cable-dark`,
`memorial-recorder-v1`, `hud-icons` (source of `hud/*.png`), `wing-star`.

Palette: world gold/sky/wine; HUD paper/ink/acid; Gestell lavender. Never acid
in the world; never gold-plate the HUD. Display Anton, UI Space Grotesk.

## 8. Quality gates

- `npm run typecheck`, `npm test`, `npm run build` green.
- `scripts/smoke-world.mjs` and `scripts/smoke-campaign.mjs` pass against
  local Wrangler: real WebSocket movement, dodge, reconnect, single-tab
  ownership, Movement I to the guest lock, mock link, Movement II–IV spine.
- `scripts/render-check.mjs` (Playwright + preinstalled Chromium) loads the
  built client against local Wrangler at 1366 × 768, screenshots the title, the
  Nave with HUD, a dialogue, and reports frame pacing.
- Content lint test: no forbidden words in `src/`, `site/`, `index.html`
  (studio, film, director, collective, screening, dispatch, Square names), every
  referenced asset exists, every POI/NPC referenced by content exists in the map,
  every quest step has a reachable target.
