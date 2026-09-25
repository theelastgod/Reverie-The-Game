/**
 * Loads only what the city draws, reports progress to the HUD, then starts
 * the CityScene. Asset URLs honour import.meta.env.BASE_URL (the game deploys
 * under /play/).
 */
import Phaser from "phaser";
import { FLOOR_FILES, type FloorKey } from "../sim/map";
import { bus } from "../render/bus";
import { NPC_SPRITES, TEX, ensureScanlineTexture } from "../render/floors";

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}assets/${path}`.replace(/([^:]\/)\/+/g, "$1");
}

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
  }

  create(): void {
    ensureScanlineTexture(this);
    bus.hud?.setLoading("Entering the Nave", 1);
    this.scene.start("city");
  }
}
