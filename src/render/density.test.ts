import { describe, expect, it } from "vitest";
import { MAX_DENSITY, cameraZoom, canvasSize, renderDensity, textResolution } from "./density";

describe("render density (round seventy-five)", () => {
  it("draws at the screen's density, from 1 to the cap", () => {
    expect(renderDensity(1)).toBe(1);
    expect(renderDensity(1.25)).toBe(1.25);
    expect(renderDensity(2)).toBe(2);
    expect(renderDensity(3)).toBe(MAX_DENSITY);
  });

  it("never below 1, and 1 when the browser says nothing usable", () => {
    expect(renderDensity(0.5)).toBe(1);
    expect(renderDensity(undefined)).toBe(1);
    expect(renderDensity(Number.NaN)).toBe(1);
    expect(renderDensity(0)).toBe(1);
  });

  it("sizes the canvas in whole device pixels", () => {
    expect(canvasSize(390, 844, 2)).toEqual({ width: 780, height: 1688 });
    expect(canvasSize(1365, 767, 1.25)).toEqual({ width: 1706, height: 959 });
    expect(canvasSize(0, 0, 2)).toEqual({ width: 1, height: 1 });
  });

  it("keeps the world's size on screen: the layout's zoom by CSS width, times the density", () => {
    expect(cameraZoom(1280, 1)).toBe(1.15);
    expect(cameraZoom(1279, 1)).toBe(1);
    expect(cameraZoom(1280, 2)).toBeCloseTo(2.3);
    expect(cameraZoom(390, 2)).toBe(2);
  });

  it("rasterises text at the camera's largest zoom for the density, rounded up (round seventy-eight)", () => {
    expect(textResolution(1)).toBe(2);
    expect(textResolution(1.5)).toBe(2);
    expect(textResolution(2)).toBe(3);
    expect(textResolution(3)).toBe(3);
    expect(textResolution(undefined)).toBe(2);
  });
});
