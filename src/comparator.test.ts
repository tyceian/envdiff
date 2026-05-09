import { describe, it, expect } from "vitest";
import {
  parseCompareMode,
  normalizeValue,
  compareValues,
  compareEnvMaps,
  countMismatches,
} from "./comparator";

const opts = { mode: "strict" as const };

describe("parseCompareMode", () => {
  it("parses valid modes", () => {
    expect(parseCompareMode("strict")).toBe("strict");
    expect(parseCompareMode("loose")).toBe("loose");
    expect(parseCompareMode("keys-only")).toBe("keys-only");
  });

  it("throws on unknown mode", () => {
    expect(() => parseCompareMode("fuzzy")).toThrow(/Unknown compare mode/);
  });
});

describe("normalizeValue", () => {
  it("lowercases when ignoreCase", () => {
    expect(normalizeValue("Hello", { mode: "loose", ignoreCase: true })).toBe("hello");
  });

  it("trims when ignoreWhitespace", () => {
    expect(normalizeValue("  hi  ", { mode: "loose", ignoreWhitespace: true })).toBe("hi");
  });

  it("returns value unchanged with no flags", () => {
    expect(normalizeValue("Value", opts)).toBe("Value");
  });
});

describe("compareValues", () => {
  it("matches equal values in strict mode", () => {
    const r = compareValues("KEY", "val", "val", opts);
    expect(r.match).toBe(true);
  });

  it("fails on different values in strict mode", () => {
    const r = compareValues("KEY", "val", "VAL", opts);
    expect(r.match).toBe(false);
    expect(r.reason).toMatch(/strict/);
  });

  it("matches case-insensitively in loose mode with ignoreCase", () => {
    const r = compareValues("KEY", "val", "VAL", { mode: "loose", ignoreCase: true });
    expect(r.match).toBe(true);
  });

  it("keys-only: matches when both keys present", () => {
    const r = compareValues("KEY", "anything", "other", { mode: "keys-only" });
    expect(r.match).toBe(true);
  });

  it("keys-only: fails when one side missing", () => {
    const r = compareValues("KEY", undefined, "val", { mode: "keys-only" });
    expect(r.match).toBe(false);
  });
});

describe("compareEnvMaps", () => {
  it("returns sorted compare results for all keys", () => {
    const left = new Map([["A", "1"], ["B", "2"]]);
    const right = new Map([["A", "1"], ["C", "3"]]);
    const results = compareEnvMaps(left, right, opts);
    expect(results.map((r) => r.key)).toEqual(["A", "B", "C"]);
    expect(results.find((r) => r.key === "A")?.match).toBe(true);
    expect(results.find((r) => r.key === "B")?.match).toBe(false);
  });
});

describe("countMismatches", () => {
  it("counts non-matching results", () => {
    const results = [
      { match: true, key: "A" },
      { match: false, key: "B" },
      { match: false, key: "C" },
    ];
    expect(countMismatches(results)).toBe(2);
  });
});
