import { DiffResult } from "./diff";

export interface EnvStats {
  total: number;
  missing: number;
  extra: number;
  mismatched: number;
  matching: number;
  missingPercent: number;
  extraPercent: number;
  mismatchedPercent: number;
  matchingPercent: number;
}

export function computeStats(results: DiffResult[]): EnvStats {
  const total = results.length;
  const missing = results.filter((r) => r.status === "missing").length;
  const extra = results.filter((r) => r.status === "extra").length;
  const mismatched = results.filter((r) => r.status === "mismatched").length;
  const matching = results.filter((r) => r.status === "matching").length;

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return {
    total,
    missing,
    extra,
    mismatched,
    matching,
    missingPercent: pct(missing),
    extraPercent: pct(extra),
    mismatchedPercent: pct(mismatched),
    matchingPercent: pct(matching),
  };
}

export function formatStats(stats: EnvStats): string {
  const lines = [
    `Total keys : ${stats.total}`,
    `  Matching   : ${stats.matching} (${stats.matchingPercent}%)`,
    `  Missing    : ${stats.missing} (${stats.missingPercent}%)`,
    `  Extra      : ${stats.extra} (${stats.extraPercent}%)`,
    `  Mismatched : ${stats.mismatched} (${stats.mismatchedPercent}%)`,
  ];
  return lines.join("\n");
}

export function hasIssues(stats: EnvStats): boolean {
  return stats.missing > 0 || stats.extra > 0 || stats.mismatched > 0;
}
