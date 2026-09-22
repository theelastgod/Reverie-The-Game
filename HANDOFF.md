# HANDOFF — Reverie: The Game

Execute `PROMPT.md`. Do not wait for a new user prompt.

**Next stage: 126** — Campaign / PvP / economy polish. 24 authored hours are in. No mint.

## Live
- GitHub: https://github.com/theelastgod/Reverie-The-Game
- Brief site: https://reverie-the-game.wendellphillips.workers.dev
- Play: https://reverie-the-game.wendellphillips.workers.dev/play/
- Prompt: https://reverie-the-game.wendellphillips.workers.dev/prompt.html
- Local client: `npm run dev` → http://127.0.0.1:5175
- Deploy: `npm run deploy` (Vite `/play` + Worker `reverie-the-game`)
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

## Stage 125 (do this next)
Campaign / PvP / economy polish. Fetch-only forbidden. No mint. No Base. 24 named hours are in; more hours still allowed.

## Rules
- Branch: `main` until told otherwise. Commit, push, deploy Pages (`site/`) as you go.
- Do not arm Base, treasury, or `$REVERIE`.
- Imagine for art (`image_edit` from `brand/reference/`). No Higgsfield until owner confirms credits.
- Co-Authored-By: Grok <noreply@x.ai>. No other model names in the repo.
- Never write WALL STREET / Meltdown / METROPHAGE / Mafia / Solana Seas repos.
