import { DiffResult } from "./diff";

export type CompareMode = "strict" | "loose" | "keys-only";

export interface CompareOptions {
  mode: CompareMode;
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
}

export interface CompareResult {
  match: boolean;
  reason?: string;
  key: string;
  leftValue?: string;
  rightValue?: string;
}

export function parseCompareMode(raw: string): CompareMode {
  const normalized = raw.toLowerCase();
  if (normalized === "strict" || normalized === "loose" || normalized === "keys-only") {
    return normalized;
  }
  throw new Error(`Unknown compare mode: "${raw}". Expected strict, loose, or keys-only.`);
}

export function normalizeValue(value: string, options: CompareOptions): string {
  let v = value;
  if (options.ignoreCase) v = v.toLowerCase();
  if (options.ignoreWhitespace) v = v.trim();
  return v;
}

export function compareValues(
  key: string,
  left: string | undefined,
  right: string | undefined,
  options: CompareOptions
): CompareResult {
  if (options.mode === "keys-only") {
    const match = left !== undefined && right !== undefined;
    return { match, key, reason: match ? undefined : "key missing in one env", leftValue: left, rightValue: right };
  }

  if (left === undefined || right === undefined) {
    return { match: false, key, reason: "key missing in one env", leftValue: left, rightValue: right };
  }

  const l = normalizeValue(left, options);
  const r = normalizeValue(right, options);

  if (options.mode === "loose") {
    const match = l === r || (l === "" && r === "");
    return { match, key, reason: match ? undefined : "values differ", leftValue: left, rightValue: right };
  }

  // strict
  const match = left === right;
  return { match, key, reason: match ? undefined : "values differ (strict)", leftValue: left, rightValue: right };
}

export function compareEnvMaps(
  left: Map<string, string>,
  right: Map<string, string>,
  options: CompareOptions
): CompareResult[] {
  const allKeys = new Set([...left.keys(), ...right.keys()]);
  const results: CompareResult[] = [];

  for (const key of allKeys) {
    results.push(compareValues(key, left.get(key), right.get(key), options));
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}

export function countMismatches(results: CompareResult[]): number {
  return results.filter((r) => !r.match).length;
}
