import Phaser from "phaser";
import {
  CARE_DOOR,
  formatSerial,
  GOING_UNDER,
  HOUSE_HALL,
  SAFETY_ANNEX,
  CLEARING_STALL,
  CLEARING_PRICE,
  M3_DOOR,
  OPERATOR_DESK,
  ORGAN_STRAIT,
  ORGAN_FOUNDRY,
  ORGAN_CABLE,
  PRIVATE_YIELD,
  WRECK_GARDEN,
  movementReady,
  NAVE_NPCS,
  NAVE_SIGNS,
  nearPoint,
  TEST_SERIAL,
  visibleFailed,
  visibleHistory,
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
  private npcMarks = new Map<string, Phaser.GameObjects.Image>();
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
      .text(TILE * 2, TILE * 2.9, "WASD · F speak / read / bury / under · click strike clerks · E extract · Q keep", {
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
    this.input.keyboard.addKey("SPACE").on("down", () => this.net.strike());
    this.input.on("pointerdown", () => this.net.strike());
    hud("mock-link")?.addEventListener("click", () => this.net.link(TEST_SERIAL));

    this.net.connect();
  }

  private drawSign(s: Sign) {
    if (this.signLabels.has(s.id)) return;
    this.add.rectangle(s.x, s.y, 112, 28, 0xffffff).setStrokeStyle(3, 0x0a0a0a).setDepth(4);
    if (s.id === HOUSE_HALL.id) {
      this.add.image(s.x, s.y - 52, "house-hall").setDisplaySize(88, 50).setDepth(3);
    }
    if (s.id === SAFETY_ANNEX.id) {
      this.add.image(s.x, s.y - 52, "safety-annex").setDisplaySize(88, 50).setDepth(3);
    }
    if (s.id === CLEARING_STALL.id) {
      this.add.image(s.x, s.y - 52, "clearing-stall").setDisplaySize(88, 50).setDepth(3);
    }
    if (s.id === ORGAN_STRAIT.id) {
      this.add.image(s.x, s.y - 52, "organ-strait").setDisplaySize(88, 50).setDepth(3);
    }
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
    for (const n of NAVE_NPCS) {
      if (this.npcMarks.has(n.id)) continue;
      const img = this.add.image(n.x, n.y, n.id).setDisplaySize(52, 64).setDepth(9);
      this.add
        .text(n.x, n.y - 40, n.name, {
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "11px",
          color: "#e8d5a3",
        })
        .setOrigin(0.5)
        .setDepth(11);
      this.npcMarks.set(n.id, img);
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
    const n = nodes.find((node) => !node.depleted && Phaser.Math.Distance.Between(me.x, me.y, node.x, node.y) < 40);
    if (n) this.net.use(n.id, choice);
  }

  private interact() {
    const me = this.net.you;
    if (!me) return;
    const npc = NAVE_NPCS.find((n) => nearPoint(me.x, me.y, n.x, n.y));
    if (npc) {
      this.net.talk(npc.id);
      return;
    }
    const sign = (this.net.snap?.signs ?? NAVE_SIGNS).find((s) => nearPoint(me.x, me.y, s.x, s.y, 56));
    if (sign) {
      this.net.read(sign.id);
      return;
    }
    if (me.locked) return;
    const rites = this.net.snap?.rites ?? [];
    const burial = rites.find((r) => r.kind === "burial" && !r.done && nearPoint(me.x, me.y, r.x, r.y));
    const wreck = this.net.snap?.wreckage.find((r) => nearPoint(me.x, me.y, r.x, r.y, 56));
    const hist = visibleHistory(me.guest, me.serial, this.net.snap?.history ?? []).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const garden = rites.find((r) => r.kind === "garden" && !r.done && nearPoint(me.x, me.y, r.x, r.y, 56));
    const failed = visibleFailed(me.guest, me.serial, this.net.snap?.failed ?? []).find((h) =>
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

  private bodyFor(p: Player): Phaser.GameObjects.Image {
    let img = this.bodies.get(p.id);
    if (!img) {
      img = this.add.image(p.x, p.y, "guest").setDisplaySize(40, 48).setDepth(10);
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

  private syncRites() {
    const rites = this.net.snap?.rites ?? [];
    for (const r of rites) {
      let g = this.riteMarks.get(r.id);
      if (!g) {
        g = this.add.circle(r.x, r.y, r.kind === "going-under" ? 18 : 12, 0x7a1028, 0.75).setDepth(4);
        if (r.kind === "garden") {
          this.add.image(r.x, r.y - 36, "wreckage-garden").setDisplaySize(72, 40).setDepth(3);
        }
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
        img = this.add.image(c.x, c.y, "clerk").setDisplaySize(36, 44).setDepth(8);
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
          : poi.kind === "house-hall"
            ? 0xc9a56a
            : poi.kind === "safety-frozen"
              ? 0x7eb6ff
              : poi.kind === "safety-annex"
                ? 0xe8e8e8
              : poi.kind === "clearing-listed"
                ? 0x7eb6ff
            : poi.kind === "care-open"
              ? 0x7eb6ff
              : poi.kind === "operator-desk"
                ? 0xc9a56a
                : poi.kind === "m3-open"
                  ? 0xff2d6b
                  : poi.kind === "m3-shut"
                    ? 0x3a3a3a
                    : poi.kind === "wreckage-garden"
                      ? 0x7a1028
                      : poi.kind.startsWith("organ-")
                        ? 0xc9a56a
            : poi.kind === "care-shut"
                ? 0x3a3a3a
                : 0x5a5a5a;
      g.setFillStyle(fill, 0.85);
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
    const histSeen = new Set<string>();
    for (const h of visibleHistory(me.guest, me.serial, snap.history ?? [])) {
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
    for (const f of visibleFailed(me.guest, me.serial, snap.failed ?? [])) {
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

    const npcNear = NAVE_NPCS.find((n) => nearPoint(me.x, me.y, n.x, n.y));
    const burial = snap.rites.find((r) => r.kind === "burial" && !r.done && nearPoint(me.x, me.y, r.x, r.y));
    const sign = (snap.signs ?? NAVE_SIGNS).find((s) => nearPoint(me.x, me.y, s.x, s.y, 56));
    const clerkNear = snap.clerks.find((c) => nearPoint(me.x, me.y, c.x, c.y, 70));
    const under = nearPoint(me.x, me.y, GOING_UNDER.x, GOING_UNDER.y, 56);
    const care = nearPoint(me.x, me.y, CARE_DOOR.x, CARE_DOOR.y, 56);
    const hall = nearPoint(me.x, me.y, HOUSE_HALL.x, HOUSE_HALL.y, 56);
    const annex = nearPoint(me.x, me.y, SAFETY_ANNEX.x, SAFETY_ANNEX.y, 56);
    const stall = nearPoint(me.x, me.y, CLEARING_STALL.x, CLEARING_STALL.y, 56);
    const desk = nearPoint(me.x, me.y, OPERATOR_DESK.x, OPERATOR_DESK.y, 56);
    const m3 = nearPoint(me.x, me.y, M3_DOOR.x, M3_DOOR.y, 56);
    const gardenNear = snap.rites.find((r) => r.kind === "garden" && nearPoint(me.x, me.y, r.x, r.y, 56));
    const strait = nearPoint(me.x, me.y, ORGAN_STRAIT.x, ORGAN_STRAIT.y, 56);
    const foundry = nearPoint(me.x, me.y, ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y, 56);
    const cable = nearPoint(me.x, me.y, ORGAN_CABLE.x, ORGAN_CABLE.y, 56);
    const histNear = visibleHistory(me.guest, me.serial, snap.history ?? []).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const failNear = visibleFailed(me.guest, me.serial, snap.failed ?? []).find((h) =>
      nearPoint(me.x, me.y, h.x, h.y, 56),
    );
    const nearNode = snap.nodes.find(
      (n) => !n.depleted && Phaser.Math.Distance.Between(me.x, me.y, n.x, n.y) < 40,
    );

    if (me.locked) {
      this.prompt = care ? me.heard || "You see a door. You do not see what it is for." : me.heard || "A guest cannot prepare the ground.";
    } else if (hall && me.inCare && !me.guest) {
      this.prompt = me.beats.hall
        ? me.heard
        : `F read House of Mortals. Gestell tax ${snap.tax}. The number does not strike.`;
    } else if (hall) {
      this.prompt = "You see a hall. You do not see who owns the nodes.";
    } else if (annex && (me.guest || me.locked)) {
      this.prompt = "A desk. Paper. You are not the one who signs.";
    } else if (annex && snap.frozen) {
      this.prompt = me.heard || "The freeze holds. The Passing stays hungry.";
    } else if (annex && me.beats.hall) {
      this.prompt = "F — sign the freeze. The district holds. The Passing will starve.";
    } else if (annex) {
      this.prompt = "Safety Annex. The desk will not take a name that has not read the hall.";
    } else if (stall && (me.guest || me.locked)) {
      this.prompt = "A stall of lights. You cannot afford a sky you cannot see.";
    } else if (stall && me.beats.market) {
      this.prompt = `F — buy the copy. ${CLEARING_PRICE} Bestand. The Clearing stays closed.`;
    } else if (stall && me.beats.hall) {
      this.prompt = "F — Quill listed a Clearing. It looks like freedom.";
    } else if (stall) {
      this.prompt = "Quill is selling something. You do not yet have the eyes for the price.";
    } else if (desk && (me.guest || me.locked)) {
      this.prompt = "A woman at a desk. She is not speaking to you.";
    } else if (desk && me.beats.cold) {
      this.prompt = me.heard || "You took the private yield. Movement III is funded.";
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
    } else if (m3 && snap.m3Open && !me.guest) {
      this.prompt = me.inM3 ? me.heard || "The Third Movement is organs, not nations." : "F — enter Movement III. Strait / Foundry / Cable.";
    } else if (m3) {
      this.prompt = "Movement III is shut. The private yield funds this door the Cold way.";
    } else if (gardenNear && !gardenNear.done && !me.guest) {
      this.prompt = "F bury the Clearing that Movement I over-extracted. Nara Vale will not speak until you do.";
    } else if ((strait || foundry || cable) && snap.m3Open && !me.guest) {
      this.prompt = "F read the organ. Extract here lights a factory there. No country names.";
    } else if (care && snap.careOpen && !me.guest && me.beats.under) {
      this.prompt = me.wink || "F — the Care. A Wink only you can hold.";
    } else if (care && !me.guest && !me.beats.under) {
      this.prompt = "The Care is shut until you go under.";
    } else if (care) {
      this.prompt = "You see a door. You do not see what it is for.";
    } else if (me.heard && (npcNear || burial || under)) {
      this.prompt = me.heard;
    } else if (npcNear) {
      this.prompt = `F speak with ${npcNear.name} · ${npcNear.role}`;
    } else if (burial) {
      this.prompt = "F bury the unnamed. Nara Vale is watching.";
    } else if (failNear) {
      this.prompt = me.beats.failed
        ? me.heard || "Last season’s Passing failed. You already watched."
        : "F — watch the failed Passing. Ruin-sight only. Do not loot it.";
    } else if (histNear) {
      this.prompt = "F — bury a prior hour. Only your serial can see this wreckage.";
    } else if (under && movementReady(me.beats)) {
      this.prompt = "F — the first going-under. Guests stop here.";
    } else if (under) {
      this.prompt = "A Wink you cannot spend yet. Speak with Nara Vale, Quill, and Ord. Bury the plot.";
    } else if (sign) {
      this.prompt = `F read ${sign.title}: ${sign.text}`;
    } else if (clerkNear) {
      this.prompt = `${clerkNear.name} is working the yield. They will strike if you stay. Click to interrupt.`;
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
        : `Angel ${formatSerial(me.serial)} · aura ${me.aura} · hp ${me.hp}`;
    }
    const stats = hud("stat-chip");
    if (stats) {
      const winke = winkeVisible(me.guest) ? `Winke ${me.winke}` : "Winke —";
      const taxBit = me.inCare ? ` · tax ${snap.tax}` : "";
      const freezeBit = snap.frozen ? " · freeze" : "";
      const passBit = snap.passing.starved ? " · Passing starved" : "";
      stats.textContent = `Bestand ${me.bestand} · ${winke} · Gestell ${snap.gestell}${taxBit}${freezeBit}${passBit}`;
    }
    const lock = hud("lock-panel");
    if (lock) lock.hidden = !me.locked;
    const wink = hud("wink-chip");
    if (wink) {
      wink.hidden = me.guest || !me.wink;
      wink.textContent = me.wink ? `Wink · ${me.wink}` : "";
    }
    const zone = hud("zone-chip");
    if (zone) {
      zone.textContent = me.inM3
        ? strait
          ? "The Strait"
          : foundry
            ? "The Foundry"
            : cable
              ? "The Cable"
              : "Movement III"
        : me.inCare
          ? hall
            ? "The Care · House hall"
            : "The Care"
          : "Nave of Tubes";
    }
  }
}
