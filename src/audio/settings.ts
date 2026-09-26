/**
 * Audio settings: a volume and a mute, kept per browser under one key.
 * Storage is injected so the logic is testable and a blocked localStorage
 * never throws into the game.
 */
export type AudioSettings = { volume: number; muted: boolean };
export type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export const AUDIO_KEY = "reverie.audio";
export const DEFAULT_AUDIO: AudioSettings = { volume: 0.8, muted: false };
export const VOLUME_STEP = 0.1;

/** A finite volume in 0..1, kept to two decimals so steps land on round numbers. */
export function clampVolume(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : DEFAULT_AUDIO.volume;
  return Math.round(Math.min(1, Math.max(0, n)) * 100) / 100;
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/** The saved settings, or the defaults when there are none or they are malformed. */
export function readAudio(storage: StorageLike | null = browserStorage()): AudioSettings {
  try {
    const raw = storage?.getItem(AUDIO_KEY);
    if (!raw) return { ...DEFAULT_AUDIO };
    const parsed = JSON.parse(raw) as { volume?: unknown; muted?: unknown };
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_AUDIO };
    return { volume: clampVolume(parsed.volume), muted: parsed.muted === true };
  } catch {
    return { ...DEFAULT_AUDIO };
  }
}

/** Saves the settings; a storage that refuses is ignored. */
export function writeAudio(s: AudioSettings, storage: StorageLike | null = browserStorage()): void {
  try {
    storage?.setItem(AUDIO_KEY, JSON.stringify({ volume: clampVolume(s.volume), muted: s.muted === true }));
  } catch {
    /* private mode, quota, or a policy: the setting lives for the session only */
  }
}

export const toggleMuted = (s: AudioSettings): AudioSettings => ({ ...s, muted: !s.muted });

/** Steps the volume without touching the mute; a step never leaves 0..1. */
export const stepVolume = (s: AudioSettings, delta: number): AudioSettings => ({ ...s, volume: clampVolume(s.volume + delta) });
