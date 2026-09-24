import Phaser from "phaser";

function asset(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`.replace(/([^:]\/)\/+/g, "$1");
}

/** Each texture key is registered once so the authored art reaches the renderer. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    const status = document.getElementById("connection-chip");
    const prompt = document.getElementById("prompt-chip");
    if (prompt) prompt.textContent = "The city is already over. You still have a place in it.";
    this.load.on("progress", (progress: number) => {
      if (status) status.textContent = `Opening the city · ${Math.round(progress * 100)}%`;
    });
    this.load.image("tile-nave", asset("tiles/nave-v2.png"));
    this.load.image("tile-wet", asset("tiles/wet.jpg"));
    this.load.image("tile-clearing", asset("tiles/clearing.jpg"));
    this.load.image("tile-care", asset("tiles/care.jpg"));
    this.load.image("prop-crt", asset("tiles/crt.jpg"));
    this.load.image("serial-wreckage", asset("serial-wreckage.jpg"));
    this.load.image("failed-passing", asset("failed-passing.jpg"));
    this.load.image("guest", asset("sprites/guest.png"));
    this.load.image("nara", asset("sprites/nara.png"));
    this.load.image("quill", asset("sprites/quill.png"));
    this.load.image("ord", asset("sprites/ord.png"));
    this.load.image("ione", asset("sprites/ione.png"));
    this.load.image("vesper", asset("sprites/vesper.png"));
    this.load.image("clerk", asset("sprites/clerk.png"));
    this.load.image("angel", asset("sprites/angel.png"));
    this.load.image("fx-strike", asset("sprites/fx-strike.png"));
    this.load.image("fx-aura", asset("sprites/fx-aura.png"));
    this.load.image("fx-wreckage", asset("sprites/fx-wreckage.png"));
  }

  create() {
    this.scene.start("nave");
  }
}
