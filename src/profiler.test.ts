import { profileEnvMap, profileAllEnvMaps, hasProfileAnomalies } from "./profiler";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("profileEnvMap", () => {
  it("counts total keys", () => {
    const map = makeMap({ A: "1", B: "2", C: "3" });
    expect(profileEnvMap(map).totalKeys).toBe(3);
  });

  it("detects empty values", () => {
    const map = makeMap({ A: "", B: "  ", C: "hello" });
    const profile = profileEnvMap(map);
    expect(profile.emptyValues).toContain("A");
    expect(profile.emptyValues).toContain("B");
    expect(profile.emptyValues).not.toContain("C");
  });

  it("detects long values", () => {
    const longVal = "x".repeat(300);
    const map = makeMap({ SHORT: "hi", LONG: longVal });
    const profile = profileEnvMap(map);
    expect(profile.longValues).toContain("LONG");
    expect(profile.longValues).not.toContain("SHORT");
  });

  it("detects numeric-only values", () => {
    const map = makeMap({ PORT: "3000", NAME: "app" });
    const profile = profileEnvMap(map);
    expect(profile.numericOnlyValues).toContain("PORT");
    expect(profile.numericOnlyValues).not.toContain("NAME");
  });

  it("detects boolean-like values", () => {
    const map = makeMap({ ENABLED: "true", FLAG: "yes", NAME: "app" });
    const profile = profileEnvMap(map);
    expect(profile.booleanLikeValues).toContain("ENABLED");
    expect(profile.booleanLikeValues).toContain("FLAG");
    expect(profile.booleanLikeValues).not.toContain("NAME");
  });

  it("returns empty arrays when no anomalies", () => {
    const map = makeMap({ KEY: "value" });
    const profile = profileEnvMap(map);
    expect(profile.emptyValues).toHaveLength(0);
    expect(profile.duplicateKeys).toHaveLength(0);
    expect(profile.longValues).toHaveLength(0);
  });
});

describe("profileAllEnvMaps", () => {
  it("profiles multiple environments", () => {
    const maps = {
      dev: makeMap({ A: "", B: "val" }),
      prod: makeMap({ A: "val", B: "other" }),
    };
    const profiles = profileAllEnvMaps(maps);
    expect(profiles.dev.emptyValues).toContain("A");
    expect(profiles.prod.emptyValues).toHaveLength(0);
  });
});

describe("hasProfileAnomalies", () => {
  it("returns true when empty values exist", () => {
    const map = makeMap({ A: "" });
    expect(hasProfileAnomalies(profileEnvMap(map))).toBe(true);
  });

  it("returns false when no anomalies", () => {
    const map = makeMap({ A: "value" });
    expect(hasProfileAnomalies(profileEnvMap(map))).toBe(false);
  });
});
