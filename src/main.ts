import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { NaveScene } from "./scenes/NaveScene";

const boot = document.getElementById("boot-title");
const hud = document.getElementById("hud");

let started = false;
function start() {
  if (started) return;
  started = true;
  boot?.remove();
  if (hud) hud.hidden = false;
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: document.body,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#1a1820",
    pixelArt: true,
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } },
    scale: { mode: Phaser.Scale.RESIZE },
    scene: [BootScene, NaveScene],
  });
}

if (boot) {
  const go = () => start();
  boot.addEventListener("click", go, { once: true });
  window.addEventListener("keydown", go, { once: true });
} else {
  start();
}
