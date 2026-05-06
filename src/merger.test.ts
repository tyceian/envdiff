import { describe, it, expect } from "vitest";
import {
  mergeEnvMaps,
  parseMergeStrategy,
  formatMergeConflicts,
} from "./merger";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("parseMergeStrategy", () => {
  it("parses last-wins", () => {
    expect(parseMergeStrategy("last-wins")).toBe("last-wins");
  });

  it("parses first-wins", () => {
    expect(parseMergeStrategy("first-wins")).toBe("first-wins");
  });

  it("is case-insensitive", () => {
    expect(parseMergeStrategy("Last-Wins")).toBe("last-wins");
  });

  it("throws on unknown strategy", () => {
    expect(() => parseMergeStrategy("random")).toThrow();
  });
});

describe("mergeEnvMaps", () => {
  it("merges non-overlapping keys", () => {
    const a = makeMap({ FOO: "1" });
    const b = makeMap({ BAR: "2" });
    const { merged, conflicts } = mergeEnvMaps([a, b]);
    expect(merged.get("FOO")).toBe("1");
    expect(merged.get("BAR")).toBe("2");
    expect(conflicts.size).toBe(0);
  });

  it("last-wins on conflict", () => {
    const a = makeMap({ FOO: "first" });
    const b = makeMap({ FOO: "second" });
    const { merged, conflicts } = mergeEnvMaps([a, b], "last-wins");
    expect(merged.get("FOO")).toBe("second");
    expect(conflicts.has("FOO")).toBe(true);
  });

  it("first-wins on conflict", () => {
    const a = makeMap({ FOO: "first" });
    const b = makeMap({ FOO: "second" });
    const { merged } = mergeEnvMaps([a, b], "first-wins");
    expect(merged.get("FOO")).toBe("first");
  });

  it("records all conflicting values", () => {
    const a = makeMap({ KEY: "v1" });
    const b = makeMap({ KEY: "v2" });
    const c = makeMap({ KEY: "v3" });
    const { conflicts } = mergeEnvMaps([a, b, c]);
    expect(conflicts.get("KEY")).toEqual(["v1", "v2", "v3"]);
  });

  it("no conflicts when values are identical", () => {
    const a = makeMap({ FOO: "same" });
    const b = makeMap({ FOO: "same" });
    const { conflicts } = mergeEnvMaps([a, b]);
    expect(conflicts.size).toBe(0);
  });
});

describe("formatMergeConflicts", () => {
  it("returns no-conflict message for empty map", () => {
    expect(formatMergeConflicts(new Map())).toBe("No conflicts.");
  });

  it("formats conflict entries", () => {
    const conflicts = new Map([["FOO", ["a", "b"]]]);
    const output = formatMergeConflicts(conflicts);
    expect(output).toContain("FOO");
    expect(output).toContain('"a"');
    expect(output).toContain('"b"');
  });
});
