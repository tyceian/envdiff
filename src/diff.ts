import type { EnvMap } from './parser';

export interface DiffResult {
  /** Keys present in base but missing in compare */
  missingInCompare: string[];
  /** Keys present in compare but missing in base */
  missingInBase: string[];
  /** Keys present in both but with different values */
  mismatched: Array<{ key: string; baseValue: string; compareValue: string }>;
  /** Keys present in both with identical values */
  matching: string[];
}

/**
 * Compares two parsed env maps and returns a structured diff.
 * @param base      The reference environment (e.g. .env.example)
 * @param compare   The environment to compare against (e.g. .env.production)
 */
export function diffEnvMaps(base: EnvMap, compare: EnvMap): DiffResult {
  const allKeys = new Set([...Object.keys(base), ...Object.keys(compare)]);

  const result: DiffResult = {
    missingInCompare: [],
    missingInBase: [],
    mismatched: [],
    matching: [],
  };

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inCompare = Object.prototype.hasOwnProperty.call(compare, key);

    if (inBase && !inCompare) {
      result.missingInCompare.push(key);
    } else if (!inBase && inCompare) {
      result.missingInBase.push(key);
    } else if (base[key] !== compare[key]) {
      result.mismatched.push({
        key,
        baseValue: base[key],
        compareValue: compare[key],
      });
    } else {
      result.matching.push(key);
    }
  }

  // sort for deterministic output
  result.missingInCompare.sort();
  result.missingInBase.sort();
  result.mismatched.sort((a, b) => a.key.localeCompare(b.key));
  result.matching.sort();

  return result;
}
