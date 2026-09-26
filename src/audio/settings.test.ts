import { describe, expect, it } from "vitest";
import { AUDIO_KEY, DEFAULT_AUDIO, clampVolume, readAudio, stepVolume, toggleMuted, writeAudio, type StorageLike } from "./settings";

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
}

describe("audio settings", () => {
  it("clamps and rounds the volume", () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(1.7)).toBe(1);
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(0.7000000001)).toBe(0.7);
    expect(clampVolume("loud")).toBe(DEFAULT_AUDIO.volume);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_AUDIO.volume);
  });

  it("reads defaults when nothing or nonsense is stored, and round-trips a write", () => {
    expect(readAudio(memory())).toEqual(DEFAULT_AUDIO);
    expect(readAudio(memory({ [AUDIO_KEY]: "{" }))).toEqual(DEFAULT_AUDIO);
    expect(readAudio(memory({ [AUDIO_KEY]: "[1]" }))).toEqual({ volume: DEFAULT_AUDIO.volume, muted: false });
    expect(readAudio(memory({ [AUDIO_KEY]: JSON.stringify({ volume: 3, muted: "yes" }) }))).toEqual({ volume: 1, muted: false });
    const store = memory();
    writeAudio({ volume: 0.3, muted: true }, store);
    expect(readAudio(store)).toEqual({ volume: 0.3, muted: true });
    expect(readAudio(null)).toEqual(DEFAULT_AUDIO);
  });

  it("survives a storage that throws", () => {
    const broken: StorageLike = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("quota"); } };
    expect(readAudio(broken)).toEqual(DEFAULT_AUDIO);
    expect(() => writeAudio({ volume: 0.5, muted: false }, broken)).not.toThrow();
  });

  it("steps within 0..1 and toggles the mute without touching the volume", () => {
    let s = { ...DEFAULT_AUDIO };
    s = stepVolume(s, 0.1); expect(s.volume).toBe(0.9);
    s = stepVolume(s, 0.1); expect(s.volume).toBe(1);
    s = stepVolume(s, 0.1); expect(s.volume).toBe(1);
    s = stepVolume(s, -1.5); expect(s.volume).toBe(0);
    expect(toggleMuted(s)).toEqual({ volume: 0, muted: true });
    expect(toggleMuted(toggleMuted(s))).toEqual(s);
  });
});
