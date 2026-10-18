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

audio.followVisibility(document);

let game: Phaser.Game | null = null;
let starting = false;

function start(): void {
  if (game || starting) return;
  starting = true;
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
      scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%", autoCenter: Phaser.Scale.NO_CENTER },
      input: { keyboard: false, mouse: true, touch: true },
      // Every sound goes through the audio bus; Phaser's own manager would open a second context that plays nothing.
      audio: { noAudio: true },
      scene: [BootScene, CityScene],
    });
  });
}

mountTitle(start);
