import { describe, expect, it } from "vitest";
import { AudioBus } from "./bus";

/** Just enough of an AudioContext for the bus: gains, a state, suspend and resume counted. */
class FakeContext {
  state: "running" | "suspended" | "closed" = "suspended";
  currentTime = 0;
  destination = {};
  suspends = 0;
  resumes = 0;
  createGain() {
    const param = { value: 1, cancelScheduledValues() {}, linearRampToValueAtTime() {}, setValueAtTime() {} };
    return { gain: param, connect() {} };
  }
  suspend() { this.suspends++; this.state = "suspended"; return Promise.resolve(); }
  resume() { this.resumes++; this.state = "running"; return Promise.resolve(); }
}

function rig() {
  let made: FakeContext | null = null;
  const Ctor = function (this: unknown) { made = new FakeContext(); return made; } as unknown as new () => AudioContext;
  const fetcher = (() => Promise.resolve(new Response("{}", { status: 404 }))) as typeof fetch;
  const bus = new AudioBus(t => t, null, fetcher, Ctor);
  // main.ts's one page listener hands the bus the page's visibility (round seventy)
  const show = (state: DocumentVisibilityState) => bus.setHidden(state === "hidden");
  return { bus, show, ctx: () => made as FakeContext | null };
}

describe("the audio bus and a hidden page (the player-defect sweep, round sixty-one)", () => {
  it("suspends a running context when the page is hidden and resumes it when the page shows again", () => {
    const { bus, show, ctx } = rig();
    bus.unlock();
    const c = ctx()!;
    expect(c.state).toBe("running");
    show("hidden");
    expect(c.state).toBe("suspended");
    expect(c.suspends).toBe(1);
    show("visible");
    expect(c.state).toBe("running");
    expect(c.resumes).toBe(2); // the unlock's and the return's
  });

  it("does nothing before the context exists, and builds none", () => {
    const { show, ctx } = rig();
    show("hidden");
    show("visible");
    expect(ctx()).toBeNull();
  });

  it("suspends a context not yet running (the unlock's resume still pending) and resumes it on return (round sixty-nine)", () => {
    const { bus, show, ctx } = rig();
    bus.unlock();
    const c = ctx()!;
    c.state = "suspended"; // ENTER's resume not yet resolved when the tab is switched away
    show("hidden");
    expect(c.suspends).toBe(1);
    show("visible");
    expect(c.resumes).toBe(2);
    expect(c.state).toBe("running");
  });

  it("leaves a closed context alone and suspends once for repeated hides", () => {
    const { bus, show, ctx } = rig();
    bus.unlock();
    const c = ctx()!;
    show("hidden");
    show("hidden");
    expect(c.suspends).toBe(1);
    show("visible");
    c.state = "closed";
    show("hidden");
    expect(c.suspends).toBe(1);
  });
});
