# Reverie: The Game

Near-AAA top-down 2D MMO RPG. Every player is an angel. 7,777 Reverie Angels. Play-to-earn on Base. Campaign and MMO share one server.

**Build brief:** [`PROMPT.md`](./PROMPT.md) — the document to execute against.

Live client and brief: Cloudflare Worker `reverie-the-game`. The earlier Pages reference in the brief is historical; no Pages project with this name exists.

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


## Release checks

`npm test` covers simulation, server recovery, the opening journal and client reconnects.
`npm run typecheck` checks both client and Worker code.
With `npm run dev:world` running, `npm run test:smoke` exercises actual WebSocket movement,
saved reconnects and single-tab ownership. Pass an origin to check a deployment:
`npm run test:smoke -- https://reverie-the-game.wendellphillips.workers.dev`.

After committing and pushing, `npm run deploy` builds the client, stages `site/play/`,
and deploys the existing Worker. `/play/release.json` identifies the source commit.
The brief and game use the same Worker; do not create a replacement Pages host.

Browser sessions use a host-only HttpOnly cookie. Progress belongs to that browser
session until wallet authentication is implemented. Actions save before their
snapshots are sent; movement and passive simulation checkpoint about once per
simulation second, and disconnect saves the current state. Abrupt runtime failure
may roll back that last second of passive state. A second tab takes over the same
body. Clearing cookies starts a new guest. These sessions do not prove NFT ownership;
test Angel linking and the disarmed claims desk remain prototype features.
