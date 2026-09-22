# HANDOFF — Reverie: The Game

Execute `PROMPT.md`. Do not wait for a new user prompt.

**Next stage: 23** — Claims desk **disarmed**: Bestand claim object, 24h hold, guest reject, no Base settle. No mint.

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

## Stage 9 (landed)
- House of Mortals hall plaque inside The Care (Angel going-under then F at the door).
- `gestellTax` is climate/4. Snapshot carries `tax`. HUD shows it in the Care.
- Reading the plaque is a Wink (`WINK_HALL`). Guests never hear it.
- Hall tax skims extract Bestand. `damageFor` ignores tax, aura, and `$REVERIE`. Claims still refuse.

## Stage 10 (landed)
- Safety Annex desk in the Nave. Angel who read the House hall may sign a freeze.
- Freeze protects the district (extract refused). Passing `ready` → 0, `starved: true`.
- Guests get spectator copy. `damageFor` unchanged. Claims still refuse.

## Stage 11 (landed)
- Mock link #7777 seeds a prior-hour wreckage only that serial can see.
- Guests and other serials get empty `visibleHistory`. Bury is a Wink. Claims stay disarmed.

## Stage 12 (landed)
- Quill’s stall lists a Clearing for 40 Bestand. Hall-read Angels hear the market Wink.
- Buying a copy spends Bestand, wounds aura, and does **not** open the Clearing.
- Guests see lights. `damageFor` unchanged. Claims stay disarmed.

## Stage 13 (landed)
- Vesper Hale, Concentrator. Human. Private yield desk.
- Hall-read Angels hear the offer Wink. E take = Cold, +90 Bestand, Movement III funded. Q refuse = Readiness, door stays shut.
- Guests get spectator copy. `damageFor` unchanged. Claims stay disarmed.

## Stage 14 (landed)
- Going-under plants a wreckage garden (the Movement I Clearing, gone). Nara Vale is silent until it is buried.
- Cold-funded Movement III door opens Strait / Foundry / Cable plaques (invented organs, no country names).
- Ord’s map: extract here lights a factory there. Guests cannot enter. `damageFor` unchanged.

## Stage 15 (landed)
- Going-under seeds last season’s failed Passing. Ruin-sight is mock #7777 only.
- F watch (not loot). Guests see asphalt. `damageFor` unchanged. Claims stay disarmed.

## Stage 16 (landed)
- Quill’s tray after the listing: cult Winke vs exhibition copies.
- F lesson. Q keep the eye (cult). E sell a print (+25 Bestand, aura wound). Selling does not open the hole.
- Guests cannot tell which sheet is the prayer. `damageFor` unchanged.

## Stage 17 (landed)
- Ione Kade last word (mortality). She does not return.
- F/Q keep a Clearing; E extract contests it (closes the hole, pays Bestand, aura wound).
- Passing: Appearance / Absence / Hijack / Failed. Gestell 100 without a Clearing fails. Solo cannot force Appearance at Gestell ≥91. Two dwellers can. Freeze or Cold hijacks.
- Guests cannot prepare the ground. `damageFor` unchanged. Claims stay disarmed.

## Stage 18 (landed)
- Mock #7777 links House of Mortals. Earth/Sky/Mortals/Divinities are perception + gather/ritual.
- Earth skims less hall tax. Divinities keep extra Winke. Mortals see failed Passings. Sky HUD omens Passing ready.
- `damageFor` identical across houses. Claims stay disarmed.

## Stage 19 (landed)
- Mock #7777 is a Herald. F on a kept node pings it (`announced`). Sky-blue mark. Not a strike.
- Non-Heralds and guests cannot announce. `damageFor` unchanged. Claims stay disarmed.

## Stage 20 (landed)
- Wet Grid flag (F). Spoils on flagged Angel kills: 30% unbanked Bestand + 1 exhibition copy.
- Cult Winke and banked Bestand never drop. Guests are not loot. Camping the same grave feeds Gestell and thins aura.
- `damageFor` unchanged. Claims stay disarmed.

## Stage 21 (landed)
- Clearing keep/extract scores House war. Two keeps or a ring-hold win Readiness omen; two extracts win Cold omen.
- Winner: tithe cut and omen, never a damage buff. Guests do not score. Claims stay disarmed.

## Stage 22 (landed)
- 1v1 at a wreckage is a ruin duel. Unbanked + exhibition spoils. Cult and banked stay.
- Spectators gain 1 aura, cap 3. Ruin-angel kit is not DPS. Guests gain nothing. Claims stay disarmed.

## Stage 23 (do this next)
Claims desk **disarmed**. Play earns a claim object (not a yield). 24h hold. Guest cannot claim. TAKE would pay Bestand only; `$REVERIE` settle is off. No mint. No Base.

## Rules
- Branch: `main` until told otherwise. Commit, push, deploy Pages (`site/`) as you go.
- Do not arm Base, treasury, or `$REVERIE`.
- Imagine for art (`image_edit` from `brand/reference/`). No Higgsfield until owner confirms credits.
- Co-Authored-By: Grok <noreply@x.ai>. No other model names in the repo.
- Never write WALL STREET / Meltdown / METROPHAGE / Mafia / Solana Seas repos.
