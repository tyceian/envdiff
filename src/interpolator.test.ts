import {
  parseInterpolationMode,
  interpolateValue,
  interpolateEnvMap,
  findUnresolvedRefs,
} from "./interpolator";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("parseInterpolationMode", () => {
  it("accepts valid modes", () => {
    expect(parseInterpolationMode("strict")).toBe("strict");
    expect(parseInterpolationMode("loose")).toBe("loose");
    expect(parseInterpolationMode("none")).toBe("none");
  });

  it("throws on unknown mode", () => {
    expect(() => parseInterpolationMode("fuzzy")).toThrow("Unknown interpolation mode");
  });
});

describe("interpolateValue", () => {
  const vars = makeMap({ HOST: "localhost", PORT: "5432" });

  it("resolves a single reference", () => {
    expect(interpolateValue("${HOST}", vars)).toBe("localhost");
  });

  it("resolves multiple references", () => {
    expect(interpolateValue("${HOST}:${PORT}", vars)).toBe("localhost:5432");
  });

  it("leaves unresolved refs as-is in loose mode", () => {
    expect(interpolateValue("${UNKNOWN}", vars, "loose")).toBe("${UNKNOWN}");
  });

  it("throws on unresolved ref in strict mode", () => {
    expect(() => interpolateValue("${MISSING}", vars, "strict")).toThrow(
      "Unresolved variable reference: MISSING"
    );
  });

  it("returns value unchanged in none mode", () => {
    expect(interpolateValue("${HOST}", vars, "none")).toBe("${HOST}");
  });
});

describe("interpolateEnvMap", () => {
  it("resolves cross-key references in insertion order", () => {
    const env = makeMap({ BASE: "http://localhost", URL: "${BASE}/api" });
    const result = interpolateEnvMap(env);
    expect(result.get("URL")).toBe("http://localhost/api");
  });

  it("uses baseVars for external references", () => {
    const env = makeMap({ FULL_URL: "${SCHEME}://example.com" });
    const base = makeMap({ SCHEME: "https" });
    const result = interpolateEnvMap(env, "loose", base);
    expect(result.get("FULL_URL")).toBe("https://example.com");
  });

  it("leaves unresolved in loose mode", () => {
    const env = makeMap({ VAL: "${NOPE}" });
    const result = interpolateEnvMap(env, "loose");
    expect(result.get("VAL")).toBe("${NOPE}");
  });
});

describe("findUnresolvedRefs", () => {
  it("returns keys with unresolved placeholders", () => {
    const env = makeMap({ A: "hello", B: "${MISSING}", C: "ok" });
    expect(findUnresolvedRefs(env)).toEqual(["B"]);
  });

  it("returns empty array when all resolved", () => {
    const env = makeMap({ A: "hello", B: "world" });
    expect(findUnresolvedRefs(env)).toEqual([]);
  });
});
