import * as fs from "fs";
import * as path from "path";

export interface BaselineEntry {
  key: string;
  value: string;
  timestamp: string;
}

export type BaselineMap = Record<string, BaselineEntry>;

export function createBaseline(envMap: Record<string, string>): BaselineMap {
  const timestamp = new Date().toISOString();
  const baseline: BaselineMap = {};
  for (const [key, value] of Object.entries(envMap)) {
    baseline[key] = { key, value, timestamp };
  }
  return baseline;
}

export function saveBaseline(baseline: BaselineMap, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2), "utf-8");
}

export function loadBaseline(filePath: string): BaselineMap {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Baseline file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as BaselineMap;
}

export function diffAgainstBaseline(
  current: Record<string, string>,
  baseline: BaselineMap
): { added: string[]; removed: string[]; changed: string[] } {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const key of Object.keys(current)) {
    if (!(key in baseline)) {
      added.push(key);
    } else if (baseline[key].value !== current[key]) {
      changed.push(key);
    }
  }

  for (const key of Object.keys(baseline)) {
    if (!(key in current)) {
      removed.push(key);
    }
  }

  return { added, removed, changed };
}
