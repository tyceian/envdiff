import * as fs from "fs";
import * as path from "path";

export interface EnvSnapshot {
  timestamp: string;
  label: string;
  envMaps: Record<string, Record<string, string>>;
}

export function createSnapshot(
  label: string,
  envMaps: Record<string, Record<string, string>>
): EnvSnapshot {
  return {
    timestamp: new Date().toISOString(),
    label,
    envMaps,
  };
}

export function saveSnapshot(snapshot: EnvSnapshot, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), "utf-8");
}

export function loadSnapshot(filePath: string): EnvSnapshot {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!parsed.timestamp || !parsed.label || !parsed.envMaps) {
    throw new Error(`Invalid snapshot format in: ${filePath}`);
  }
  return parsed as EnvSnapshot;
}

export function compareSnapshots(
  older: EnvSnapshot,
  newer: EnvSnapshot
): Record<string, { added: string[]; removed: string[]; changed: string[] }> {
  const result: Record<string, { added: string[]; removed: string[]; changed: string[] }> = {};

  const allEnvs = new Set([
    ...Object.keys(older.envMaps),
    ...Object.keys(newer.envMaps),
  ]);

  for (const env of allEnvs) {
    const oldMap = older.envMaps[env] ?? {};
    const newMap = newer.envMaps[env] ?? {};
    const allKeys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);

    const added: string[] = [];
    const removed: string[] = [];
    const changed: string[] = [];

    for (const key of allKeys) {
      if (!(key in oldMap)) {
        added.push(key);
      } else if (!(key in newMap)) {
        removed.push(key);
      } else if (oldMap[key] !== newMap[key]) {
        changed.push(key);
      }
    }

    result[env] = { added, removed, changed };
  }

  return result;
}
