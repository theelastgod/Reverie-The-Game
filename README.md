# Reverie: The Game

A standalone top-down 2D action RPG / MMO. You are a cybernetic angel inside a
world that has already ended. The singularity is the weather. You prepare the
ground for the last god — or you become standing-reserve.

One city of eight districts, a four-movement campaign on the live server, Houses
of the Fourfold, Clearing contests, flagged PvP with wreckage, and an in-world
economy (Bestand) whose every earner has a sink. 7,777 Angels. `$REVERIE` on
Base ships last and disarmed. Guests play Movement I in the browser and lock at
the going-under.

Developers: the master brief is `PROMPT.md`; `DESIGN.md` says how the code
satisfies it; `.rebuild/CONTRACTS.md` holds the shared-sim module signatures and
`.rebuild/CLIENT.md` the client contract; `HANDOFF.md` is the state of the build.

## Controls

| Input | Message | Rule |
|---|---|---|
| WASD / arrows | `intent` | 170 px/s; walls and personal gates are the server's |
| Shift + direction | `dodge` | 0.18 s dash, i-frames only during the dash; longer window in Restraint |
| Click / Space | `strike` | light hit, hit-stop; `damageFor` is a constant |
| R / Shift + click | `heavy` | wind-up you cannot dodge out of; interrupts a telegraph |
| Tab | `stance` | Restraint (see Winke, better dodge, less yield) ⇄ Storm (see wreckage, burns restraint) |
| K | `kit` | the messenger's one verb; never damage |
| F | `interact` / `talk` | primary verb of the nearest thing |
| E / Q | `interact` | secondary verbs: extract / keep, take / refuse, spot / sell, loot / bury |
| 1–4 / Esc | `choose` / `close` | dialogue |
| V / T | `flag` / `truce` | Angels only, in flag-legal districts |
| I | `use` | first paper item (insurance / repair) |
| J / M / L | client | journal / minimap / ledger (holdings, claims, the Grid) |

## Shape

- `src/sim/**` — DOM-free shared simulation (types, constants, the map, the
  protocol, reducers, content). The server owns every number.
- `server/src/index.ts` — one Cloudflare Worker and one Durable Object
  (`ReverieWorld`): cookie sessions, 20 Hz fixed steps from an alarm, checkpoint
  before broadcast, per-viewer snapshots, single-tab ownership (code 4001).
  Storage keys `world:v2` and `player:v2:<token>`; the object is `city-v2`.
- `src/` (client) — Phaser 3 + Vite + TypeScript, DOM HUD over the canvas. Sends
  intents, renders snapshots.
- `site/` — the landing page; `site/play/` is the built client (git-ignored).
- `scripts/` — live checks against a running server.

## Local run

Two processes:

```
npx wrangler dev --port 8788     # the Worker + Durable Object, serves site/ and /ws
npm run dev                      # Vite client on http://127.0.0.1:5175 (proxies /ws, /session, /world)
```

Play at http://127.0.0.1:5175. Link the test Angel from the title or the lock
panel (serial 7777, mock signature). Clearing cookies starts a new guest.

## Release checks

```
npm run typecheck        # client and Worker
npm test                 # vitest: sim, content lint, server sessions, client socket
npm run build            # typecheck + vite build
npm run test:smoke       # scripts/smoke-world.mjs: session, hello v2, movement, dodge, reconnect, 4001 takeover
npm run test:campaign    # scripts/smoke-campaign.mjs: Movement I to the guest lock, link 7777, going under
npm run test:render      # scripts/render-check.mjs: Chromium screenshots to .rebuild/shots, frame pacing >= 30 fps
```

The three live scripts take an origin argument (default `http://127.0.0.1:8788`;
the render check defaults to `http://127.0.0.1:8788/play/`) and need
`npm run dev:world` running with a built client staged in `site/play/`
(`npm run build:play && node scripts/stage-play.mjs`). `GET /health` returns
`{ ok: true, v: 2 }`.

## Deploy

`npm run deploy` builds the client with `VITE_BASE=/play/`, stages it into
`site/play/` with a `release.json`, and deploys the Worker named in
`wrangler.toml`. Sessions use a host-only HttpOnly cookie; a second tab takes
over the same body. Actions checkpoint before their snapshot is sent; passive
simulation checkpoints about once per simulation second.

## Non-negotiables

1. The server owns every number. The client sends intents and renders.
2. `$REVERIE`, serials, aura, House, messenger, items and claims never change
   combat. Traits change perception, verbs and style.
3. Only a linked Angel earns. Guests play Movement I, lock at the going-under,
   cannot claim, flag, see Winke, or enter the Care, the Clearing or the Organs.
4. Every earner ships a sink. The claims desk is disarmed: no mint, no Base
   settlement, no real value.
5. Death drops unbanked Bestand and exhibition items, wounds aura, leaves
   wreckage. Cult objects and banked value never drop.
6. Gestell ≥ 91 fails a Passing unless the Clearing is held by enough dwelling
   Angels. A solo hero cannot force it.
7. PvP needs both flags, no truce, never on the practice ground. Camping the
   same body costs the camper.
8. Persistent ids do not change once shipped. No yield promises anywhere.
9. Never touch WALL STREET, Meltdown, METROPHAGE, Mafia or Solana Seas infra.
