/**
 * merger.ts
 * Merges multiple env maps into a single resolved map,
 * with configurable precedence (last-wins or first-wins).
 */

export type MergeStrategy = "last-wins" | "first-wins";

export interface MergeResult {
  merged: Map<string, string>;
  conflicts: Map<string, string[]>; // key -> list of differing values
}

export function parseMergeStrategy(raw: string): MergeStrategy {
  const val = raw.trim().toLowerCase();
  if (val === "first-wins" || val === "last-wins") return val;
  throw new Error(`Unknown merge strategy: "${raw}". Use "last-wins" or "first-wins".`);
}

export function mergeEnvMaps(
  maps: Map<string, string>[],
  strategy: MergeStrategy = "last-wins"
): MergeResult {
  const merged = new Map<string, string>();
  const conflicts = new Map<string, string[]>();

  for (const map of maps) {
    for (const [key, value] of map.entries()) {
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        if (existing !== value) {
          if (!conflicts.has(key)) {
            conflicts.set(key, [existing]);
          }
          conflicts.get(key)!.push(value);

          if (strategy === "last-wins") {
            merged.set(key, value);
          }
          // first-wins: keep existing, do nothing
        }
      } else {
        merged.set(key, value);
      }
    }
  }

  return { merged, conflicts };
}

export function formatMergeConflicts(conflicts: Map<string, string[]>): string {
  if (conflicts.size === 0) return "No conflicts.";
  const lines: string[] = ["Merge conflicts:"];
  for (const [key, values] of conflicts.entries()) {
    lines.push(`  ${key}: [${values.map((v) => JSON.stringify(v)).join(", ")}]`);
  }
  return lines.join("\n");
}
