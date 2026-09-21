import Phaser from "phaser";

/** Draw influence-palette textures in code. Imagine replaces these later. */
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

    this.load.image("guest", "/assets/guest.jpg");
    this.load.image("nara", "/assets/nara.jpg");
    this.load.image("quill", "/assets/quill.jpg");
    this.load.image("ord", "/assets/ord.jpg");
    this.load.image("house-hall", "/assets/house-hall.jpg");
  }

  create() {
    this.scene.start("nave");
  }
}
