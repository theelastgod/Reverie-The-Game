# Reverie: The Game

Near-AAA top-down 2D MMO RPG. Every player is an angel. 7,777 Reverie Angels. Play-to-earn on Base. Campaign and MMO share one server.

**Build brief:** [`PROMPT.md`](./PROMPT.md) — the document to execute against.

Site (Cloudflare Pages): see deploy notes in `PROMPT.md` § Technical.

## Non-negotiables (short)

- Title is **Reverie: The Game**. Token is **$REVERIE**.
- Guests can play Movement I, then lock. Only a linked Angel NFT earns.
- `$REVERIE` never buys combat stats.
- Art references in `brand/reference/` are **influence**, not official screenshots.
- Imagine for first graphics. Higgsfield only after credits are confirmed.

## Local

Two processes:

```
npx wrangler dev --port 8788
npm run dev
```

Play at http://127.0.0.1:5175 — WASD, click/space strike, F speak / bury / going-under / Care / House hall, E extract, Q keep. Guests lock at the first going-under and cannot claim. Gestell tax is a number, never a damage stick.

Brief: https://reverie-the-game.wendellphillips.workers.dev
