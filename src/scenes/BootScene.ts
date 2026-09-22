import Phaser from "phaser";

function asset(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`.replace(/([^:]\/)\/+/g, "$1");
}

/** Code tiles as fallback; Imagine stills overwrite the same keys. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x2a2433, 1);
    g.fillRect(0, 0, 48, 48);
    g.lineStyle(2, 0x3d3548, 1);
    g.strokeRect(1, 1, 46, 46);
    g.fillStyle(0x1a1620, 1);
    g.fillRect(18, 18, 12, 12);
    g.generateTexture("tile-nave", 48, 48);
    g.clear();

    g.fillStyle(0x4a3a28, 1);
    g.fillRect(0, 0, 48, 48);
    g.lineStyle(3, 0xc9a56a, 1);
    g.strokeRect(4, 4, 40, 40);
    g.generateTexture("tile-wall", 48, 48);
    g.clear();

    g.fillStyle(0x3a4860, 1);
    g.fillRect(0, 0, 32, 48);
    g.fillStyle(0x88a0c8, 1);
    g.fillRect(6, 8, 20, 16);
    g.generateTexture("prop-crt", 32, 48);
    g.clear();

    g.fillStyle(0xe8e4dc, 1);
    g.fillCircle(16, 20, 10);
    g.fillStyle(0xc9c4bc, 1);
    g.fillTriangle(4, 18, 16, 6, 16, 22);
    g.fillTriangle(28, 18, 16, 6, 16, 22);
    g.fillStyle(0xff2d6b, 1);
    g.fillRect(6, 8, 20, 3);
    g.generateTexture("guest", 32, 40);

    const npcs: [string, number][] = [
      ["nara", 0x7a1028],
      ["quill", 0x7eb6ff],
      ["ord", 0x5a5a5a],
      ["ione", 0x7a1028],
      ["vesper", 0xc9a56a],
      ["clerk", 0x6a6a72],
    ];
    for (const [key, color] of npcs) {
      g.clear();
      g.fillStyle(color, 1);
      g.fillCircle(16, 20, 11);
      g.fillStyle(0xe8e4dc, 1);
      g.fillCircle(16, 14, 7);
      g.generateTexture(key, 32, 40);
    }
    g.destroy();

    this.load.image("tile-nave", asset("tiles/nave.jpg"));
    this.load.image("tile-wall", asset("tiles/wall.jpg"));
    this.load.image("tile-wet", asset("tiles/wet.jpg"));
    this.load.image("tile-organ", asset("tiles/organ.jpg"));
    this.load.image("tile-clearing", asset("tiles/clearing.jpg"));
    this.load.image("tile-care", asset("tiles/care.jpg"));
    this.load.image("tile-shrine", asset("tiles/shrine.jpg"));
    this.load.image("tile-burial", asset("tiles/burial.jpg"));
    this.load.image("tile-arena", asset("tiles/arena.jpg"));
    this.load.image("tile-hall", asset("tiles/hall.jpg"));
    this.load.image("tile-stall", asset("tiles/stall.jpg"));
    this.load.image("tile-forge", asset("tiles/forge.jpg"));
    this.load.image("tile-annex", asset("tiles/annex.jpg"));
    this.load.image("prop-crt", asset("tiles/crt.jpg"));
    this.load.image("guest", asset("guest.jpg"));
    this.load.image("nara", asset("nara.jpg"));
    this.load.image("quill", asset("quill.jpg"));
    this.load.image("ord", asset("ord.jpg"));
    this.load.image("house-hall", asset("house-hall.jpg"));
    this.load.image("safety-annex", asset("safety-annex.jpg"));
    this.load.image("serial-wreckage", asset("serial-wreckage.jpg"));
    this.load.image("clearing-stall", asset("clearing-stall.jpg"));
    this.load.image("stall-surface", asset("stall-surface.jpg"));
    this.load.image("wreckage-garden", asset("wreckage-garden.jpg"));
    this.load.image("organ-strait", asset("organ-strait.jpg"));
    this.load.image("failed-passing", asset("failed-passing.jpg"));
    this.load.image("clearing-ring", asset("clearing-ring.jpg"));
    this.load.image("ione", asset("ione.jpg"));
    this.load.image("vesper", asset("vesper.jpg"));
    this.load.image("organ-foundry-dark", asset("organ-foundry-dark.jpg"));
    this.load.image("wet-grid-cult", asset("wet-grid-cult.jpg"));
    this.load.image("organ-cable-dark", asset("organ-cable-dark.jpg"));
    this.load.image("house-war", asset("house-war.jpg"));
    this.load.image("shrine-upkeep", asset("shrine-upkeep.jpg"));
  }

  create() {
    this.scene.start("nave");
  }
}
