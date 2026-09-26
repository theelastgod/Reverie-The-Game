/**
 * The audio bus. WebAudio behind the pure cues: a bed that cross-fades by
 * district, one music track that ducks the bed, one-shot effects. Files are
 * fetched once and decoded; an absent file is remembered as silence and never
 * asked for again, so a city without the generated sounds plays exactly the
 * same, quietly. The context is created only after a user gesture.
 */
import type { Snap } from "../sim/protocol";
import { genUrl } from "../assets/url";
import { bedFor, musicInputs, musicStep, sfxFor, MUSIC_IDLE, type AudioScene, type MusicState, type SfxName } from "./cues";
import { readAudio, stepVolume, toggleMuted, writeAudio, type AudioSettings, type StorageLike } from "./settings";

type Ctor = new () => AudioContext;
type Voice = { name: string; source: AudioBufferSourceNode; gain: GainNode };

const BED_FADE_S = 1.5;
const MUSIC_FADE_S = 1.0;
const DUCK = 0.5;
const SFX_THROTTLE_MS = 60;
const SFX_LEVEL = 0.9;

function pathFor(kind: "bed" | "sfx" | "music", name: string): string {
  return kind === "music" ? `music/${name}.m4a` : `audio/${kind === "bed" ? name : `sfx-${name}`}.mp3`;
}

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bedGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private manifest: Promise<Set<string>> | null = null;
  private readonly buffers = new Map<string, AudioBuffer | null>();
  private readonly loading = new Map<string, Promise<AudioBuffer | null>>();
  private readonly lastSfx = new Map<string, number>();
  private bed: Voice | null = null;
  private track: Voice | null = null;
  private wantBed: string | null = null;
  private wantTrack: string | null = null;
  private music: MusicState = MUSIC_IDLE;
  private scene: AudioScene = "title";
  private lastSnap: Snap | null = null;
  private settings: AudioSettings;
  private armed = false;
  /** The HUD listens here to redraw its chip. */
  onChange: (() => void) | null = null;

  constructor(
    private readonly urlFor: (target: string) => string = genUrl,
    private readonly storage: StorageLike | null | undefined = undefined,
    private readonly fetcher: typeof fetch = (...a) => fetch(...a),
    private Context: Ctor | null = typeof AudioContext !== "undefined" ? AudioContext : null,
  ) {
    this.settings = readAudio(storage);
  }

  get muted(): boolean { return this.settings.muted; }
  get volume(): number { return this.settings.volume; }
  get currentTrack(): string | null { return this.wantTrack; }
  get currentBed(): string | null { return this.wantBed; }

  /** Resumes on the first gesture; browsers refuse sound before one. */
  armGesture(win: Window): void {
    if (this.armed) return;
    this.armed = true;
    const once = () => {
      win.removeEventListener("pointerdown", once);
      win.removeEventListener("keydown", once);
      this.unlock();
    };
    win.addEventListener("pointerdown", once);
    win.addEventListener("keydown", once);
  }

  /** Called from inside a user gesture: builds the context and resumes it. */
  unlock(): void {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    this.refresh();
  }

  setScene(scene: AudioScene): void {
    if (this.scene === scene) return;
    this.scene = scene;
    this.refresh();
  }

  /** Every snapshot: the bed, the music decision, the diff effects. */
  update(prev: Snap | null, next: Snap, nowMs: number = now()): void {
    this.lastSnap = next;
    this.wantBed = bedFor(next);
    this.music = musicStep(this.music, musicInputs(next, this.scene), nowMs);
    this.wantTrack = this.music.track;
    for (const name of sfxFor(prev, next)) this.play(name, nowMs);
    this.apply();
  }

  play(name: SfxName, nowMs: number = now()): void {
    if (this.settings.muted) return;
    const last = this.lastSfx.get(name) ?? -Infinity;
    if (nowMs - last < SFX_THROTTLE_MS) return;
    this.lastSfx.set(name, nowMs);
    const ctx = this.ctx;
    if (!ctx || !this.sfxGain) return;
    void this.load(pathFor("sfx", name)).then(buffer => {
      if (!buffer || !this.ctx || !this.sfxGain || this.settings.muted) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain);
      source.start();
    });
  }

  setMuted(muted: boolean): void { this.commit({ ...this.settings, muted }); }
  toggleMuted(): void { this.commit(toggleMuted(this.settings)); }
  setVolume(volume: number): void { this.commit({ ...this.settings, volume }); }
  stepVolume(delta: number): void { this.commit(stepVolume(this.settings, delta)); }

  // ------------------------------------------------------------ internals

  private commit(next: AudioSettings): void {
    this.settings = next;
    writeAudio(next, this.storage);
    this.applyLevels();
    this.onChange?.();
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (!this.Context) return null;
    try {
      const ctx = new this.Context();
      this.master = ctx.createGain();
      this.bedGain = ctx.createGain();
      this.musicGain = ctx.createGain();
      this.sfxGain = ctx.createGain();
      this.bedGain.connect(this.master);
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(ctx.destination);
      this.sfxGain.gain.value = SFX_LEVEL;
      this.ctx = ctx;
      this.applyLevels();
      return ctx;
    } catch {
      this.Context = null; // a context that cannot be built is not asked for again
      return null;
    }
  }

  private applyLevels(): void {
    if (!this.ctx || !this.master || !this.bedGain) return;
    const t = this.ctx.currentTime;
    const level = this.settings.muted ? 0 : this.settings.volume;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.linearRampToValueAtTime(level, t + 0.15);
    const duck = this.wantTrack ? DUCK : 1;
    this.bedGain.gain.cancelScheduledValues(t);
    this.bedGain.gain.linearRampToValueAtTime(duck, t + MUSIC_FADE_S);
  }

  /** Re-decides the music for the last snapshot after a scene change or an unlock. */
  private refresh(): void {
    if (this.lastSnap) this.update(null, this.lastSnap);
    else {
      this.wantTrack = this.scene === "city" ? null : "title-theme";
      this.apply();
    }
  }

  private apply(): void {
    if (!this.ctx) return;
    if ((this.bed?.name ?? null) !== this.wantBed) this.swap("bed");
    if ((this.track?.name ?? null) !== this.wantTrack) this.swap("music");
    this.applyLevels();
  }

  private swap(kind: "bed" | "music"): void {
    const want = kind === "bed" ? this.wantBed : this.wantTrack;
    const current = kind === "bed" ? this.bed : this.track;
    const fade = kind === "bed" ? BED_FADE_S : MUSIC_FADE_S;
    if (current) {
      this.fadeOut(current, fade);
      if (kind === "bed") this.bed = null; else this.track = null;
    }
    if (!want) return;
    void this.load(pathFor(kind, want)).then(buffer => {
      // The decision may have moved on while the file decoded.
      const stillWanted = kind === "bed" ? this.wantBed === want : this.wantTrack === want;
      if (!buffer || !this.ctx || !stillWanted) return;
      const already = kind === "bed" ? this.bed : this.track;
      if (already?.name === want) return;
      const out = kind === "bed" ? this.bedGain : this.musicGain;
      if (!out) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(out);
      source.start();
      gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + fade);
      const voice: Voice = { name: want, source, gain };
      if (kind === "bed") this.bed = voice; else this.track = voice;
    });
  }

  private fadeOut(voice: Voice, seconds: number): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.linearRampToValueAtTime(0, t + seconds);
    try { voice.source.stop(t + seconds + 0.05); } catch { /* already stopped */ }
  }

  /** The generated-asset manifest names what exists; without it nothing is fetched, so an unfinished city costs one request. */
  private targets(): Promise<Set<string>> {
    if (this.manifest) return this.manifest;
    this.manifest = (async () => {
      try {
        const res = await this.fetcher(this.urlFor("manifest.json"));
        if (!res.ok) return new Set<string>();
        const body = (await res.json()) as { targets?: Record<string, unknown> };
        return new Set(body && body.targets && typeof body.targets === "object" ? Object.keys(body.targets) : []);
      } catch {
        return new Set<string>();
      }
    })();
    return this.manifest;
  }

  /** Fetches and decodes once per path; absence is cached as null and never retried. */
  private load(path: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(path);
    if (cached !== undefined) return Promise.resolve(cached);
    const pending = this.loading.get(path);
    if (pending) return pending;
    const p = (async () => {
      try {
        const ctx = this.ctx;
        if (!ctx) return null;
        if (!(await this.targets()).has(path)) return null;
        const res = await this.fetcher(this.urlFor(path));
        if (!res.ok) return null;
        const bytes = await res.arrayBuffer();
        return await ctx.decodeAudioData(bytes);
      } catch {
        return null;
      }
    })().then(buffer => {
      this.buffers.set(path, buffer);
      this.loading.delete(path);
      return buffer;
    });
    this.loading.set(path, p);
    return p;
  }
}

const now = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());

/** The one bus the scene, the HUD and the title share. */
export const audio = new AudioBus();
