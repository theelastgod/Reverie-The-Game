// The Worker's entry module as workerd loads it (round forty-four). workerd takes every named export of the module
// wrangler.toml names as `main` to be a handler, a Durable Object or entrypoint class, or a function; any other value
// (a number, a string, an object without handlers) stops the runtime from starting with "Incorrect type for map entry".
// Round forty-three exported a constant from index.ts: the unit tests, the typecheck and the dry-run bundle all passed,
// and only a Wrangler run caught it. This reads the same module and holds it to the same rule.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const toml = readFileSync(resolve(root, "wrangler.toml"), "utf8");
const main = toml.match(/^main\s*=\s*"([^"]+)"/m)?.[1];

describe("the Worker's entry module", () => {
  it("is the module wrangler.toml names", () => {
    expect(main).toBe("server/src/index.ts");
  });

  it("exports only what workerd can load: functions and classes by name, a handler by default", async () => {
    const entry = (await import(resolve(root, main!))) as Record<string, unknown>;
    const loose = Object.entries(entry)
      .filter(([name]) => name !== "default")
      .filter(([, value]) => typeof value !== "function")
      .map(([name, value]) => `${name} (${typeof value})`);
    expect(loose, "named exports workerd would refuse").toEqual([]);
    const handler = entry.default as { fetch?: unknown } | undefined;
    expect(typeof handler?.fetch).toBe("function");
  });

  it("exports every Durable Object class wrangler.toml binds", async () => {
    const entry = (await import(resolve(root, main!))) as Record<string, unknown>;
    const classes = [...toml.matchAll(/class_name\s*=\s*"([^"]+)"/g)].map(m => m[1]);
    expect(classes.length).toBeGreaterThan(0);
    for (const name of classes) {
      expect(typeof entry[name], name).toBe("function");
      expect(String(entry[name]).startsWith("class "), `${name} is a class`).toBe(true);
    }
  });
});
