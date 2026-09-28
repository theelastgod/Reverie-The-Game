# Client contract (src/, index.html)

The client is Phaser 3.90 + Vite 8 + TypeScript, DOM HUD over the canvas. It
renders `Snap` (see `src/sim/protocol.ts`) and sends `ClientMsg`. It never
computes a number that matters; it may use `src/sim/map.ts` for the level and
`src/sim/constants.ts` for cosmetic timing.

## Files and owners
- **scenes/render/net** (owner D1): `src/main.ts`, `src/scenes/BootScene.ts`,
  `src/scenes/CityScene.ts`, `src/render/floors.ts`, `src/render/entities.ts`,
  `src/render/fx.ts`, `src/net/worldSocket.ts`, `src/net/worldSocket.test.ts`,
`src/audio/cues.ts` (pure: the bed by district, the music machine with its combat
hysteresis, effects from snapshot diffs), `src/audio/settings.ts` (volume and mute
under localStorage `reverie.audio`), `src/audio/bus.ts` (WebAudio: one bed that
cross-fades, one track that ducks it, one-shot effects; absent files are silence,
fetched once), `src/assets/url.ts` (`genUrl` for `assets/gen/<target>`),
`src/net/wallet.ts` (EIP-6963 discovery, the challenge/sign/link handshake over
`/wallet/challenge` and `/wallet/link`, the outcome line), `src/net/wallet.test.ts`.
- **HUD** (owner D2): `index.html`, `src/ui/hud.css`, `src/ui/hud.ts`,
  `src/ui/dialogue.ts`, `src/ui/journal.ts`, `src/ui/minimap.ts`, `src/ui/lock.ts`,
  `src/ui/title.ts`, `src/ui/hud.test.ts` (pure formatting helpers only).

## The seam between D1 and D2

`src/ui/hud.ts` exports:
```ts
export type HudCallbacks = {
  choose: (choiceId: string) => void;     // dialogue choice clicked
  close: () => void;                      // dialogue closed / Esc
  link: (serial: number) => void;         // mock Angel link from the lock panel or the title
  interact: (targetId: string, choice: string) => void; // prompt verb clicked (touch/mouse)
  stance: () => void; kit: () => void; flag: () => void; truce: () => void; use: () => void;
};
export class Hud {
  constructor(root: HTMLElement, callbacks: HudCallbacks);
  setStatus(status: "connecting" | "online" | "reconnecting" | "elsewhere" | "closed"): void;
  setLoading(text: string, progress?: number): void;   // boot progress
  update(snap: Snap): void;                            // every snapshot; cheap diffing inside
  flash(text: string, tone?: "ink" | "gold" | "hot" | "acid" | "sky"): void; // transient notice
  toggleJournal(): void; toggleMinimap(): void;
  destroy(): void;
}
```
`index.html` contains a `<div id="hud" hidden>` root and a `<div id="title">`
boot overlay; the title overlay exposes `window.__reverieStart?.()`-free API:
`src/ui/title.ts` exports `mountTitle(onEnter: () => void): void` and D1's
`main.ts` calls it, then creates the Phaser game and the `Hud`.

HUD element ids (D2 creates them; D1 never touches DOM except through `Hud`):
`hud`, `title`, `hud-top` (chips: identity, district, weather, ledger),
`hud-bars` (hp, aura, restraint, readiness), `hud-stance`, `hud-kit`,
`hud-dodge`, `hud-prompt` (nearest interaction with key caps),
`hud-heard` (spoken line), `hud-wink` (private line, void/gold),
`hud-notices`, `hud-marquee` (news ticker), `hud-dialogue` (portrait, speaker,
text, wink, choices), `hud-journal` (field notes: plate, movement, title,
detail, bearing, quests list), `hud-minimap` (canvas), `hud-lock` (guest lock
panel: mark, "A GUEST CANNOT PREPARE THE GROUND", link test Angel button and a
serial input 1–7777), `hud-connection`, `hud-credits` (shown when `you.flags.credits`
turns 1; names only the game).

## Rendering rules (D1)
- District floors: one `TileSprite` per district rect and one per floor patch
  (patches drawn above the district floor), textures from `FLOOR_FILES`. Walls:
  one `Graphics` per district drawing every wall tile as a dark block with a
  champagne seam on the lit edge, plus the outer wall band. Gates that the
  viewer cannot pass (`gateOpenFor(you, gate)` false) draw a lavender field
  with the requirement word (UNDER / ANGEL / III).
- Props: CRT altars (`tiles/crt.jpg`, ADD blend, at `crt-altar-*` POIs and
  nodes), oval light pools in the Kerb and Ring, bell posts, lamp glows at halls.
- Entities from the snapshot only: players (`guest`/`angel` texture, 56×72,
  aura ring `fx-aura` under Angels sized by auraTier, wine tint at low hp, 40%
  alpha while dodging, storm stance draws a thin hot ring, heavy windup scales
  the body 1.1×, hit-stop freezes the sprite for its duration), enemies
  (`clerk` texture tinted by `tint`; telegraph draws a red ring growing to the
  reach; recover draws a sky ring; a name + hp label), NPCs (their sprite +
  name label; party members get a small gold dot), nodes (a CRT altar plus a
  light: kept = sky glow, empty = dark, announced = gold pulse), wreckage
  (`fx-wreckage`; buried → a small grave slab), graves, history marks
  (`serial-wreckage.jpg` 48², ADD), failed passings (`failed-passing.jpg`
  56×32), POI markers (a thin gold ring at interactable POIs when a verb is
  available; label in proximity only), clearing ring state (gold when open,
  wine when failed), hot street tint, frozen districts (lavender scanline overlay).
- Camera: follows `you` with lerp 0.12, zoom 1.15 at ≥1280 wide else 1.0,
  bounds = world. Depth: floors 0, patches 1, walls 2, props 3, ground marks 4,
  bodies by y (10 + y/1000), labels 20, fx 30.
- Input: WASD/arrows intent at every update (only when `document.hasFocus()`
  and no dialogue is open — dialogue open still sends idle intent);
  Shift+direction → dodge; click / Space → strike; R / Shift+click → heavy;
  Tab → stance (prevent default; Shift+Tab is the browser's and moves focus
  into the HUD's controls, where Tab, Space and Enter are the browser's too
  and Escape blurs back to the game: `src/ui/keys.ts`); K → kit; F → prompt verb F (talk when the
  prompt target is an NPC); E / Q → prompt verbs E / Q; 1–4 → choose;
  Esc → close; V → flag; T → truce; I → use; J → journal; M → minimap.
- 60 fps target: no per-tile GameObjects; reuse sprites by id; cull labels.

## Network (D1)
`WorldSocket`: `POST /session` then `ws(s)://host/ws`; `hello` sets `id`,
`you`; `snap` replaces `snap`; reconnect with backoff (1 s → 10 s); code 4001 =
"elsewhere" (another tab); `sendIntent` throttled to 250 ms unless changed;
typed senders for every `ClientMsg`. Status exposed for the HUD.

## Assistive technology (the HUD's markup)
The HUD is DOM, so it can say what it is. The title, the dialogue, the lock
and the credits are `role="dialog"`, the dialogue named by its speaker
(`aria-labelledby`) and described by its line (`aria-describedby`), the lock by
its heading. What changes on its own is a live region: the connection chip
(`role="status"`), the events strip, the notices, the heard line, the
dialogue's text, the lock's note. The four bars are `role="meter"` with a
name and a range, and `Hud.setBar` keeps `aria-valuenow` and
`aria-valuemax` on the row equal to the number shown. The map canvas's label
is the map in a sentence (`mapLabel` in `format.ts`, set by the minimap on
every snapshot): your district, the objective with its bearing in words and
its district when not yours, and what is under a freeze. The ledger is
labelled; the journal is a labelled `aside` (a landmark) whose open quests
are a labelled list; the prompt is a labelled group whose verbs are
buttons, as the dialogue's choices are. `hud.css` honours `prefers-reduced-motion` (the
marquee, the credits roll, the notices and the fades stop), and so do the
minimap (the objective's ring stands still) and the canvas
(`src/render/motion.ts`: the camera never shakes, a strike flash, a ledger
tick, the Wink ripple, the interrupt ring and the hijack scanlines fade in
place instead of growing, rising or drifting, the going-under's wing-star
holds its size, the rings and lights that pulse hold their mean, an idle
body does not breathe and an Angel's aura does not turn; camera fades and
flashes stay, since they do not move). `src/ui/a11y.test.ts`
reads the static attributes off `index.html`; the render check reads them
in the browser with the live values, the map's sentence included. Keyboard
reach: every verb has a key, and the HUD's buttons repeat them; a keyboard
or switch user who needs the buttons themselves enters them with Shift+Tab
from the canvas, moves among them with Tab and Shift+Tab, activates with
Space or Enter, and leaves with Escape (`src/ui/keys.ts` decides who owns a
press; the render check walks that path). A panel that appears on its own
takes focus itself (`src/ui/focus.ts`, a keeper per panel; each has
`tabindex="-1"`, so the dialog is announced with its name): the dialogue
(named by its speaker, described by its line; Tab reaches its first
choice, the digits and Enter choose, and when the next line replaces a
focused choice the panel takes focus back; the panel rather than the
first choice, so a strike key held as a dialogue opens cannot pick a
decision), the guest lock (named by its heading; Tab reaches the wallet
button; Escape hands the keys back and the panel stays), and the credits
(Enter, Space or Escape close them, as a click does). Escape inside the
dialogue closes it (`escapeDoes`), and every close returns focus to the
HUD control that had it when the panel appeared, else to the canvas
(`focusAfterClose`; the prompt and the bars are hidden while a dialogue
is open, so the return waits until the panel is hidden). The title's
Enter button has focus at boot. Not done: the news marquee, which stays
silent by design.
