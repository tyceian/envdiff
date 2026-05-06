import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  createBaseline,
  saveBaseline,
  loadBaseline,
  diffAgainstBaseline,
} from "./baseline";

const makeMap = (entries: Record<string, string>) => entries;

describe("createBaseline", () => {
  it("creates entries for each key", () => {
    const map = makeMap({ FOO: "bar", BAZ: "qux" });
    const baseline = createBaseline(map);
    expect(Object.keys(baseline)).toEqual(["FOO", "BAZ"]);
    expect(baseline["FOO"].value).toBe("bar");
    expect(baseline["FOO"].timestamp).toBeTruthy();
  });

  it("handles empty map", () => {
    expect(createBaseline({})).toEqual({});
  });
});

describe("saveBaseline / loadBaseline", () => {
  it("round-trips baseline to disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envdiff-"));
    const filePath = path.join(tmpDir, "baseline.json");
    const map = makeMap({ KEY: "value" });
    const baseline = createBaseline(map);
    saveBaseline(baseline, filePath);
    const loaded = loadBaseline(filePath);
    expect(loaded["KEY"].value).toBe("value");
  });

  it("throws if baseline file does not exist", () => {
    expect(() => loadBaseline("/nonexistent/baseline.json")).toThrow();
  });

  it("creates directory if it does not exist", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envdiff-"));
    const filePath = path.join(tmpDir, "sub", "baseline.json");
    const baseline = createBaseline({ A: "1" });
    saveBaseline(baseline, filePath);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

describe("diffAgainstBaseline", () => {
  it("detects added keys", () => {
    const baseline = createBaseline({ A: "1" });
    const result = diffAgainstBaseline({ A: "1", B: "2" }, baseline);
    expect(result.added).toContain("B");
  });

  it("detects removed keys", () => {
    const baseline = createBaseline({ A: "1", B: "2" });
    const result = diffAgainstBaseline({ A: "1" }, baseline);
    expect(result.removed).toContain("B");
  });

  it("detects changed values", () => {
    const baseline = createBaseline({ A: "old" });
    const result = diffAgainstBaseline({ A: "new" }, baseline);
    expect(result.changed).toContain("A");
  });

  it("returns empty arrays when no changes", () => {
    const baseline = createBaseline({ A: "1" });
    const result = diffAgainstBaseline({ A: "1" }, baseline);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
  });
});
