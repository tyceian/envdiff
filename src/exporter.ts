import { DiffResult } from './diff';
import { formatOutput, OutputFormat } from './formatter';
import * as fs from 'fs';
import * as path from 'path';

export type ExportOptions = {
  outputPath: string;
  format: OutputFormat;
  overwrite?: boolean;
};

export function resolveOutputPath(outputPath: string): string {
  return path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);
}

export function ensureOutputDir(outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function exportResults(
  results: DiffResult[],
  options: ExportOptions
): void {
  const { outputPath, format, overwrite = false } = options;
  const resolved = resolveOutputPath(outputPath);

  if (fs.existsSync(resolved) && !overwrite) {
    throw new Error(
      `Output file already exists: ${resolved}. Use --overwrite to replace it.`
    );
  }

  ensureOutputDir(resolved);

  const content = formatOutput(results, format);
  fs.writeFileSync(resolved, content, 'utf-8');
}

export function parseExportOptions(
  outputPath: string,
  format: string,
  overwrite: boolean
): ExportOptions {
  const validFormats: OutputFormat[] = ['text', 'json', 'csv'];
  const fmt = format as OutputFormat;
  if (!validFormats.includes(fmt)) {
    throw new Error(`Invalid export format: "${format}". Use text, json, or csv.`);
  }
  return { outputPath, format: fmt, overwrite };
}
