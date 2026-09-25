/**
 * Transient effects driven by diffs of `you` between snapshots and by input.
 * Strike flash, dodge afterimages, hit-stop, the Wink shimmer, the death
 * fade, the going-under wipe and the Passing outcome flash. Everything here
 * is cosmetic; nothing computes a number that matters.
 */
import Phaser from "phaser";
import type { PassingOutcome } from "../sim/types";
import { COLOR, DEPTH, TEX, UI_FONT } from "./floors";

const STRIKE_MS = 120;
const GHOST_MS = 240;
const SHIMMER_MS = 640;
const UNDER_MS = 1200;

export class Fx {
  private readonly scene: Phaser.Scene;
  private readonly strikes: Phaser.GameObjects.Image[] = [];
  private readonly ghosts: Phaser.GameObjects.Image[] = [];
  private readonly shimmer: Phaser.GameObjects.Arc;
  private readonly veil: Phaser.GameObjects.Rectangle;
  private readonly wing: Phaser.GameObjects.Image;
  private readonly wingText: Phaser.GameObjects.Text;
  private readonly scan: Phaser.GameObjects.TileSprite;
  private underTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.shimmer = scene.add.circle(0, 0, 12).setStrokeStyle(2, COLOR.champagneLight, 1).setDepth(DEPTH.fx).setVisible(false);
    this.veil = scene.add.rectangle(0, 0, 10, 10, COLOR.void, 1).setScrollFactor(0).setDepth(DEPTH.fx + 5).setVisible(false);
    this.wing = scene.add.image(0, 0, TEX.wingStar).setScrollFactor(0).setDepth(DEPTH.fx + 6).setDisplaySize(160, 160).setVisible(false);
    this.wingText = scene.add
      .text(0, 0, "GOING UNDER", { fontFamily: UI_FONT, fontSize: "12px", fontStyle: "700", color: "#c9a56a", letterSpacing: 4 })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.fx + 6)
      .setResolution(2)
      .setVisible(false);
    this.scan = scene.add.tileSprite(0, 0, 10, 10, TEX.scanline).setScrollFactor(0).setDepth(DEPTH.fx + 4).setVisible(false);
  }

  /** Overlays are screen-space: size them to the camera view (zoom-aware). */
  private fitOverlays(): void {
    const cam = this.scene.cameras.main;
    const w = cam.width / cam.zoom;
    const h = cam.height / cam.zoom;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    this.veil.setPosition(cx, cy).setSize(w + 4, h + 4);
    this.scan.setPosition(cx, cy).setSize(w + 4, h + 4);
    this.wing.setPosition(cx, cy - 12);
    this.wingText.setPosition(cx, cy + 92);
  }

  // ------------------------------------------------------------ combat

  /** A flash at the strike point; heavy strikes are bigger and slower to fade. */
  strike(x: number, y: number, heavy: boolean): void {
    let img = this.strikes.find((s) => !s.visible);
    if (!img) {
      img = this.scene.add.image(0, 0, TEX.strike).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.fx);
      this.strikes.push(img);
    }
    const size = heavy ? 96 : 56;
    img.setPosition(x, y).setDisplaySize(size, size).setAlpha(1).setAngle(Math.random() * 360).setVisible(true);
    img.setTint(heavy ? COLOR.champagneLight : 0xffffff);
    this.scene.tweens.add({
      targets: img,
      alpha: 0,
      displayWidth: size * (heavy ? 1.6 : 1.3),
      displayHeight: size * (heavy ? 1.6 : 1.3),
      duration: heavy ? STRIKE_MS * 1.6 : STRIKE_MS,
      ease: "Quad.Out",
      onComplete: () => img!.setVisible(false),
    });
  }

  /** Two ghosts of your body left behind the dash. */
  dodge(x: number, y: number, dx: number, dy: number, texture: string, flip: boolean): void {
    for (let i = 0; i < 2; i++) {
      let g = this.ghosts[i];
      if (!g) {
        g = this.scene.add.image(0, 0, texture).setOrigin(0.5, 0.86).setDisplaySize(56, 72).setDepth(DEPTH.fx).setTint(0xe8d5a3);
        this.ghosts[i] = g;
      }
      if (g.texture.key !== texture) g.setTexture(texture).setDisplaySize(56, 72);
      const back = (i + 1) * 16;
      g.setPosition(x - dx * back, y - dy * back).setFlipX(flip).setAlpha(0.38 - i * 0.12).setVisible(true);
      this.scene.tweens.add({ targets: g, alpha: 0, duration: GHOST_MS + i * 80, ease: "Quad.Out", onComplete: () => g!.setVisible(false) });
    }
  }

  /** A short shake for the hit-stop; the sprite freeze itself lives in Entities. */
  hitStop(): void {
    this.scene.cameras.main.shake(60, 0.0022);
  }

  // ------------------------------------------------------------ private lines and states

  /** A champagne ripple under you when a Wink arrives. */
  wink(x: number, y: number): void {
    const s = this.shimmer;
    s.setPosition(x, y - 2).setRadius(10).setAlpha(0.9).setScale(1, 0.55).setVisible(true);
    this.scene.tweens.add({ targets: s, radius: 54, alpha: 0, duration: SHIMMER_MS, ease: "Cubic.Out", onComplete: () => s.setVisible(false) });
  }

  /** Fade to void and back. */
  death(): void {
    const cam = this.scene.cameras.main;
    cam.fadeOut(260, 10, 10, 10);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => cam.fadeIn(720, 10, 10, 10));
  }

  /** The going-under: a void wipe with the wing-star for UNDER_MS. */
  goingUnder(): void {
    this.fitOverlays();
    this.underTween?.stop();
    const wingScale = 160 / this.wing.width;
    this.veil.setAlpha(0).setVisible(true);
    this.wing.setAlpha(0).setScale(wingScale * 0.9).setVisible(true);
    this.wingText.setAlpha(0).setVisible(true);
    this.underTween = this.scene.tweens.add({
      targets: this.veil,
      alpha: 1,
      duration: UNDER_MS * 0.25,
      ease: "Quad.In",
      onComplete: () => {
        this.scene.tweens.add({ targets: [this.wing, this.wingText], alpha: 1, duration: UNDER_MS * 0.2 });
        this.scene.tweens.add({ targets: this.wing, scale: wingScale * 1.1, duration: UNDER_MS * 0.5, ease: "Sine.InOut" });
        this.scene.time.delayedCall(UNDER_MS * 0.55, () => {
          this.scene.tweens.add({
            targets: [this.veil, this.wing, this.wingText],
            alpha: 0,
            duration: UNDER_MS * 0.2,
            onComplete: () => {
              this.veil.setVisible(false);
              this.wing.setVisible(false);
              this.wingText.setVisible(false);
              this.wing.setScale(wingScale);
            },
          });
        });
      },
    });
  }

  /** The Passing outcome flash. */
  passing(outcome: PassingOutcome): void {
    const cam = this.scene.cameras.main;
    switch (outcome) {
      case "appearance":
        cam.flash(900, 236, 244, 255);
        break;
      case "absence":
        cam.fadeOut(1800, 10, 10, 10);
        cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => cam.fadeIn(1800, 10, 10, 10));
        break;
      case "hijack": {
        this.fitOverlays();
        const s = this.scan;
        s.setTint(COLOR.wine).setAlpha(0.6).setVisible(true);
        this.scene.tweens.add({ targets: s, alpha: 0, tilePositionY: 64, duration: 1600, ease: "Quad.In", onComplete: () => s.setVisible(false) });
        cam.flash(200, 122, 16, 40);
        break;
      }
      case "failed":
        cam.flash(700, 185, 176, 216);
        break;
      default:
        break;
    }
  }

  destroy(): void {
    this.underTween?.stop();
    for (const s of this.strikes) s.destroy();
    for (const g of this.ghosts) g.destroy();
    this.shimmer.destroy();
    this.veil.destroy();
    this.wing.destroy();
    this.wingText.destroy();
    this.scan.destroy();
  }
}
