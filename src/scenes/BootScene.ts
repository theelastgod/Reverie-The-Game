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
    this.load.image("tile-nave", asset("tiles/nave-v2.png"));
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
    this.load.image("tile-m3", asset("tiles/m3.jpg"));
    this.load.image("tile-operator", asset("tiles/operator.jpg"));
    this.load.image("tile-under", asset("tiles/under.jpg"));
    this.load.image("tile-garden", asset("tiles/garden.jpg"));
    this.load.image("tile-annex", asset("tiles/annex.jpg"));
    this.load.image("tile-screening", asset("tiles/screening.jpg"));
    this.load.image("tile-claims", asset("tiles/claims.jpg"));
    this.load.image("prop-crt", asset("tiles/crt.jpg"));
    this.load.image("house-hall", asset("house-hall.jpg"));
    this.load.image("safety-annex", asset("safety-annex.jpg"));
    this.load.image("serial-wreckage", asset("serial-wreckage.jpg"));
    this.load.image("clearing-stall", asset("clearing-stall.jpg"));
    this.load.image("stall-surface", asset("stall-surface.jpg"));
    this.load.image("wreckage-garden", asset("wreckage-garden.jpg"));
    this.load.image("organ-strait", asset("organ-strait.jpg"));
    this.load.image("failed-passing", asset("failed-passing.jpg"));
    this.load.image("clearing-ring", asset("clearing-ring.jpg"));
    this.load.image("organ-foundry-dark", asset("organ-foundry-dark.jpg"));
    this.load.image("wet-grid-cult", asset("wet-grid-cult.jpg"));
    this.load.image("organ-cable-dark", asset("organ-cable-dark.jpg"));
    this.load.image("house-war", asset("house-war.jpg"));
    this.load.image("shrine-upkeep", asset("shrine-upkeep.jpg"));
    this.load.image("plate-m3", asset("plate-m3.jpg"));
    this.load.image("plate-care", asset("plate-care.jpg"));
    this.load.image("plate-forge", asset("plate-forge.jpg"));
    this.load.image("plate-operator", asset("plate-operator.jpg"));
    this.load.image("plate-under", asset("plate-under.jpg"));
    this.load.image("plate-arena", asset("plate-arena.jpg"));
    this.load.image("plate-screening", asset("plate-screening.jpg"));
    this.load.image("plate-claims", asset("plate-claims.jpg"));
    this.load.image("plate-burial", asset("plate-burial.jpg"));
    this.load.image("plate-ione", asset("plate-ione.jpg"));
    this.load.image("plate-vesper", asset("plate-vesper.jpg"));
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
