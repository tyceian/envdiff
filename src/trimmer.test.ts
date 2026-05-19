import {
  parseTrimMode,
  trimValue,
  trimKey,
  trimEnvMap,
  trimAllEnvMaps,
  findUntrimmedKeys,
} from "./trimmer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("parseTrimMode", () => {
  it("defaults to values", () => expect(parseTrimMode(undefined)).toBe("values"));
  it("accepts keys", () => expect(parseTrimMode("keys")).toBe("keys"));
  it("accepts both", () => expect(parseTrimMode("both")).toBe("both"));
  it("falls back to values for unknown", () => expect(parseTrimMode("none")).toBe("values"));
});

describe("trimValue", () => {
  it("trims surrounding whitespace", () => {
    expect(trimValue("  hello  ")).toBe("hello");
  });
  it("removes double quotes", () => {
    expect(trimValue('"my value"')).toBe("my value");
  });
  it("removes single quotes", () => {
    expect(trimValue("'my value'")).toBe("my value");
  });
  it("strips inline comments", () => {
    expect(trimValue("localhost # dev only")).toBe("localhost");
  });
  it("preserves # inside quotes", () => {
    expect(trimValue('"color: #fff"')).toBe("color: #fff");
  });
  it("handles empty string", () => {
    expect(trimValue("")).toBe("");
  });
});

describe("trimKey", () => {
  it("trims whitespace from key", () => {
    expect(trimKey("  DB_HOST  ")).toBe("DB_HOST");
  });
});

describe("trimEnvMap", () => {
  it("trims values by default", () => {
    const m = makeMap({ DB_HOST: "  localhost  ", PORT: '"3000"' });
    const result = trimEnvMap(m);
    expect(result.get("DB_HOST")).toBe("localhost");
    expect(result.get("PORT")).toBe("3000");
  });

  it("trims keys when mode is keys", () => {
    const m = new Map([["  KEY  ", "value"]]);
    const result = trimEnvMap(m, "keys");
    expect(result.has("KEY")).toBe(true);
  });

  it("trims both when mode is both", () => {
    const m = new Map([["  KEY  ", "  value  "]]);
    const result = trimEnvMap(m, "both");
    expect(result.get("KEY")).toBe("value");
  });
});

describe("trimAllEnvMaps", () => {
  it("trims all environments", () => {
    const maps = {
      dev: makeMap({ API_URL: '"http://localhost"' }),
      prod: makeMap({ API_URL: '"https://example.com"' }),
    };
    const result = trimAllEnvMaps(maps);
    expect(result.dev.get("API_URL")).toBe("http://localhost");
    expect(result.prod.get("API_URL")).toBe("https://example.com");
  });
});

describe("findUntrimmedKeys", () => {
  it("returns keys with untrimmed values", () => {
    const m = makeMap({ KEY: "  value  ", CLEAN: "clean" });
    const issues = findUntrimmedKeys(m);
    expect(issues).toHaveLength(1);
    expect(issues[0].key).toBe("KEY");
    expect(issues[0].trimmed).toBe("value");
  });

  it("returns empty when all clean", () => {
    const m = makeMap({ KEY: "value" });
    expect(findUntrimmedKeys(m)).toHaveLength(0);
  });
});
