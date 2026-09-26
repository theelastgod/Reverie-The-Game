/**
 * Loads only what the city draws, reports progress to the HUD, then starts
 * the CityScene. Asset URLs honour import.meta.env.BASE_URL (the game deploys
 * under /play/).
 */
import Phaser from "phaser";
import { FLOOR_FILES, type FloorKey } from "../sim/map";
import { bus } from "../render/bus";
import { NPC_SPRITES, TEX, ensureRainTexture, ensureScanlineTexture } from "../render/floors";
import { assetUrl } from "../ui/format";
import { gen, genUrl } from "../assets/gen";
import { PROP_KINDS, propTarget } from "../assets/slots";

/** The texture key of a generated file, so the renderers can ask `textures.exists` for it. */
export const genTex = (target: string): string => `gen:${target}`;

/** The generated textures the city draws when they exist: enemy sprites and props. Seals, badges, portraits, plates and loops stay DOM. */
export const GEN_TEXTURES: readonly string[] = ["sprites/warden.png", "sprites/enforcer.png", "sprites/hour-clerk.png", ...PROP_KINDS.map(propTarget)];

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    bus.hud?.setLoading("Opening the city", 0);
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      bus.hud?.setLoading("Opening the city", progress);
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: { key?: string }) => {
      bus.hud?.setLoading(`Missing ${file?.key ?? "asset"}`, undefined);
    });

    for (const key of Object.keys(FLOOR_FILES) as FloorKey[]) this.load.image(TEX.floor(key), assetUrl(FLOOR_FILES[key]));
    this.load.image(TEX.crt, assetUrl("tiles/crt.jpg"));

    const sprites = [TEX.guest, TEX.angel, TEX.clerk, ...NPC_SPRITES, TEX.aura, TEX.strike, TEX.wreckage];
    for (const s of sprites) this.load.image(s, assetUrl(`sprites/${s}.png`));

    this.load.image(TEX.history, assetUrl("serial-wreckage.jpg"));
    this.load.image(TEX.failed, assetUrl("failed-passing.jpg"));
    this.load.image(TEX.wingStar, assetUrl("wing-star.png"));

    // Generated textures: only the files the manifest names; an absent one is never requested.
    for (const target of GEN_TEXTURES) if (gen.has(target)) this.load.image(genTex(target), genUrl(target));
  }

  create(): void {
    ensureScanlineTexture(this);
    ensureRainTexture(this);
    bus.hud?.setLoading("Entering the Nave", 1);
    this.scene.start("city");
  }
}
