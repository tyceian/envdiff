/**
 * filter.ts
 * Utilities for filtering diff results by key patterns or severity.
 */

import { DiffResult } from './diff';

export type Severity = 'missing' | 'mismatch' | 'all';

export interface FilterOptions {
  severity?: Severity;
  keyPattern?: string | RegExp;
  ignoreKeys?: string[];
}

/**
 * Filters an array of DiffResult entries based on the provided options.
 */
export function filterDiffResults(
  results: DiffResult[],
  options: FilterOptions = {}
): DiffResult[] {
  const { severity = 'all', keyPattern, ignoreKeys = [] } = options;

  return results.filter((entry) => {
    // Filter by severity
    if (severity !== 'all' && entry.type !== severity) {
      return false;
    }

    // Filter out ignored keys (case-insensitive)
    if (ignoreKeys.length > 0) {
      const lowerKey = entry.key.toLowerCase();
      if (ignoreKeys.some((k) => k.toLowerCase() === lowerKey)) {
        return false;
      }
    }

    // Filter by key pattern
    if (keyPattern) {
      const pattern =
        typeof keyPattern === 'string' ? new RegExp(keyPattern, 'i') : keyPattern;
      if (!pattern.test(entry.key)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Parses a comma-separated ignore list string into an array of keys.
 */
export function parseIgnoreList(raw: string): string[] {
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}
