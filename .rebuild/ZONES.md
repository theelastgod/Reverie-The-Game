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

### After the step's shared views (the same day)

Both levers are in, as one change: `stepViews(w)` builds once per
broadcast what every viewer sees the same (a body's public shape, an
enemy's view, the node views, the POI list, the market, the news, the
clearing, the passing, the frozen list, the history by serial) and a frame
cache that keeps each body's split and each object's JSON for the step, so
`encodeFast` writes a viewer's fast frame from fragments instead of a
stringify per viewer; sections that read one unchanged world section keep
their identity from step to step (the sim never mutates a world in place,
and the object now replaces its collections on a join or a close), so the
slow tracker reads "unchanged" off the object's identity without a
stringify. Version counters were not needed: identity is the version.

Measured in one process, without the wire (`npm run bench`,
`src/sim/broadcast.bench.ts`: 80 bodies in one area of interest, walking;
every step snapshots, splits, diffs and encodes for all 80 viewers):

| path | per broadcast mean | p99 | worst |
|---|---:|---:|---:|
| one viewer at a time (before) | 23.3 ms | 37 ms | 40 ms |
| the step's shared views (now) | 4.8 ms | 10.6 ms | 68 ms (one, a collector pause) |

4.8× less compute per step at 80 viewers, identical bytes on the wire.
With the tick itself the object's step at 80 bodies is now well inside 50
ms of compute on this CPU.

The local end-to-end check tells less. At 40 bots (bots and Worker on one
CPU, through `wrangler dev`'s proxy) the alarm's worst lateness came down
from 159–220 ms (three runs, all FAIL) to 80–131 ms (five runs, three
PASS), the interval mean from 58–63 to 55–57 ms. At 80 bots the check
cannot rank the two: the faster object produces frames in bursts that the
dev proxy and the bots on the same CPU do not drain, the wrangler log
fills with `write(): Broken pipe` from the proxy, and the alarm shows
multi-second stalls (2.6–5 s) the slower object never reached, with p50
intervals under the 50 ms step (catch-up bursts). That is the harness,
not the object: the bench above is the measure of the object, and the
real knee is only known from a run where the bots live elsewhere. A first
try kept the shared views in WeakMaps keyed by the world and the bodies;
it was replaced by the explicit per-step cache (plain Maps dropped with
the step) before it could be blamed for the stalls, and the stalls stayed,
so they are not the collector's ephemerons either.

### The viewer's own side (the same day, later)

Profiled before touching anything (80 walking viewers in one process,
`performance.now` around each part): the per-viewer cost was not where
the plan guessed (NPC views 0.5 ms, the per-viewer slow sections' JSON
0.2 ms) but in the prompt (1.4 ms: `verbsFor` for every body within
reach, and for a guest that is every body), the `you` split (1.8 ms in
`splitSnap`: a spread and ten deletes per viewer), the fast encode (2.3
ms: 79 fragments joined per viewer, which is the fan-out itself) and the
tracker's roster bookkeeping (four Maps rebuilt per viewer per slow
step). So:

- `framesFor(w, id, step)` replaces `splitSnap(snapshotFor(...))` in the
  object: the fast frame now, the slow frame as a thunk the object calls
  only when a slow frame is due. On four steps in five the viewer's slow
  side (the persons' offers, the nodes, the wreckage, the graves, the
  marks, the objectives, the kit's readout) is not built at all. The
  bytes are what `splitSnap(snapshotFor(...))` gives; a test holds them
  equal, encoded and folded back.
- The prompt gathers everything within reach by distance first, then
  reads verbs nearest first and stops at the first thing with one; the
  verbs come from the kind's own function (`playerVerbs(ctx, other)` and
  the rest) with the thing in hand, not by id through three finds. A
  guest or a locked viewer gathers no bodies. The POI list with its
  places and reaches is gathered once.
- `fast.you` is one native copy with the slow keys left `undefined`
  (JSON drops them), measured at less than half of any key-by-key copy;
  `splitYou` keeps its spread and deletes, which measured faster than a
  key-by-key copy too.
- The open dialogue rides `youSlow`, and the notices leave the wire's
  `you` altogether (`Snap.notices` is their section; they were sent
  twice): for a body in conversation the fast frame falls from ~1.9 KB
  to ~1.3 KB, and a lone viewer's from 1352 to ~1290 bytes. The action
  that opens or answers a dialogue sends the slow frame at once, and
  `SlowTracker.youDue` brings it forward the step a record field changes
  under the viewer on a tick (a death closing the dialogue), so nothing
  is later than before.
- A body's roster entry keeps its identity from step to step while its
  roster fields stand (`newFrameCache(last)` carries the last step's
  splits), and a tracker whose roster is entry for entry the object it
  saw last owes nothing and rebuilds nothing.

Measured (`npm run bench`, the same 80 walking viewers; this container
is slower than the morning's, so the rows are for one run):

| path | per broadcast mean | p99 | worst |
|---|---:|---:|---:|
| one viewer at a time (`old`) | 20.2 ms | 31 ms | 33 ms |
| the step's shared views, split after (`shared`) | 6.9 ms | 14.7 ms | 16.5 ms |
| the frames, the slow side when due (`frames`) | 5.2 ms | 14.6 ms | 18.0 ms |

Per part, the frames path (80 guests): the fast encode 1.5 ms, the fast
frame 1.4 ms (of which `you` 0.4, the prompt 0.4), the tracker 0.4, the
slow side 0.3, the step's shared views 0.1: 4.7 ms with the profiler's
own overhead. With 80 Angels (every body a candidate for a flag) the
prompt is 1.5 ms and the whole 7.7 ms. The broadcast itself is 847 KB
per step at that density, 17 MB/s at 20 Hz: with 80 bodies in one area
of interest the wire is the bound long before the compute, which is the
case for zones (or a smaller area of interest), not for more diet.

### The curve past 80 bodies (the same day, last)

`BENCH_BODIES=N npm run bench` on this container: N bodies in one area
of interest, every body walking every step. `tick` is the step without
any broadcast (every body's intent applied, the world ticked); the other
rows add one broadcast to every viewer. Means, and the frames path's
99th percentile:

| bodies | tick alone | one viewer at a time | shared views, split after | frames (the object's path) | frames p99 |
|---:|---:|---:|---:|---:|---:|
| 80 | 1.2 ms | 25.9 ms | 9.7 ms | 4.7 ms | 9.3 ms |
| 120 | 2.1 ms | 54.4 ms | 16.7 ms | 9.4 ms | 17.9 ms |
| 160 | 4.0 ms | 95.3 ms | 28.6 ms | 15.0 ms | 29.3 ms |

The tick grows with the bodies; the broadcast grows with their square,
since every viewer is sent every other body in view. At 160 bodies in
one area the step is 15 ms mean and 29 ms at the 99th on this CPU,
inside the 50 ms step; by this curve the compute alone would cross 50
ms near 250–300 bodies in one area (the old path crossed it at about
115). The wire binds first: 160 bodies in one area is about 3 MB per
step, 60 MB/s, which no single object should be asked to send. So the
object's compute is not the knee at any population one area could
hold; the area of interest, the wire, and then zones are. This is one
process on the container's CPU; a Workers isolate has its own CPU
budget and its own socket costs, so the deployed run (HANDOFF Backlog
4) is still the measure of the real knee.

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
