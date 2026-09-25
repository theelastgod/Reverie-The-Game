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

## Verified (2026-09-25, integration)

- `npm run typecheck` — client and Worker clean.
- `npm test` — 19 files, 305 tests: map integrity and reachability, identity,
  world/combat/fairness, economy, houses, clearing, engine glue, snapshot
  visibility, content coverage, side quests (all 33 driven end to end), two
  full spine playthroughs reaching every Passing outcome, server sessions,
  clock, client socket, HUD helpers, standalone-content lint.
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
3. **World surface without new art.** Wall faces from `tiles/wall.jpg` instead
   of flat blocks; light pools at halls and shrines; lamp glows; rain particles
   on the Wet Grid; scanline overlay for frozen districts and meltdown weather;
   district ambient tints by weather band.
4. **Body motion.** Walk bob and lean, facing flip, squash on hit-stop, a
   two-frame idle breath; dodge afterimages exist.
5. **Measure the opening.** Script a bot through Movement I over the wire
   (extend `scripts/smoke-campaign.mjs` with real walking) and time it; tune
   distances and copy toward a 15–20 minute first playthrough.
6. **Combat readability.** Directional telegraph arcs, cold ledger damage
   ticks (no coin shower), enemy variety in feel (warden slow and heavy,
   enforcer fast), heavy interrupt feedback.
7. **PvP surfaces.** Hot-street flag zone visuals, ruin-duel spectator
   readout, House war countdown in the HUD, Clearing contest keep/extract bar.
8. **Economy panels.** Claims desk (file / bank / take with the hold timer),
   market (list / buy / cancel), inventory grouped cult / exhibition / paper.
9. **Side quest surfaces.** Active side quests with bearings in the journal;
   quest givers marked in the world.
10. **Wallet login** (EIP-6963 signature, never a seed) replacing the mock link;
    the cookie session stays as the guest identity.
11. **Per-zone Durable Objects** with handoff at gates; **D1** writeback log
    (history, passings, claims) with additive migrations.
12. **Saved-world shape migration.** A world checkpointed by an older build
    can carry stale enemy/node/POI shapes; on restore, rebuild those
    collections from defaults while keeping player progress, and version the
    checkpoint. (A stale local checkpoint made the campaign smoke fail once.)
13. Mainnet stays disarmed: no mint, no `$REVERIE` settlement, claims desk banks
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
