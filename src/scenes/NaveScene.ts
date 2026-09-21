import Phaser from "phaser";
import { COLS, ROWS, TILE, YieldNode } from "../sim/nave";
import { WorldSocket } from "../net/worldSocket";
import type { Player } from "../sim/world";

function hud(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export class NaveScene extends Phaser.Scene {
  private net = new WorldSocket();
  private bodies = new Map<string, Phaser.GameObjects.Image>();
  private nodeMarks = new Map<string, Phaser.GameObjects.Arc>();
  private wreckMarks = new Map<string, Phaser.GameObjects.Arc>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private prompt = "";
  private following = false;

  constructor() {
    super("nave");
  }

  create() {
    this.cameras.main.setBackgroundColor("#16141c");

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
        const aisle = x === 9 || x === 18;
        const wall = edge || (aisle && y > 3 && y < ROWS - 3 && y % 4 !== 0);
        this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, wall ? "tile-wall" : "tile-nave");
      }
    }

    this.add
      .text(TILE * 2, TILE * 2.2, "NAVE OF TUBES", {
        fontFamily: "Anton, Impact, sans-serif",
        fontSize: "28px",
        color: "#c9a56a",
      })
      .setDepth(5);
    this.add
      .text(TILE * 2, TILE * 2.9, "WASD walk · click strike · E extract · Q keep", {
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "13px",
        color: "#e8e8e8",
      })
      .setDepth(5);

    this.cameras.main.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.cameras.main.setZoom(1.15);

    if (!this.input.keyboard) throw new Error("keyboard");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey("W"),
      A: this.input.keyboard.addKey("A"),
      S: this.input.keyboard.addKey("S"),
      D: this.input.keyboard.addKey("D"),
    };
    this.input.keyboard.addKey("E").on("down", () => this.useNear("extract"));
    this.input.keyboard.addKey("Q").on("down", () => this.useNear("keep"));
    this.input.keyboard.addKey("SPACE").on("down", () => this.net.strike());
    this.input.on("pointerdown", () => this.net.strike());

    this.net.connect();
  }

  private useNear(choice: "extract" | "keep") {
    const me = this.net.you;
    const nodes = this.net.snap?.nodes ?? [];
    if (!me) return;
    const n = nodes.find((node) => !node.depleted && Phaser.Math.Distance.Between(me.x, me.y, node.x, node.y) < 40);
    if (n) this.net.use(n.id, choice);
  }

  private bodyFor(p: Player): Phaser.GameObjects.Image {
    let img = this.bodies.get(p.id);
    if (!img) {
      img = this.add.image(p.x, p.y, "guest").setDepth(10);
      this.bodies.set(p.id, img);
    }
    return img;
  }

  private syncNodes(nodes: YieldNode[]) {
    for (const n of nodes) {
      let g = this.nodeMarks.get(n.id);
      if (!g) {
        g = this.add.circle(n.x, n.y, 16, 0x88a0c8, 0.85).setDepth(3);
        this.add.image(n.x, n.y, "prop-crt").setDepth(4);
        this.nodeMarks.set(n.id, g);
      }
      g.setFillStyle(n.kept ? 0xc9a56a : n.depleted ? 0x3a3a3a : 0x88a0c8, 0.9);
    }
  }

  update() {
    const intent = {
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
    };
    this.net.sendIntent(intent);

    const snap = this.net.snap;
    const me = this.net.you;
    if (!snap || !me) return;

    const seen = new Set<string>();
    for (const p of snap.players) {
      seen.add(p.id);
      const img = this.bodyFor(p);
      img.x += (p.x - img.x) * 0.35;
      img.y += (p.y - img.y) * 0.35;
      img.setAlpha(p.id === me.id ? 1 : 0.85);
      img.setTint(p.hp < 40 ? 0xff2d6b : 0xffffff);
      if (p.id === me.id && !this.following) {
        this.cameras.main.startFollow(img, true, 0.12, 0.12);
        this.following = true;
      }
    }
    for (const [id, img] of this.bodies) {
      if (!seen.has(id)) {
        img.destroy();
        this.bodies.delete(id);
      }
    }

    this.syncNodes(snap.nodes);
    const wreckSeen = new Set<string>();
    for (const r of snap.wreckage) {
      wreckSeen.add(r.id);
      let m = this.wreckMarks.get(r.id);
      if (!m) {
        m = this.add.circle(r.x, r.y, 10, 0xff2d6b, 0.7).setDepth(6);
        this.wreckMarks.set(r.id, m);
      }
    }
    for (const [id, m] of this.wreckMarks) {
      if (!wreckSeen.has(id)) {
        m.destroy();
        this.wreckMarks.delete(id);
      }
    }

    const near = snap.nodes.find(
      (n) => !n.depleted && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );
    this.prompt = near
      ? "E extract Bestand · Q keep (Winke). A guest cannot cash out."
      : "";
    const promptEl = hud("prompt-chip");
    if (promptEl) {
      promptEl.textContent = this.prompt || "Strike leaves wreckage. Guests cannot claim.";
      promptEl.style.display = "block";
    }
    const guest = hud("guest-chip");
    if (guest) guest.textContent = `Guest · aura ${me.aura} · hp ${me.hp}`;
    const stats = hud("stat-chip");
    if (stats) stats.textContent = `Bestand ${me.bestand} · Winke ${me.winke} · Gestell ${snap.gestell}`;
  }
}
