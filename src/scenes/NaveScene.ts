import Phaser from "phaser";
import {
  CARE_DOOR,
  formatSerial,
  houseName,
  messengerName,
  GOING_UNDER,
  BURIAL_PLOT,
  GUEST_ARENA,
  SCREENING,
  STILL,
  HOUSE_HALL,
  SAFETY_ANNEX,
  FREEZE_COST,
  TITHE_COST,
  CLEARING_STALL,
  CLEARING_PRICE,
  M3_DOOR,
  OPERATOR_DESK,
  ORGAN_STRAIT,
  ORGAN_FOUNDRY,
  ORGAN_CABLE,
  FORGE_TRAY,
  FORGE_PAY,
  LISTING_FEE,
  PRIVATE_YIELD,
  WRECK_GARDEN,
  CLEARING_RING,
  WET_GRID,
  CLAIMS_DESK,
  SHRINE,
  FUNERAL_COST,
  SHRINE_COST,
  AURA_DIM,
  RESTORE_COST,
  INSURANCE_COST,
  REPAIR_COST,
  inWetGrid,
  IONE,
  VESPER,
  movementReady,
  NAVE_NPCS,
  NAVE_SIGNS,
  nearPoint,
  TEST_SERIAL,
  visibleFailed,
  visibleHistory,
  palindromeSerial,
  AURA_ADDRESS,
  winkeVisible,
  type Sign,
} from "../sim/campaign";
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
  private wreckImgs = new Map<string, Phaser.GameObjects.Image>();
  private npcMarks = new Map<string, Phaser.GameObjects.Image>();
  private npcNames = new Map<string, Phaser.GameObjects.Text>();
  private riteMarks = new Map<string, Phaser.GameObjects.Arc>();
  private clerkMarks = new Map<string, Phaser.GameObjects.Image>();
  private clerkTele = new Map<string, Phaser.GameObjects.Arc>();
  private clerkNames = new Map<string, Phaser.GameObjects.Text>();
  private signLabels = new Map<string, Phaser.GameObjects.Text>();
  private poiMarks = new Map<string, Phaser.GameObjects.Arc>();
  private histMarks = new Map<string, Phaser.GameObjects.Image>();
  private failMarks = new Map<string, Phaser.GameObjects.Image>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private prompt = "";
  private following = false;
  private signsDrawn = false;
  private stallStill: Phaser.GameObjects.Image | null = null;
  private auraImg: Phaser.GameObjects.Image | null = null;

  constructor() {
    super("nave");
  }

  create() {
    this.cameras.main.setBackgroundColor("#16141c");

    this.paintFloors();
    this.graftPlates();

    this.add
      .text(TILE * 2, TILE * 2.2, "NAVE OF TUBES", {
        fontFamily: "Anton, Impact, sans-serif",
        fontSize: "28px",
        color: "#c9a56a",
      })
      .setDepth(5);
    this.add
      .text(TILE * 2, TILE * 2.9, "WASD · F speak · click light · R / shift-click heavy · E extract · Q keep", {
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "13px",
        color: "#e8e8e8",
      })
      .setDepth(5);

    this.drawSigns();

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
    this.input.keyboard.addKey("F").on("down", () => this.interact());
    this.input.keyboard.addKey("SPACE").on("down", () => {
      this.net.strike();
      this.flashStrike();
    });
    this.input.keyboard.addKey("R").on("down", () => {
      this.net.heavy();
      this.flashStrike(true);
    });
    this.input.on("pointerdown", (ptr: Phaser.Input.Pointer) => {
      if (ptr.event && (ptr.event as MouseEvent).shiftKey) {
        this.net.heavy();
        this.flashStrike(true);
      } else {
        this.net.strike();
        this.flashStrike();
      }
    });
    hud("mock-link")?.addEventListener("click", () => this.net.link(TEST_SERIAL));

    this.net.connect();
  }

  private floorKey(cx: number, cy: number, wall: boolean): string {
    if (wall) return "tile-wall";
    if (inWetGrid(cx, cy)) return "tile-wet";
    if (cy < 168) return "tile-organ";
    if (nearPoint(cx, cy, CLEARING_RING.x, CLEARING_RING.y, 140)) return "tile-clearing";
    if (nearPoint(cx, cy, CARE_DOOR.x, CARE_DOOR.y, 110)) return "tile-care";
    if (nearPoint(cx, cy, SHRINE.x, SHRINE.y, 90)) return "tile-shrine";
    if (nearPoint(cx, cy, BURIAL_PLOT.x, BURIAL_PLOT.y, 90)) return "tile-burial";
    if (nearPoint(cx, cy, GUEST_ARENA.x, GUEST_ARENA.y, 90)) return "tile-arena";
    if (nearPoint(cx, cy, HOUSE_HALL.x, HOUSE_HALL.y, 90)) return "tile-hall";
    if (nearPoint(cx, cy, CLEARING_STALL.x, CLEARING_STALL.y, 90)) return "tile-stall";
    if (nearPoint(cx, cy, FORGE_TRAY.x, FORGE_TRAY.y, 90)) return "tile-forge";
    if (nearPoint(cx, cy, M3_DOOR.x, M3_DOOR.y, 90)) return "tile-m3";
    if (nearPoint(cx, cy, OPERATOR_DESK.x, OPERATOR_DESK.y, 90)) return "tile-operator";
    if (nearPoint(cx, cy, GOING_UNDER.x, GOING_UNDER.y, 90)) return "tile-under";
    if (nearPoint(cx, cy, WRECK_GARDEN.x, WRECK_GARDEN.y, 90)) return "tile-garden";
    if (nearPoint(cx, cy, SAFETY_ANNEX.x, SAFETY_ANNEX.y, 90)) return "tile-annex";
    if (nearPoint(cx, cy, SCREENING.x, SCREENING.y, 90)) return "tile-screening";
    if (nearPoint(cx, cy, CLAIMS_DESK.x, CLAIMS_DESK.y, 90)) return "tile-claims";
    return "tile-nave";
  }

  private paintFloors() {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
        const aisle = x === 9 || x === 18;
        const wall = edge || (aisle && y > 3 && y < ROWS - 3 && y % 4 !== 0);
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        const key = this.floorKey(cx, cy, wall);
        if (wall) {
          this.add.image(cx, cy, key).setDisplaySize(TILE, TILE).setDepth(0);
          continue;
        }
        const cell = this.add.tileSprite(cx, cy, TILE, TILE, key).setDepth(0);
        cell.setTilePosition(x * TILE, y * TILE);
      }
    }
  }

  private plate(x: number, y: number, tex: string, w: number, h: number): Phaser.GameObjects.Image {
    this.add.rectangle(x, y, w + 8, h + 8, 0x0a0a0a).setDepth(2);
    this.add.rectangle(x, y, w + 4, h + 4, 0xc9a56a).setDepth(2);
    return this.add.image(x, y, tex).setDisplaySize(w, h).setDepth(3);
  }

  private graftPlates() {
    this.plate(CLEARING_RING.x, CLEARING_RING.y - 10, "clearing-ring", 280, 158);
    this.plate(WET_GRID.x, WET_GRID.y - 20, "wet-grid-cult", 196, 116);
    this.plate(ORGAN_STRAIT.x, ORGAN_STRAIT.y + 30, "organ-strait", 140, 78);
    this.plate(ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y + 30, "organ-foundry-dark", 140, 78);
    this.plate(ORGAN_CABLE.x, ORGAN_CABLE.y + 30, "organ-cable-dark", 140, 78);
    this.plate(HOUSE_HALL.x, HOUSE_HALL.y - 38, "house-hall", 160, 90);
    this.plate(SAFETY_ANNEX.x, SAFETY_ANNEX.y - 38, "safety-annex", 152, 86);
    this.stallStill = this.plate(CLEARING_STALL.x, CLEARING_STALL.y - 38, "clearing-stall", 152, 86);
    this.plate(SHRINE.x, SHRINE.y - 38, "shrine-upkeep", 144, 82);
    this.plate(WRECK_GARDEN.x, WRECK_GARDEN.y - 38, "wreckage-garden", 152, 86);
    this.plate(SCREENING.x, SCREENING.y - 38, "plate-screening", 148, 84);
    this.plate(GUEST_ARENA.x, GUEST_ARENA.y - 38, "plate-arena", 140, 80);
    this.plate(M3_DOOR.x, M3_DOOR.y + 30, "plate-m3", 132, 74);
    this.plate(CARE_DOOR.x, CARE_DOOR.y - 30, "plate-care", 140, 80);
    this.plate(FORGE_TRAY.x, FORGE_TRAY.y - 38, "plate-forge", 140, 80);
    this.plate(OPERATOR_DESK.x, OPERATOR_DESK.y - 38, "plate-operator", 132, 74);
    this.plate(GOING_UNDER.x, GOING_UNDER.y + 30, "plate-under", 132, 74);
    this.plate(CLAIMS_DESK.x, CLAIMS_DESK.y - 38, "plate-claims", 140, 80);
    this.plate(BURIAL_PLOT.x, BURIAL_PLOT.y - 38, "plate-burial", 148, 84);
    this.plate(HOUSE_HALL.x + 180, HOUSE_HALL.y + 70, "house-war", 140, 80);
    this.plate(IONE.x - 120, IONE.y - 8, "plate-ione", 140, 80);
    this.plate(VESPER.x + 88, VESPER.y, "plate-vesper", 132, 74);
  }

  private drawSign(s: Sign) {
    if (this.signLabels.has(s.id)) return;
    this.add.rectangle(s.x, s.y, 112, 28, 0xffffff).setStrokeStyle(3, 0x0a0a0a).setDepth(4);
    const label = this.add
      .text(s.x, s.y - 2, s.title, {
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "9px",
        color: "#0a0a0a",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(5);
    this.signLabels.set(s.id, label);
  }

  private drawSigns() {
    if (this.signsDrawn) return;
    this.signsDrawn = true;
    for (const s of NAVE_SIGNS) this.drawSign(s);
    for (const n of this.net.snap?.npcs ?? [...NAVE_NPCS, IONE]) {
      if (this.npcMarks.has(n.id)) continue;
      const img = this.add.image(n.x, n.y, n.id).setDisplaySize(56, 72).setDepth(9);
      const nm = this.add
        .text(n.x, n.y - 40, n.name, {
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "11px",
          color: "#e8d5a3",
        })
        .setOrigin(0.5)
        .setDepth(11);
      this.npcMarks.set(n.id, img);
      this.npcNames.set(n.id, nm);
    }
  }

  private syncNpcs() {
    const list = this.net.snap?.npcs ?? [];
    const seen = new Set<string>();
    for (const n of list) {
      seen.add(n.id);
      let img = this.npcMarks.get(n.id);
      let nm = this.npcNames.get(n.id);
      if (!img) {
        img = this.add.image(n.x, n.y, n.id).setDisplaySize(56, 72).setDepth(9);
        nm = this.add
          .text(n.x, n.y - 40, n.name, {
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "11px",
            color: "#e8d5a3",
          })
          .setOrigin(0.5)
          .setDepth(11);
        this.npcMarks.set(n.id, img);
        this.npcNames.set(n.id, nm);
      }
      img.setPosition(n.x, n.y);
      nm?.setPosition(n.x, n.y - 40);
    }
    for (const [id, img] of this.npcMarks) {
      if (!seen.has(id)) {
        img.destroy();
        this.npcMarks.delete(id);
        this.npcNames.get(id)?.destroy();
        this.npcNames.delete(id);
      }
    }
  }

  private useNear(choice: "extract" | "keep") {
    const me = this.net.you;
    const nodes = this.net.snap?.nodes ?? [];
    if (!me || me.locked) return;
    if (nearPoint(me.x, me.y, OPERATOR_DESK.x, OPERATOR_DESK.y, 56) && me.beats.yield) {
      this.net.operator(choice === "extract" ? "take" : "refuse");
      return;
    }
    const atForge =
      nearPoint(me.x, me.y, FORGE_TRAY.x, FORGE_TRAY.y, 64) || nearPoint(me.x, me.y, 1080, 504, 64);
    if (atForge && me.beats.forge) {
      this.net.forge(choice === "extract" ? "sell" : "spot");
      return;
    }
    if (nearPoint(me.x, me.y, SHRINE.x, SHRINE.y, 56)) {
      if (choice === "extract") this.net.restore();
      else this.net.insure();
      return;
    }
    if (nearPoint(me.x, me.y, CLEARING_STALL.x, CLEARING_STALL.y, 56) && choice === "keep") {
      this.net.repair();
      return;
    }
    if (nearPoint(me.x, me.y, CLAIMS_DESK.x, CLAIMS_DESK.y, 56)) {
      this.net.desk(choice === "extract" ? "take" : "bank");
      return;
    }
    if (nearPoint(me.x, me.y, CLEARING_RING.x, CLEARING_RING.y, 64)) {
      this.net.clearing(choice === "extract" ? "extract" : "keep");
      return;
    }
    const n = nodes.find((node) => !node.depleted && Phaser.Math.Distance.Between(me.x, me.y, node.x, node.y) < 40);
    if (n) this.net.use(n.id, choice);
  }

  private interact() {
    const me = this.net.you;
    if (!me) return;
    const npc = (this.net.snap?.npcs ?? [...NAVE_NPCS, IONE]).find((n) => nearPoint(me.x, me.y, n.x, n.y));
    if (npc) {
      this.net.talk(npc.id);
      return;
    }
    const clerk = this.net.snap?.clerks.find((c) => !c.dummy && nearPoint(me.x, me.y, c.x, c.y, 70));
    if (clerk) {
      this.net.clockOut();
      return;
    }
    const sign = (this.net.snap?.signs ?? NAVE_SIGNS).find((s) => nearPoint(me.x, me.y, s.x, s.y, 56));
    if (sign) {
      this.net.read(sign.id);
      return;
    }
    const mate = (this.net.snap?.players ?? []).find(
      (o) => o.id !== me.id && !o.guest && nearPoint(me.x, me.y, o.x, o.y, 56),
    );
    if (me.partyOf && !me.guest) {
      this.net.party();
      return;
    }
    if (mate && me.flagged && mate.flagged && !me.guest) {
      this.net.truce();
      return;
    }
    if (mate && this.net.snap?.weatherNamed && !me.guest) {
      this.net.party();
      return;
    }
    if (me.locked) return;
    const rites = this.net.snap?.rites ?? [];
    const burial = rites.find((r) => r.kind === "burial" && !r.done && nearPoint(me.x, me.y, r.x, r.y));
    const wreck = this.net.snap?.wreckage.find((r) => nearPoint(me.x, me.y, r.x, r.y, 56));
    if (wreck && me.messenger === "witness" && !me.beats.blitz) {
      this.net.blitz();
      return;
    }
    if (wreck && me.messenger === "ruin-angel" && !me.beats.ruinBack) {
      this.net.ruinBack();
      return;
    }
    const hist = visibleHistory(me.guest, me.serial, this.net.snap?.history ?? [], me.storm || me.ruinBack).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const garden = rites.find((r) => r.kind === "garden" && !r.done && nearPoint(me.x, me.y, r.x, r.y, 56));
    const failed = visibleFailed(me.guest, me.serial, this.net.snap?.failed ?? [], me.house, me.storm || me.ruinBack).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    if (failed) {
      this.net.watch();
      return;
    }
    if (burial || wreck || hist || garden) {
      this.net.bury();
      return;
    }
    if (nearPoint(me.x, me.y, CLEARING_RING.x, CLEARING_RING.y, 64)) {
      this.net.clearing(me.beats.clearing ? "pass" : "keep");
      return;
    }
    const kept = (this.net.snap?.nodes ?? []).find(
      (n) => n.kept && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );
    if (kept && me.messenger === "herald") {
      this.net.announce(kept.id);
      return;
    }
    if (kept && me.messenger === "dweller" && !me.beats.dwell) {
      this.net.dwell(kept.id);
      return;
    }
    const live = (this.net.snap?.nodes ?? []).find(
      (n) => !n.depleted && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );
    if (live && me.messenger === "cybernetic" && !me.beats.cyber) {
      this.net.cyber(live.id);
      return;
    }
    if (nearPoint(me.x, me.y, M3_DOOR.x, M3_DOOR.y, 56)) {
      this.net.m3();
      return;
    }
    if (nearPoint(me.x, me.y, CARE_DOOR.x, CARE_DOOR.y, 56)) {
      this.net.care();
      return;
    }
    if (movementReady(me.beats) && nearPoint(me.x, me.y, GOING_UNDER.x, GOING_UNDER.y, 56)) {
      this.net.goingUnder();
    }
  }

  private flashStrike(heavy = false) {
    const me = this.net.you;
    if (!me || !this.textures.exists("fx-strike")) return;
    const fx = this.add
      .image(me.x, me.y - 8, "fx-strike")
      .setDisplaySize(heavy ? 96 : 72, heavy ? 96 : 72)
      .setDepth(20)
      .setAlpha(0.95);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: heavy ? 1.6 : 1.35,
      duration: heavy ? 220 : 160,
      onComplete: () => fx.destroy(),
    });
  }

  private bodyFor(p: Player): Phaser.GameObjects.Image {
    let img = this.bodies.get(p.id);
    if (!img) {
      const key = !p.guest && this.textures.exists("angel") ? "angel" : "guest";
      img = this.add.image(p.x, p.y, key).setDisplaySize(48, 64).setDepth(10);
      this.bodies.set(p.id, img);
    }
    return img;
  }

  private syncNodes(nodes: YieldNode[]) {
    for (const n of nodes) {
      let g = this.nodeMarks.get(n.id);
      if (!g) {
        g = this.add.circle(n.x, n.y, 14, 0x88a0c8, 0.28).setDepth(3);
        this.add.image(n.x, n.y - 6, "prop-crt").setDisplaySize(44, 48).setDepth(4);
        this.nodeMarks.set(n.id, g);
      }
      const announced = this.net.snap?.announced === n.id;
      g.setFillStyle(announced ? 0x7eb6ff : n.kept ? 0xc9a56a : n.depleted ? 0x3a3a3a : 0x88a0c8, 0.9);
    }
  }

  private syncRites() {
    const rites = this.net.snap?.rites ?? [];
    for (const r of rites) {
      let g = this.riteMarks.get(r.id);
      if (!g) {
        g = this.add.circle(r.x, r.y, r.kind === "going-under" ? 18 : 12, 0x7a1028, 0.55).setDepth(4);
        const label = r.kind === "going-under" ? "GOING-UNDER" : r.kind === "garden" ? "WRECKAGE GARDEN" : "BURIAL";
        this.add
          .text(r.x, r.y + 22, label, {
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "10px",
            color: "#c9a56a",
          })
          .setOrigin(0.5)
          .setDepth(5);
        this.riteMarks.set(r.id, g);
      }
      if (r.kind === "burial") g.setFillStyle(r.done ? 0xc9a56a : 0x7a1028, 0.8);
      else if (r.kind === "garden") g.setFillStyle(r.done ? 0xc9a56a : 0x7a1028, 0.85);
      else g.setFillStyle(r.done ? 0x7eb6ff : 0xc9a56a, 0.85);
    }
  }

  private syncClerks() {
    const clerks = this.net.snap?.clerks ?? [];
    const seen = new Set<string>();
    for (const c of clerks) {
      seen.add(c.id);
      let img = this.clerkMarks.get(c.id);
      if (!img) {
        img = this.add.image(c.x, c.y, "clerk").setDisplaySize(48, 60).setDepth(8);
        const nm = this.add
          .text(c.x, c.y - 28, c.name, {
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "10px",
            color: "#e8e8e8",
          })
          .setOrigin(0.5)
          .setDepth(9);
        this.clerkMarks.set(c.id, img);
        this.clerkNames.set(c.id, nm);
      }
      img.setTint(c.hp < 20 ? 0xff2d6b : 0xffffff);
      let ring = this.clerkTele.get(c.id);
      if (c.telegraph > 0) {
        if (!ring) {
          ring = this.add.circle(c.x, c.y, 28, 0xff2d6b, 0.25).setDepth(7);
          this.clerkTele.set(c.id, ring);
        }
        ring.setVisible(true);
      } else if (ring) {
        ring.setVisible(false);
      }
    }
    for (const [id, img] of this.clerkMarks) {
      if (!seen.has(id)) {
        img.destroy();
        this.clerkMarks.delete(id);
        this.clerkTele.get(id)?.destroy();
        this.clerkTele.delete(id);
        this.clerkNames.get(id)?.destroy();
        this.clerkNames.delete(id);
      }
    }
  }

  private syncPois() {
    for (const poi of this.net.snap?.pois ?? []) {
      let g = this.poiMarks.get(poi.id);
      if (!g) {
        g = this.add.circle(poi.x, poi.y, 14, 0x5a5a5a, 0.7).setDepth(4);
        this.poiMarks.set(poi.id, g);
      }
      const fill =
        poi.kind === "named-weather"
          ? 0xc9a56a
          : poi.kind === "weather-people"
            ? 0xc9a56a
          : poi.kind === "house-hall"
            ? 0xc9a56a
            : poi.kind === "safety-frozen"
              ? 0x7eb6ff
              : poi.kind === "safety-annex-home"
                ? 0xc9a56a
              : poi.kind === "annex-route"
                ? 0x5a5a5a
              : poi.kind === "safety-annex"
                ? 0xe8e8e8
              : poi.kind === "clearing-listed"
                ? 0x7eb6ff
              : poi.kind === "stall-dark"
                ? 0xc9a56a
              : poi.kind === "stall-glamour"
                ? 0x7eb6ff
            : poi.kind === "care-open"
              ? 0x7eb6ff
              : poi.kind === "operator-desk"
                ? 0xc9a56a
                : poi.kind === "operator-vacant"
                  ? 0x5a5a5a
                : poi.kind === "operator-no-god"
                  ? 0xc9a56a
                : poi.kind === "organ-foundry-earth"
                  ? 0xc9a56a
                : poi.kind === "organ-foundry-dark"
                  ? 0x3a3a3a
                : poi.kind === "m3-open"
                  ? 0xff2d6b
                  : poi.kind === "m3-shut"
                    ? 0x3a3a3a
                    : poi.kind === "blitz-trace"
                      ? 0x7eb6ff
                    : poi.kind === "storm-back"
                      ? 0x7a1028
                    : poi.kind === "storm-progress"
                      ? 0x7eb6ff
                    : poi.kind === "hit-stop"
                      ? 0x7eb6ff
                    : poi.kind === "addressed"
                      ? 0xc9a56a
                    : poi.kind === "wink-seed"
                      ? 0xc9a56a
                    : poi.kind === "process-read"
                      ? 0x7eb6ff
                    : poi.kind === "clearing-seed"
                      ? 0xc9a56a
                    : poi.kind === "wreckage-garden"
                      ? 0x7a1028
                      : poi.kind === "claims-desk"
                          ? 0xffffff
                      : poi.kind === "claims-vault"
                          ? 0xc9a56a
                      : poi.kind === "wet-grid"
                          ? 0x7eb6ff
                      : poi.kind === "wet-grid-season"
                          ? 0x7eb6ff
                      : poi.kind === "wet-grid-bracket"
                          ? 0x7eb6ff
                      : poi.kind === "wet-grid-cult"
                          ? 0xc9a56a
                      : poi.kind === "wet-people"
                          ? 0xc9a56a
                      : poi.kind === "yield-empty"
                        ? 0x5a5a5a
                      : poi.kind === "ione-gone"
                        ? 0x7a1028
                      : poi.kind === "ione-people"
                        ? 0xc9a56a
                      : poi.kind === "lastword-people"
                        ? 0xc9a56a
                      : poi.kind === "duel-people"
                        ? 0xc9a56a
                      : poi.kind === "camp-people"
                        ? 0xc9a56a
                      : poi.kind === "passing-people"
                        ? 0xc9a56a
                      : poi.kind === "claims-people"
                        ? 0xc9a56a
                      : poi.kind === "file-people"
                        ? 0xc9a56a
                      : poi.kind === "stormpress-people"
                        ? 0xc9a56a
                      : poi.kind === "fallen-people"
                        ? 0xc9a56a
                      : poi.kind === "spoils-people"
                        ? 0xc9a56a
                      : poi.kind === "unflag-people"
                        ? 0xc9a56a
                      : poi.kind === "seconds-people"
                        ? 0xc9a56a
                      : poi.kind === "street-people"
                        ? 0xc9a56a
                      : poi.kind === "grief-people"
                        ? 0xc9a56a
                      : poi.kind === "kit-people"
                        ? 0xc9a56a
                      : poi.kind === "practice-people"
                        ? 0xc9a56a
                      : poi.kind === "dummy-people"
                        ? 0xc9a56a
                      : poi.kind === "geared-people"
                        ? 0xc9a56a
                      : poi.kind === "serial-people"
                        ? 0xc9a56a
                      : poi.kind === "band-people"
                        ? 0xc9a56a
                      : poi.kind === "number-people"
                        ? 0xc9a56a
                      : poi.kind === "skill-people"
                        ? 0xc9a56a
                      : poi.kind === "trait-people"
                        ? 0xc9a56a
                      : poi.kind === "token-people"
                        ? 0xc9a56a
                      : poi.kind === "fair-people"
                        ? 0xc9a56a
                      : poi.kind === "visible-people"
                        ? 0xc9a56a
                      : poi.kind === "aura-people"
                        ? 0xc9a56a
                      : poi.kind === "presence-people"
                        ? 0xc9a56a
                      : poi.kind === "wink-people"
                        ? 0xc9a56a
                      : poi.kind === "bestand-people"
                        ? 0xc9a56a
                      : poi.kind === "cult-people"
                        ? 0xc9a56a
                      : poi.kind === "copy-people"
                        ? 0xc9a56a
                      : poi.kind === "banked-people"
                        ? 0xc9a56a
                      : poi.kind === "unbanked-people"
                        ? 0xc9a56a
                      : poi.kind === "sink-people"
                        ? 0xc9a56a
                      : poi.kind === "yield-people"
                        ? 0xc9a56a
                      : poi.kind === "tax-people"
                        ? 0xc9a56a
                      : poi.kind === "gestell-people"
                        ? 0xc9a56a
                      : poi.kind === "climate-people"
                        ? 0xc9a56a
                      : poi.kind === "extract-people"
                        ? 0xc9a56a
                      : poi.kind === "max-people"
                        ? 0xc9a56a
                      : poi.kind === "heat-people"
                        ? 0xc9a56a
                      : poi.kind === "fat-people"
                        ? 0xc9a56a
                      : poi.kind === "poor-people"
                        ? 0xc9a56a
                      : poi.kind === "block-people"
                        ? 0xc9a56a
                      : poi.kind === "solo-people"
                        ? 0xc9a56a
                      : poi.kind === "dwell-people"
                        ? 0xc9a56a
                      : poi.kind === "trace-people"
                        ? 0xc9a56a
                      : poi.kind === "fail-people"
                        ? 0xc9a56a
                      : poi.kind === "hole-people"
                        ? 0xc9a56a
                      : poi.kind === "stipend-people"
                        ? 0xc9a56a
                      : poi.kind === "hijack-people"
                        ? 0xc9a56a
                      : poi.kind === "absence-people"
                        ? 0xc9a56a
                      : poi.kind === "wait-people"
                        ? 0xc9a56a
                      : poi.kind === "stay-people"
                        ? 0xc9a56a
                      : poi.kind === "willing-people"
                        ? 0xc9a56a
                      : poi.kind === "empty-people"
                        ? 0xc9a56a
                      : poi.kind === "walked-people"
                        ? 0xc9a56a
                      : poi.kind === "leave-people"
                        ? 0xc9a56a
                      : poi.kind === "kept-people"
                        ? 0xc9a56a
                      : poi.kind === "hold-people"
                        ? 0xc9a56a
                      : poi.kind === "capped-people"
                        ? 0xc9a56a
                      : poi.kind === "prayer-people"
                        ? 0xc9a56a
                      : poi.kind === "sold-people"
                        ? 0xc9a56a
                      : poi.kind === "unlit-people"
                        ? 0xc9a56a
                      : poi.kind === "live-people"
                        ? 0xc9a56a
                      : poi.kind === "blind-people"
                        ? 0xc9a56a
                      : poi.kind === "hour-people"
                        ? 0xc9a56a
                      : poi.kind === "names-people"
                        ? 0xc9a56a
                      : poi.kind === "residual-people"
                        ? 0xc9a56a
                      : poi.kind === "equal-people"
                        ? 0xc9a56a
                      : poi.kind === "addressed-people"
                        ? 0xc9a56a
                      : poi.kind === "back-people"
                        ? 0xc9a56a
                      : poi.kind === "seed-people"
                        ? 0xc9a56a
                      : poi.kind === "invite-people"
                        ? 0xc9a56a
                      : poi.kind === "parted-people"
                        ? 0xc9a56a
                      : poi.kind === "together-people"
                        ? 0xc9a56a
                      : poi.kind === "gather-people"
                        ? 0xc9a56a
                      : poi.kind === "clinic-people"
                        ? 0xc9a56a
                      : poi.kind === "paper-people"
                        ? 0xc9a56a
                      : poi.kind === "frame-people"
                        ? 0xc9a56a
                      : poi.kind === "observer-people"
                        ? 0xc9a56a
                      : poi.kind === "participant-people"
                        ? 0xc9a56a
                      : poi.kind === "proximity-people"
                        ? 0xc9a56a
                      : poi.kind === "enter-people"
                        ? 0xc9a56a
                      : poi.kind === "refuse-people"
                        ? 0xc9a56a
                      : poi.kind === "collective-people"
                        ? 0xc9a56a
                      : poi.kind === "studios-people"
                        ? 0xc9a56a
                      : poi.kind === "film-people"
                        ? 0xc9a56a
                      : poi.kind === "director-people"
                        ? 0xc9a56a
                      : poi.kind === "disarmed-people"
                        ? 0xc9a56a
                      : poi.kind === "guest-people"
                        ? 0xc9a56a
                      : poi.kind === "supply-people"
                        ? 0xc9a56a
                      : poi.kind === "combat-people"
                        ? 0xc9a56a
                      : poi.kind === "earn-people"
                        ? 0xc9a56a
                      : poi.kind === "angel-people"
                        ? 0xc9a56a
                      : poi.kind === "messenger-people"
                        ? 0xc9a56a
                      : poi.kind === "link-people"
                        ? 0xc9a56a
                      : poi.kind === "perception-people"
                        ? 0xc9a56a
                      : poi.kind === "nara-gone"
                        ? 0x7a1028
                      : poi.kind === "nara-person"
                        ? 0xc9a56a
                      : poi.kind === "quill-person"
                        ? 0x7a1028
                      : poi.kind === "ord-person"
                        ? 0x7a1028
                      : poi.kind === "vesper-person"
                        ? 0x7eb6ff
                      : poi.kind === "party-walk"
                        ? 0x7eb6ff
                      : poi.kind === "party-parted"
                        ? 0x7eb6ff
                      : poi.kind === "heavy"
                        ? 0x7eb6ff
                      : poi.kind === "truce"
                        ? 0x7eb6ff
                      : poi.kind === "stall-handoff"
                        ? 0xc9a56a
                      : poi.kind === "care-people"
                        ? 0xc9a56a
                      : poi.kind === "shrine-people"
                        ? 0xc9a56a
                      : poi.kind === "safety-people"
                        ? 0xc9a56a
                      : poi.kind === "desk-people"
                        ? 0xc9a56a
                      : poi.kind === "hall-people"
                        ? 0xc9a56a
                      : poi.kind === "clearing-people"
                        ? 0xc9a56a
                      : poi.kind === "stall-people"
                        ? 0xc9a56a
                      : poi.kind === "foundry-people"
                        ? 0xc9a56a
                      : poi.kind === "strait-people"
                        ? 0xc9a56a
                      : poi.kind === "cable-people"
                        ? 0xc9a56a
                      : poi.kind === "organs-people"
                        ? 0xc9a56a
                      : poi.kind === "vesper-people"
                        ? 0xc9a56a
                      : poi.kind === "m3-people"
                        ? 0xc9a56a
                      : poi.kind === "screening-people"
                        ? 0xc9a56a
                      : poi.kind === "annex-people"
                        ? 0xc9a56a
                      : poi.kind === "under-people"
                        ? 0xc9a56a
                      : poi.kind === "garden-people"
                        ? 0xc9a56a
                      : poi.kind === "burial-people"
                        ? 0xc9a56a
                      : poi.kind === "nave-people"
                        ? 0xc9a56a
                      : poi.kind === "credits-people"
                        ? 0xc9a56a
                      : poi.kind === "still-people"
                        ? 0xc9a56a
                      : poi.kind === "season-people"
                        ? 0xc9a56a
                      : poi.kind === "bracket-people"
                        ? 0xc9a56a
                      : poi.kind === "log-people"
                        ? 0xc9a56a
                      : poi.kind === "founder-people"
                        ? 0xc9a56a
                      : poi.kind === "rooms-people"
                        ? 0xc9a56a
                      : poi.kind === "storm-people"
                        ? 0xc9a56a
                      : poi.kind === "vesper-gone"
                        ? 0x7a1028
                      : poi.kind === "party-blind"
                        ? 0x7eb6ff
                      : poi.kind === "guest-arena"
                        ? 0xe8e8e8
                      : poi.kind === "arena-people"
                        ? 0xe8e8e8
                      : poi.kind === "screening"
                        ? 0x7eb6ff
                      : poi.kind === "screening-participant"
                        ? 0xc9a56a
                      : poi.kind === "screening-founder"
                        ? 0xc9a56a
                      : poi.kind === "screening-log"
                        ? 0xc9a56a
                      : poi.kind === "production-still"
                        ? 0xc9a56a
                      : poi.kind === "ord-gone"
                        ? 0x7a1028
                      : poi.kind === "quill-gone"
                        ? 0x7a1028
                      : poi.kind === "desk-empty"
                        ? 0x5a5a5a
                      : poi.kind === "sexton-mark"
                        ? 0xc9a56a
                      : poi.kind === "fourfold-held"
                        ? 0xc9a56a
                      : poi.kind === "last-god-absent"
                        ? 0xc9a56a
                      : poi.kind === "last-god-buried"
                        ? 0x7a1028
                      : poi.kind === "last-god-unlisted"
                        ? 0xc9a56a
                      : poi.kind === "shrine-restraint"
                        ? 0xc9a56a
                      : poi.kind === "shrine-stance"
                        ? 0x7eb6ff
                      : poi.kind === "house-standing"
                        ? 0xc9a56a
                      : poi.kind === "house-bounty"
                        ? 0xc9a56a
                      : poi.kind === "organ-cable-quiet"
                        ? 0x7eb6ff
                      : poi.kind === "organ-cable-dark"
                        ? 0x3a3a3a
                      : poi.kind === "organ-cable-sky"
                        ? 0x7eb6ff
                      : poi.kind === "organ-strait-refused"
                        ? 0x5a5a5a
                      : poi.kind === "organ-strait-buried"
                        ? 0xc9a56a
                      : poi.kind === "organ-strait-divinities"
                        ? 0x7eb6ff
                      : poi.kind.startsWith("organ-")
                        ? 0xc9a56a
                        : poi.kind === "forge-tray"
                          ? 0xe8d5a3
                          : poi.kind === "clearing-held"
                            ? 0x7eb6ff
                            : poi.kind === "clearing-appear"
                              ? 0xc9a56a
                            : poi.kind === "clearing-credits"
                              ? 0xc9a56a
                            : poi.kind === "clearing-absence"
                              ? 0x7a1028
                            : poi.kind === "clearing-empty"
                              ? 0x7a1028
                            : poi.kind === "clearing-hijack"
                              ? 0x7a1028
                            : poi.kind === "clearing-storm"
                              ? 0x7a1028
                            : poi.kind === "clearing-failed"
                              ? 0x3a3a3a
                            : poi.kind === "clearing-ring"
                              ? 0xc9a56a
            : poi.kind === "care-shut"
                ? 0x3a3a3a
                : 0x5a5a5a;
      g.setFillStyle(fill, 0.85);
    }
    if (this.stallStill) {
      const glam = (this.net.snap?.pois ?? []).some((poi) => poi.kind === "stall-glamour");
      this.stallStill.setTexture(glam ? "stall-surface" : "clearing-stall");
    }
    for (const s of this.net.snap?.signs ?? []) {
      this.drawSign(s);
      this.signLabels.get(s.id)?.setText(s.title);
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
      if (p.id === me.id && this.textures.exists("fx-aura")) {
        if (!this.auraImg) {
          this.auraImg = this.add.image(img.x, img.y, "fx-aura").setDisplaySize(78, 78).setDepth(8).setAlpha(0.5);
        }
        this.auraImg.setPosition(img.x, img.y + 4);
        this.auraImg.setVisible(!p.guest);
      }
    }
    for (const [id, img] of this.bodies) {
      if (!seen.has(id)) {
        img.destroy();
        this.bodies.delete(id);
      }
    }

    this.syncNodes(snap.nodes);
    this.syncRites();
    this.syncClerks();
    this.syncPois();
    this.syncNpcs();
    const ioneImg = this.npcMarks.get(IONE.id);
    if (ioneImg) ioneImg.setVisible(!snap.ioneGone);
    this.npcNames.get(IONE.id)?.setVisible(!snap.ioneGone);
    const wreckSeen = new Set<string>();
    for (const r of snap.wreckage) {
      wreckSeen.add(r.id);
      if (this.textures.exists("fx-wreckage")) {
        let img = this.wreckImgs.get(r.id);
        if (!img) {
          img = this.add.image(r.x, r.y, "fx-wreckage").setDisplaySize(36, 44).setDepth(6);
          this.wreckImgs.set(r.id, img);
        } else img.setPosition(r.x, r.y);
      } else {
        let m = this.wreckMarks.get(r.id);
        if (!m) {
          m = this.add.circle(r.x, r.y, 10, 0xff2d6b, 0.7).setDepth(6);
          this.wreckMarks.set(r.id, m);
        }
      }
    }
    if (me.messenger === "witness" || me.beats.blitz) {
      for (const r of snap.blitzMarks ?? []) {
        wreckSeen.add(`blitz-${r.id}`);
        let m = this.wreckMarks.get(`blitz-${r.id}`);
        if (!m) {
          m = this.add.circle(r.x, r.y, 7, 0x7eb6ff, 0.55).setDepth(6);
          this.wreckMarks.set(`blitz-${r.id}`, m);
        }
      }
    }
    for (const [id, m] of this.wreckMarks) {
      if (!wreckSeen.has(id)) {
        m.destroy();
        this.wreckMarks.delete(id);
      }
    }
    for (const [id, img] of this.wreckImgs) {
      if (!wreckSeen.has(id)) {
        img.destroy();
        this.wreckImgs.delete(id);
      }
    }
    const histSeen = new Set<string>();
    for (const h of visibleHistory(me.guest, me.serial, snap.history ?? [], me.storm || me.ruinBack)) {
      histSeen.add(h.id);
      let img = this.histMarks.get(h.id);
      if (!img) {
        img = this.add.image(h.x, h.y, "serial-wreckage").setDisplaySize(48, 48).setDepth(6);
        this.histMarks.set(h.id, img);
      }
    }
    for (const [id, img] of this.histMarks) {
      if (!histSeen.has(id)) {
        img.destroy();
        this.histMarks.delete(id);
      }
    }
    const failSeen = new Set<string>();
    for (const f of visibleFailed(me.guest, me.serial, snap.failed ?? [], me.house, me.storm || me.ruinBack)) {
      failSeen.add(f.id);
      let img = this.failMarks.get(f.id);
      if (!img) {
        img = this.add.image(f.x, f.y, "failed-passing").setDisplaySize(56, 32).setDepth(6);
        this.failMarks.set(f.id, img);
      }
    }
    for (const [id, img] of this.failMarks) {
      if (!failSeen.has(id)) {
        img.destroy();
        this.failMarks.delete(id);
      }
    }

    const npcNear = (snap.npcs ?? [...NAVE_NPCS, IONE]).find((n) => nearPoint(me.x, me.y, n.x, n.y));
    const burial = snap.rites.find((r) => r.kind === "burial" && !r.done && nearPoint(me.x, me.y, r.x, r.y));
    const sign = (snap.signs ?? NAVE_SIGNS).find((s) => nearPoint(me.x, me.y, s.x, s.y, 56));
    const clerkNear = snap.clerks.find((c) => nearPoint(me.x, me.y, c.x, c.y, 70));
    const under = nearPoint(me.x, me.y, GOING_UNDER.x, GOING_UNDER.y, 56);
    const care = nearPoint(me.x, me.y, CARE_DOOR.x, CARE_DOOR.y, 56);
    const hall = nearPoint(me.x, me.y, HOUSE_HALL.x, HOUSE_HALL.y, 56);
    const annex = nearPoint(me.x, me.y, SAFETY_ANNEX.x, SAFETY_ANNEX.y, 56);
    const stall = nearPoint(me.x, me.y, CLEARING_STALL.x, CLEARING_STALL.y, 56);
    const wet = inWetGrid(me.x, me.y);
    const arena = nearPoint(me.x, me.y, GUEST_ARENA.x, GUEST_ARENA.y, 56);
    const screening = nearPoint(me.x, me.y, SCREENING.x, SCREENING.y, 56);
    const still = nearPoint(me.x, me.y, STILL.x, STILL.y, 56);
    const deskClaim = nearPoint(me.x, me.y, CLAIMS_DESK.x, CLAIMS_DESK.y, 56);
    const forge =
      nearPoint(me.x, me.y, FORGE_TRAY.x, FORGE_TRAY.y, 64) ||
      (npcNear?.id === "quill" && me.beats.market);
    const desk = nearPoint(me.x, me.y, OPERATOR_DESK.x, OPERATOR_DESK.y, 56);
    const m3 = nearPoint(me.x, me.y, M3_DOOR.x, M3_DOOR.y, 56);
    const gardenNear = snap.rites.find((r) => r.kind === "garden" && nearPoint(me.x, me.y, r.x, r.y, 56));
    const strait = nearPoint(me.x, me.y, ORGAN_STRAIT.x, ORGAN_STRAIT.y, 56);
    const foundry = nearPoint(me.x, me.y, ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y, 56);
    const cable = nearPoint(me.x, me.y, ORGAN_CABLE.x, ORGAN_CABLE.y, 56);
    const histNear = visibleHistory(me.guest, me.serial, snap.history ?? [], me.storm || me.ruinBack).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const failNear = visibleFailed(me.guest, me.serial, snap.failed ?? [], me.house, me.storm || me.ruinBack).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const ring = nearPoint(me.x, me.y, CLEARING_RING.x, CLEARING_RING.y, 64);
    const nearNode = snap.nodes.find(
      (n) => !n.depleted && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );
    const keptNear = snap.nodes.find(
      (n) => n.kept && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );
    const wreckNear = snap.wreckage.find((r) => nearPoint(me.x, me.y, r.x, r.y, 72));
    const funeralNear = snap.wreckage.find((r) => nearPoint(me.x, me.y, r.x, r.y, 56));
    const shrine = nearPoint(me.x, me.y, SHRINE.x, SHRINE.y, 56);
    const weatherPlaque = nearPoint(me.x, me.y, 192, 340, 56);
    const ioneGoneNear = !!(snap.ioneGone && nearPoint(me.x, me.y, IONE.x, IONE.y, 56));

    const mateNear = snap.players.find(
      (o) => o.id !== me.id && !o.guest && nearPoint(me.x, me.y, o.x, o.y, 56),
    );
    if (weatherPlaque && (me.beats.navePeople || snap.navePeopleHeld)) {
      this.prompt = me.heard || "The Nave — people. Extract still costs. Not a stick.";
    } else if (weatherPlaque && snap.weatherPeopleHeld && !me.guest) {
      this.prompt = "F — gather the Nave as people. Extract still costs. Not a fetch.";
    } else if (weatherPlaque && (me.beats.weatherPeople || snap.weatherPeopleHeld)) {
      this.prompt = me.heard || "Weather — people. Speak with the living to name it. Not a stick.";
    } else if (weatherPlaque && snap.burialPeopleHeld && !me.guest) {
      this.prompt = "F — the weather as a house of people. Speak with the living to name it. Not a fetch.";
    } else if (me.partyOf && !me.guest) {
      this.prompt = "F — part the hour. The walk ends. Not a stick.";
    } else if (mateNear && me.flagged && mateNear.flagged && !me.guest) {
      this.prompt =
        me.beats.trucePeople || snap.trucePeopleHeld
          ? me.heard || "Truce — people. Both unflag. Spoils stay. Seconds, not a stick."
        : snap.flagPeopleHeld
          ? "F — the truce as a house of people. Both unflag. Spoils stay. Not a fetch."
        : me.beats.truce || snap.truceHeld
          ? me.heard || "Truce. Both unflag. Spoils stay. Seconds, not a stick."
          : "F — truce. Both unflag. Spoils stay. Not a stick.";
    } else if (mateNear && (me.beats.party || snap.partyHeld) && !me.partyOf) {
      this.prompt = me.heard || "You walk the hour together. A party, not a stick.";
    } else if (mateNear && snap.weatherNamed && !me.guest) {
      this.prompt = "F — ask them to walk the hour. A party, not a stick.";
    } else if (still && (me.guest || me.locked)) {
      this.prompt = "A still. You do not get this Wink.";
    } else if (still && (me.beats.stillPeople || snap.stillPeopleHeld)) {
      this.prompt = me.heard || "The still — people. Optional Wink still optional. Not a stick.";
    } else if (still && snap.creditsPeopleHeld && !me.guest) {
      this.prompt = "F — the still as a house of people. Optional Wink still optional. Not a fetch.";
    } else if (still && (snap.stillHeld || me.beats.still)) {
      this.prompt = me.heard || "Production still. Same hour. Your Wink. Combat is not.";
    } else if (still && (me.beats.participant || snap.participantHeld)) {
      this.prompt = "F — optional production still. Same hour, your Wink. Not a stick.";
    } else if (still) {
      this.prompt = "A still. Participant first. Optional.";
    } else if (screening && (me.guest || me.locked)) {
      this.prompt = "A screen. You do not get the dispatch.";
    } else if (screening && (me.beats.roomsPeople || snap.roomsPeopleHeld)) {
      this.prompt = me.heard || "The rooms — people. Proximity still holds. Not a stick.";
    } else if (screening && snap.founderPeopleHeld && !me.guest) {
      this.prompt = "F — gather the rooms as people. Observer, Participant, Founder. Not a fetch.";
    } else if (screening && (me.beats.founderPeople || snap.founderPeopleHeld)) {
      this.prompt = me.heard || "Founder — people. Proximity still holds. Not a stick.";
    } else if (screening && snap.logPeopleHeld && !me.guest) {
      this.prompt = "F — Founder as a house of people. Proximity still holds. Not a fetch.";
    } else if (screening && (me.beats.logPeople || snap.logPeopleHeld)) {
      this.prompt = me.heard || "The log — people. Uniqueness still a log. Not a stick.";
    } else if (screening && snap.bracketPeopleHeld && !me.guest) {
      this.prompt = "F — the history log as a house of people. Uniqueness still a log. Not a fetch.";
    } else if (screening && (me.beats.screeningPeople || snap.screeningPeopleHeld)) {
      this.prompt = me.heard || "Dispatch — people. Observer proximity. Not a stick.";
    } else if (screening && snap.m3PeopleHeld && !me.guest) {
      this.prompt = "F — the screening as a house of people. Dispatch still observer. Not a fetch.";
    } else if (screening && (me.beats.log || snap.logHeld)) {
      this.prompt = me.heard || "History log. Passings. Buried. Looted. Houses. Not a stick.";
    } else if (screening && (me.beats.founder || snap.founderHeld) && me.messenger === "ruin-angel") {
      this.prompt = "F — read the history log. Uniqueness as a log. Not a stick.";
    } else if (screening && (me.beats.founder || snap.founderHeld)) {
      this.prompt = me.heard || "Founder room. Clearing watches. Passing rites. Credits. Not a stick.";
    } else if (screening && (me.beats.participant || snap.participantHeld) && (snap.creditsHeld || me.beats.credits || snap.appearWorld)) {
      this.prompt = "F — Founder room. Credits named the hour. Clearing watches. Not a stick.";
    } else if (screening && (me.beats.participant || snap.participantHeld)) {
      this.prompt = me.heard || "Participant room. You went under. A room, not a stick.";
    } else if (screening && (snap.screeningHeld || me.beats.screening) && me.beats.under) {
      this.prompt = "F — Participant room. You went under. Proximity, not a stick.";
    } else if (screening && (snap.screeningHeld || me.beats.screening)) {
      this.prompt = me.heard || "Dispatch. Public screening. The Last God is a room, not a stick.";
    } else if (screening) {
      this.prompt = "F — take the public screening. Observer proximity. Not a stick.";
    } else if (arena && (me.beats.dummyPeople || snap.dummyPeopleHeld)) {
      this.prompt = me.heard || "Dummy — people. The dummy still pays nothing. Guests are not loot. Not a stick.";
    } else if (arena && snap.practicePeopleHeld && !me.guest) {
      this.prompt = "F — the dummy as a house of people. The dummy still pays nothing. Not a fetch.";
    } else if (arena && (me.beats.practicePeople || snap.practicePeopleHeld)) {
      this.prompt = me.heard || "Practice — people. The dummy still pays nothing. Guests are not loot. Not a stick.";
    } else if (arena && snap.kitPeopleHeld && !me.guest) {
      this.prompt = "F — practice as a house of people. The dummy still pays nothing. Not a fetch.";
    } else if (arena && (me.beats.kitPeople || snap.kitPeopleHeld)) {
      this.prompt = me.heard || "Kit — people. Same number. Serials do not buy damage. Not a stick.";
    } else if (arena && snap.griefPeopleHeld && !me.guest) {
      this.prompt = "F — the kit as a house of people. Same number. Serials do not buy damage. Not a fetch.";
    } else if (arena && (me.beats.griefPeople || snap.griefPeopleHeld)) {
      this.prompt = me.heard || "Grief — people. Protocol still rejects. Guests are not loot. Not a stick.";
    } else if (arena && snap.streetPeopleHeld && !me.guest) {
      this.prompt = "F — grief as a house of people. Protocol still rejects. Guests are not loot. Not a fetch.";
    } else if (arena && (me.beats.hitStopPeople || snap.hitStopPeopleHeld)) {
      this.prompt = me.heard || "Hit-stop — people. The hit still holds. You did not strike harder. Not a stick.";
    } else if (arena && snap.heavyPeopleHeld && !me.guest) {
      this.prompt = "F — hit-stop as a house of people. The hit still holds. Not a fetch.";
    } else if (arena && (me.beats.heavyPeople || snap.heavyPeopleHeld)) {
      this.prompt = me.heard || "Heavy — people. Same number. Telegraph still drops. Not a stick.";
    } else if (arena && snap.dodgePeopleHeld && !me.guest) {
      this.prompt = "F — heavy as a house of people. Same number. Telegraph still drops. Not a fetch.";
    } else if (arena && (me.beats.arenaPeople || snap.arenaPeopleHeld)) {
      this.prompt = me.heard || "Arena — people. Practice still has no spoils. Not a stick.";
    } else if (arena && snap.annexPeopleHeld && !me.guest) {
      this.prompt = "F — the arena as a house of people. Practice still has no spoils. Not a fetch.";
    } else if (arena && (snap.arenaHeld || me.beats.arena)) {
      this.prompt = me.heard || "Guest arena. Click strike the dummy. Practice. No spoils.";
    } else if (arena) {
      this.prompt = "F — open the guest arena. Practice. No spoils. Guests are not loot.";
    } else if (deskClaim && (me.guest || me.locked)) {
      this.prompt = "A period on a ledger. Guests cannot claim.";
    } else if (deskClaim && (me.beats.bankPeople || snap.bankPeopleHeld)) {
      this.prompt = me.heard || "Bank — people. Banked still does not drop. TAKE stays disarmed. Not a stick.";
    } else if (deskClaim && snap.takePeopleHeld && !me.guest) {
      this.prompt = "F — the vault as a house of people. Banked still does not drop. TAKE stays disarmed. Not a fetch.";
    } else if (deskClaim && (me.beats.takePeople || snap.takePeopleHeld)) {
      this.prompt = me.heard || "TAKE — people. TAKE stays disarmed. No Base. Not a stick.";
    } else if (deskClaim && snap.filePeopleHeld && !me.guest) {
      this.prompt = "F — TAKE as a house of people. TAKE stays disarmed. No Base. Not a fetch.";
    } else if (deskClaim && (me.beats.filePeople || snap.filePeopleHeld)) {
      this.prompt = me.heard || "File — people. File still sits. TAKE stays disarmed. Not a stick.";
    } else if (deskClaim && snap.claimsPeopleHeld && !me.guest) {
      this.prompt = "F — filing as a house of people. File still sits. TAKE stays disarmed. Not a fetch.";
    } else if (deskClaim && (me.beats.claimsPeople || snap.claimsPeopleHeld)) {
      this.prompt = me.heard || "Claims — people. TAKE stays disarmed. The token does not strike.";
    } else if (deskClaim && snap.passingPeopleHeld && !me.guest) {
      this.prompt = "F — the claims desk as a house of people. TAKE stays disarmed. Not a fetch.";
    } else if (deskClaim && (me.beats.vaultPeople || snap.vaultPeopleHeld)) {
      this.prompt = me.heard || "The vault — people. File still sits. TAKE stays disarmed.";
    } else if (deskClaim && snap.handoffPeopleHeld && !me.guest) {
      this.prompt = "F — the vault as a house of people. File still sits. TAKE stays disarmed. Not a fetch.";
    } else if (deskClaim && (me.beats.deskPeople || snap.deskPeopleHeld)) {
      this.prompt = me.heard || "DESK — people. F file (not a yield). E TAKE is disarmed. No Base.";
    } else if (deskClaim && snap.safetyPeopleHeld && !me.guest) {
      this.prompt = "F — the desk will not price people. TAKE stays disarmed. Not a fetch.";
    } else if (deskClaim) {
      this.prompt = me.heard
        || (snap.deskVaulted
          ? "Q bank unbanked. F file a claim (not a yield). E TAKE is disarmed. No Base."
          : "Q bank unbanked (vault). F file a claim (not a yield). E TAKE is disarmed. No Base.");
    } else if (wet && (me.guest || me.locked)) {
      this.prompt = "A wet street. You are not flagged. You are not spoils.";
    } else if (wet && (me.beats.perceptionPeople || snap.perceptionPeopleHeld)) {
      this.prompt = me.heard || "Perception — people. Traits change verbs and style, not damage. Not a stick.";
    } else if (wet && snap.linkPeopleHeld && !me.guest) {
      this.prompt = "F — perception as a house of people. Traits change verbs and style, not damage. Not a fetch.";
    } else if (wet && (me.beats.linkPeople || snap.linkPeopleHeld)) {
      this.prompt = me.heard || "Link — people. Serial still seeds aura. Guests stay aura 0. Not a stick.";
    } else if (wet && snap.messengerPeopleHeld && !me.guest) {
      this.prompt = "F — the mock link as a house of people. Serial still seeds aura. Guests stay aura 0. Not a fetch.";
    } else if (wet && (me.beats.messengerPeople || snap.messengerPeopleHeld)) {
      this.prompt = me.heard || "Messenger — people. Angels hint. Perception, not combat. Not a stick.";
    } else if (wet && snap.angelPeopleHeld && !me.guest) {
      this.prompt = "F — the messenger as a house of people. Angels hint. Perception, not combat. Not a fetch.";
    } else if (wet && (me.beats.angelPeople || snap.angelPeopleHeld)) {
      this.prompt = me.heard || "Angel — people. One of 7,777. Guests cannot claim. Not a stick.";
    } else if (wet && snap.earnPeopleHeld && !me.guest) {
      this.prompt = "F — the Angel as a house of people. One of 7,777. Guests cannot claim. Not a fetch.";
    } else if (wet && (me.beats.earnPeople || snap.earnPeopleHeld)) {
      this.prompt = me.heard || "Earn — people. Only a linked Angel can file. Guests cannot claim. TAKE stays disarmed. Not a stick.";
    } else if (wet && snap.combatPeopleHeld && !me.guest) {
      this.prompt = "F — the earn license as a house of people. Only a linked Angel can file. Guests cannot claim. Not a fetch.";
    } else if (wet && (me.beats.combatPeople || snap.combatPeopleHeld)) {
      this.prompt = me.heard || "Combat — people. Damage stays equal. The token does not strike. Not a stick.";
    } else if (wet && snap.supplyPeopleHeld && !me.guest) {
      this.prompt = "F — combat as a house of people. Damage stays equal. The token does not strike. Not a fetch.";
    } else if (wet && (me.beats.supplyPeople || snap.supplyPeopleHeld)) {
      this.prompt = me.heard || "Supply — people. Supply is 7,777. The mint stays disarmed. Not a stick.";
    } else if (wet && snap.guestPeopleHeld && !me.guest) {
      this.prompt = "F — supply as a house of people. Supply is 7,777. The mint stays disarmed. Not a fetch.";
    } else if (wet && (me.beats.guestPeople || snap.guestPeopleHeld)) {
      this.prompt = me.heard || "Guest — people. A guest cannot prepare the ground. Not a stick.";
    } else if (wet && snap.disarmedPeopleHeld && !me.guest) {
      this.prompt = "F — the guest lock as a house of people. A guest cannot prepare the ground. Not a fetch.";
    } else if (wet && (me.beats.disarmedPeople || snap.disarmedPeopleHeld)) {
      this.prompt = me.heard || "Disarmed — people. The mint stays disarmed. TAKE stays disarmed. No Base. Not a stick.";
    } else if (wet && snap.directorPeopleHeld && !me.guest) {
      this.prompt = "F — the mint as a house of people. The mint stays disarmed. TAKE stays disarmed. No Base. Not a fetch.";
    } else if (wet && (me.beats.directorPeople || snap.directorPeopleHeld)) {
      this.prompt = me.heard || "Director — people. Credits still name Lucah Rosenberg-Lee. Not a stick.";
    } else if (wet && snap.filmPeopleHeld && !me.guest) {
      this.prompt = "F — the director as a house of people. Credits still name Lucah Rosenberg-Lee. Not a fetch.";
    } else if (wet && (me.beats.filmPeople || snap.filmPeopleHeld)) {
      this.prompt = me.heard || "Film — people. Credits still name The Last God. Not a stick.";
    } else if (wet && snap.studiosPeopleHeld && !me.guest) {
      this.prompt = "F — the film as a house of people. Credits still name The Last God. Not a fetch.";
    } else if (wet && (me.beats.studiosPeople || snap.studiosPeopleHeld)) {
      this.prompt = me.heard || "Studios — people. Credits still name Reverie Studios. Not a stick.";
    } else if (wet && snap.collectivePeopleHeld && !me.guest) {
      this.prompt = "F — Reverie Studios as a house of people. Credits still name Reverie Studios. Not a fetch.";
    } else if (wet && (me.beats.collectivePeople || snap.collectivePeopleHeld)) {
      this.prompt = me.heard || "Collective — people. Credits still name Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective. Not a stick.";
    } else if (wet && snap.refusePeopleHeld && !me.guest) {
      this.prompt = "F — the Collective as a house of people. Credits still name Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective. Not a fetch.";
    } else if (wet && (me.beats.refusePeople || snap.refusePeopleHeld)) {
      this.prompt = me.heard || "Refuse — people. Observer without credits still cannot enter the Founder room. Not a stick.";
    } else if (wet && snap.enterPeopleHeld && !me.guest) {
      this.prompt = "F — the refusal as a house of people. Observer without credits still cannot enter. Not a fetch.";
    } else if (wet && (me.beats.enterPeople || snap.enterPeopleHeld)) {
      this.prompt = me.heard || "Enter — people. After credits, Participant Angels still enter the Founder room. Observer without credits cannot. Not a stick.";
    } else if (wet && snap.proximityPeopleHeld && !me.guest) {
      this.prompt = "F — entering as a house of people. After credits, Participant Angels still enter. Observer without credits cannot. Not a fetch.";
    } else if (wet && (me.beats.proximityPeople || snap.proximityPeopleHeld)) {
      this.prompt = me.heard || "Proximity — people. After credits, Participant Angels still enter the Founder room. Observer without credits cannot. Not a stick.";
    } else if (wet && snap.participantPeopleHeld && !me.guest) {
      this.prompt = "F — Founder proximity as a house of people. After credits, Participant Angels still enter. Observer without credits cannot. Not a fetch.";
    } else if (wet && (me.beats.participantPeople || snap.participantPeopleHeld)) {
      this.prompt = me.heard || "Participant — people. After a dispatch, Angels who went under still enter. Observer stays Observer until under. Not a stick.";
    } else if (wet && snap.observerPeopleHeld && !me.guest) {
      this.prompt = "F — the Participant room as a house of people. After a dispatch, Angels who went under still enter. Not a fetch.";
    } else if (wet && (me.beats.observerPeople || snap.observerPeopleHeld)) {
      this.prompt = me.heard || "Observer — people. Public screening still takes a dispatch. Observer proximity, not a stick.";
    } else if (wet && snap.framePeopleHeld && !me.guest) {
      this.prompt = "F — Observer proximity as a house of people. Public screening still takes a dispatch. Not a fetch.";
    } else if (wet && (me.beats.framePeople || snap.framePeopleHeld)) {
      this.prompt = me.heard || "Frame — people. Optional F after Participant still takes a school-specific Wink. Not a stick.";
    } else if (wet && snap.paperPeopleHeld && !me.guest) {
      this.prompt = "F — the production still as a house of people. Optional F after Participant still takes a school-specific Wink. Not a fetch.";
    } else if (wet && (me.beats.paperPeople || snap.paperPeopleHeld)) {
      this.prompt = me.heard || "Paper — people. Insurance paper still costs. Death still walks you. Not a revive. Not a stick.";
    } else if (wet && snap.clinicPeopleHeld && !me.guest) {
      this.prompt = "F — insurance paper as a house of people. Paper still costs. Death still walks you. Not a revive. Not a fetch.";
    } else if (wet && (me.beats.clinicPeople || snap.clinicPeopleHeld)) {
      this.prompt = me.heard || "Clinic — people. The Care is not a clinic. Restore still costs. Insurance still costs. Not a stick.";
    } else if (wet && snap.gatherPeopleHeld && !me.guest) {
      this.prompt = "F — the Care as a house of people, not a clinic. Restore still costs. Insurance still costs. Not a fetch.";
    } else if (wet && (me.beats.gatherPeople || snap.gatherPeopleHeld)) {
      this.prompt = me.heard || "Gather — people. When Nara, Quill, Ord, and Vesper stay as people, Ione's hole is still a gathering. Not a stick.";
    } else if (wet && snap.togetherPeopleHeld && !me.guest) {
      this.prompt = "F — the gathering as a house of people. When they stay as people, Ione's hole is still a gathering. Not a fetch.";
    } else if (wet && (me.beats.togetherPeople || snap.togetherPeopleHeld)) {
      this.prompt = me.heard || "Together — people. After named weather the invite still holds. After parting you can walk again. Not a stick.";
    } else if (wet && snap.partedPeopleHeld && !me.guest) {
      this.prompt = "F — walking together as a house of people. After parting you can walk again. Not a fetch.";
    } else if (wet && (me.beats.partedPeople || snap.partedPeopleHeld)) {
      this.prompt = me.heard || "Parted — people. F while walking together still parts the hour. You can walk again. Not a stick.";
    } else if (wet && snap.invitePeopleHeld && !me.guest) {
      this.prompt = "F — parting as a house of people. F while walking together still parts the hour. You can walk again. Not a fetch.";
    } else if (wet && (me.beats.invitePeople || snap.invitePeopleHeld)) {
      this.prompt = me.heard || "Invite — people. After named weather, F near another Angel still asks them to walk the hour. Not a stick.";
    } else if (wet && snap.seedPeopleHeld && !me.guest) {
      this.prompt = "F — the invite as a house of people. After named weather, F near another Angel still asks them to walk the hour. Not a fetch.";
    } else if (wet && (me.beats.seedPeople || snap.seedPeopleHeld)) {
      this.prompt = me.heard || "Seed — people. Palindrome serials still seed a Wink at the prior hour. Then bury. Not a stick.";
    } else if (wet && snap.backPeopleHeld && !me.guest) {
      this.prompt = "F — the palindrome seed as a house of people. Palindrome serials still seed a Wink. Then bury. Not a fetch.";
    } else if (wet && (me.beats.backPeople || snap.backPeopleHeld)) {
      this.prompt = me.heard || "Back — people. Ruin-angel still names the storm at your back without burning readiness. Not a stick.";
    } else if (wet && snap.addressedPeopleHeld && !me.guest) {
      this.prompt = "F — the storm at your back as a house of people. Ruin-angel still names it without burning readiness. Not a fetch.";
    } else if (wet && (me.beats.addressedPeople || snap.addressedPeopleHeld)) {
      this.prompt = me.heard || "Addressed — people. High aura still addresses you after named weather. Low aura stays dark. Not a stick.";
    } else if (wet && snap.equalPeopleHeld && !me.guest) {
      this.prompt = "F — addressing as a house of people. High aura still addresses. Low aura stays dark. Not a fetch.";
    } else if (wet && (me.beats.equalPeople || snap.equalPeopleHeld)) {
      this.prompt = me.heard || "Equal — people. The equalized bracket still shows serials. Serials do not buy damage. Not a stick.";
    } else if (wet && snap.residualPeopleHeld && !me.guest) {
      this.prompt = "F — the equalized bracket as a house of people. Serials stay visible. Serials do not buy damage. Not a fetch.";
    } else if (wet && (me.beats.residualPeople || snap.residualPeopleHeld)) {
      this.prompt = me.heard || "Residual — people. The residual season still flags by default. Gestell 91+ still flags the street. Cult still refuses. Not a stick.";
    } else if (wet && snap.namesPeopleHeld && !me.guest) {
      this.prompt = "F — the residual season as a house of people. It still flags by default. Cult still refuses. Not a fetch.";
    } else if (wet && (me.beats.namesPeople || snap.namesPeopleHeld)) {
      this.prompt = me.heard || "Names — people. Credits still name Reverie Studios, The Last God, Lucah Rosenberg-Lee, Collective. Not a stick.";
    } else if (wet && snap.hourPeopleHeld && !me.guest) {
      this.prompt = "F — the names as a house of people. Credits still name the studios. Guests cannot take the names. Not a fetch.";
    } else if (wet && (me.beats.hourPeople || snap.hourPeopleHeld)) {
      this.prompt = me.heard || "Hour — people. Appearance still opens. Credits still run after. Then the MMO. Not a stick.";
    } else if (wet && snap.blindPeopleHeld && !me.guest) {
      this.prompt = "F — the hour as a house of people. Appearance still opens. Credits still run after. Not a fetch.";
    } else if (wet && (me.beats.blindPeople || snap.blindPeopleHeld)) {
      this.prompt = me.heard || "Blind — people. The party still cannot see a Wink. Not a stick.";
    } else if (wet && snap.livePeopleHeld && !me.guest) {
      this.prompt = "F — the unseen Wink as a house of people. The party still cannot see it. Not a fetch.";
    } else if (wet && (me.beats.livePeople || snap.livePeopleHeld)) {
      this.prompt = me.heard || "Live — people. Vesper still leaves if you keep a Clearing with Cold heat still live. Not a stick.";
    } else if (wet && snap.unlitPeopleHeld && !me.guest) {
      this.prompt = "F — live heat as a house of people. Vesper still leaves if you keep a Clearing with Cold heat still live. Not a fetch.";
    } else if (wet && (me.beats.unlitPeople || snap.unlitPeopleHeld)) {
      this.prompt = me.heard || "Unlit — people. Unlight still keeps Vesper. Not a stick.";
    } else if (wet && snap.soldPeopleHeld && !me.guest) {
      this.prompt = "F — unlighting as a house of people. Unlight still keeps Vesper. Not a fetch.";
    } else if (wet && (me.beats.soldPeople || snap.soldPeopleHeld)) {
      this.prompt = me.heard || "Sold — people. Quill still leaves if you sell a copy without hanging the prayer. Not a stick.";
    } else if (wet && snap.prayerPeopleHeld && !me.guest) {
      this.prompt = "F — selling as a house of people. Quill still leaves if you sell a copy without hanging the prayer. Not a fetch.";
    } else if (wet && (me.beats.prayerPeople || snap.prayerPeopleHeld)) {
      this.prompt = me.heard || "Prayer — people. Hang still keeps Quill. Not a stick.";
    } else if (wet && snap.cappedPeopleHeld && !me.guest) {
      this.prompt = "F — the prayer as a house of people. Hang still keeps Quill. Not a fetch.";
    } else if (wet && (me.beats.cappedPeople || snap.cappedPeopleHeld)) {
      this.prompt = me.heard || "Capped — people. Ord still leaves if extract maxes Gestell at 100 without a freeze. Not a stick.";
    } else if (wet && snap.holdPeopleHeld && !me.guest) {
      this.prompt = "F — capping as a house of people. Ord still leaves if extract maxes Gestell at 100 without a freeze. Not a fetch.";
    } else if (wet && (me.beats.holdPeople || snap.holdPeopleHeld)) {
      this.prompt = me.heard || "Hold — people. A freeze still keeps Ord. Not a stick.";
    } else if (wet && snap.keptPeopleHeld && !me.guest) {
      this.prompt = "F — holding as a house of people. A freeze still keeps Ord. Not a fetch.";
    } else if (wet && (me.beats.keptPeople || snap.keptPeopleHeld)) {
      this.prompt = me.heard || "Kept — people. A paid funeral still keeps Nara. Not a stick.";
    } else if (wet && snap.leavePeopleHeld && !me.guest) {
      this.prompt = "F — keeping as a house of people. A paid funeral still keeps Nara. Not a fetch.";
    } else if (wet && (me.beats.leavePeople || snap.leavePeopleHeld)) {
      this.prompt = me.heard || "Leave — people. Nara still leaves if extract feeds Gestell past 71 without a funeral. Not a stick.";
    } else if (wet && snap.walkedPeopleHeld && !me.guest) {
      this.prompt = "F — leaving as a house of people. Nara still leaves if extract feeds Gestell past 71 without a funeral. Not a fetch.";
    } else if (wet && (me.beats.walkedPeople || snap.walkedPeopleHeld)) {
      this.prompt = me.heard || "Walked — people. If Nara, Ord, or Quill walked, Passing is absence. Not a stick.";
    } else if (wet && snap.emptyPeopleHeld && !me.guest) {
      this.prompt = "F — walking as a house of people. If Nara, Ord, or Quill walked, Passing is absence. Not a fetch.";
    } else if (wet && (me.beats.emptyPeople || snap.emptyPeopleHeld)) {
      this.prompt = me.heard || "Empty — people. If Nara, Ord, or Quill walked, Passing is absence. Not a stick.";
    } else if (wet && snap.willingPeopleHeld && !me.guest) {
      this.prompt = "F — the empty party as a house of people. If Nara, Ord, or Quill walked, Passing is absence. Not a fetch.";
    } else if (wet && (me.beats.willingPeople || snap.willingPeopleHeld)) {
      this.prompt = me.heard || "Willing — people. Appearance still needs the party willing. Not a stick.";
    } else if (wet && snap.stayPeopleHeld && !me.guest) {
      this.prompt = "F — willingness as a house of people. Appearance still needs the party willing. Not a fetch.";
    } else if (wet && (me.beats.stayPeople || snap.stayPeopleHeld)) {
      this.prompt = me.heard || "Stay — people. Nara still stays at the hole. Absence still waits. Not a stick.";
    } else if (wet && snap.waitPeopleHeld && !me.guest) {
      this.prompt = "F — staying as a house of people. Nara still stays at the hole. Absence still waits. Not a fetch.";
    } else if (wet && (me.beats.waitPeople || snap.waitPeopleHeld)) {
      this.prompt = me.heard || "Wait — people. Absence still waits. Nara still stays at the hole. Not a stick.";
    } else if (wet && snap.absencePeopleHeld && !me.guest) {
      this.prompt = "F — waiting as a house of people. Absence still waits. Nara still stays at the hole. Not a fetch.";
    } else if (wet && (me.beats.absencePeople || snap.absencePeopleHeld)) {
      this.prompt = me.heard || "Absence — people. Absence still waits. Nara still stays at the hole. Not a stick.";
    } else if (wet && snap.hijackPeopleHeld && !me.guest) {
      this.prompt = "F — absence as a house of people. Absence still waits. Nara still stays at the hole. Not a fetch.";
    } else if (wet && (me.beats.hijackPeople || snap.hijackPeopleHeld)) {
      this.prompt = me.heard || "Hijack — people. Freeze or Cold still hijacks the Clearing. Not a stick.";
    } else if (wet && snap.stipendPeopleHeld && !me.guest) {
      this.prompt = "F — hijack as a house of people. Freeze or Cold still hijacks the Clearing. Not a fetch.";
    } else if (wet && (me.beats.stipendPeople || snap.stipendPeopleHeld)) {
      this.prompt = me.heard || "Stipend — people. Appearance still pays cult upkeep. Absence pays none. Not a stick.";
    } else if (wet && snap.holePeopleHeld && !me.guest) {
      this.prompt = "F — the stipend as a house of people. Appearance still pays cult upkeep. Absence pays none. Not a fetch.";
    } else if (wet && (me.beats.holePeople || snap.holePeopleHeld)) {
      this.prompt = me.heard || "Hole — people. A failed Passing still writes the hole. No stipend. Not a stick.";
    } else if (wet && snap.failPeopleHeld && !me.guest) {
      this.prompt = "F — the hole as a house of people. A failed Passing still writes the hole. No stipend. Not a fetch.";
    } else if (wet && (me.beats.failPeople || snap.failPeopleHeld)) {
      this.prompt = me.heard || "Fail — people. A failed Passing still writes the hole. No stipend. Not a stick.";
    } else if (wet && snap.tracePeopleHeld && !me.guest) {
      this.prompt = "F — failure as a house of people. A failed Passing still writes the hole. No stipend. Not a fetch.";
    } else if (wet && (me.beats.tracePeople || snap.tracePeopleHeld)) {
      this.prompt = me.heard || "Trace — people. Appearance is a trace, not a model. Aura still holds. Not a stick.";
    } else if (wet && snap.dwellPeopleHeld && !me.guest) {
      this.prompt = "F — the trace as a house of people. Appearance is a trace, not a model. Aura still holds. Not a fetch.";
    } else if (wet && (me.beats.dwellPeople || snap.dwellPeopleHeld)) {
      this.prompt = me.heard || "Dwell — people. Two dwellers still open Appearance. Solo cannot force it. Not a stick.";
    } else if (wet && snap.soloPeopleHeld && !me.guest) {
      this.prompt = "F — dwelling as a house of people. Two dwellers still open Appearance. Solo cannot force it. Not a fetch.";
    } else if (wet && (me.beats.soloPeople || snap.soloPeopleHeld)) {
      this.prompt = me.heard || "Solo — people. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing. Not a stick.";
    } else if (wet && snap.blockPeopleHeld && !me.guest) {
      this.prompt = "F — solo as a house of people. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing. Not a fetch.";
    } else if (wet && (me.beats.blockPeople || snap.blockPeopleHeld)) {
      this.prompt = me.heard || "Block — people. Gestell 100 still blocks a Passing without a Clearing. Solo cannot force Appearance. Not a stick.";
    } else if (wet && snap.poorPeopleHeld && !me.guest) {
      this.prompt = "F — the block as a house of people. Gestell 100 still blocks a Passing without a Clearing. Not a fetch.";
    } else if (wet && (me.beats.poorPeople || snap.poorPeopleHeld)) {
      this.prompt = me.heard || "Poor — people. Low climate still keeps Clearings. Yield still poor. Not a stick.";
    } else if (wet && snap.fatPeopleHeld && !me.guest) {
      this.prompt = "F — poor yield as a house of people. Low climate still keeps Clearings. Yield still poor. Not a fetch.";
    } else if (wet && (me.beats.fatPeople || snap.fatPeopleHeld)) {
      this.prompt = me.heard || "Fat — people. Fat yield still drinks. Sacred doors still dim. Not a stick.";
    } else if (wet && snap.heatPeopleHeld && !me.guest) {
      this.prompt = "F — fat yield as a house of people. Fat yield still drinks. Sacred doors still dim. Not a fetch.";
    } else if (wet && (me.beats.heatPeople || snap.heatPeopleHeld)) {
      this.prompt = me.heard || "Heat — people. Gestell 91 still flags the street. Flag still opts in. Not a stick.";
    } else if (wet && snap.maxPeopleHeld && !me.guest) {
      this.prompt = "F — heat as a house of people. Gestell 91 still flags the street. Flag still opts in. Not a fetch.";
    } else if (wet && (me.beats.maxPeople || snap.maxPeopleHeld)) {
      this.prompt = me.heard || "Max — people. Gestell 91 still flags the street. Flag still opts in. Not a stick.";
    } else if (wet && snap.extractPeopleHeld && !me.guest) {
      this.prompt = "F — max climate as a house of people. Gestell 91 still flags the street. Not a fetch.";
    } else if (wet && (me.beats.extractPeople || snap.extractPeopleHeld)) {
      this.prompt = me.heard || "Extract — people. Extract still pays. Keep still costs. Not a stick.";
    } else if (wet && snap.climatePeopleHeld && !me.guest) {
      this.prompt = "F — extract as a house of people. Extract still pays. Keep still costs. Not a fetch.";
    } else if (wet && (me.beats.climatePeople || snap.climatePeopleHeld)) {
      this.prompt = me.heard || "Climate — people. Climate still ticks. Yield still drinks Gestell. Not a stick.";
    } else if (wet && snap.gestellPeopleHeld && !me.guest) {
      this.prompt = "F — climate as a house of people. Climate still ticks. Yield still drinks Gestell. Not a fetch.";
    } else if (wet && (me.beats.gestellPeople || snap.gestellPeopleHeld)) {
      this.prompt = me.heard || "Gestell — people. Gestell still rises. Yield still drinks Gestell. Not a stick.";
    } else if (wet && snap.taxPeopleHeld && !me.guest) {
      this.prompt = "F — Gestell as a house of people. Gestell still rises. Yield still drinks Gestell. Not a fetch.";
    } else if (wet && (me.beats.taxPeople || snap.taxPeopleHeld)) {
      this.prompt = me.heard || "Tax — people. Hall tax still skims. The number does not strike. Not a stick.";
    } else if (wet && snap.yieldPeopleHeld && !me.guest) {
      this.prompt = "F — tax as a house of people. Hall tax still skims. The number does not strike. Not a fetch.";
    } else if (wet && (me.beats.yieldPeople || snap.yieldPeopleHeld)) {
      this.prompt = me.heard || "Yield — people. Yield still drinks Gestell. Keep still costs. Not a stick.";
    } else if (wet && snap.sinkPeopleHeld && !me.guest) {
      this.prompt = "F — yield as a house of people. Yield still drinks Gestell. Keep still costs. Not a fetch.";
    } else if (wet && (me.beats.sinkPeople || snap.sinkPeopleHeld)) {
      this.prompt = me.heard || "Sink — people. Every earner still spends. Banked is a sink, not a stick.";
    } else if (wet && snap.unbankedPeopleHeld && !me.guest) {
      this.prompt = "F — the sink as a house of people. Every earner still spends. Not a fetch.";
    } else if (wet && (me.beats.unbankedPeople || snap.unbankedPeopleHeld)) {
      this.prompt = me.heard || "Unbanked — people. Unbanked still drops. Guests are not loot. Not a stick.";
    } else if (wet && snap.bankedPeopleHeld && !me.guest) {
      this.prompt = "F — unbanked as a house of people. Unbanked still drops. Guests are not loot. Not a fetch.";
    } else if (wet && (me.beats.bankedPeople || snap.bankedPeopleHeld)) {
      this.prompt = me.heard || "Banked — people. Banked still does not drop. TAKE stays disarmed. Not a stick.";
    } else if (wet && snap.copyPeopleHeld && !me.guest) {
      this.prompt = "F — banked as a house of people. Banked still does not drop. TAKE stays disarmed. Not a fetch.";
    } else if (wet && (me.beats.copyPeople || snap.copyPeopleHeld)) {
      this.prompt = me.heard || "Copy — people. Copies still decay. Listing still costs. Cult does not list. Not a stick.";
    } else if (wet && snap.cultPeopleHeld && !me.guest) {
      this.prompt = "F — copies as a house of people. Copies still decay. Listing still costs. Not a fetch.";
    } else if (wet && (me.beats.cultPeople || snap.cultPeopleHeld)) {
      this.prompt = me.heard || "Cult — people. Cult still does not drop. Cult does not list. Not a stick.";
    } else if (wet && snap.bestandPeopleHeld && !me.guest) {
      this.prompt = "F — cult as a house of people. Cult still does not drop. Cult does not list. Not a fetch.";
    } else if (wet && (me.beats.bestandPeople || snap.bestandPeopleHeld)) {
      this.prompt = me.heard || "Bestand — people. Bestand still spends. The token never buys combat. TAKE stays disarmed. Not a stick.";
    } else if (wet && snap.winkPeopleHeld && !me.guest) {
      this.prompt = "F — Bestand as a house of people. Bestand still spends. The token never buys combat. Not a fetch.";
    } else if (wet && (me.beats.winkPeople || snap.winkPeopleHeld)) {
      this.prompt = me.heard || "Wink — people. Winke never withdraw. TAKE stays disarmed. Not a stick.";
    } else if (wet && snap.presencePeopleHeld && !me.guest) {
      this.prompt = "F — Winke as a house of people. Winke never withdraw. TAKE stays disarmed. Not a fetch.";
    } else if (wet && (me.beats.presencePeople || snap.presencePeopleHeld)) {
      this.prompt = me.heard || "Presence — people. Presence still addresses. Presence is not damage. Not a stick.";
    } else if (wet && snap.auraPeopleHeld && !me.guest) {
      this.prompt = "F — presence as a house of people. Presence still addresses. Presence is not damage. Not a fetch.";
    } else if (wet && (me.beats.auraPeople || snap.auraPeopleHeld)) {
      this.prompt = me.heard || "Aura — people. Aura still withers. Aura is not damage. Not a stick.";
    } else if (wet && snap.visiblePeopleHeld && !me.guest) {
      this.prompt = "F — aura as a house of people. Aura still withers. Aura is not damage. Not a fetch.";
    } else if (wet && (me.beats.visiblePeople || snap.visiblePeopleHeld)) {
      this.prompt = me.heard || "Visible — people. Serials stay visible. Serials do not buy damage. Not a stick.";
    } else if (wet && snap.fairPeopleHeld && !me.guest) {
      this.prompt = "F — visibility as a house of people. Serials stay visible. Serials do not buy damage. Not a fetch.";
    } else if (wet && (me.beats.fairPeople || snap.fairPeopleHeld)) {
      this.prompt = me.heard || "Fair — people. Same skill, different serials: same number. Serials stay visible. Not a stick.";
    } else if (wet && snap.tokenPeopleHeld && !me.guest) {
      this.prompt = "F — the published band as a house of people. Same skill, different serials: same number. Not a fetch.";
    } else if (wet && (me.beats.tokenPeople || snap.tokenPeopleHeld)) {
      this.prompt = me.heard || "Token — people. The token never buys combat. TAKE stays disarmed. Not a stick.";
    } else if (wet && snap.traitPeopleHeld && !me.guest) {
      this.prompt = "F — the token as a house of people. The token never buys combat. TAKE stays disarmed. Not a fetch.";
    } else if (wet && (me.beats.traitPeople || snap.traitPeopleHeld)) {
      this.prompt = me.heard || "Trait — people. Traits do not buy damage. Serials stay visible. Not a stick.";
    } else if (wet && snap.skillPeopleHeld && !me.guest) {
      this.prompt = "F — traits as a house of people. Traits do not buy damage. Serials stay visible. Not a fetch.";
    } else if (wet && (me.beats.skillPeople || snap.skillPeopleHeld)) {
      this.prompt = me.heard || "Skill — people. Skill still wins. Traits do not buy the fight. Not a stick.";
    } else if (wet && snap.numberPeopleHeld && !me.guest) {
      this.prompt = "F — skill as a house of people. Skill still wins. Traits do not buy the fight. Not a fetch.";
    } else if (wet && (me.beats.numberPeople || snap.numberPeopleHeld)) {
      this.prompt = me.heard || "Number — people. Same skill, different serials: same number. Not a stick.";
    } else if (wet && snap.bandPeopleHeld && !me.guest) {
      this.prompt = "F — the number as a house of people. Same skill, different serials: same number. Not a fetch.";
    } else if (wet && (me.beats.bandPeople || snap.bandPeopleHeld)) {
      this.prompt = me.heard || "Band — people. Same skill, different serials: same number. Not a stick.";
    } else if (wet && snap.serialPeopleHeld && !me.guest) {
      this.prompt = "F — the band as a house of people. Same skill, different serials: same number. Not a fetch.";
    } else if (wet && (me.beats.serialPeople || snap.serialPeopleHeld)) {
      this.prompt = me.heard || "Serial — people. Serials stay visible. Serials do not buy damage. Not a stick.";
    } else if (wet && snap.gearedPeopleHeld && !me.guest) {
      this.prompt = "F — serials as a house of people. Serials stay visible. Serials do not buy damage. Not a fetch.";
    } else if (wet && (me.beats.gearedPeople || snap.gearedPeopleHeld)) {
      this.prompt = me.heard || "Geared — people. Geared graves still crack. Fallen graves still do not. Not a stick.";
    } else if (wet && snap.dummyPeopleHeld && !me.guest) {
      this.prompt = "F — geared graves as a house of people. Geared graves still crack. Fallen graves still do not. Not a fetch.";
    } else if (wet && (me.beats.streetPeople || snap.streetPeopleHeld)) {
      this.prompt = me.heard || "Street — people. Flag still opts in. Guests are not loot. Seconds still last. Not a stick.";
    } else if (wet && snap.secondsPeopleHeld && !me.guest) {
      this.prompt = "F — the flagged street as a house of people. Flag still opts in. Guests are not loot. Not a fetch.";
    } else if (wet && (me.beats.secondsPeople || snap.secondsPeopleHeld)) {
      this.prompt = me.heard || "Seconds — people. Flagged street still lasts seconds. Not a stick.";
    } else if (wet && snap.unflagPeopleHeld && !me.guest) {
      this.prompt = "F — seconds as a house of people. Flagged street still lasts seconds. Not a fetch.";
    } else if (wet && (me.beats.unflagPeople || snap.unflagPeopleHeld)) {
      this.prompt = me.heard || "Unflag — people. Unflag still opts out. Cult still hangs. Not a stick.";
    } else if (wet && snap.spoilsPeopleHeld && !me.guest) {
      this.prompt = "F — unflag as a house of people. Unflag still opts out. Cult still hangs. Not a fetch.";
    } else if (wet && (me.beats.spoilsPeople || snap.spoilsPeopleHeld)) {
      this.prompt = me.heard || "Spoils — people. Unbanked still drops. Guests are not loot. Not a stick.";
    } else if (wet && snap.fallenPeopleHeld && !me.guest) {
      this.prompt = "F — spoils as a house of people. Unbanked still drops. Guests are not loot. Not a fetch.";
    } else if (wet && (me.beats.fallenPeople || snap.fallenPeopleHeld)) {
      this.prompt = me.heard || "Fallen — people. Fallen graves still do not crack. Geared graves still crack. Not a stick.";
    } else if (wet && snap.stormPressPeopleHeld && !me.guest) {
      this.prompt = "F — fallen graves as a house of people. Fallen graves still do not crack. Not a fetch.";
    } else if (wet && (me.beats.stormPressPeople || snap.stormPressPeopleHeld)) {
      this.prompt = me.heard || "Storm-press — people. Geared graves still crack. Fallen graves still do not. Not a stick.";
    } else if (wet && snap.bankPeopleHeld && !me.guest) {
      this.prompt = "F — storm-press as a house of people. Geared graves still crack. Fallen graves still do not. Not a fetch.";
    } else if (wet && (me.beats.flagPeople || snap.flagPeopleHeld)) {
      this.prompt = me.heard || "Flag — people. Flag still opts in. Guests are not loot. Not a stick.";
    } else if (wet && snap.bountyPeopleHeld && !me.guest) {
      this.prompt = "F — the flag as a house of people. Guests are not loot. Seconds. Not a fetch.";
    } else if (wet && (me.beats.bracketPeople || snap.bracketPeopleHeld)) {
      this.prompt = me.heard || "The bracket — people. Serials stay visible. Not a stick.";
    } else if (wet && snap.seasonPeopleHeld && !me.guest) {
      this.prompt = "F — the bracket as a house of people. Serials stay visible. Not a fetch.";
    } else if (wet && (me.beats.seasonPeople || snap.seasonPeopleHeld)) {
      this.prompt = me.heard || "The season — people. Flag still opts in. Not a stick.";
    } else if (wet && snap.stillPeopleHeld && !me.guest) {
      this.prompt = "F — the residual season as a house of people. Flag still opts in. Not a fetch.";
    } else if (wet && (me.beats.wetPeople || snap.wetPeopleHeld)) {
      this.prompt = me.heard || "Wet Grid — people. Flag still opts in. Not a stick.";
    } else if (wet && snap.clearingPeopleHeld && !me.guest) {
      this.prompt = "F — the Wet Grid as a street of people. Flag still opts in. Not a fetch.";
    } else if (wet && (snap.wetCult || me.beats.unflag)) {
      this.prompt = me.heard || "The street is cult. Spoils do not live here.";
    } else if (wet && me.beats.unflagAsk) {
      this.prompt = "F — unflag the Wet Grid. Quill keeps the street. Not a fetch.";
    } else if (wet && (snap.creditsHeld || me.beats.credits) && !snap.seasonHeld && !me.beats.season) {
      this.prompt = "F — name the residual season. Wet Grid flags by default. The MMO is the rest of life.";
    } else if (wet && (snap.bracketHeld || me.beats.bracket)) {
      this.prompt = me.heard || "The season — equal. Serials stay visible. Combat is not.";
    } else if (wet && (snap.seasonHeld || me.beats.season) && !snap.bracketHeld) {
      this.prompt = "F — optional equalized bracket. Serials stay visible. Not a stick.";
    } else if (wet && (snap.seasonHeld || me.beats.season)) {
      this.prompt = me.heard || "The season — residual. Flagged by default. Spoils from people. Combat is not.";
    } else if (wet && me.flagged) {
      this.prompt = me.heard || "Flagged. Click strike. Spoils: unbanked and copies. Cult stays. Guests are not loot.";
    } else if (wet) {
      this.prompt = "F — flag in the Wet Grid. Seconds. Spoils from people, not a faucet.";
    } else if (me.locked) {
      this.prompt = care ? me.heard || "You see a door. You do not see what it is for." : me.heard || "A guest cannot prepare the ground.";
    } else if (hall && me.inCare && !me.guest) {
      const four =
        !!snap.standing &&
        snap.standing.earth >= 1 &&
        snap.standing.sky >= 1 &&
        snap.standing.mortals >= 1 &&
        snap.standing.divinities >= 1;
      this.prompt =
        me.beats.tithePeople || snap.tithePeopleHeld
          ? me.heard || "Tithe — people. Six Bestand. Omen holds after upkeep. Not a stick."
        : snap.keepPeopleHeld && !me.beats.tithePeople
          ? "F — the tithe as a house of people. Six Bestand. Omen holds after upkeep. Not a fetch."
        : me.beats.bountyPeople || snap.bountyPeopleHeld
          ? me.heard || "The bounty — people. One omen, one purse. Not a stick."
        : snap.stormPeopleHeld && !me.beats.bountyPeople
          ? "F — the bounty as a house of people. One omen, one purse. Not a fetch."
        : me.beats.organsPeople || snap.organsPeopleHeld
          ? me.heard || "The organs — people. Tithe still costs. Not a stick."
        : snap.foundryPeopleHeld && snap.straitPeopleHeld && snap.cablePeopleHeld && me.beats.hall
          ? "F — gather the organs as people. Foundry, Strait, Cable. Not a fetch."
        : me.beats.hallPeople || snap.hallPeopleHeld
          ? me.heard || "The hall — people. Tithe still costs. Bounty still costs."
        : snap.deskPeopleHeld && me.beats.hall
          ? "F — the hall as a house of people. Tithe still costs. Not a fetch."
        : me.beats.fourfold || snap.fourfoldHeld
          ? me.heard || "The fourfold holds. A gathering, not a stick."
          : four
            ? "F — gather the fourfold in the hall. Earth, Sky, Mortals, Divinities. Not a fetch."
        : me.beats.hall && snap.war?.winner && snap.war.tithePaid && !snap.bountyHeld && me.house === snap.war.winner
          ? "F — collect House bounty. Tithe pool. Gestell drinks. Not a stick."
        : me.beats.hall && snap.war?.winner && !snap.war.tithePaid && me.house === snap.war.winner
          ? `F — pay House tithe (${TITHE_COST} Bestand). Omen holds after upkeep. Not a stick.`
          : me.beats.hall && me.beats.garden && me.house === "mortals" && !snap.hallLamp
            ? "F — name the garden in the hall. Mortals standing. Not a stick."
          : me.beats.hall
            ? me.heard
            : `F read House of Mortals. Gestell tax ${snap.tax}. The number does not strike.`;
    } else if (hall) {
      this.prompt = "You see a hall. You do not see who owns the nodes.";
    } else if (annex && (me.guest || me.locked)) {
      this.prompt = "A desk. Paper. You are not the one who signs.";
    } else if (annex && (me.beats.freezePeople || snap.freezePeopleHeld)) {
      this.prompt = me.heard || "Freeze — people. Ten Bestand. The Passing still starves. Not a stick.";
    } else if (annex && snap.tithePeopleHeld && !me.guest) {
      this.prompt = "F — the freeze as a house of people. Ten Bestand. The Passing still starves. Not a fetch.";
    } else if (annex && (me.beats.annexPeople || snap.annexPeopleHeld)) {
      this.prompt = me.heard || "Annex — people. The freeze still costs. Not a stick.";
    } else if (annex && snap.screeningPeopleHeld && !me.guest) {
      this.prompt = "F — the Annex as a house of people. The freeze still costs. Not a fetch.";
    } else if (annex && (snap.annexHome || me.beats.annexHome)) {
      this.prompt = me.heard || "The runner is in. The freeze holds. No more paper on the street.";
    } else if (annex && snap.frozen) {
      this.prompt = me.heard || "The freeze holds. The Passing stays hungry.";
    } else if (annex && me.beats.hall) {
      this.prompt = `F — sign the freeze (${FREEZE_COST} Bestand). The district holds. The Passing will starve.`;
    } else if (annex) {
      this.prompt = "Safety Annex. The desk will not take a name that has not read the hall.";
    } else if (stall && (me.guest || me.locked)) {
      this.prompt = "A stall of lights. You cannot afford a sky you cannot see.";
    } else if (stall && (me.beats.hangPeople || snap.hangPeopleHeld)) {
      this.prompt = me.heard || "Hang — people. Cult still hangs. The stall still goes dark. Not a stick.";
    } else if (stall && snap.marketPeopleHeld && !me.guest) {
      this.prompt = "F — the hang as a house of people. Cult still hangs. The stall still goes dark. Not a fetch.";
    } else if (stall && (me.beats.marketPeople || snap.marketPeopleHeld)) {
      this.prompt = me.heard || "Market — people. Forty Bestand. The Clearing stays closed. Not a stick.";
    } else if (stall && snap.listingPeopleHeld && !me.guest) {
      this.prompt = "F — the market as a house of people. Forty Bestand. The Clearing stays closed. Not a fetch.";
    } else if (stall && (me.beats.repairPeople || snap.repairPeopleHeld)) {
      this.prompt = me.heard || "Repair — people. Seven Bestand. Cult does not crack. Not a stick.";
    } else if (stall && snap.freezePeopleHeld && !me.guest) {
      this.prompt = "F — repair as a house of people. Seven Bestand. Cult does not crack. Not a fetch.";
    } else if (stall && (me.beats.stallPeople || snap.stallPeopleHeld)) {
      this.prompt = me.heard || "The stall — people. Listing still costs. Cult does not list.";
    } else if (stall && snap.wetPeopleHeld && !me.guest) {
      this.prompt = "F — the stall as a house of people. Listing still costs. Not a fetch.";
    } else if (stall && (snap.stallDark || me.beats.hang)) {
      this.prompt = me.heard || "The stall is dark. Cult hangs. Copies do not travel.";
    } else if (stall && me.beats.hangAsk && me.cultWink) {
      this.prompt = "F — hang the cult sheet. The stall goes dark. Quill walks the Wet Grid.";
    } else if (stall && me.messenger === "iridescent" && !me.guest && !me.beats.glamour && !snap.glamourHeld) {
      this.prompt = "F — Iridescent Glamour. Aura as surface. Copies travel. Cult does not. Not a stick.";
    } else if (stall && mateNear && me.fakeWinke > 0 && !me.guest && !me.cultWink) {
      this.prompt =
        me.beats.handoffPeople || snap.handoffPeopleHeld
          ? me.heard || "Handoff — people. Listing still costs. Cult does not pass. Not a stick."
        : snap.trucePeopleHeld
          ? "F — the handoff as a house of people. Listing still costs. Cult does not pass. Not a fetch."
          : me.heard ||
            `F — pass a print (${LISTING_FEE} Bestand). Exhibition travels. Cult does not. Not a fetch.`;
    } else if (stall && me.beats.market) {
      this.prompt = me.damaged
        ? `F buy a copy (${CLEARING_PRICE}). Q repair a cracked print (${REPAIR_COST}). Cult does not crack.`
        : `F — buy the copy. ${CLEARING_PRICE} Bestand. The Clearing stays closed.`;
    } else if (stall && me.beats.hall) {
      this.prompt = "F — Quill listed a Clearing. It looks like freedom.";
    } else if (stall) {
      this.prompt = "Quill is selling something. You do not yet have the eyes for the price.";
    } else if (forge && (me.guest || me.locked)) {
      this.prompt = "Quill is doing something with paper. You cannot tell which sheet is the prayer.";
    } else if (forge && (me.beats.listingPeople || snap.listingPeopleHeld)) {
      this.prompt = me.heard || "Listing — people. The fee still sits. Not a stick.";
    } else if (forge && snap.repairPeopleHeld && !me.guest) {
      this.prompt = "F — listing as a house of people. The fee still sits. Not a fetch.";
    } else if (npcNear?.id === "quill" && (me.beats.quillNoPrint || snap.quillNoPrint)) {
      this.prompt = me.heard || "Quill will not print the last god. Copies stop here.";
    } else if (npcNear?.id === "quill" && (snap.lastGodNamed || me.beats.lastGod) && me.beats.market && !me.guest) {
      this.prompt = "F — Quill will not print the last god. Absence does not list. Not a fetch.";
    } else if (npcNear?.id === "quill" && (me.beats.quillPerson || snap.quillPersonHeld)) {
      this.prompt = me.heard || "Quill stays. A person, not a listing.";
    } else if (npcNear?.id === "quill" && (me.beats.unflag || snap.wetCult) && !me.guest) {
      this.prompt = "F — Quill can stay as a person. Not a fetch.";
    } else if (npcNear?.id === "quill" && me.beats.unflagAsk) {
      this.prompt = "The Wet Grid is still a ring. Unflag the plaque.";
    } else if (npcNear?.id === "quill" && me.beats.hang) {
      this.prompt = "F — Quill will keep the street if you unflag it. Spoils can end.";
    } else if (npcNear?.id === "quill" && me.beats.hangAsk) {
      this.prompt = "The stall is still lit. Hang the sheet on the listing.";
    } else if ((forge || npcNear?.id === "quill") && me.beats.spot && !me.beats.hangAsk) {
      this.prompt = "F — Quill will hang the prayer if you keep it. The stall can go dark.";
    } else if (forge && me.beats.spot) {
      this.prompt = me.heard || "You kept the eye. The cult hint does not list.";
    } else if (forge && me.beats.sold) {
      this.prompt = me.heard || "You sold a copy. The cult hint is not in the bag.";
    } else if (forge && me.beats.forge) {
      this.prompt = `Q keep the eye (cult). E sell a copy (+${FORGE_PAY - LISTING_FEE} after listing fee). Cult does not list.`;
    } else if (forge && me.beats.market) {
      this.prompt = "F — Quill will teach the difference, or sell you the print.";
    } else if (npcNear?.id === "ione" && (me.beats.lastWordPeople || snap.lastWordPeopleHeld)) {
      this.prompt = me.heard || "Last word — people. Ione still speaks. Absence still waits. Not a stick.";
    } else if (npcNear?.id === "ione" && snap.spectatePeopleHeld && !me.guest) {
      this.prompt = "F — the last word as a house of people. Ione still speaks. Not a fetch.";
    } else if (ioneGoneNear && (me.guest || me.locked)) {
      this.prompt = "An empty place. You do not get a last word.";
    } else if (ioneGoneNear && (me.beats.people || snap.peopleHeld)) {
      this.prompt = me.heard || "Ione — people. A gathering, not a process.";
    } else if (
      ioneGoneNear &&
      snap.naraPersonHeld &&
      snap.quillPersonHeld &&
      snap.ordPersonHeld &&
      snap.vesperPersonHeld
    ) {
      this.prompt = "F — the people stayed. Ione's hole is a gathering. Not a fetch.";
    } else if (ioneGoneNear && me.beats.ioneMark) {
      this.prompt = me.heard || "The hole holds. Ione Kade is gone.";
    } else if (ioneGoneNear) {
      this.prompt = "F — stand in the hole Ione left. Absence is a standing. Not a fetch.";
    } else if (ring && (me.beats.passingPeople || snap.passingPeopleHeld)) {
      this.prompt = me.heard || "Passing — people. Appearance still opens. Absence still waits. Not a stick.";
    } else if (ring && snap.campPeopleHeld && !me.guest) {
      this.prompt = "F — the Passing as a house of people. Appearance still opens. Not a fetch.";
    } else if (ring && (me.guest || me.locked)) {
      this.prompt = "A ring in the asphalt. You cannot prepare the ground.";
    } else if (ring && (me.beats.stormPeople || snap.stormPeopleHeld)) {
      this.prompt = me.heard || "Storm — people. Storm still burns readiness. Not a stick.";
    } else if (ring && snap.roomsPeopleHeld && !me.guest) {
      this.prompt = "F — the failed hole as a house of people. Storm still burns readiness. Not a fetch.";
    } else if (ring && (me.beats.creditsPeople || snap.creditsPeopleHeld)) {
      this.prompt = me.heard || "Credits — people. TAKE stays disarmed. Not a stick.";
    } else if (ring && snap.navePeopleHeld && !me.guest) {
      this.prompt = "F — credits as a house of people. TAKE stays disarmed. Not a fetch.";
    } else if (ring && (me.beats.clearingPeople || snap.clearingPeopleHeld)) {
      this.prompt = me.heard || "The Clearing — people. Passing still happens. Not a stick.";
    } else if (ring && snap.hallPeopleHeld && !me.guest) {
      this.prompt = "F — the Clearing as a house of people. Passing still happens. Not a fetch.";
    } else if (ring && snap.war?.winner) {
      this.prompt = snap.war.omen || me.heard;
    } else if (ring && (snap.creditsHeld || me.beats.credits)) {
      this.prompt = me.heard || "Credits. Reverie Studios. The Last God. Then the MMO.";
    } else if (ring && (snap.appearWorld || snap.passing.outcome === "appearance")) {
      this.prompt = me.heard || "F — credits. Reverie Studios. The Last God. Then the MMO. Not a stick.";
    } else if (ring && snap.passing.outcome === "absence" && (snap.naraGone || snap.ordGone || snap.quillGone)) {
      this.prompt = me.heard || "The Clearing — empty party. They will not stand. You cannot force the hour alone.";
    } else if (ring && (snap.naraAtClearing || snap.passing.outcome === "absence")) {
      this.prompt = me.heard || "The Clearing — absence. Nara Vale stays. The hour went by.";
    } else if (ring && (snap.stormHeld || me.storm || me.beats.storm)) {
      this.prompt = me.heard || "The Clearing — storm. Wreckage vision. Readiness burns. Not a stick.";
    } else if (ring && (snap.clearingFailed || snap.passing.outcome === "failed")) {
      this.prompt = me.heard || "F — take Storm at the failed hole. Wreckage vision. Not a stick.";
    } else if (ring && (snap.hijacked || snap.passing.outcome === "hijack")) {
      this.prompt =
        me.heard ||
        (snap.hijackBy === "cold"
          ? "The Clearing — Cold. A concentrator claimed the hour. You are marked."
          : "The Clearing — Safety. The freeze ate the rite. You are marked.");
    } else if (ring && snap.passing.outcome) {
      this.prompt = me.heard || "The hour already went by.";
    } else if (ring && me.beats.clearing && snap.clearingOpen) {
      this.prompt = "F — attempt the Passing. Q keep. E extract (contest). Solo cannot force a god.";
    } else if (ring && me.beats.lastWord && me.beats.garden) {
      this.prompt = "F / Q keep the Clearing. E extract is a contest. Mortality is done.";
    } else if (ring && !me.beats.lastWord) {
      this.prompt = "A mortality act is required. Speak a last word with Ione Kade.";
    } else if (ring && !me.beats.garden) {
      this.prompt = "Nara Vale will not stand in a hole you left as wreckage.";
    } else if (desk && (me.guest || me.locked)) {
      this.prompt = "A woman at a desk. She is not speaking to you.";
    } else if (desk && (me.beats.vesperPeople || snap.vesperPeopleHeld)) {
      this.prompt = me.heard || "Vesper — people. She will not sell a god. Not a stick.";
    } else if (desk && snap.organsPeopleHeld && !me.guest) {
      this.prompt = "F — Vesper's desk as a house of people. She will not sell a god. Not a fetch.";
    } else if (desk && snap.vesperGone) {
      this.prompt = me.heard || "Vesper Hale is gone. The furnace kept the heat.";
    } else if (desk && (me.beats.vesperNoGod || snap.vesperNoGod)) {
      this.prompt = me.heard || "No god for sale. Private yield does not list absence.";
    } else if (desk && (snap.lastGodNamed || me.beats.lastGod) && !me.guest) {
      this.prompt = "F — Vesper will not sell the last god. The desk lists no absence. Not a fetch.";
    } else if (desk && (snap.vesperAtFoundry || snap.foundryDark || me.beats.foundryDark)) {
      this.prompt = me.heard || "The desk is empty. Vesper Hale is at the Foundry.";
    } else if (desk && me.beats.foundryAsk) {
      this.prompt = "The Foundry is still a mouth. Unlight the plaque. Vesper will walk.";
    } else if (desk && me.beats.cold && me.beats.foundry) {
      this.prompt = "F — Vesper will walk if you unlight the Foundry. Not a fetch.";
    } else if (desk && me.beats.cold) {
      this.prompt = me.heard || "You took the private yield. Read the Foundry. Then come back.";
    } else if (desk && me.beats.refuse) {
      this.prompt = me.heard || "You refused. The door stays shut.";
    } else if (desk && me.beats.yield) {
      this.prompt = `E take +${PRIVATE_YIELD} Bestand (Cold). Q refuse (Readiness). She is not a boss.`;
    } else if (desk && me.beats.hall) {
      this.prompt = "F — Vesper Hale, Concentrator. A private yield. Human.";
    } else if (desk) {
      this.prompt = "A concentrator. She will not quote until you have read the hall.";
    } else if (m3 && (me.guest || me.locked)) {
      this.prompt = "A door with a number. You do not travel organs.";
    } else if (m3 && (me.beats.m3People || snap.m3PeopleHeld)) {
      this.prompt = me.heard || "M3 — people. Going-under still works. Not a stick.";
    } else if (m3 && snap.vesperPeopleHeld && !me.guest) {
      this.prompt = "F — M3 as a house of people. Going-under still works. Not a fetch.";
    } else if (m3 && snap.m3Open && !me.guest) {
      this.prompt = me.inM3 ? me.heard || "The Third Movement is organs, not nations." : "F — enter Movement III. Strait / Foundry / Cable.";
    } else if (m3) {
      this.prompt = "Movement III is shut. The private yield funds this door the Cold way.";
    } else if (gardenNear && (me.beats.gardenPeople || snap.gardenPeopleHeld)) {
      this.prompt = me.heard || "Garden — people. Bury still works. Not a stick.";
    } else if (gardenNear && snap.underPeopleHeld && !me.guest) {
      this.prompt = "F — the wreckage garden as a house of people. Bury still works. Not a fetch.";
    } else if (gardenNear && !gardenNear.done && !me.guest) {
      this.prompt = "F bury the Clearing that Movement I over-extracted. Nara Vale will not speak until you do.";
    } else if (npcNear?.id === "nara" && (me.beats.naraPerson || snap.naraPersonHeld)) {
      this.prompt = me.heard || "Nara Vale stays. A person, not a function.";
    } else if (npcNear?.id === "nara" && me.beats.funeral && !me.guest) {
      this.prompt = "F — Nara Vale can stay as a person. Not a fetch.";
    } else if (npcNear?.id === "nara" && (snap.naraAtClearing || me.beats.absenceHour)) {
      this.prompt = me.heard || "Nara Vale stays. The hour went by. Absence is honest.";
    } else if (npcNear?.id === "nara" && (me.beats.naraGod || snap.lastGodBuried || snap.naraAtCare)) {
      this.prompt = me.heard || "The last god is in the earth. Nara Vale is at the Care.";
    } else if (npcNear?.id === "nara" && me.beats.naraGodAsk) {
      this.prompt = "F — bury the last god as earth with Nara. Cult. She walks to the Care.";
    } else if (npcNear?.id === "nara" && me.beats.sexton && (snap.lastGodNamed || me.beats.lastGod)) {
      this.prompt = "F — Nara will bury the last god as earth. Absence can be a grave.";
    } else if (npcNear?.id === "nara" && (me.beats.canalBury || snap.straitBuried)) {
      this.prompt = me.heard || "The canal is in the earth. Nara Vale is burying it.";
    } else if (npcNear?.id === "nara" && me.beats.canalAsk) {
      this.prompt = "F — bury the refused Strait with Nara. Cult. She walks if she must.";
    } else if (npcNear?.id === "nara" && me.beats.sexton && (snap.straitRefused || me.beats.straitRefuse)) {
      this.prompt = "F — Nara will bury the refused water. A canal can be a grave.";
    } else if (npcNear?.id === "nara" && me.beats.sexton) {
      this.prompt = me.heard || "The sexton mark is cult. Nara Vale is at the Strait.";
    } else if (npcNear?.id === "nara" && me.beats.sextonAsk) {
      this.prompt = "F — take the sexton mark. Cult object. Nara walks to the Strait.";
    } else if (npcNear?.id === "ord" && (me.beats.ordPerson || snap.ordPersonHeld)) {
      this.prompt = me.heard || "Ord stays. A person, not a number.";
    } else if (npcNear?.id === "ord" && (me.beats.freeze || snap.frozen) && !me.guest && !snap.m3Open) {
      this.prompt = "F — Ord can stay as a person. Not a fetch.";
    } else if (npcNear?.id === "ord" && (snap.ordAtHijack || me.beats.hijacked) && snap.hijackBy === "safety") {
      this.prompt = me.heard || "Ord claimed the rite for Safety. You are marked. Not a stick.";
    } else if (npcNear?.id === "ord" && (me.beats.ordLast || snap.ordAtCare)) {
      this.prompt = me.heard || "Ord will not number the last god. He stands at the Care.";
    } else if (npcNear?.id === "ord" && (snap.lastGodNamed || me.beats.lastGod) && !me.guest) {
      this.prompt = "F — Ord will not number the last god. He walks to the Care. Not a fetch.";
    } else if (npcNear?.id === "ord" && me.beats.ordWitness) {
      this.prompt = me.heard || "Ord stands at the refused Strait. The number is quieter.";
    } else if (npcNear?.id === "ord" && (me.beats.straitRefuse || snap.straitRefused)) {
      this.prompt = "F — Ord will witness the refused water. He walks. Not a fetch.";
    } else if (npcNear?.id === "ord" && me.beats.cableQuiet) {
      this.prompt = me.heard || "Ord walked to the Cable. The organ is quieter.";
    } else if (npcNear?.id === "ord" && me.beats.errand) {
      this.prompt = "Keep a CRT node (Q). Do not extract. Ord will walk to the Cable.";
    } else if (npcNear?.id === "ord" && me.beats.map) {
      this.prompt = "F — Ord has an errand. Keep a node. Change an organ.";
    } else if (npcNear?.id === "vesper" && (me.beats.vesperPerson || snap.vesperPersonHeld)) {
      this.prompt = me.heard || "Vesper Hale stays. A person, not a furnace.";
    } else if (npcNear?.id === "vesper" && (me.beats.foundryDark || snap.foundryDark) && !me.guest) {
      this.prompt = "F — Vesper Hale can stay as a person. Not a fetch.";
    } else if (npcNear?.id === "vesper" && (snap.vesperAtHijack || (me.beats.hijacked && snap.hijackBy === "cold"))) {
      this.prompt = me.heard || "Vesper Hale claimed the yield. The hour is Cold. You are marked.";
    } else if (npcNear?.id === "vesper" && (me.beats.vesperNoGod || snap.vesperNoGod)) {
      this.prompt = me.heard || "Vesper Hale will not sell the last god. Yield is not a hint.";
    } else if (npcNear?.id === "vesper" && (snap.lastGodNamed || me.beats.lastGod) && !me.guest) {
      this.prompt = "F — Vesper will not sell the last god. The desk lists no absence. Not a fetch.";
    } else if (npcNear?.id === "vesper") {
      this.prompt = me.heard || "Vesper Hale walked. The furnace is off.";
    } else if (foundry && (me.beats.foundryPeople || snap.foundryPeopleHeld) && !me.guest) {
      this.prompt = me.heard || "The Foundry — people. Unlight still works. Not a stick.";
    } else if (foundry && snap.stallPeopleHeld && !me.guest) {
      this.prompt = "F — the Foundry as a house of people. Unlight still works. Not a fetch.";
    } else if (foundry && (snap.earthStanding || me.beats.earthStanding) && !me.guest) {
      this.prompt = me.heard || "House of Earth named the dark heat. Standing. Not a stick.";
    } else if (foundry && (snap.foundryDark || me.beats.foundryDark) && me.house === "earth" && !me.guest) {
      this.prompt = "F — name the dark Foundry for House of Earth. Standing. Not a fetch.";
    } else if (foundry && (snap.foundryDark || me.beats.foundryDark) && !me.guest) {
      this.prompt = me.heard || "The Foundry is dark. Vesper Hale is here. Heat is not a nation.";
    } else if (foundry && me.beats.foundryAsk && !me.guest) {
      this.prompt = "F — unlight the Foundry. Vesper walks. This is not a fetch.";
    } else if (strait && (me.beats.straitPeople || snap.straitPeopleHeld) && !me.guest) {
      this.prompt = me.heard || "The Strait — people. Refuse still works. Not a stick.";
    } else if (strait && snap.foundryPeopleHeld && !me.guest) {
      this.prompt = "F — the Strait as a house of people. Refuse still works. Not a fetch.";
    } else if (strait && (snap.divStanding || me.beats.divStanding) && !me.guest) {
      this.prompt = me.heard || "House of Divinities named the buried water. Standing. Not a stick.";
    } else if (strait && (snap.straitBuried || me.beats.canalBury) && me.house === "divinities" && !me.guest) {
      this.prompt = "F — name the buried Strait for House of Divinities. Standing. Not a fetch.";
    } else if (strait && (snap.straitBuried || me.beats.canalBury) && !me.guest) {
      this.prompt = me.heard || "The canal is in the earth. Nara Vale is burying it.";
    } else if (strait && (snap.straitRefused || me.beats.straitRefuse) && !me.guest) {
      this.prompt = me.heard || "The Strait is refused. The water is not paying.";
    } else if (strait && snap.foundryDark && !me.guest) {
      this.prompt = "F — refuse the Strait. The furnace is dark. Stop the water. Not a fetch.";
    } else if (cable && (me.beats.cablePeople || snap.cablePeopleHeld)) {
      this.prompt = me.heard || "The Cable — people. Quiet still works. Not a stick.";
    } else if (cable && snap.straitPeopleHeld && !me.guest) {
      this.prompt = "F — the Cable as a house of people. Quiet still works. Not a fetch.";
    } else if (cable && (snap.skyStanding || me.beats.skyStanding) && !me.guest) {
      this.prompt = me.heard || "House of Sky named the dark line. Standing. Not a stick.";
    } else if (cable && (snap.cableDark || me.beats.cableDark) && me.house === "sky" && !me.guest) {
      this.prompt = "F — name the dark Cable for House of Sky. Standing. Not a fetch.";
    } else if (cable && (snap.cableDark || me.beats.cableDark) && !me.guest) {
      this.prompt = me.heard || "The Cable is dark. Quiet was mercy. This is absence.";
    } else if (cable && (snap.straitRefused || snap.straitBuried || me.beats.straitRefuse) && !me.guest) {
      this.prompt = "F — cut the Cable. The Strait is not paying. Dark is not a fetch.";
    } else if ((strait || foundry || cable) && snap.m3Open && !me.guest) {
      this.prompt = cable && me.beats.cableQuiet
        ? "The Cable is quiet. You changed the plaque."
        : "F read the organ. Extract here lights a factory there. No country names.";
    } else if (care && snap.careOpen && !me.guest && me.beats.under) {
      this.prompt =
        snap.carePeopleHeld || me.beats.carePeople
          ? me.heard || "The Care — people. Restore still costs. Insurance still costs."
          : snap.peopleHeld && (snap.lastGodNamed || snap.lastGodBuried)
            ? "F — name the Care as a house of people. Restore still costs. Not a fetch."
        : snap.lastGodBuried || me.beats.naraGod
          ? me.heard || "The last god is in the earth. Nara Vale is at the Care."
          : me.beats.lastGod || snap.lastGodNamed
          ? me.heard || "The last god is not here. Absence is a standing. Not a stick."
          : snap.fourfoldHeld
            ? "F — name the last god as absence. The Care is not a room with a body. Not a fetch."
            : me.wink || "F — the Care. A Wink only you can hold.";
    } else if (care && !me.guest && !me.beats.under) {
      this.prompt = "The Care is shut until you go under.";
    } else if (care) {
      this.prompt = "You see a door. You do not see what it is for.";
    } else if (me.heard && (npcNear || burial || under)) {
      this.prompt = me.heard;
    } else if (npcNear && me.wink && !me.guest && me.beats.nara && me.beats.quill && me.beats.ord && !snap.winkBlindHeld && (npcNear.id === "nara" || npcNear.id === "quill" || npcNear.id === "ord")) {
      this.prompt = `F — ${npcNear.name} cannot see the Wink. "You're looking at something I'm not."`;
    } else if (npcNear) {
      this.prompt = `F speak with ${npcNear.name} · ${npcNear.role}`;
    } else if (burial && (me.beats.burialPeople || snap.burialPeopleHeld)) {
      this.prompt = me.heard || "The plot — people. Bury still works. Not a stick.";
    } else if (burial && snap.gardenPeopleHeld && !me.guest) {
      this.prompt = "F — the unnamed plot as a house of people. Bury still works. Not a fetch.";
    } else if (burial) {
      this.prompt = "F bury the unnamed. Nara Vale is watching.";
    } else if (shrine && (me.guest || me.locked)) {
      this.prompt = "A shrine. You do not keep it.";
    } else if (shrine && (me.beats.dodgePeople || snap.dodgePeopleHeld)) {
      this.prompt = me.heard || "Dodge — people. Moving still skips. Standing still does not.";
    } else if (shrine && snap.restraintPeopleHeld && !me.guest) {
      this.prompt = "F — dodge as a house of people. Moving still skips. Not a fetch.";
    } else if (shrine && (me.beats.restraintPeople || snap.restraintPeopleHeld)) {
      this.prompt = me.heard || "Restraint — people. Restraint still thins yield. Storm still burns it. Not a stick.";
    } else if (shrine && snap.hangPeopleHeld && !me.guest) {
      this.prompt = "F — holding-back as a house of people. Restraint still thins yield. Not a fetch.";
    } else if (shrine && (me.beats.keepPeople || snap.keepPeopleHeld)) {
      this.prompt = me.heard || "Keep — people. Eight Bestand. Not a stick.";
    } else if (shrine && snap.restorePeopleHeld && !me.guest) {
      this.prompt = "F — keep as a house of people. Eight Bestand. Not a fetch.";
    } else if (shrine && (me.beats.restorePeople || snap.restorePeopleHeld)) {
      this.prompt = me.heard || "Restore — people. Aura still costs. Not a stick.";
    } else if (shrine && snap.funeralPeopleHeld && !me.guest) {
      this.prompt = "F — restore as a house of people. Aura still costs. Not a fetch.";
    } else if (shrine && (me.beats.insurancePeople || snap.insurancePeopleHeld)) {
      this.prompt = me.heard || "Insurance — people. Insurance still costs. Death still walks you. Not a stick.";
    } else if (shrine && snap.vaultPeopleHeld && !me.guest) {
      this.prompt = "F — the paper as a house of people. Insurance still costs. Not a revive. Not a fetch.";
    } else if (shrine && (me.beats.shrinePeople || snap.shrinePeopleHeld)) {
      this.prompt = me.heard || `The shrine — people. F keep (${SHRINE_COST}). Restore still costs. Not a stick.`;
    } else if (shrine && snap.carePeopleHeld && !me.guest) {
      this.prompt = "F — the shrine as a house of people. Keep still costs. Not a fetch.";
    } else if (shrine && me.stipend > 0) {
      this.prompt = me.heard || `F spend Passing stipend on the shrine (${me.stipend} left). Cult upkeep. Not a stick.`;
    } else if (shrine && (snap.lastGodNamed || me.beats.lastGod) && !me.beats.restraint && !snap.restraintHeld) {
      this.prompt = "F — name holding-back at the shrine. The last god is not a spend. Not a fetch.";
    } else if (shrine && snap.restraintHeld && !me.restraint && !me.guest) {
      this.prompt = me.storm
        ? "Storm burned holding-back. You cannot take Restraint."
        : "F — take Restraint. Yield thins. Winke hold. Storm would burn this. Not a stick.";
    } else if (shrine && (me.beats.restraint || snap.restraintHeld) && !me.insured) {
      this.prompt = me.heard
        || `Holding-back. F keep (${SHRINE_COST}). E restore (${RESTORE_COST}). Q insurance (${INSURANCE_COST}). Not a stick.`;
    } else if (shrine) {
      const vault = me.banked > 0 ? " Vault covers if the pocket is short." : "";
      this.prompt = me.insured
        ? `F keep (${SHRINE_COST}). E restore (${RESTORE_COST}). Paper held — death walks you here. Not a stick.${vault}`
        : `F keep (${SHRINE_COST}). E restore aura (${RESTORE_COST}). Q insurance (${INSURANCE_COST}). A walk, not a revive.${vault}`;
    } else if (wreckNear && me.messenger === "witness" && !me.guest && !me.beats.blitz) {
      this.prompt = "F — Witness Blitz. Trace the last eight graves. Not a stick.";
    } else if (wreckNear && (me.beats.blitz || snap.blitzHeld) && me.messenger === "witness") {
      this.prompt = me.heard || "The traces hold. Eight graves. Combat is not.";
    } else if (wreckNear && me.messenger === "ruin-angel" && !me.guest && !me.beats.ruinBack) {
      this.prompt = "F — name the storm at your back. Every grave is a season. Not a stick.";
    } else if (wreckNear && (me.beats.ruinBack || snap.ruinBackHeld) && me.messenger === "ruin-angel") {
      this.prompt = me.heard || "The storm holds. Graves stay seasons. Combat is not.";
    } else if (funeralNear && (me.beats.campPeople || snap.campPeopleHeld)) {
      this.prompt = me.heard || "Camp — people. Gestell still rises. Aura still thins. Not a stick.";
    } else if (funeralNear && snap.duelPeopleHeld && !me.guest) {
      this.prompt = "F — camping as a house of people. Gestell still rises. Aura still thins. Not a fetch.";
    } else if (funeralNear && (me.beats.duelPeople || snap.duelPeopleHeld)) {
      this.prompt = me.heard || "Duel — people. The grave is still the ring. The kit still does not strike harder. Not a stick.";
    } else if (funeralNear && snap.lastWordPeopleHeld && !me.guest) {
      this.prompt = "F — the ruin duel as a house of people. The grave is still the ring. Not a fetch.";
    } else if (funeralNear && (me.beats.spectatePeople || snap.spectatePeopleHeld)) {
      this.prompt = me.heard || "Spectate — people. Aura still caps. The duel still pays from a person. Not a stick.";
    } else if (funeralNear && snap.hitStopPeopleHeld && !me.guest) {
      this.prompt = "F — spectate as a house of people. Aura still caps. Not a fetch.";
    } else if (funeralNear && (me.beats.funeralPeople || snap.funeralPeopleHeld)) {
      this.prompt = me.heard || "Funeral — people. Twelve Bestand. The body is in the ground. Not a stick.";
    } else if (funeralNear && snap.insurancePeopleHeld && !me.guest) {
      this.prompt = "F — the funeral as a house of people. Twelve Bestand. Not a fetch.";
    } else if (funeralNear && !me.locked) {
      this.prompt = `F funeral. ${FUNERAL_COST} Bestand on Nara Vale's street.`;
    } else if (failNear) {
      this.prompt = me.beats.failed
        ? me.heard || "Last season’s Passing failed. You already watched."
        : "F — watch the failed Passing. Ruin-sight only. Do not loot it.";
    } else if (histNear && !me.guest && palindromeSerial(me.serial) && !me.beats.winkSeed) {
      this.prompt = "F — seed a palindrome Wink. Not a stick.";
    } else if (histNear) {
      this.prompt = "F — bury a prior hour. Only your serial can see this wreckage.";
    } else if (under && (me.beats.underPeople || snap.underPeopleHeld)) {
      this.prompt = me.heard || "Going-under — people. The first hour still works. Not a stick.";
    } else if (under && snap.arenaPeopleHeld && !me.guest) {
      this.prompt = "F — going-under as a house of people. The first hour still works. Not a fetch.";
    } else if (under && movementReady(me.beats)) {
      this.prompt = "F — the first going-under. Guests stop here.";
    } else if (under) {
      this.prompt = "A Wink you cannot spend yet. Speak with Nara Vale, Quill, and Ord. Bury the plot.";
    } else if (
      (sign?.id === "safety-plaque" || sign?.id === "safety-people") &&
      (me.beats.safetyPeople || snap.safetyPeopleHeld)
    ) {
      this.prompt = me.heard || "Safety — people. The freeze still costs. Not a stick.";
    } else if (sign?.id === "safety-plaque" && snap.shrinePeopleHeld && !me.guest) {
      this.prompt = "F — Safety as a house of people. The freeze still costs. Not a fetch.";
    } else if (sign?.id === "safety-plaque" && me.beats.clockOut && snap.annexHome && !me.guest) {
      this.prompt = me.beats.yieldEmpty
        ? me.heard || "The yield is unmanned. The weather still has a name."
        : "F — name the unmanned yield. Both desks are empty. Not a fetch.";
    } else if (sign?.id === "safety-plaque" && snap.addressedHeld) {
      this.prompt = me.heard || "They address you. Presence, not a listing.";
    } else if (sign?.id === "safety-plaque" && snap.weatherNamed && !me.guest && me.aura >= AURA_ADDRESS) {
      this.prompt = "F — they can address you. High aura. Not a stick.";
    } else if (sign) {
      this.prompt = `F read ${sign.title}: ${sign.text}`;
    } else if (clerkNear?.id === "clerk-annex" && snap.frozen && !me.guest) {
      this.prompt = "F — send Annex Runner in. The freeze holds. They stop running. Not a fetch.";
    } else if (clerkNear?.id === "clerk-annex") {
      this.prompt = me.guest
        ? "Someone running papers. Not for you to send inside."
        : "Annex Runner will not come in until the freeze is signed. They will strike if you stay.";
    } else if (clerkNear && snap.weatherNamed && !me.guest) {
      this.prompt = `F — send ${clerkNear.name} home. The weather has a name. The desk will empty.`;
    } else if (clerkNear) {
      this.prompt = `${clerkNear.name} is working the yield. They will strike if you stay. Click to interrupt.`;
    } else if (wreckNear && !me.guest) {
      this.prompt = "Ruin duel. The grave is the ring. Spectators gain a little aura. Not a bigger stick.";
    } else if (keptNear && me.messenger === "herald") {
      this.prompt = "F — Herald Announce. Ping the kept node. This is not a strike.";
    } else if (keptNear && me.messenger === "dweller" && !me.guest && !me.beats.dwell) {
      this.prompt = "F — Dweller Keep. Plant a Clearing seed. Not a stick.";
    } else if (keptNear && (me.beats.dwell || snap.dwellHeld) && me.messenger === "dweller") {
      this.prompt = me.heard || "The seed holds. A Clearing can grow. Combat is not.";
    } else if (nearNode && me.messenger === "cybernetic" && !me.guest && !me.beats.cyber) {
      this.prompt = "F — read the process. Extract drinks Gestell. Keep thins it. Not a stick.";
    } else if (nearNode && (me.beats.cyber || snap.cyberHeld) && me.messenger === "cybernetic") {
      this.prompt = me.heard || "The process holds. Extract still drinks. Combat is not.";
    } else if (nearNode) {
      this.prompt = "E extract Bestand · Q keep (Winke). A guest cannot cash out.";
    } else if (me.heard) {
      this.prompt = me.heard;
    } else {
      this.prompt = "";
    }

    const promptEl = hud("prompt-chip");
    if (promptEl) {
      promptEl.textContent = this.prompt || "Strike leaves wreckage. F to speak. Guests cannot claim.";
      promptEl.style.display = "block";
    }
    const guest = hud("guest-chip");
    if (guest) {
      guest.textContent = me.guest
        ? me.locked
          ? `Guest · locked · aura 0`
          : `Guest · aura 0 · hp ${me.hp}`
        : `Angel ${formatSerial(me.serial)} · ${houseName(me.house)} · ${messengerName(me.messenger)} · aura ${me.aura} · hp ${me.hp}${me.filmRoom ? ` · ${me.filmRoom}` : ""}${me.winkSchool ? ` · ${me.winkSchool}` : ""}${me.storm ? " · storm" : ""}${me.surface ? " · surface" : ""}${me.beats.dwell ? " · seed" : ""}${me.flagged ? " · flagged" : ""}${me.insured ? " · paper" : ""}`;
    }
    const stats = hud("stat-chip");
    if (stats) {
      const winke = winkeVisible(me.guest) ? `Winke ${me.winke}` : "Winke —";
      const claimBit = me.claims?.length ? ` · claims ${me.claims.length}` : "";
      const taxBit = me.inCare ? ` · tax ${snap.tax}` : "";
      const freezeBit = snap.frozen ? " · freeze" : "";
      const omenBit = me.house === "sky" && !snap.passing.outcome ? ` · omen ${snap.passing.ready}` : "";
      const warBit = snap.war?.winner
        ? ` · ${houseName(snap.war.winner)} omen${snap.war.tithePaid ? "" : " · tithe due"}`
        : "";
      const passBit = snap.appearSlow || snap.passing.outcome === "appearance"
        ? " · Passing appearance · aura holds"
        : snap.passing.outcome
        ? ` · Passing ${snap.passing.outcome}`
        : snap.passing.starved
          ? " · Passing starved"
          : snap.clearingOpen
            ? " · Clearing held"
            : omenBit;
      const stanceBit = me.storm
        ? ` · Storm${snap.stormPressHeld ? " vs progress" : ""}`
        : me.restraint
          ? " · Restraint · dodge if moving"
          : snap.hitStopHeld
            ? " · hit-stop"
            : snap.heavyHeld
              ? " · heavy"
              : "";
      const naraBit = snap.naraGone ? " · sexton gone" : "";
      const ordBit = snap.ordGone ? " · Ord gone" : "";
      const quillBit = snap.quillGone ? " · Quill gone" : "";
      const vesperBit = snap.vesperGone ? " · Vesper gone" : "";
      const seasonBit = snap.bracketHeld ? " · equal bracket" : snap.seasonHeld ? " · season" : "";
      const partyBit = me.partyOf ? " · party" : snap.partedHeld ? " · parted" : "";
      const truceBit = me.truceUntil && me.truceUntil > snap.now ? " · truce" : snap.truceHeld ? " · truce held" : "";
      stats.textContent = `Bestand ${me.bestand}${me.banked ? ` · banked ${me.banked}` : ""}${me.stipend ? ` · stipend ${me.stipend}` : ""} · ${winke} · Gestell ${snap.gestell}${taxBit}${freezeBit}${passBit}${warBit}${claimBit}${me.damaged ? ` · cracked ${me.damaged}` : ""}${stanceBit}${naraBit}${ordBit}${quillBit}${vesperBit}${seasonBit}${partyBit}${truceBit}`;
    }
    const lock = hud("lock-panel");
    if (lock) lock.hidden = !me.locked;
    const wink = hud("wink-chip");
    if (wink) {
      wink.hidden = me.guest || !me.wink || me.aura < AURA_DIM;
      wink.textContent = me.wink ? `Wink · ${me.wink}` : "";
    }
    const zone = hud("zone-chip");
    if (zone) {
      zone.textContent = me.inM3
        ? strait
          ? snap.divStanding
            ? "The Strait — Divinities standing"
            : snap.straitBuried
              ? "The Strait — buried"
              : snap.straitRefused
                ? "The Strait — refused"
                : "The Strait"
          : foundry
            ? snap.earthStanding
              ? "The Foundry — Earth standing"
              : snap.foundryDark
                ? "The Foundry — dark"
                : "The Foundry"
            : cable
              ? snap.skyStanding
                ? "The Cable — Sky standing"
                : snap.cableDark
                  ? "The Cable — dark"
                  : me.beats.cableQuiet
                    ? "The Cable — quiet"
                    : "The Cable"
              : "Movement III"
        : ring
          ? snap.creditsHeld || me.beats.credits
            ? "Credits"
          : snap.appearWorld || snap.passing.outcome === "appearance"
            ? "The Clearing — world"
            : snap.naraAtClearing || snap.passing.outcome === "absence"
            ? "The Clearing — absence"
            : snap.hijacked || snap.passing.outcome === "hijack"
              ? snap.hijackBy === "cold"
                ? "The Clearing — Cold"
                : "The Clearing — Safety"
            : snap.stormHeld
              ? "The Clearing — storm"
            : snap.clearingFailed || snap.passing.outcome === "failed"
              ? "The Clearing — failed"
            : snap.clearingOpen
            ? "The Clearing · held"
            : "The Clearing"
        : me.inCare
          ? hall
            ? "The Care · House hall"
            : "The Care"
          : "Nave of Tubes";
    }
  }
}
