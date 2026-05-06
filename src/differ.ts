import { diffEnvMaps } from './diff';
import { filterDiffResults } from './filter';
import { sortDiffResults } from './sorter';
import { redactAllEnvMaps } from './redactor';

export interface DiffOptions {
  ignore?: string[];
  sortOrder?: string;
  redact?: boolean;
  onlyMissing?: boolean;
  onlyMismatched?: boolean;
}

export interface DiffEntry {
  key: string;
  status: 'missing' | 'mismatched' | 'ok';
  values: Record<string, string | undefined>;
}

/**
 * High-level helper that runs the full diff pipeline:
 * load → optionally redact → diff → filter → sort
 */
export function runDiff(
  envMaps: Record<string, Map<string, string>>,
  options: DiffOptions = {}
): DiffEntry[] {
  const { ignore = [], sortOrder = 'key', redact = false, onlyMissing = false, onlyMismatched = false } = options;

  const maps = redact ? redactAllEnvMaps(envMaps) : envMaps;

  const rawResults = diffEnvMaps(maps);

  const statusFilter: string[] = [];
  if (onlyMissing) statusFilter.push('missing');
  if (onlyMismatched) statusFilter.push('mismatched');

  const filtered = filterDiffResults(rawResults, { ignore, statuses: statusFilter.length ? statusFilter : undefined });

  return sortDiffResults(filtered, sortOrder) as DiffEntry[];
}

/**
 * Returns a quick boolean indicating whether any differences exist.
 */
export function hasDifferences(
  envMaps: Record<string, Map<string, string>>,
  options: DiffOptions = {}
): boolean {
  const results = runDiff(envMaps, options);
  return results.some((r) => r.status !== 'ok');
}
