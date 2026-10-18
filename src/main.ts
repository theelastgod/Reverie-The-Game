/**
 * Entry. Mounts the title, builds the HUD, then the Phaser game with the
 * Boot and City scenes. The HUD talks to the scene through the bus.
 */
import Phaser from "phaser";
import { getPreselectedSerial, mountTitle } from "./ui/title";
import { Hud, type HudCallbacks } from "./ui/hud";
import { bus } from "./render/bus";
import { linkWallet } from "./net/wallet";
import { audio } from "./audio/bus";
import { gen } from "./assets/gen";
import { loopFor } from "./assets/slots";
import { LoopSlot } from "./ui/loops";
import { BootScene } from "./scenes/BootScene";
import { CityScene } from "./scenes/CityScene";
import { canvasSize, renderDensity } from "./render/density";

// The generated-asset manifest: one small request, before anything asks for a generated file.
const manifest = gen.load().then(() => {
  // The title mark's loop plays behind the word once the manifest says it exists.
  const inner = document.querySelector<HTMLElement>("#title .title-inner");
  new LoopSlot(inner, "title-loop", inner?.querySelector(".title-mark") ?? null).set(loopFor("title-mark"));
});

const callbacks: HudCallbacks = {
  // A click or tap carries the window it was made on, as the digit keys do: the server refuses a press on a window gone by.
  choose: (choiceId, node) => bus.actions?.choose(choiceId, node),
  close: node => bus.actions?.close(node),
  link: (serial) => {
    if (bus.actions) bus.actions.link(serial);
    else bus.pendingSerial = serial;
  },
  wallet: () => linkWallet(),
  interact: (targetId, choice) => bus.actions?.interact(targetId, choice),
  stance: () => bus.actions?.stance(),
  kit: () => bus.actions?.kit(),
  flag: () => bus.actions?.flag(),
  truce: () => bus.actions?.truce(),
  use: () => bus.actions?.use(),
  dodge: () => bus.actions?.dodge(),
  reclaim: () => bus.net?.reclaim(),
  market: (op, args) => bus.actions?.market(op, args),
};

function hudRoot(): HTMLElement {
  let root = document.getElementById("hud");
  if (!root) {
    root = document.createElement("div");
    root.id = "hud";
    root.hidden = true;
    document.body.appendChild(root);
  }
  return root;
}

const hud = new Hud(hudRoot(), callbacks);
bus.hud = hud;
hud.setStatus("connecting");

/**
 * The page's one visibility listener (round seventy; there were two). Hidden, the city is silent (round sixty-one);
 * shown again, or back on the network, a reconnect waiting out its backoff goes at once (round sixty-two).
 */
document.addEventListener("visibilitychange", () => {
  const hidden = document.visibilityState === "hidden";
  audio.setHidden(hidden);
  if (!hidden) bus.net?.wake();
});
window.addEventListener("online", () => bus.net?.wake());

let game: Phaser.Game | null = null;
let starting = false;

/**
 * The canvas holds the screen's device pixels and shows at the window's CSS size (round seventy-five): Phaser's own
 * RESIZE mode sizes it in CSS pixels, which a 2x screen upscales and blurs. Run on every resize and whenever the
 * density changes (a window dragged to another screen, the page zoomed; see followDensity).
 */
function fitCanvas(): void {
  if (!game) return;
  const d = renderDensity(window.devicePixelRatio);
  const { width, height } = canvasSize(window.innerWidth, window.innerHeight, d);
  if (game.scale.zoom !== 1 / d) game.scale.setZoom(1 / d);
  if (game.scale.width !== width || game.scale.height !== height) game.scale.resize(width, height);
  game.canvas.style.width = `${window.innerWidth}px`;
  game.canvas.style.height = `${window.innerHeight}px`;
}

/**
 * A window dragged to another screen changes the density with no resize event, and the `(resolution)` media query's
 * change event did not fire in Chrome 155 (round seventy-seven, found by CI): the density is read once a frame instead,
 * a number compare, and the canvas refitted the frame it differs (the minimap does the same per draw).
 */
function followDensity(): void {
  if (game && game.scale.zoom !== 1 / renderDensity(window.devicePixelRatio)) fitCanvas();
}

/**
 * The phone's Back closes the open panel before it leaves the city (round sixty-eight): entering the city leaves one
 * history entry of our own, and each Back that closes a panel lays it down again. With nothing open, Back goes on.
 */
function armBack(): void {
  let armed = true;
  history.pushState({ city: true }, "");
  window.addEventListener("popstate", () => {
    if (hud.closeTop()) {
      history.pushState({ city: true }, "");
      return;
    }
    // Nothing open: Back goes on. Where the city is the tab's first page there is nowhere to go and the browser stays,
    // so the entry is laid down again at the next touch or key (round sixty-nine), or a later Back on a panel would
    // close the tab instead of the panel.
    armed = false;
    history.back();
  });
  const rearm = () => {
    if (armed) return;
    armed = true;
    history.pushState({ city: true }, "");
  };
  window.addEventListener("pointerdown", rearm, true);
  window.addEventListener("keydown", rearm, true);
}

function start(): void {
  if (game || starting) return;
  starting = true;
  armBack();
  audio.unlock();
  audio.setScene("city");
  const pre = getPreselectedSerial();
  if (pre !== null && Number.isInteger(pre) && pre >= 1 && pre <= 7777) bus.pendingSerial = pre;
  // Boot only knows which generated textures to load once the manifest has answered (or failed).
  void manifest.then(() => {
    if (game) return;
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: document.body,
      backgroundColor: "#0a0a0a",
      pixelArt: false,
      antialias: true,
      roundPixels: true,
      // Device pixels at the window's CSS size; fitCanvas keeps it so (round seventy-five).
      scale: { mode: Phaser.Scale.NONE, ...canvasSize(window.innerWidth, window.innerHeight, renderDensity(window.devicePixelRatio)), zoom: 1 / renderDensity(window.devicePixelRatio), autoCenter: Phaser.Scale.NO_CENTER },
      input: { keyboard: false, mouse: true, touch: true },
      // The canvas's right-click opens no menu over the city (round sixty-four); the HUD's own controls keep theirs.
      disableContextMenu: true,
      // Every sound goes through the audio bus; Phaser's own manager would open a second context that plays nothing.
      audio: { noAudio: true },
      scene: [BootScene, CityScene],
    });
    game.events.once(Phaser.Core.Events.READY, fitCanvas);
    window.addEventListener("resize", fitCanvas);
    game.events.on(Phaser.Core.Events.PRE_STEP, followDensity);
  });
}

mountTitle(start);
