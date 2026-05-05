/**
 * Sorts and groups diff results by severity or key name.
 */

import { DiffResult } from './diff';

export type SortOrder = 'severity' | 'key' | 'none';

const SEVERITY_RANK: Record<string, number> = {
  missing: 0,
  mismatch: 1,
  extra: 2,
};

/**
 * Sorts an array of DiffResult entries by the given order.
 */
export function sortDiffResults(
  results: DiffResult[],
  order: SortOrder = 'severity'
): DiffResult[] {
  if (order === 'none') {
    return [...results];
  }

  return [...results].sort((a, b) => {
    if (order === 'severity') {
      const rankA = SEVERITY_RANK[a.type] ?? 99;
      const rankB = SEVERITY_RANK[b.type] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      // Secondary sort by key for stable output
      return a.key.localeCompare(b.key);
    }

    if (order === 'key') {
      return a.key.localeCompare(b.key);
    }

    return 0;
  });
}

/**
 * Groups diff results by their type.
 */
export function groupDiffResults(
  results: DiffResult[]
): Record<string, DiffResult[]> {
  const groups: Record<string, DiffResult[]> = {};

  for (const result of results) {
    if (!groups[result.type]) {
      groups[result.type] = [];
    }
    groups[result.type].push(result);
  }

  return groups;
}

/**
 * Parses a sort order string, falling back to 'severity' if invalid.
 */
export function parseSortOrder(value: string | undefined): SortOrder {
  if (value === 'key' || value === 'severity' || value === 'none') {
    return value;
  }
  return 'severity';
}
