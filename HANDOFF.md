# HANDOFF — Reverie: The Game

Execute `PROMPT.md`. Do not wait for a new user prompt.

**Next stage: 9** — Movement II stub in The Care (House hall / Gestell tax copy). No mint.

## Live
- GitHub: https://github.com/theelastgod/Reverie-The-Game
- Brief site: https://reverie-the-game.wendellphillips.workers.dev
- Prompt: https://reverie-the-game.wendellphillips.workers.dev/prompt.html
- Local client: `npm run dev` → http://127.0.0.1:5175
- Deploy site: `npx wrangler deploy` (Worker `reverie-the-game`, assets from `site/`)
- Durable builder: scheduled every 30m (do not create a second one)

## Done
- Master prompt written (`PROMPT.md`). Art pack is **influence**, not official.
- Document site in `site/` (home + prompt) deployed as a Worker.
- Phaser client scaffold: Boot + Nave, WASD guest body, brutalist HUD.
- Sim tests: guest aura 0, guest cannot claim, intent moves.

## Stage 2–4
- Shared Nave walls; server `stepPlayer` collides.
- Client sends intents over `/ws`. Snapshots lerp other bodies.
- Melee strike, wreckage on death, extract vs keep on CRT nodes.
- Guest still cannot claim.

## Stage 5 (landed)
- Movement I named beats: Nara Vale (burial), Quill (market), Ord (numbers).
- Office of Safety plaque (second visible sign).
- Authored burial plot + going-under shrine. Guest lock copy: “A guest cannot prepare the ground.” Mint still disarmed.
- Imagine guest + party stills in `public/assets/` from brand influence (not official).
- F = speak / bury / go under. Locked guests cannot extract.

Local: `npx wrangler dev --port 8788` and `npm run dev`.

## Stage 6 (landed)
- Gestell clerks Desk Three and Annex Runner: telegraph, strike, die into named wreckage. People doing jobs.
- Name-the-weather: read Safety plaque, speak with Ord, speak with Nara. First completion strikes the plaque and turns Unnamed weather → Named weather.

## Stage 7 (landed)
- Mock Angel link: `{ t: "link", serial: 7777, sig: "mock" }` only. `#0000` guest, `#7777` test Angel.
- Aura seed from serial. Guests stay aura 0. Winke hidden from guests. `damageFor` ignores link. Claims still refuse.

## Stage 8 (landed)
- Care door POI. Angel going-under opens it.
- F at the door: linked Angel hears WINK_CARE (HUD wink chip). Guests hear spectator copy and never get the Wink.
- Claims still refuse. No Base.

## Stage 9 (do this next)
Movement II stub inside The Care: House hall plaque, Gestell tax as a number, no combat power from it.

## Rules
- Branch: `main` until told otherwise. Commit, push, deploy Pages (`site/`) as you go.
- Do not arm Base, treasury, or `$REVERIE`.
- Imagine for art (`image_edit` from `brand/reference/`). No Higgsfield until owner confirms credits.
- Co-Authored-By: Grok <noreply@x.ai>. No other model names in the repo.
- Never write WALL STREET / Meltdown / METROPHAGE / Mafia / Solana Seas repos.
