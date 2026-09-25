# site/

The landing page for Reverie: The Game (`index.html`, `style.css`, `assets/`), served as the Worker's static assets from `wrangler.toml`. `npm run deploy` builds the client into `site/play/` (git-ignored) and deploys the Worker; `/play/` is the game, `/health` reports the protocol version, `/session` and `/ws` are the server. Nothing but the game is mentioned here.
