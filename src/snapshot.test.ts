import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  compareSnapshots,
} from "./snapshot";

function makeMaps(): Record<string, Record<string, string>> {
  return {
    development: { API_URL: "http://localhost", DEBUG: "true" },
    production: { API_URL: "https://prod.example.com", DEBUG: "false" },
  };
}

describe("createSnapshot", () => {
  it("creates a snapshot with label and timestamp", () => {
    const snap = createSnapshot("v1", makeMaps());
    expect(snap.label).toBe("v1");
    expect(snap.timestamp).toBeTruthy();
    expect(snap.envMaps).toEqual(makeMaps());
  });

  it("timestamp is a valid ISO string", () => {
    const snap = createSnapshot("test", {});
    expect(() => new Date(snap.timestamp)).not.toThrow();
  });
});

describe("saveSnapshot / loadSnapshot", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envdiff-snap-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("saves and loads a snapshot correctly", () => {
    const snap = createSnapshot("v1", makeMaps());
    const filePath = path.join(tmpDir, "snap.json");
    saveSnapshot(snap, filePath);
    const loaded = loadSnapshot(filePath);
    expect(loaded.label).toBe("v1");
    expect(loaded.envMaps).toEqual(makeMaps());
  });

  it("throws if snapshot file does not exist", () => {
    expect(() => loadSnapshot(path.join(tmpDir, "missing.json"))).toThrow(
      "not found"
    );
  });

  it("throws if snapshot file has invalid format", () => {
    const filePath = path.join(tmpDir, "bad.json");
    fs.writeFileSync(filePath, JSON.stringify({ foo: "bar" }), "utf-8");
    expect(() => loadSnapshot(filePath)).toThrow("Invalid snapshot format");
  });
});

describe("compareSnapshots", () => {
  it("detects added keys", () => {
    const older = createSnapshot("v1", { dev: { A: "1" } });
    const newer = createSnapshot("v2", { dev: { A: "1", B: "2" } });
    const result = compareSnapshots(older, newer);
    expect(result.dev.added).toContain("B");
  });

  it("detects removed keys", () => {
    const older = createSnapshot("v1", { dev: { A: "1", B: "2" } });
    const newer = createSnapshot("v2", { dev: { A: "1" } });
    const result = compareSnapshots(older, newer);
    expect(result.dev.removed).toContain("B");
  });

  it("detects changed keys", () => {
    const older = createSnapshot("v1", { dev: { A: "old" } });
    const newer = createSnapshot("v2", { dev: { A: "new" } });
    const result = compareSnapshots(older, newer);
    expect(result.dev.changed).toContain("A");
  });

  it("handles env present only in one snapshot", () => {
    const older = createSnapshot("v1", { dev: { A: "1" } });
    const newer = createSnapshot("v2", { dev: { A: "1" }, prod: { X: "y" } });
    const result = compareSnapshots(older, newer);
    expect(result.prod.added).toContain("X");
  });
});
