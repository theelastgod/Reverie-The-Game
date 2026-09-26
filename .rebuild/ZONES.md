# Scaling one city: the numbers, the snapshot diet, then zones

The brief says one shard: everyone who enters is in the same city, guests see
Angels, Angels see guests as unsealed. So the scale path is not instancing
(many parallel cities) but making one city carry more bodies: first by
sending less, then by splitting the city into zone objects that hand bodies
to each other at the gates. This note keeps the measurements that decide
when each step is due, and the design of the second so it can be built
without re-deriving it.

## 1. What one object costs today (measured 2026-09-26)

`scripts/load-check.mjs` connects N guests over the real WebSocket, walks
them at random through the Nave with strikes when an enemy is near, and
samples the object's own load meter (`/world` → `load`, from
`server/src/load.ts`: alarm lateness, catch-up steps, stalls, broadcast
size) and every bot's snapshot cadence. On this container's local workerd
(one small CPU; production Durable Objects are faster, but the shape of the
curve is what matters):

| bodies | snapshot interval mean / p95 / p99 | alarm late mean / worst | per-viewer broadcast | verdict |
|---:|---|---|---:|---|
| 10 | 49 / 58 / 65 ms | 4 / 18 ms | 10.6 KB | 20 Hz held |
| 20 | 47–49 / 66 / 75 ms | 5 / 31–47 ms | 14.3 KB | 20 Hz held; the default size the check must pass anywhere |
| 40 | 55 / 92 / 104 ms | 17 / 145 ms | 20.3 KB | the knee: mean holds, the worst alarm slips |
| 80 | 128 / 367 / 485 ms | 192 / 789 ms, 1 stall | 31.8 KB | behind: simulation time dropped |

The cost model is plain: every alarm builds one `snapshotFor` per viewer
and stringifies it, so the work per tick is (viewers × snapshot size), and
the snapshot grows with the bodies in view. At 40 bodies that is
40 × 20 KB × 20 Hz ≈ 16 MB/s out of one object; at 80 it is 50 MB/s. A
single viewer's snapshot is already ~10 KB with nobody around, because it
carries the whole slow state every tick: every POI state, every NPC, the
nodes, the history marks, the failed Passings, the houses, the clearing,
the passing, the market, the news, the objective and the side objectives,
the notices. Only players, enemies, nodes, wreckage and graves are limited
to the area of interest (AOI_RADIUS 1040 px, about 21 tiles).

### After the diet (protocol v3, the same day)

| bodies | snapshot interval mean / p95 / p99 | alarm late mean / worst | per-viewer broadcast | verdict |
|---:|---|---|---:|---|
| 20 | 48 / 67 / 74 ms | 4 / 40 ms | 4.3 KB (fast 4.5 KB, slow 336 KB over 15 s) | 20 Hz held |
| 40 | 56 / 84 / 96 ms | 8 / 80 ms | 7.2 KB (fast 7.6 KB) | 20 Hz held; the knee moved past here |
| 80 | 117 / 196 / 2701 ms | 347 / 4821 ms | 14.4 KB (fast 12 KB) | behind; the next levers are in §2 |

### After the second pass (short ids, `you` split; the same day)

| bodies | per fast frame | alarm late mean / worst | checkpoint write | verdict |
|---:|---:|---|---:|---|
| 20 | 4.0 KB | 6 / 56 ms | ~1 ms | 20 Hz held |
| 40 | 6.4 KB | 14–20 / 71–101 ms | 1 ms | at the 100 ms line, run to run |
| 80 | 9.7 KB | 400–550 / 1500–3100 ms | 2 ms | behind |

Two things to know when reading these. The checkpoint (the world blob plus
every connected body's record, once a second of world time) costs 1–2 ms
even at 80 bodies, so the late alarms are compute: one `tickWorld` over
every body plus one `snapshotFor` and one stringify per viewer. And the
load check's bots run on the same one CPU as the Worker in this container,
so every number here is pessimistic; the real knee is higher and is only
known from a run where the bots live elsewhere.

What is left in a crowd's fast frame: ~105 bytes per body in view (of
which the id is 20), `you` without its records (~0.7 KB), the enemies in
view (~110 bytes each). The levers left before zones: version counters so
the slow check skips the stringify, and a `snapshotFor` that builds the
shared views (POIs, NPCs) once per step instead of once per viewer.

## 2. First: the snapshot diet (protocol v3)

Done 2026-09-26 as described below (with one addition: other bodies split
into motion and a roster, joined by id on merge). Kept as the record of
why.

Before any zoning, send less, because zoning does not shrink a viewer's
snapshot, it only spreads the viewers.

- Split `Snap` into a fast frame and a slow frame. The fast frame goes every
  step: `you` (trimmed: no `quests`, `items`, `history`, `claims`, which
  move to the slow frame), `players`, `enemies`, `prompt`, `now`, `tick`.
  The slow frame goes when it changes, and at most every 250 ms (5 Hz):
  everything else, with the objective, side objectives, journal fields,
  purse, notices, news, market, houses, clearing, passing, pois, npcs,
  nodes, wreckage, graves, history, failed.
- The client merges: `WorldSocket` keeps the last slow frame and hands the
  scene a merged `Snap` (the renderers and the HUD stay as they are). The
  campaign smoke and the world smoke read the merged view the same way.
- Change detection on the server: a cheap signature per slow section
  (JSON of the section, cached per viewer, compared by string) is simpler
  than diffing and already saves the send; a per-section version counter
  on the world (bumped by the reducers that touch it) saves the stringify
  too, and is the second pass.
- Expected: the fast frame at 20 bodies in view is 2–3 KB; the slow frame
  ~8 KB at 5 Hz worst case, usually far less often. One object's ceiling
  moves from ~40 to well past 100 bodies on the same hardware, and the
  bandwidth per viewer drops from 200 KB/s to about 60 KB/s.
- Protocol version 3; `hello.v` tells the client; a v2 client is refused
  with the existing version line. `.rebuild/CONTRACTS.md` gets the two
  frame types.

Do this first. It is a day's work, it is testable in the unit suite (a
merge test, a change-detection test) and by `scripts/load-check.mjs` at 40
and 80 bodies, and it pays whether or not zones ever ship.

## 3. Then: zone objects with handoff at the gates

When one object still cannot carry the city after the diet, split it along
the districts. Eight districts, eight zone objects, and one city object for
what is global.

### What is per zone

Everything whose position is inside the district: the bodies standing in it
(players and their intents, cooldowns, timers), its enemies (routes stay in
the zone: no route crosses a gate), its yield nodes, its wreckage and
graves, its frozen state, and the POI states of its POIs. The zone runs the
20 Hz step for those and broadcasts to the viewers standing in it. A viewer
near a gate sees the neighbouring zone's bodies through a **mirror**: each
zone sends its neighbours, at 5 Hz, the public view of every body within
AOI_RADIUS of the shared gate, and the neighbour draws them (not
interactable across the gate; a strike stops at the gate line, which the
level already draws as a field).

### What stays global (the city object)

Gestell and the weather, the season, the houses (standing, tithe, war), the
clearing (open, reserve, contest, seed), the Passing, the market, the news,
the flags and counters, the history marks, the failed Passings, the
writeback log sink. The NPCs' positions and presence: content moves them
between districts (Nara to the garden, Ord to the strait), so their state
is global and each zone renders the ones standing in it from the city's
5 Hz "globals" frame.

### How a zone reads and writes the globals

- The city object pushes a globals frame to every zone at 5 Hz, and at
  once when a value the zones gate on changes (a freeze, the season roll,
  the clearing opening). Zones keep the last frame and read it in the
  reducers where `w.gestell`, `w.frozen`, `w.passing`, `w.houses`,
  `w.clearing`, `w.season`, `w.flags`, `w.npcs`, `w.market`, `w.news`
  are read today. The shared sim keeps its shape: a zone's `WorldState`
  is the same type, with the global sections overwritten from the frame
  before each step and treated as read-only during it.
- A zone sends the city **events** for anything that writes the globals:
  an extraction (gestell, the counters), a burial, a claim, a market
  listing, a news line, a flag effect, a Passing attempt, a tithe. The
  reducers that do this today (`earn`, `pushNews`, `bumpFlag`, the market
  ops, the clearing ops) become the event boundary: in a zone they enqueue;
  the city applies them in order and the next globals frame carries the
  result. Ordering within one zone is preserved; across zones it is the
  city's arrival order, which is the only order there is.
- The Clearing is a zone whose whole content is global (the ring, the
  seeds, the Passing). It runs on the city object itself, so the rite never
  crosses a boundary. The same for the Care's shrine and the House halls'
  lamps: hall state is house state.

### The handoff at a gate

1. The zone's step notices a body whose position crossed into another
   district (`districtAt` already runs per tick in `updateDistrict`).
2. The zone removes the body from its world, checkpoints it under the
   player key, and sends the neighbour a **handoff** message with the full
   `Player` record and the session token, then closes the socket with code
   4010 and reason `zone:<district>`.
3. The client, on 4010, reconnects to `/ws?zone=<district>` (the Worker
   routes by the query, default the Nave), keeping its cookie; the
   neighbour's `join` finds the handed-off record (or the checkpoint) and
   continues the body from the same position, cooldowns intact. The
   reconnect is the same path the client already walks after a hibernation
   close (1012), so the HUD shows RECONNECTING for a frame and nothing else.
4. Until the neighbour's `join` arrives, the record is held by the
   neighbour for 30 s, then falls back to the checkpoint. A body that dies
   during a handoff (impossible: it is in no world) does not exist.

The gates are three tiles wide and the fields are already drawn; a body
cannot stand in two zones. Enemies never cross (`ENEMY_LEASH` and the
routes keep them inside); a chase ends at the gate, which is what the
leash does today.

### The campaign smoke across a gate

`scripts/smoke-campaign.mjs` reaches the Care through the going-under
threshold (a teleport effect, not a walk), so the first crossing it makes
is the Nave → Care wake. It would learn: on close code 4010, reconnect with
`?zone=` from the reason, wait for the hello, and continue; `settle` and
the stall detector already handle the gap. A second scripted crossing
(walk through the Nave → Wet Grid gate at (34, 40) and back) becomes the
zoning smoke.

### Migration from one object

- The city object keeps the name `city-v2` and the key `world:v2`; on
  first start with zoning on (`ZONES=1`), it splits its world by district
  into the zone objects (`zone-v2:<district>`) through the shape migration
  (which already rebuilds collections by id) and keeps the globals.
- The Worker routes `/ws` by `?zone=`; a client without one lands in the
  Nave, whose `join` may hand it off at once if its checkpoint stands
  elsewhere (the same handoff, before the first frame).
- `ZONES=0` (the default until it is needed) keeps everything in one
  object: the handoff code path is never entered, so today's tests and
  smokes stay the proof.

### What it costs

Two message types (`globals`, `event`), one handoff type, one close code,
a zone router in the Worker, mirror frames at the gates, and the reducers'
write boundary. The pure sim does not change shape; what changes is who
owns which sections of it and when they are read. Roughly a week, after
the diet, and only when a real population asks for it.

## 4. Not instancing

Parallel cities would be a fortnight less work and are ruled out by the
brief: one shard, one city, conversion is the point. The writeback log is
public history for that one city, not a bridge between copies.
