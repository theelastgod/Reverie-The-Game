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
- Opening measured (2026-09-25): the campaign smoke reports bot time by phase,
  words shown by source, decisions, and a first-playthrough estimate.
- Shape migration (2026-09-25): `src/sim/migrate.ts` rebuilds a checkpoint
  from any earlier build over the current defaults (nodes, npcs, pois merged
  by id; enemies and transient player state rebuilt; every scalar type-checked;
  unknown keys and ids dropped) and stamps `shape` on every checkpoint; the
  server restores worlds and players through it. Verified live against the
  oldest local checkpoint.

## Verified (2026-09-25, integration)

- `npm run typecheck` — client and Worker clean.
- `npm test` — 19 files, 337 tests: map integrity and reachability, identity,
  world/combat/fairness, economy, houses, clearing, engine glue, snapshot
  visibility, content coverage, side quests (all 33 driven end to end, every
  verb through the prompt), two full spine playthroughs reaching every Passing
  outcome, the desk decided once, ruin duels, meltdown streets, the season roll,
  server sessions, clock, client socket, HUD helpers, standalone-content lint.
- `npm run build:play` + `node scripts/stage-play.mjs` — production client staged.
- Against `npx wrangler dev --port 8788`: `scripts/smoke-world.mjs` PASS;
  `scripts/smoke-campaign.mjs` PASS on a fresh world and again on the same
  world (Movement I to the guest lock, link 7777, going under, Movement II).
- `scripts/render-check.mjs` PASS: title, Nave with HUD, dialogue screenshots
  in `.rebuild/shots/`; 16 fps under this sandbox's software WebGL
  (SwiftShader), so frame pacing on a GPU-backed laptop is still unmeasured.
- Not verified: a deploy (the Cloudflare API is denied by the network policy),
  the Stage B assets (results host denied), rendered play on real hardware.

## Backlog

Prioritized. The autonomous routine takes the top unfinished item, finishes it
with tests, runs the gates, commits, pushes, and moves it to Done. Add items as
they are discovered; keep this list honest.

1. **Generated assets (Stage B).** 68 results exist in the owner's Higgsfield
   account (manifest: `.rebuild/generated-manifest.tsv`, pull script:
   `scripts/pull-generated.mjs`). Blocked until `d8j0ntlcm91z4.cloudfront.net`
   is reachable from the container. Then: pull, review each result, drop
   anything off-style, and wire the keepers: portraits (officer, omen, keeper,
   sexton, desk) into `side-npcs.ts`; enemy sprites (warden, enforcer, hour
   clerk) into the entity renderer; House seals into the identity chip and
   minimap; messenger badges into the kit chip; props on the world surface (CRT
   altars at nodes, grave slabs, bells, stalls, vans on the hot street, the
   freeze desk, furnaces, oval light pools, wreckage, the listing board, yield
   nodes, seeds); plates (Kerb, Nave, hot street, credits) into the journal;
   loops (title mark behind the title, going-under and guest lock in the lock
   panel, the four Passing outcomes as full-screen overlays, district ambients
   in the journal); audio (district beds with cross-fades, SFX on strike, heavy,
   hit, dodge, wink, death, extract, keep, page, going-under, burial, freeze,
   appearance, hijack; a mute toggle; volume in localStorage). Remaining
   Higgsfield budget after this session: about 170 credits, for replacements only.
2. **Deploy.** `npm run deploy` with the credentials in the session scratchpad
   (`cf.env`, never in the repo). Blocked until `api.cloudflare.com` is reachable.
3. **Opening density.** Measured 2026-09-25 (`scripts/smoke-campaign.mjs`
   prints `measure:` lines): bot 45 s (walk 40 s, fight 3 s), 996 words on the
   critical path (dialogue 459, spoken 108, journal 315, notices 114), four
   decisions; estimated first playthrough about 10 min against the 15–20
   target. Close the gap with authored beats, not padding: the first fight must
   ask for one dodge and one heavy (see item 4); give Quill's and Ord's first
   conversations a choice each with a consequence; put the second yield node
   and Desk Three on the way to Quill; let the recorder be heard before it is
   decided; a short second clerk on the way to the plaque. Re-measure after
   each change and keep the numbers here.
4. **Combat readability.** The Intake Clerk falls to four light hits in three
   seconds before its first telegraph lands; raise its health and shorten its
   recovery so a first fight shows at least two telegraphs and rewards a heavy
   interrupt. Directional telegraph arcs, cold ledger damage
   ticks (no coin shower), enemy variety in feel (warden slow and heavy,
   enforcer fast), heavy interrupt feedback.
5. **PvP surfaces.** Hot-street flag zone visuals, ruin-duel spectator
   readout, House war countdown in the HUD, Clearing contest keep/extract bar.
6. **Economy panels.** Claims desk (file / bank / take with the hold timer),
   market (list / buy / cancel), inventory grouped cult / exhibition / paper.
7. **Side quest surfaces.** Active side quests with bearings in the journal;
   quest givers marked in the world.
8. **Wallet login** (EIP-6963 signature, never a seed) replacing the mock link;
    the cookie session stays as the guest identity.
9. **Per-zone Durable Objects** with handoff at gates; **D1** writeback log
    (history, passings, claims) with additive migrations.
10. Mainnet stays disarmed: no mint, no `$REVERIE` settlement, claims desk banks
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
