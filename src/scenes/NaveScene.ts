import Phaser from "phaser";

const TILE = 48;
const COLS = 28;
const ROWS = 20;

export class NaveScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;

  constructor() {
    super("nave");
  }

  create() {
    this.cameras.main.setBackgroundColor("#16141c");
    const walls = this.physics.add.staticGroup();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
        const aisle = x === 9 || x === 18;
        const key = edge || (aisle && y > 3 && y < ROWS - 3 && y % 4 !== 0) ? "tile-wall" : "tile-nave";
        const img = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key);
        if (key === "tile-wall") walls.add(img);
      }
    }

    for (let i = 0; i < 8; i++) {
      this.add.image(120 + i * 140, 180, "prop-crt").setDepth(2);
    }

    this.add
      .text(TILE * 2, TILE * 2.2, "NAVE OF TUBES", {
        fontFamily: "Anton, Impact, sans-serif",
        fontSize: "28px",
        color: "#c9a56a",
      })
      .setDepth(5);
    this.add
      .text(TILE * 2, TILE * 2.9, "The city is already over. WASD to walk.", {
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "13px",
        color: "#e8e8e8",
      })
      .setDepth(5);

    this.player = this.physics.add.sprite(TILE * 4, TILE * 10, "guest");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, walls);

    this.physics.world.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.cameras.main.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.15);

    if (!this.input.keyboard) throw new Error("keyboard");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey("W"),
      A: this.input.keyboard.addKey("A"),
      S: this.input.keyboard.addKey("S"),
      D: this.input.keyboard.addKey("D"),
    };
  }

  update() {
    const speed = 160;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;
    const v = new Phaser.Math.Vector2(vx, vy);
    if (v.lengthSq() > 0) v.normalize().scale(speed);
    this.player.setVelocity(v.x, v.y);
  }
}
