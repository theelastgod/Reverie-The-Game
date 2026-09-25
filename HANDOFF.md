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

## Verified (2026-09-25, integration)

- `npm run typecheck` — client and Worker clean.
- `npm test` — 22 files, 356 tests: map integrity and reachability, identity,
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
  world (Movement I to the guest lock, link 7777, going under, Movement II);
  latest measure (after the opening beats, fresh world and reused world):
  bot 59 s (walk 49 s, two fights 8 s, talk 1.8 s), 1393 words shown, 7
  decisions, first playthrough estimate 15.0 min.
- `scripts/render-check.mjs` PASS: title, Nave with HUD, dialogue screenshots
  in `.rebuild/shots/`; 14.9 fps under this sandbox's software WebGL
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
   appearance, hijack; a mute toggle; volume in localStorage); music (rows
   72–78: the title theme behind the title screen, the Nave and Grid
   underscores by district, the combat pulse while an enemy is in telegraph
   or recovery, the burial elegy at the plot and the Care, the rite in the
   Clearing; cross-fade with the beds, never both at full level); the four
   trailer clips (79–82) as extra loops, and the 30 s trailer (83) on the
   landing page in `site/`. Remaining Higgsfield budget after the music and
   trailer: about 255 credits, for replacements only.
2. **Deploy.** `npm run deploy` with the credentials in the session scratchpad
   (`cf.env`, never in the repo). Blocked until `api.cloudflare.com` is reachable.
3. **Wallet login** (EIP-6963 signature, never a seed) replacing the mock link;
   the cookie session stays as the guest identity.
4. **Per-zone Durable Objects** with handoff at gates; **D1** writeback log
   (history, passings, claims) with additive migrations.
5. **Opening density, the last stretch.** Measured 2026-09-25 after the
   opening beats and Ord's reading of the pair (`scripts/smoke-campaign.mjs`
   prints `measure:` lines; a later fight is floored at 25 s of a person's
   time, the first at 45 s): bot 58.9 s (walk 48.9 s, fights 8.2 s, talk
   1.8 s), 1393 words on the critical path (dialogue 687, spoken 161, journal
   392, notices 153), seven decisions; estimated first playthrough 15.0 min,
   the low end of the 15–20 target (was 10.2). Optional beat left: the Annex
   Runner as a courier on the way back to the plaque (needs a route state for
   enemies, not just an aggro radius). Re-measure after any change and keep
   the numbers here.
6. Mainnet stays disarmed: no mint, no `$REVERIE` settlement, claims desk banks
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
