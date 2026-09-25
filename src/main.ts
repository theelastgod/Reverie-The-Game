/**
 * Entry. Mounts the title, builds the HUD, then the Phaser game with the
 * Boot and City scenes. The HUD talks to the scene through the bus.
 */
import Phaser from "phaser";
import { getPreselectedSerial, mountTitle } from "./ui/title";
import { Hud, type HudCallbacks } from "./ui/hud";
import { bus } from "./render/bus";
import { BootScene } from "./scenes/BootScene";
import { CityScene } from "./scenes/CityScene";

const callbacks: HudCallbacks = {
  choose: (choiceId) => bus.actions?.choose(choiceId),
  close: () => bus.actions?.close(),
  link: (serial) => {
    if (bus.actions) bus.actions.link(serial);
    else bus.pendingSerial = serial;
  },
  interact: (targetId, choice) => bus.actions?.interact(targetId, choice),
  stance: () => bus.actions?.stance(),
  kit: () => bus.actions?.kit(),
  flag: () => bus.actions?.flag(),
  truce: () => bus.actions?.truce(),
  use: () => bus.actions?.use(),
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

let game: Phaser.Game | null = null;

function start(): void {
  if (game) return;
  const pre = getPreselectedSerial();
  if (pre !== null && Number.isInteger(pre) && pre >= 1 && pre <= 7777) bus.pendingSerial = pre;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: document.body,
    backgroundColor: "#0a0a0a",
    pixelArt: false,
    antialias: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%", autoCenter: Phaser.Scale.NO_CENTER },
    input: { keyboard: false, mouse: true, touch: true },
    scene: [BootScene, CityScene],
  });
}

mountTitle(start);
