import { describe, it, expect } from "vitest";
import { maskFull, maskPartial, maskLength, maskValue, parseMaskMode } from "./masker";

describe("maskFull", () => {
  it("returns *** for any value", () => {
    expect(maskFull("supersecret")).toBe("***");
    expect(maskFull("x")).toBe("***");
  });
});

describe("maskPartial", () => {
  it("shows last 4 chars with asterisks prefix", () => {
    const result = maskPartial("supersecret");
    expect(result).toMatch(/\*+cret$/);
  });

  it("fully masks short values", () => {
    expect(maskPartial("abc")).toBe("***");
  });

  it("respects custom visibleChars", () => {
    const result = maskPartial("abcdefgh", 2);
    expect(result).toMatch(/\*+gh$/);
  });

  it("caps hidden asterisks at 6", () => {
    const result = maskPartial("averylongsecretvalue", 4);
    const stars = result.replace(/[^*]/g, "");
    expect(stars.length).toBeLessThanOrEqual(6);
  });
});

describe("maskLength", () => {
  it("returns length hint string", () => {
    expect(maskLength("hello")).toBe("[5 chars]");
    expect(maskLength("")).toBe("[0 chars]");
  });
});

describe("maskValue", () => {
  it("defaults to full mask", () => {
    expect(maskValue("secret")).toBe("***");
  });

  it("applies partial mode", () => {
    const result = maskValue("mysecret", "partial");
    expect(result).toMatch(/\*+cret$/);
  });

  it("applies length mode", () => {
    expect(maskValue("hello", "length")).toBe("[5 chars]");
  });

  it("preserves empty string", () => {
    expect(maskValue("", "full")).toBe("");
    expect(maskValue("", "partial")).toBe("");
  });
});

describe("parseMaskMode", () => {
  it("parses valid modes", () => {
    expect(parseMaskMode("full")).toBe("full");
    expect(parseMaskMode("partial")).toBe("partial");
    expect(parseMaskMode("length")).toBe("length");
  });

  it("falls back to full for unknown values", () => {
    expect(parseMaskMode("blah")).toBe("full");
    expect(parseMaskMode(undefined)).toBe("full");
  });
});
