import { DiffResult } from './diff';
import { exportResults, parseExportOptions } from './exporter';

export type ExportHandlerArgs = {
  results: DiffResult[];
  output?: string;
  format?: string;
  overwrite?: boolean;
  silent?: boolean;
};

export function handleExport(args: ExportHandlerArgs): boolean {
  const {
    results,
    output,
    format = 'text',
    overwrite = false,
    silent = false,
  } = args;

  if (!output) {
    if (!silent) {
      console.error('Export failed: no output path provided.');
    }
    return false;
  }

  try {
    const options = parseExportOptions(output, format, overwrite);
    exportResults(results, options);
    if (!silent) {
      console.log(`Exported ${results.length} result(s) to ${output} as ${format}.`);
    }
    return true;
  } catch (err: unknown) {
    if (!silent) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Export failed: ${message}`);
    }
    return false;
  }
}
