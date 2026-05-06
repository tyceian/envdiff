import { loadEnvFiles } from './loader';
import { runDiff, hasDifferences, DiffOptions } from './differ';
import { formatOutput } from './formatter';
import { formatReport } from './reporter';

export interface DifferHandlerOptions extends DiffOptions {
  files: string[];
  format?: string;
  silent?: boolean;
}

/**
 * Orchestrates loading env files and running the diff pipeline,
 * returning a formatted string ready for output or export.
 */
export async function handleDiff(options: DifferHandlerOptions): Promise<{ output: string; hasIssues: boolean }> {
  const { files, format = 'text', silent = false, ...diffOptions } = options;

  if (files.length < 2) {
    throw new Error('At least two env files are required for comparison.');
  }

  const envMaps = await loadEnvFiles(files);

  const results = runDiff(envMaps, diffOptions);
  const hasIssues = hasDifferences(envMaps, diffOptions);

  let output: string;

  if (format === 'text') {
    output = formatReport(results, Object.keys(envMaps));
  } else {
    output = formatOutput(results, format);
  }

  if (!silent) {
    process.stdout.write(output + '\n');
  }

  return { output, hasIssues };
}
