import { loadEnvFiles } from './loader';
import { diffEnvMaps } from './diff';
import { filterDiffResults } from './filter';
import { sortDiffResults } from './sorter';
import { redactAllEnvMaps } from './redactor';
import { formatOutput } from './formatter';
import { runDiff, hasDifferences } from './differ';

export interface DifferHandlerOptions {
  files: string[];
  ignore?: string[];
  sort?: string;
  format?: string;
  redact?: boolean;
  exitCode?: boolean;
}

export async function handleDiff(options: DifferHandlerOptions): Promise<{ output: string; changed: boolean }> {
  const { files, ignore = [], sort, format = 'text', redact = false, exitCode = false } = options;

  if (files.length < 2) {
    throw new Error('At least two env files are required for comparison');
  }

  let envMaps = await loadEnvFiles(files);

  if (redact) {
    envMaps = redactAllEnvMaps(envMaps);
  }

  const results = runDiff(envMaps);

  const filtered = ignore.length > 0
    ? filterDiffResults(results, ignore)
    : results;

  const sorted = sort
    ? sortDiffResults(filtered, sort)
    : filtered;

  const output = formatOutput(sorted, format, files);
  const changed = hasDifferences(filtered);

  return { output, changed };
}
