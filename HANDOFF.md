# HANDOFF — Reverie: The Game

Execute `PROMPT.md`. Do not wait for a new user prompt.

**Next stage: 270** — Execute the playable chapter redesign in `DESIGN.md`: reusable clerk encounters, a consequential first node choice, and measured opening playthrough. No more repeated “as people” plaques. No mint.

## Live
- GitHub: https://github.com/theelastgod/Reverie-The-Game
- Brief site: https://reverie-the-game.wendellphillips.workers.dev
- Play: https://reverie-the-game.wendellphillips.workers.dev/play/
- Prompt: https://reverie-the-game.wendellphillips.workers.dev/prompt.html
- Local client: `npm run dev` → http://127.0.0.1:5175
- Deploy: `npm run deploy` (Vite `/play` + Worker `reverie-the-game`)
- Continued execution: one task heartbeat checks every 30m. An earlier builder was recorded here but could not be located in the available scheduler. The heartbeat defers when another writer has recent meaningful progress or unexplained local edits; do not create additional schedules.

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

## Stage 23 (landed)
- DESK plaque. F/Q file unbanked Bestand into a claim (24h hold). E TAKE is **disarmed** — no Bestand paid, no Base.
- Guests cannot file. `guestCanClaim` stays false. Copy forbids yield/APY.

## Stage 24 (landed)
- Wreckage funeral costs 12 Bestand (Nara’s street). Movement I plot stays free.
- Shrine upkeep costs 8 Bestand and thins Gestell. Guests cannot keep the shrine.
- `damageFor` unchanged. Claims stay disarmed.

## Stage 25 (landed)
- Selling a print nets 20 after a 5 Bestand listing fee. Cult Winke refuse the stall.
- Exhibition copies decay (20s). Cult does not. `damageFor` unchanged. Claims stay disarmed.

## Stage 26 (landed)
- Shrine E restores aura (15 Bestand, +8 aura). Aura below 5 darkens Winke.
- Guests cannot restore. Spend does not change `damageFor`. Claims stay disarmed.

## Stage 27 (landed)
- Shrine Q buys insurance paper (18 Bestand). Guests cannot.
- Death without paper respawns at the Nave start. Paper walks you to the last Care shrine or House hall.
- Paper is consumed. Same HP, same aura wound, same `damageFor`. Not a P2W revive.
- Claims stay disarmed. No mint. No Base.

## Stage 28 (landed)
- Signing the Safety freeze costs 10 Bestand. Poor signatures refuse. Guests cannot sign.
- Freeze still starves the Passing and blocks extract. `damageFor` unchanged. Claims stay disarmed.

## Stage 29 (landed)
- Winning House omen tax-cut arms only after hall tithe (6 Bestand). Unpaid omen is flavor, not a skim.
- Wrong House, guests, and empty wars refuse. `damageFor` unchanged. Claims stay disarmed.

## Stage 30 (landed)
- Death cracks remaining exhibition prints (`damaged`). Cult stays whole.
- Quill Q repairs one print for 7 Bestand. Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 31 (landed)
- Ord’s Cable errand: after the map, keep a node. The Cable plaque becomes quiet. Ord walks there.
- Extracting instead leaves the Cable humming. Guests cannot take the errand. `damageFor` unchanged.

## Stage 32 (landed)
- After the garden burial, talk to Nara twice: sexton mark (cult). Garden POI becomes Sexton mark. Nara walks to the Strait.
- Guests cannot take the mark. `damageFor` unchanged.

## Stage 33 (landed)
- After spotting the cult sheet, talk to Quill then F at the stall: hang it. Stall POI goes dark (unlisted). Quill walks the Wet Grid.
- Selling a print cannot darken the stall. Guests cannot hang. `damageFor` unchanged.

## Stage 34 (landed)
- Mortals Angel who buried the garden F at the hall: Mortals standing +1. Hall plaque becomes standing. Other Houses refused.
- Guests cannot light the lamp. `damageFor` unchanged.

## Stage 35 (landed)
- After the weather is named, F at Desk Three: they clock out. Clerk gone. Empty-desk POI.
- Unnamed weather refuses. Guests cannot send them home. `damageFor` unchanged.

## Stage 36 (landed)
- After Cold take, read the Foundry then F at Vesper: she will walk if you unlight the heat she sold.
- F at the Foundry: plaque/POI go dark, concentrator desk vacant, Vesper walks to the organ. Not a fetch.
- Refuse never bought the heat. Guests cannot unlight. `damageFor` unchanged. Claims stay disarmed.

## Stage 37 (landed)
- After the freeze is signed, F at Annex Runner: they come in. Street route empty. Annex plaque becomes runner-in. Freeze still holds.
- Weather-named clock-out is Desk Three only. Guests cannot send the runner inside. `damageFor` unchanged. Claims stay disarmed.

## Stage 38 (landed)
- After the Foundry is dark, F at the Strait: refuse the water. Plaque/POI become The Strait — refused. Gestell thins. Not a fetch.
- Live furnace refuses. Guests cannot shut the canal. `damageFor` unchanged. Claims stay disarmed.

## Stage 39 (landed)
- After the Strait is refused, F at Ord: he walks to the canal. Schedule change. Not a fetch.
- Guests cannot take him. `damageFor` unchanged.

## Stage 40 (landed)
- After hanging the cult sheet, talk to Quill on the wet street then F at the Wet Grid: unflag. Spoils stop. POI/plaque become cult street. Quill keeps the kerb.
- Flagging refuses after. Hang required. Guests cannot unflag. `damageFor` unchanged. Claims stay disarmed.

## Stage 41 (landed)
- After sexton mark and refused Strait, talk to Nara twice: she buries the canal. POI/plaque The Strait — buried. Cult. She stays as sexton of the organ.
- Live canal refuses. Guests cannot bury water. `damageFor` unchanged. Claims stay disarmed.

## Stage 42 (landed)
- After Desk Three clocks out and the Annex Runner comes in, F at the Safety plaque: unmanned yield. Plaque/POI change. Not a fetch.
- Desks with bodies refuse. Guests cannot name it. `damageFor` unchanged.

## Stage 43 (landed)
- After the Strait is refused, F at the Cable: it goes dark. Plaque/POI The Cable — dark. Quiet was a keep; dark is a grave. Gestell thins.
- Live canal refuses. Guests cannot cut the line. `damageFor` unchanged. Claims stay disarmed.

## Stage 44 (landed)
- After the Cable is dark, a Sky Angel F at the line: House of Sky standing +1. Plaque/POI The Cable — Sky standing. Not a stick.
- Other Houses, live Cable, and guests refuse. `damageFor` unchanged. Claims stay disarmed.

## Stage 45 (landed)
- After the Foundry is dark, an Earth Angel F at the furnace: House of Earth standing +1. Plaque/POI The Foundry — Earth standing.
- Other Houses, live furnace, and guests refuse. `damageFor` unchanged.

## Stage 46 (landed)
- After the Strait is buried, a Divinities Angel F at the canal: House of Divinities standing +1. Plaque/POI The Strait — Divinities standing. A Wink, not a stick.
- Other Houses, live canal, and guests refuse. `damageFor` unchanged. Claims stay disarmed. Fourfold standing is complete.

## Stage 47 (landed)
- After Ione Kade's last word, her place becomes a POI/plaque: Ione Kade — gone. F stands in the hole. Absence is a standing. Not a fetch.
- Guests cannot mark it. `damageFor` unchanged. Claims stay disarmed.

## Stage 48 (landed)
- When Earth, Sky, Mortals, and Divinities all stand, F at the hall gathers the fourfold. Plaque/POI The fourfold holds. Not a stick.
- Partial standing refuses. Guests cannot gather. `damageFor` unchanged.

## Stage 49 (landed)
- After the fourfold holds, F at the Care names the last god as absence. Plaque/POI The last god — not here. A hint, not a stick.
- Partial fourfold refuses. Guests cannot name it. `damageFor` unchanged. Claims stay disarmed.

## Stage 50 (landed)
- After the last god is named as absence, F at Ord: he will not number it. He walks to the Care. Plaque/POI The last god — not numbered.
- Guests cannot take him. `damageFor` unchanged. Claims stay disarmed.

## Stage 51 (landed)
- After the last god is named as absence, talk to Nara twice: she buries it as earth. Care plaque/POI The last god — buried. Cult. She walks to the Care.
- Guests cannot bury a god. `damageFor` unchanged. Claims stay disarmed.

## Stage 52 (landed)
- After the last god is named as absence, talk to Quill: she will not print it. Stall plaque/POI The last god does not list. Role: Will not print it.
- Guests cannot unlist a god. `damageFor` unchanged. Claims stay disarmed.

## Stage 53 (landed)
- After the last god is named as absence, F at the shrine names holding-back. Plaque/POI Holding-back. Not a spend. Keep still costs.
- Guests cannot name it. `damageFor` unchanged. Claims stay disarmed.

## Stage 54 (landed)
- After the last god is named as absence, F at Vesper / the concentrator desk: she will not sell it. Plaque/POI No god for sale. Role: Will not sell it.
- Guests cannot unlist a god from yield. `damageFor` unchanged. Claims stay disarmed. Twenty-fourth authored hour.

## Stage 55 (landed)
- Q at the claims desk banks unbanked Bestand into a vault. Spoils cannot take banked. Plaque/POI DESK — vault. TAKE stays disarmed. Not a yield.
- Guests cannot bank. `damageFor` unchanged. Claims stay disarmed. HUD shows banked.

## Stage 56 (landed)
- Vault covers sinks when the pocket is short: shrine, restore, insurance, funeral, freeze, tithe, repair, stall buy. Banked is a sink, not a stick.
- Guests cannot spend a vault. `damageFor` unchanged. Claims stay disarmed.

## Stage 57 (landed)
- Passing Appearance slows aura decay toward seed (not to zero). Guests stay aura 0. HUD: aura holds.
- Absence/hijack do not grant the slow. `damageFor` unchanged. Claims stay disarmed.

## Stage 58 (landed)
- Passing Absence plants a going-under Wink. Clearing plaque/POI The Clearing — absence. Nara Vale stays at the hole. Not a fetch.
- Appearance does not move her. Guests cannot keep the hole. `damageFor` unchanged. Claims stay disarmed.

## Stage 59 (landed)
- Passing Hijack claims the Clearing. Safety freeze: Ord walks, plaque The Clearing — Safety. Cold: Vesper walks, plaque The Clearing — Cold. Serial history mark. Guests cannot see it.
- `damageFor` unchanged. Claims stay disarmed.

## Stage 60 (landed)
- Passing Appearance pays a cult-upkeep stipend. Clearing plaque/POI The Clearing — world. F at the shrine spends stipend, not Bestand.
- Absence/hijack pay none. Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 61 (landed)
- Failed Passing writes the hole. Plaque/POI The Clearing — failed. Gestell drinks. No stipend. Ruin-sight mark planted.
- Guests cannot fail a hole they cannot keep. `damageFor` unchanged. Claims stay disarmed.

## Stage 62 (landed)
- After a failed Passing, F at the hole takes Storm. Wreckage vision (history + failed seasons). Readiness burns. Plaque/POI The Clearing — storm. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 63 (landed)
- After holding-back is named, F at the shrine takes Restraint. Yield thins (30). Keep pays an extra Wink. Plaque/POI Restraint. Storm burns the stance.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 64 (landed)
- Witness kit: F at a grave traces the last eight wreckages. POI Blitz trace. Not a stick.
- Other kits and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 65 (landed)
- Cybernetic kit: F at a live CRT node reads the process. Extract drinks Gestell. Keep thins it. Plaque/POI The process — read. Not a stick.
- Other kits and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 66 (landed)
- Iridescent kit: F at a live stall glamours it. Aura as surface. Copies travel. Cult does not hang on the shine. Plaque/POI The stall — surface. Not a stick.
- A dark shrine refuses. Hang still unlists. Other kits and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 67 (landed)
- Dweller kit: F at a kept tile plants a Clearing seed. Plaque/POI The keep — seed. Not a stick.
- Live tiles, other kits, and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 68 (landed)
- Nara Vale leaves if extract feeds Gestell past 71 without a funeral. Plaque/POI Nara Vale — gone. Schedule change. Not a fetch.
- A paid funeral keeps her. Guests cannot walk her off. `damageFor` unchanged. Claims stay disarmed.

## Stage 69 (landed)
- Ord leaves if extract maxes Gestell at 100 without a freeze. Plaque/POI Ord — gone. Schedule change. Not a fetch.
- A freeze keeps him. Guests cannot walk him off. `damageFor` unchanged. Claims stay disarmed.

## Stage 70 (landed)
- Quill leaves if you sell a copy without hanging the prayer. Plaque/POI Quill — gone. Schedule change. Not a fetch.
- Hang keeps her. Guests cannot walk her off. `damageFor` unchanged. Claims stay disarmed.

## Stage 71 (landed)
- Appearance needs the party willing. If Nara, Ord, or Quill walked, Passing is absence. Plaque/POI The Clearing — empty party. Not a stick.
- Freeze still hijacks. Guests cannot force the hour. `damageFor` unchanged. Claims stay disarmed.

## Stage 72 (landed)
- Vesper Hale leaves if you keep a Clearing with Cold heat still live. Plaque/POI Vesper Hale — gone. Unlight keeps her. Not a fetch.
- Refuse never bought the heat. Guests cannot walk her off. `damageFor` unchanged. Claims stay disarmed.

## Stage 73 (landed)
- After Appearance, F at the Clearing runs credits. Plaque/POI Credits. Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective. Then the MMO.
- Guests cannot take the names. `damageFor` unchanged. Claims stay disarmed.

## Stage 74 (landed)
- After credits, F at the Wet Grid names the residual season. Plaque/POI The season — residual. Flagged by default. Gestell 91+ also flags the street. Cult refuses. Not a stick.
- Guests cannot open a season. `damageFor` unchanged. Claims stay disarmed.

## Stage 75 (landed)
- Party reacts to a Wink they cannot see. Talk after Nara, Quill, and Ord: "You're looking at something I'm not." Plaque/POI The party cannot see. Not a fetch.
- Guests cannot share a Wink. `damageFor` unchanged. Claims stay disarmed.

## Stage 76 (landed)
- Ruin-angel kit: F at a grave names the storm at your back. Wreckage vision without burning readiness. Plaque/POI The storm at your back. Not a stick.
- Other kits and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 77 (landed)
- Guest arena: F opens a practice dummy. Strike it: no spoils, no wreckage, no Gestell. Plaque/POI Guest arena — practice. Guests can.
- Angels practice the same. `damageFor` unchanged. Claims stay disarmed.

## Stage 78 (landed)
- Public screening: F takes a dispatch. Plaque/POI Dispatch. Observer proximity. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 79 (landed)
- After a dispatch, Angels who went under enter the Participant room. Plaque/POI Participant room. Proximity, not a stick. Observer stays Observer until under.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 80 (landed)
- After credits, Participant Angels enter the Founder room. Plaque/POI Founder room. Clearing watches, Passing rites, credits. Proximity, not a stick.
- Observer/Participant without credits cannot. Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 81 (landed)
- House bounty: after tithe, F at the hall cashes twelve Bestand. Gestell drinks two. Aura thins. One omen, one purse. Plaque/POI House bounty. Not a stick.
- Guests cannot. Wrong House cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 82 (landed)
- Restraint dodge: moving skips a strike and clerk telegraph. Standing still does not. HUD: dodge if moving. Not a stick.
- Guests cannot take Restraint. `damageFor` unchanged. Claims stay disarmed.

## Stage 83 (landed)
- Storm vs high-progress: geared graves crack and skim. Fallen graves do not. Plaque/POI Storm — progress. `damageFor` unchanged.
- Guests cannot Storm. Claims stay disarmed.

## Stage 84 (landed)
- Palindrome serials seed a Wink at the prior hour. Plaque/POI Wink seed. Not a stick. Then bury.
- Other serials bury as before. Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 85 (landed)
- History writeback: Passings, burials, loot, Houses. Ruin-angel F in Founder room reads the log. Plaque/POI History log. Uniqueness as a log, not a stick.
- Other kits and guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 86 (landed)
- Wink-personalized production still: optional F after Participant. Same screening hour, school-specific Wink. Plaque/POI Production still. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 87 (landed)
- Optional equalized seasonal bracket after residual season. Plaque/POI The season — equal. Serials stay visible. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 88 (landed)
- After a funeral, talk to Nara Vale: she stays as a person, not a sexton of a process. Plaque/POI Nara Vale — stays. Optional hour. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 89 (landed)
- After unflag, talk to Quill: she stays as a person, not a listing. Plaque/POI Quill — stays. Optional hour. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 90 (landed)
- After a freeze, talk to Ord: he stays as a person, not a number. Plaque/POI Ord — stays. Optional hour. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed. Nara, Quill, and Ord can all stay as people.

## Stage 91 (landed)
- After unlight, talk to Vesper Hale: she stays as a person, not a concentrator. Plaque/POI Vesper Hale — stays. Optional hour. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed. Nara, Quill, Ord, and Vesper can all stay as people.

## Stage 92 (landed)
- Hit-stop: a connecting strike holds the hit. Dodge does not. Plaque/POI Hit-stop. Guests can feel it. Not a bigger stick.
- `damageFor` unchanged. Claims stay disarmed.

## Stage 93 (landed)
- High aura: after named weather, F at Safety addresses you. Plaque/POI Addressed. Low aura stays dark. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 94 (landed)
- After named weather, F near another Angel asks them to walk the hour. Plaque/POI Party. Not a stick.
- Guests cannot invite. `damageFor` unchanged. Claims stay disarmed.

## Stage 95 (landed)
- F while walking together parts the hour. Plaque/POI Party — parted. Can walk again. Not a stick.
- Guests cannot part anyone. `damageFor` unchanged. Claims stay disarmed.

## Stage 96 (landed)
- Heavy strike (R / shift-click): longer hold, drops clerk telegraph, same damage. Plaque/POI Heavy. Guests can. Not a stick.
- Light click unchanged. `damageFor` unchanged. Claims stay disarmed.

## Stage 97 (landed)
- When Nara, Quill, Ord, and Vesper stay as people, F at Ione's hole: a gathering, not a process. Plaque/POI Ione — people. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 98 (landed)
- F near another flagged Angel: truce. Both unflag. Wet Grid will not reflag for 20s. Plaque/POI Truce. Guests cannot.
- Spoils stay in the pocket. `damageFor` unchanged. Claims stay disarmed.

## Stage 99 (landed)
- F at Quill's stall with a print and another Angel: pass the copy. Listing fee 5. Cult refuses. Dark stall refuses. Plaque/POI The stall — handoff. Guests cannot.
- `damageFor` unchanged. Claims stay disarmed. TAKE stays disarmed.

## Stage 100 (landed)
- After Ione — people and the last god named as absence, F at the Care: a house of people, not a clinic. Plaque/POI The Care — people. Restore and insurance still cost. Guests cannot.
- `damageFor` unchanged. Claims stay disarmed.

## Stage 101 (landed)
- After the Care as people, F at the shrine: a house of people. Plaque/POI The shrine — people. Keep still costs. Restore still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 102 (landed)
- After the shrine as people, F at Safety: a house of people, not a freeze of process. Plaque/POI Safety — people. Freeze still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 103 (landed)
- After Safety as people, F at the claims desk: will not price people. Plaque/POI DESK — people. File still sits. TAKE stays disarmed. No mint.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 104 (landed)
- After DESK as people, F at the House hall: a house of people, not standing-reserve. Plaque/POI The hall — people. Tithe and bounty still cost.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 105 (landed)
- After the hall as people, F at the Clearing: a house of people, not a hole in process. Plaque/POI The Clearing — people. Passing still happens.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 106 (landed)
- After the Clearing as people, F at Wet Grid: a street of people. Plaque/POI Wet Grid — people. Flag still opts in.
- Boot: nave plaques/pois drop missing ids; Worker world inits in the constructor. Local wrangler died on `.id` of undefined during reload.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 107 (landed)
- After Wet Grid as people, F at Quill's stall: a house of people, not a listing process. Plaque/POI The stall — people. Listing still costs. Cult does not list.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 108 (landed)
- After the stall as people, F at the Foundry: a house of people, not a furnace of process. Plaque/POI The Foundry — people. Unlight still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 109 (landed)
- After the Foundry as people, F at the Strait: a house of people, not a canal of process. Plaque/POI The Strait — people. Refuse still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 110 (landed)
- After the Strait as people, F at the Cable: a house of people, not a line of process. Plaque/POI The Cable — people. Quiet still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 111 (landed)
- After Foundry, Strait, and Cable as people, F at the House hall gathers the organs. Plaque/POI The organs — people. Tithe still costs. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 112 (landed)
- After the organs as people, F at Vesper's desk: a house of people, not a concentrator. Plaque/POI Vesper — people. She will not sell a god.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 113 (landed)
- After Vesper as people, F at M3: a house of people, not a tube of process. Plaque/POI M3 — people. Going-under still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 114 (landed)
- After M3 as people, F at the public screening: a house of people, not a dispatch of process. Plaque/POI Dispatch — people. Observer proximity still holds.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 115 (landed)
- After Dispatch as people, F at the Safety Annex: a house of people, not a freeze of process. Plaque/POI Annex — people. Freeze still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 116 (landed)
- After the Annex as people, F at the guest arena: a house of people, not a spoils process. Plaque/POI Arena — people. Practice still has no spoils.
- Guests cannot name it. `damageFor` unchanged. Claims stay disarmed.

## Stage 117 (landed)
- After the arena as people, F at going-under: a house of people, not a lock of process. Plaque/POI Going-under — people. The first hour still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 118 (landed)
- After going-under as people, F at the wreckage garden: a house of people, not a hole of process. Plaque/POI Garden — people. Bury still works.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 119 (landed)
- After the garden as people, F at the unnamed burial plot: a house of people, not a burial of process. Plaque/POI The plot — people. Bury still works.
- Guests cannot name it. `damageFor` unchanged. Claims stay disarmed.

## Stage 120 (landed)
- After the plot as people, F at the weather plaque: a house of people, not a process. Plaque/POI Weather — people. Naming still happens by speaking with the living.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 121 (landed)
- After weather as people, F at the weather plaque gathers the Nave. Plaque/POI The Nave — people. Extract still costs. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 122 (landed)
- After the Nave as people, F at the Clearing ring: credits as people, not a process. Plaque/POI Credits — people. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 123 (landed)
- After Credits as people, F at the production still: a house of people, not a frame of process. Plaque/POI The still — people. Optional Wink still optional.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 124 (landed)
- After the still as people, F at the Wet Grid: residual season as people, not a flag of process. Plaque/POI The season — people. Flag still opts in.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 125 (landed)
- Imagine floor tiles: nave, wall, wet, organ, clearing. CRT node still. Region-aware Nave floor. Higgsfield later.
- Playable client on Cloudflare at `/play/`. `npm run deploy` builds Vite with base `/play/` into `site/play` then wrangler.
- Claims stay disarmed. `damageFor` unchanged.

## Stage 126 (landed)
- After the season as people, F at the Wet Grid: equalized bracket as people. Plaque/POI The bracket — people. Serials stay visible. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 127 (landed)
- After the bracket as people, F at the public screening: the history log as people. Plaque/POI The log — people. Uniqueness still a log.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 128 (landed)
- After the log as people, F at the screening: Founder as people. Plaque/POI Founder — people. Proximity still holds.
- Imagine Care and shrine floor tiles. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 129 (landed)
- After Founder as people, F at the screening gathers Observer, Participant, Founder. Plaque/POI The rooms — people. Proximity still holds. Not a fetch.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 130 (landed)
- After the rooms as people, F at the Clearing ring: the failed hole as people. Plaque/POI Storm — people. Storm still burns readiness.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 131 (landed)
- After Storm as people, F at the House hall: the bounty as people. Plaque/POI The bounty — people. One omen, one purse.
- Imagine burial and arena floor tiles. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 132 (landed)
- After bounty as people, F at the Wet Grid: the flag as people. Plaque/POI **Flag — people**. Flag still opts in. Seconds, not a stick.
- Angel strike vs guest/locked is a protocol reject: no HP, no wreckage, no spoils.
- Fairness: different serials share `damageFor`. Imagine hall and stall floor tiles. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 133 (landed)
- After the flag as people, F near a flagged Angel: the truce as people. Plaque/POI **Truce — people**. Both stay flagged until the truce. Spoils stay.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 134 (landed)
- After the truce as people, F at the stall with a print and another Angel: the handoff as people. Plaque/POI **Handoff — people**. Listing still costs. Cult does not pass.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed. TAKE stays disarmed.

## Stage 135 (landed)
- After the handoff as people, F at the claims desk: the vault as people. Plaque/POI The vault — people. File still sits. TAKE stays disarmed.
- Imagine forge floor tile. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 136 (landed)
- After the vault as people, F at the shrine: the paper as people. Plaque/POI **Insurance — people**. Insurance still costs. Death still walks you. Not a revive.
- Imagine annex floor tile. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 137 (landed)
- After insurance as people, F at a wreckage: the funeral as people. Plaque/POI **Funeral — people**. Twelve Bestand. The body is in the ground.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 138 (landed)
- After the funeral as people, F at the shrine: restore as people. Plaque/POI **Restore — people**. Aura still costs. Not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 139 (landed)
- After restore as people, F at the shrine: keep as people. Plaque/POI Keep — people. Eight Bestand still.
- Imagine M3 tube floor. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 140 (landed)
- After keep as people, F at the House hall: the tithe as people. Plaque/POI **Tithe — people**. Six Bestand still. Omen holds after upkeep.
- Imagine screening floor tile. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 141 (landed)
- After the tithe as people, F at the Safety Annex: the freeze as people. Plaque/POI **Freeze — people**. Ten Bestand still. The Passing still starves.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 142 (landed)
- After the freeze as people, F at the stall: repair as people. Plaque/POI **Repair — people**. Seven Bestand still. Cult does not crack.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 143 (landed)
- After repair as people, F at the forge: listing as people. Plaque/POI Listing — people. The fee still sits.
- Imagine operator desk floor. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 144 (landed)
- After listing as people, F at the stall: the market as people. Plaque/POI **Market — people**. Forty Bestand still. The Clearing stays closed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 145 (landed)
- After the market as people, F at the stall: the hang as people. Plaque/POI **Hang — people**. Cult still hangs. The stall still goes dark.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 146 (landed)
- After the hang as people, F at the shrine: holding-back as people. Plaque/POI **Restraint — people**. Restraint still thins yield. Storm still burns it.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 147 (landed)
- After Restraint as people, F at the shrine: dodge as people. Plaque/POI Dodge — people. Moving still skips. Standing still does not.
- Imagine going-under and garden floors. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 148 (landed)
- After dodge as people, F at the guest arena: heavy as people. Plaque/POI **Heavy — people**. Same number. Telegraph still drops.
- Guests cannot name it. `damageFor` unchanged. Claims stay disarmed.

## Stage 149 (landed)
- After heavy as people, F at the guest arena: hit-stop as people. Plaque/POI **Hit-stop — people**. The hit still holds. You did not strike harder.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 150 (landed)
- After hit-stop as people, F at a wreckage: spectate as people. Plaque/POI **Spectate — people**. Aura still caps. The duel still pays from a person.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 151 (landed)
- Graft: floors tile at native grain (`tileSprite` + `tilePosition`). Location plates at Clearing, Wet Grid, organs, hall, annex, stall, shrine, garden, screening, arena, M3, Care, forge, operator, going-under, claims. Gold frames. No NPC portraits as plates.
- Imagine dedicated plates for M3, Care, forge, operator, under, arena, screening, claims. Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 152 (landed)
- After spectate as people, F at Ione: last-word as people. Plaque/POI **Last word — people**. Ione still speaks. Absence still waits. Ione is not extracted.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 153 (landed)
- Graft isolated Imagine sprites over portraits: guest, Nara, Quill, Ord, Ione, Vesper, clerk. Strike/aura FX. Burial and House-war plates. Floors still tile at native grain.
- Higgsfield later.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 154 (landed)
- After last-word as people, F at a wreckage: the ruin duel as people. Plaque/POI **Duel — people**. The grave is still the ring. The kit still does not strike harder.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 155 (landed)
- After the ruin duel as people, F at a wreckage: camping as people. Plaque/POI **Camp — people**. Gestell still rises. Aura still thins.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 156 (landed)
- After camping as people, F at the Clearing ring: Passing as people. Plaque/POI **Passing — people**. Appearance still opens. Absence still waits.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 157 (landed)
- After Passing as people, F at the claims desk: claims as people. Plaque/POI **Claims — people**. TAKE stays disarmed. The token does not strike.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 158 (landed)
- After claims as people, F at the claims desk: filing as people. Plaque/POI **File — people**. File still sits. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 159 (landed)
- After filing as people, F at the claims desk: TAKE as people. Plaque/POI **TAKE — people**. TAKE stays disarmed. No Base.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 160 (landed)
- After TAKE as people, F at the claims desk: the vault as people. Plaque/POI **Bank — people**. Banked still does not drop. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 161 (landed)
- After the vault as people, F at the Wet Grid: storm-press as people. Plaque/POI **Storm-press — people**. Geared graves still crack. Fallen graves still do not.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 162 (landed)
- After storm-press as people, F at the Wet Grid: fallen graves as people. Plaque/POI **Fallen — people**. Fallen graves still do not crack. Geared graves still crack.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 163 (landed)
- After fallen graves as people, F at the Wet Grid: spoils as people. Plaque/POI **Spoils — people**. Unbanked still drops. Guests are not loot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 164 (landed)
- After spoils as people, F at the Wet Grid: unflag as people. Plaque/POI **Unflag — people**. Unflag still opts out. Cult still hangs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 165 (landed)
- After unflag as people, F at the Wet Grid: seconds as people. Plaque/POI **Seconds — people**. Flagged street still lasts seconds.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 166 (landed)
- After seconds as people, F at the Wet Grid: the flagged street as people. Plaque/POI **Street — people**. Flag still opts in. Guests are not loot. Seconds still last.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 167 (landed)
- After the flagged street as people, F at the guest arena: grief as people. Plaque/POI **Grief — people**. Protocol still rejects. Guests are not loot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 168 (landed)
- After grief as people, F at the guest arena: the kit as people. Plaque/POI **Kit — people**. Same number. Serials do not buy damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 169 (landed)
- After the kit as people, F at the guest arena: practice as people. Plaque/POI **Practice — people**. The dummy still pays nothing. Guests are not loot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 170 (landed)
- After practice as people, F at the guest arena: the dummy as people. Plaque/POI **Dummy — people**. The dummy still pays nothing. Guests are not loot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 171 (landed)
- After the dummy as people, F at the Wet Grid: geared graves as people. Plaque/POI **Geared — people**. Geared graves still crack. Fallen graves still do not.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 172 (landed)
- After geared graves as people, F at the Wet Grid: serials as people. Plaque/POI **Serial — people**. Serials stay visible. Serials do not buy damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 173 (landed)
- After serials as people, F at the Wet Grid: the band as people. Plaque/POI **Band — people**. Same skill, different serials: same number.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 174 (landed)
- After the band as people, F at the Wet Grid: the number as people. Plaque/POI **Number — people**. Same skill, different serials: same number.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 175 (landed)
- After the number as people, F at the Wet Grid: skill as people. Plaque/POI **Skill — people**. Skill still wins. Traits do not buy the fight.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 176 (landed)
- After skill as people, F at the Wet Grid: traits as people. Plaque/POI **Trait — people**. Traits do not buy damage. Serials stay visible.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 177 (landed)
- After traits as people, F at the Wet Grid: the token as people. Plaque/POI **Token — people**. The token never buys combat. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 178 (landed)
- After the token as people, F at the Wet Grid: the published band as people. Plaque/POI **Fair — people**. Same skill, different serials: same number. Serials stay visible.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 179 (landed)
- After the published band as people, F at the Wet Grid: visibility as people. Plaque/POI **Visible — people**. Serials stay visible. Serials do not buy damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 180 (landed)
- After visibility as people, F at the Wet Grid: aura as people. Plaque/POI **Aura — people**. Aura still withers. Aura is not damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 181 (landed)
- After aura as people, F at the Wet Grid: presence as people. Plaque/POI **Presence — people**. Presence still addresses. Presence is not damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 182 (landed)
- After presence as people, F at the Wet Grid: Winke as people. Plaque/POI **Wink — people**. Winke never withdraw. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 183 (landed)
- After Winke as people, F at the Wet Grid: Bestand as people. Plaque/POI **Bestand — people**. Bestand still spends. The token never buys combat. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 184 (landed)
- After Bestand as people, F at the Wet Grid: cult as people. Plaque/POI **Cult — people**. Cult still does not drop. Cult does not list.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 185 (landed)
- After cult as people, F at the Wet Grid: copies as people. Plaque/POI **Copy — people**. Copies still decay. Listing still costs. Cult does not list.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 186 (landed)
- After copies as people, F at the Wet Grid: banked as people. Plaque/POI **Banked — people**. Banked still does not drop. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 187 (landed)
- After banked as people, F at the Wet Grid: unbanked as people. Plaque/POI **Unbanked — people**. Unbanked still drops. Guests are not loot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 188 (landed)
- After unbanked as people, F at the Wet Grid: the sink as people. Plaque/POI **Sink — people**. Every earner still spends. Banked is a sink, not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 189 (landed)
- After the sink as people, F at the Wet Grid: yield as people. Plaque/POI **Yield — people**. Yield still drinks Gestell. Keep still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 190 (landed)
- After yield as people, F at the Wet Grid: tax as people. Plaque/POI **Tax — people**. Hall tax still skims. The number does not strike.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 191 (landed)
- After tax as people, F at the Wet Grid: Gestell as people. Plaque/POI **Gestell — people**. Gestell still rises. Yield still drinks Gestell.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 192 (landed)
- After Gestell as people, F at the Wet Grid: climate as people. Plaque/POI **Climate — people**. Climate still ticks. Yield still drinks Gestell.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 193 (landed)
- After climate as people, F at the Wet Grid: extract as people. Plaque/POI **Extract — people**. Extract still pays. Keep still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 194 (landed)
- After extract as people, F at the Wet Grid: max climate as people. Plaque/POI **Max — people**. Gestell 91 still flags the street. Flag still opts in.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 195 (landed)
- After max climate as people, F at the Wet Grid: heat as people. Plaque/POI **Heat — people**. Gestell 91 still flags the street. Flag still opts in.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 196 (landed)
- After heat as people, F at the Wet Grid: fat yield as people. Plaque/POI **Fat — people**. Fat yield still drinks. Sacred doors still dim.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 197 (landed)
- After fat yield as people, F at the Wet Grid: poor yield as people. Plaque/POI **Poor — people**. Low climate still keeps Clearings. Yield still poor.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 198 (landed)
- After poor yield as people, F at the Wet Grid: the block as people. Plaque/POI **Block — people**. Gestell 100 still blocks a Passing without a Clearing. Solo cannot force Appearance.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 199 (landed)
- After the block as people, F at the Wet Grid: solo as people. Plaque/POI **Solo — people**. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 200 (landed)
- After solo as people, F at the Wet Grid: dwelling as people. Plaque/POI **Dwell — people**. Two dwellers still open Appearance. Solo cannot force it.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 201 (landed)
- After dwelling as people, F at the Wet Grid: the trace as people. Plaque/POI **Trace — people**. Appearance is a trace, not a model. Aura still holds.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 202 (landed)
- After the trace as people, F at the Wet Grid: failure as people. Plaque/POI **Fail — people**. A failed Passing still writes the hole. No stipend.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 203 (landed)
- After failure as people, F at the Wet Grid: the hole as people. Plaque/POI **Hole — people**. A failed Passing still writes the hole. No stipend.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 204 (landed)
- After the hole as people, F at the Wet Grid: the stipend as people. Plaque/POI **Stipend — people**. Appearance still pays cult upkeep. Absence pays none.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 205 (landed)
- After the stipend as people, F at the Wet Grid: hijack as people. Plaque/POI **Hijack — people**. Freeze or Cold still hijacks the Clearing.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 206 (landed)
- After hijack as people, F at the Wet Grid: absence as people. Plaque/POI **Absence — people**. Absence still waits. Nara still stays at the hole.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 207 (landed)
- After absence as people, F at the Wet Grid: waiting as people. Plaque/POI **Wait — people**. Absence still waits. Nara still stays at the hole.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 208 (landed)
- After waiting as people, F at the Wet Grid: staying as people. Plaque/POI **Stay — people**. Nara still stays at the hole. Absence still waits.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 209 (landed)
- After staying as people, F at the Wet Grid: willingness as people. Plaque/POI **Willing — people**. Appearance still needs the party willing.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 210 (landed)
- After willingness as people, F at the Wet Grid: the empty party as people. Plaque/POI **Empty — people**. If Nara, Ord, or Quill walked, Passing is absence.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 211 (landed)
- After the empty party as people, F at the Wet Grid: walking as people. Plaque/POI **Walked — people**. If Nara, Ord, or Quill walked, Passing is absence.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 212 (landed)
- After walking as people, F at the Wet Grid: leaving as people. Plaque/POI **Leave — people**. Nara still leaves if extract feeds Gestell past 71 without a funeral.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 213 (landed)
- After leaving as people, F at the Wet Grid: keeping as people. Plaque/POI **Kept — people**. A paid funeral still keeps Nara.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 214 (landed)
- After keeping as people, F at the Wet Grid: holding as people. Plaque/POI **Hold — people**. A freeze still keeps Ord.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 215 (landed)
- After holding as people, F at the Wet Grid: capping as people. Plaque/POI **Capped — people**. Ord still leaves if extract maxes Gestell at 100 without a freeze.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 216 (landed)
- After capping as people, F at the Wet Grid: the prayer as people. Plaque/POI **Prayer — people**. Hang still keeps Quill.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 217 (landed)
- After the prayer as people, F at the Wet Grid: selling as people. Plaque/POI **Sold — people**. Quill still leaves if you sell a copy without hanging the prayer.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 218 (landed)
- After selling as people, F at the Wet Grid: unlighting as people. Plaque/POI **Unlit — people**. Unlight still keeps Vesper.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 219 (landed)
- After unlighting as people, F at the Wet Grid: live heat as people. Plaque/POI **Live — people**. Vesper still leaves if you keep a Clearing with Cold heat still live.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 220 (landed)
- After live heat as people, F at the Wet Grid: the unseen Wink as people. Plaque/POI **Blind — people**. The party still cannot see it.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 221 (landed)
- After the unseen Wink as people, F at the Wet Grid: the hour as people. Plaque/POI **Hour — people**. Appearance still opens. Credits still run after. Then the MMO.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 222 (landed)
- After the hour as people, F at the Wet Grid: the names as people. Plaque/POI **Names — people**. Credits still name Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective. Guests cannot take the names.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 223 (landed)
- After the names as people, F at the Wet Grid: the residual season as people. Plaque/POI **Residual — people**. It still flags by default. Gestell 91+ still flags the street. Cult still refuses.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 224 (landed)
- After the residual season as people, F at the Wet Grid: the equalized bracket as people. Plaque/POI **Equal — people**. Serials stay visible. Serials do not buy damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 225 (landed)
- After the equalized bracket as people, F at the Wet Grid: addressing as people. Plaque/POI **Addressed — people**. High aura still addresses you after named weather. Low aura stays dark.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 226 (landed)
- After addressing as people, F at the Wet Grid: the storm at your back as people. Plaque/POI **Back — people**. Ruin-angel still names it without burning readiness.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 227 (landed)
- After the storm at your back as people, F at the Wet Grid: the palindrome seed as people. Plaque/POI **Seed — people**. Palindrome serials still seed a Wink at the prior hour. Then bury.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 228 (landed)
- After the palindrome seed as people, F at the Wet Grid: the invite as people. Plaque/POI **Invite — people**. After named weather, F near another Angel still asks them to walk the hour.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 229 (landed)
- After the invite as people, F at the Wet Grid: parting as people. Plaque/POI **Parted — people**. F while walking together still parts the hour. You can walk again.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 230 (landed)
- After parting as people, F at the Wet Grid: walking together as people. Plaque/POI **Together — people**. After named weather the invite still holds. After parting you can walk again.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 231 (landed)
- After walking together as people, F at the Wet Grid: the gathering as people. Plaque/POI **Gather — people**. When Nara, Quill, Ord, and Vesper stay as people, Ione's hole is still a gathering.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 232 (landed)
- After the gathering as people, F at the Wet Grid: the Care as people, not a clinic. Plaque/POI **Clinic — people**. Restore still costs. Insurance still costs.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 233 (landed)
- After the Care as people, F at the Wet Grid: insurance paper as people. Plaque/POI **Paper — people**. Paper still costs. Death still walks you. Not a revive.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 234 (landed)
- After insurance paper as people, F at the Wet Grid: the production still as people. Plaque/POI **Frame — people**. Optional F after Participant still takes a school-specific Wink.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 235 (landed)
- After the production still as people, F at the Wet Grid: Observer proximity as people. Plaque/POI **Observer — people**. Public screening still takes a dispatch. Proximity, not a stick.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 236 (landed)
- After Observer proximity as people, F at the Wet Grid: the Participant room as people. Plaque/POI **Participant — people**. After a dispatch, Angels who went under still enter. Observer stays Observer until under.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 237 (landed)
- After the Participant room as people, F at the Wet Grid: Founder proximity as people. Plaque/POI **Proximity — people**. After credits, Participant Angels still enter the Founder room. Observer without credits cannot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 238 (landed)
- Graft missing Imagine stills onto the Nave: burial plot plate (no longer wreckage), Ione last-word hole, Vesper foundry desk, claims floor tile, isolated wreckage marker, HUD icon row.
- Floors still tile at native grain. Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 239 (landed)
- After Founder proximity as people, F at the Wet Grid: entering as people. Plaque/POI **Enter — people**. After credits, Participant Angels still enter the Founder room. Observer without credits cannot.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 240 (landed)
- After entering as people, F at the Wet Grid: the refusal as people. Plaque/POI **Refuse — people**. Observer without credits still cannot enter.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 241 (landed)
- After the refusal as people, F at the Wet Grid: the Collective as people. Plaque/POI **Collective — people**. Credits still name Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 242 (landed)
- After the Collective as people, F at the Wet Grid: Reverie Studios as people. Plaque/POI **Studios — people**. Credits still name Reverie Studios.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 243 (landed)
- After Studios as people, F at the Wet Grid: the film as people. Plaque/POI **Film — people**. Credits still name The Last God.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 244 (landed)
- After the film as people, F at the Wet Grid: the director as people. Plaque/POI **Director — people**. Credits still name Lucah Rosenberg-Lee.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 245 (landed)
- After the director as people, F at the Wet Grid: the mint as people. Plaque/POI **Disarmed — people**. The mint stays disarmed. TAKE stays disarmed. No Base.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 246 (landed)
- After the mint as people, F at the Wet Grid: the guest lock as people. Plaque/POI **Guest — people**. A guest cannot prepare the ground.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 247 (landed)
- After the guest lock as people, F at the Wet Grid: supply as people. Plaque/POI **Supply — people**. Supply is 7,777. The mint stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 248 (landed)
- After supply as people, F at the Wet Grid: combat as people. Plaque/POI **Combat — people**. Damage stays equal. The token does not strike.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 249 (landed)
- After combat as people, F at the Wet Grid: the earn license as people. Plaque/POI **Earn — people**. Only a linked Angel can file. Guests cannot claim. TAKE stays disarmed.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 250 (landed)
- After the earn license as people, F at the Wet Grid: the Angel as people. Plaque/POI **Angel — people**. One of 7,777. Guests cannot claim.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 251 (landed)
- After the Angel as people, F at the Wet Grid: the messenger as people. Plaque/POI **Messenger — people**. Angels hint. Perception, not combat.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 252 (landed)
- After the messenger as people, F at the Wet Grid: the mock link as people. Plaque/POI **Link — people**. Serial still seeds aura. Guests stay aura 0.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 253 (landed)
- After the mock link as people, F at the Wet Grid: perception as people. Plaque/POI **Perception — people**. Traits change verbs and style, not damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 254 (landed)
- After perception as people, F at the Wet Grid: the verb as people. Plaque/POI **Verb — people**. Traits change verbs, not damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 255 (landed)
- After the verb as people, F at the Wet Grid: style as people. Plaque/POI **Style — people**. Traits change style, not damage.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 256 (landed)
- After style as people, F at the Wet Grid: the Wink school as people. Plaque/POI **School — people**. Optional F after Participant still takes a school-specific Wink.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 257 (landed)
- After the Wink school as people, F at the Wet Grid: the optional still as people. Plaque/POI **Optional — people**. Optional F after Participant still takes a school-specific Wink.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 258 (landed)
- After the optional still as people, F at the Wet Grid: the personal Wink as people. Plaque/POI **Personal — people**. Same quest, different spoken Wink.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 259 (landed)
- After the personal Wink as people, F at the Wet Grid: the variant as people. Plaque/POI **Variant — people**. Same quest, one optional objective.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 260 (landed)
- After the variant as people, F at the Wet Grid: the objective as people. Plaque/POI **Objective — people**. Same quest, one optional objective.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 261 (landed)
- After the objective as people, F at the Wet Grid: the quest as people. Plaque/POI **Quest — people**. Same quest id.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 262 (landed)
- After the quest as people, F at the Wet Grid: the spoken Wink as people. Plaque/POI **Spoken — people**. Same quest, different spoken Wink.
- Guests cannot. `damageFor` unchanged. Claims stay disarmed.

## Stage 263 (landed)
- Verified local HEAD against GitHub main (`7868e3b`) and reproduced the deployed `/play/assets/index-C4wFgcDV.js` byte-for-byte from that commit. Cloudflare deployment at audit: `99fc25bd-625d-4947-84e5-8405ae629edf`. Existing host is a Worker, not Pages; there is no `reverie-the-game` Pages project.
- Corrected alarm calls to Durable Object storage; added server type-checking to build/deploy.
- Server-owned browser sessions, saved world and character state, recovery of hibernating sockets, single-tab ownership, automatic reconnect and stale-input expiry. Actions checkpoint before broadcast; passive simulation checkpoints every simulation second. Cookie loss creates a fresh guest; this is not wallet authentication.
- Claims, mint and Base remain disarmed. Legacy in-memory progress cannot be retroactively recovered on this first persistence deployment.
- Gates: recovery and transport unit tests, actual local WebSocket movement/reconnect/ownership smoke test. Deployment builds expose `/play/release.json` with their source revision.

## Stage 264 (landed)
- Opening field notes show the next meaningful beat, direction and distance, with a world marker following the server's live NPC positions. Covers Movement I through the Care and House hall. Collapsible paper/ink/acid panel; no client-side progression awards.
- Fixed shared burial/garden completion softlocks: each character can mourn once even after the world grave is already buried. Repeating the rite grants no extra readiness. Guests still cannot take the garden rite.
- Fixed duplicate game startup when clicking the title and then pressing a key.
- Gates: opening progression guidance, moved NPC targeting, two-player burial and repeat-reward tests; existing campaign/fairness tests pass.

## Stage 265 (landed)
- Fixed the art loader: placeholder textures and duplicate portrait keys prevented the authored sprite/floor images from loading. Each key is now registered exactly once; all 56 referenced images exist.
- Owner authorized additional built-in generated art. Added a dark Nave floor variation at `public/assets/tiles/nave-v2.png`, preserving its Imagine source. Prompt/provenance in `brand/nave-floor-v2.md`.
- The browser automation surface was unavailable during this session. Image inspected directly, loader verified against Phaser source, build/assets checked. Full in-browser visual and performance acceptance remains outstanding; do not claim the five-hour/60fps master gate is satisfied.

## Stage 266 (landed)
- Closed Clearings no longer pay Bestand, wound aura, change climate or score House war. An open Clearing draws from a finite shared 40-Bestand reserve; keeping it does not refill that reserve. Subsequent contests still close the ground but explain that the reserve is spent. The existing aura wound and climate/content cost remain.
- The reserve persists with world state. Worlds saved before this stage receive the initial reserve through the existing default-state merge. No replenishment mechanism is implemented; a future seasonal reserve must have an explicit funding source.
- Refusing Vesper now has a complete entry route into Movement III: read the hall, refuse, mourn the wreckage garden, then use the Third Movement door. No private yield, currency cost or extra Gestell. Cold entry remains available. Field notes guide both choices.
- Tests cover 100 duplicate extraction intents, repeated keep/extract cycles across two players, guest exclusion, persisted exhausted reserve, Appearance stipend replay after shrine spending, and the refusal route. Updated the old House-war test that had incorrectly rewarded extracting already-closed ground.
- Browser acceptance was partial: live HUD connected, exactly one canvas after boot and keyboard input, field notes visible. The browser reported a WebGL context loss followed by restoration. Both screenshot APIs failed, so sprite/floor legibility and laptop layout remain unverified. Protocol smoke tests remain the movement/reconnect gate.

## Stage 267 (landed)
- Movement III entry now checks the character's own hall and Cold choice, or hall/refusal/garden rite. A door opened by another Angel no longer grants entry, teleportation, readiness, or the legacy door interaction to unqualified arrivals. Saved Movement III completion remains valid.
- Door guidance describes both routes instead of claiming that funding is the only route. Existing guest and locked-character exclusion remains.
- Passing participation history records the campaign rite once, including a failed first attempt. Repeated absence/hijack interactions and changed outcomes no longer inflate the participation count. This is a single campaign record; future seasons need explicit event identities. Existing inflated history is not rewritten.
- Gates: 320 tests passed across the full suite and corrected new regression fixtures; client/server type-checks and production build. Tests cover advanced shared doors, incomplete refusal, both qualified routes, saved completion, repeat readiness, and 100 repeats of each non-Appearance outcome.
- Screenshot capture retried against the connected live game and still failed. Visual/performance acceptance remains open.

## Stage 268 (landed)
- Opening Nara, Ord and Quill are presented at their introductory locations for each new arrival. The server uses the same personal list for distance checks and sends separate opening/veteran snapshots; shared departures remain intact for veterans. Initial dialogue no longer diverts into global late-story branches.
- The first Safety reading always contributes to the character's weather account. Opening burial and going-under take priority over legacy plaques. First going-under rewards are idempotent; subsequent use does not mint Winke or readiness.
- Regression coverage includes guests and Angels completing the opening in a world with departed party, named weather, an open Movement III, and active legacy flags; different snapshots for two simultaneous sessions; range checks and repeated rites.

## Stage 269 (landed)
- Owner explicitly authorized a broad artistic/gameplay redesign on 2026-09-24 and reiterated autonomous continuation. Read `DESIGN.md` alongside the original master prompt. The prototype has not met the five-hour campaign or near-AAA gate; prioritize a measured, compelling first chapter over more plaques.
- Deliberate Shift + movement dodge: server chooses distance, duration, normalized direction, cooldown and collision. Guests can use it; locked players cannot. Restraint extends the brief window by 60ms. Ordinary movement no longer grants indefinite immunity. Attacks cannot fire during the dodge.
- Collision substeps prevent a fast step crossing walls. Enemy danger rings now show the actual strike radius and brighten toward impact; clerk labels show remaining health. Dodge cooldown appears in the HUD. Linked bodies update from guest to Angel art.
- Removed framed illustration tiles from the walking surface, reduced floor materials to four, and aligned drawn walls with collision geometry. Nearby signs appear only in proximity. Preserved Imagine stills as location portraits in field notes. Existing art files remain available.
- Boot now preloads 18 used textures instead of 56 and reports art-loading progress. No new image generation was needed for this pass.
- Validation: 330 tests across the full suite and updated campaign, dodge and transport regressions. Tests cover timed evasion, ordinary movement vulnerability, cooldown spam, malformed directions, diagonal normalization, wall tunneling, attack lockout and guest fairness.
- Browser capture briefly worked for the title and old loading screen, then the preview service became unavailable. The redesigned world still needs rendered visual/performance acceptance; simulation and build checks do not establish that gate.

## Stage 270 (do this next)
- Complete rendered visual/performance acceptance when screenshot capture works; inspect restored WebGL behavior and laptop HUD overlap. Do not claim the full visual gate from DOM checks alone.
- Follow `DESIGN.md`. Make clerk encounters replayable for new arrivals, teach dodge/heavy through play, and guide a meaningful first extract/keep choice before the guest threshold. Shared clerks and nodes are currently one-shot resources; this is the next campaign blocker. Audit organ interactions for personal Movement III requirements and later party availability.
- Audit other earners and define event identity before adding seasonal Passing rewards. Preserve named interactions but prioritize playable consequences and bounded resources over additional plaques.
- Continue toward PROMPT.md. No mint, Base or real-value settlement.

## Rules
- Branch: `main` until told otherwise. Commit, push, deploy Pages (`site/`) as you go.
- Do not arm Base, treasury, or `$REVERIE`.
- Reuse Imagine art; additional built-in image generation was authorized by the owner on 2026-09-24. Keep the master visual synthesis and reference existing assets. No Higgsfield until owner confirms credits.
- Co-Authored-By: Grok <noreply@x.ai>. No other model names in the repo.
- Never write WALL STREET / Meltdown / METROPHAGE / Mafia / Solana Seas repos.
