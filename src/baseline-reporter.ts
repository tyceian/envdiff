import { colorize } from "./reporter";

export interface BaselineDiffResult {
  added: string[];
  removed: string[];
  changed: string[];
}

export function formatBaselineReport(result: BaselineDiffResult): string {
  const lines: string[] = [];

  if (
    result.added.length === 0 &&
    result.removed.length === 0 &&
    result.changed.length === 0
  ) {
    lines.push(colorize("green", "✔ No changes from baseline."));
    return lines.join("\n");
  }

  if (result.added.length > 0) {
    lines.push(colorize("cyan", `Added (${result.added.length})`));
    for (const key of result.added) {
      lines.push(`  + ${key}`);
    }
  }

  if (result.removed.length > 0) {
    lines.push(colorize("red", `Removed (${result.removed.length})`));
    for (const key of result.removed) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.changed.length > 0) {
    lines.push(colorize("yellow", `Changed (${result.changed.length})`));
    for (const key of result.changed) {
      lines.push(`  ~ ${key}`);
    }
  }

  return lines.join("\n");
}

export function summarizeBaselineDiff(result: BaselineDiffResult): string {
  const total =
    result.added.length + result.removed.length + result.changed.length;
  if (total === 0) return "No changes from baseline.";
  return [
    `${result.added.length} added`,
    `${result.removed.length} removed`,
    `${result.changed.length} changed`,
  ].join(", ");
}
