# HANDOFF — Reverie: The Game

Execute `PROMPT.md`. Do not wait for a new user prompt.

**Next stage: 5** — Movement I authored beats after the extract/keep node (Nara/Quill/Ord intro, guest lock stub).

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

## Stage 2–4 (landed this pass)
- Shared Nave walls; server `stepPlayer` collides.
- Client sends intents over `/ws` (Vite proxies to wrangler :8788). Snapshots lerp other bodies.
- Melee strike (click/space), wreckage on death, extract vs keep on CRT nodes.
- Guest still cannot claim.

Local: `npx wrangler dev --port 8788` and `npm run dev`.

## Stage 5 (do this next)
Movement I named beats: Nara burial, Quill market line, Ord numbers, guest-lock copy at first going-under (still no mint). Wire a second player-visible NPC or sign. Imagine guest sprite from brand influence.

## Rules
- Branch: `main` until told otherwise. Commit, push, deploy Pages (`site/`) as you go.
- Do not arm Base, treasury, or `$REVERIE`.
- Imagine for art (`image_edit` from `brand/reference/`). No Higgsfield until owner confirms credits.
- Co-Authored-By: Grok <noreply@x.ai>. No other model names in the repo.
- Never write WALL STREET / Meltdown / METROPHAGE / Mafia / Solana Seas repos.
