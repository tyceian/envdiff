/**
 * formatter.ts
 * Handles output formatting for diff results in multiple formats (text, json, csv).
 */

import { DiffResult } from './diff';

export type OutputFormat = 'text' | 'json' | 'csv';

export function parseOutputFormat(raw: string): OutputFormat {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'text' || normalized === 'json' || normalized === 'csv') {
    return normalized as OutputFormat;
  }
  throw new Error(`Unsupported output format: "${raw}". Use text, json, or csv.`);
}

export function formatAsJson(results: DiffResult[]): string {
  return JSON.stringify(results, null, 2);
}

export function formatAsCsv(results: DiffResult[]): string {
  const header = 'key,status,environments';
  const rows = results.map((r) => {
    const envs = Object.keys(r.values)
      .map((env) => `${env}=${r.values[env] ?? ''}`)
      .join(';');
    return `${r.key},${r.status},${envs}`;
  });
  return [header, ...rows].join('\n');
}

export function formatAsText(results: DiffResult[]): string {
  if (results.length === 0) {
    return 'No differences found.';
  }
  return results
    .map((r) => {
      const envDetails = Object.entries(r.values)
        .map(([env, val]) => `  ${env}: ${val ?? '(missing)'}`)
        .join('\n');
      return `[${r.status.toUpperCase()}] ${r.key}\n${envDetails}`;
    })
    .join('\n\n');
}

export function formatOutput(results: DiffResult[], format: OutputFormat): string {
  switch (format) {
    case 'json':
      return formatAsJson(results);
    case 'csv':
      return formatAsCsv(results);
    case 'text':
    default:
      return formatAsText(results);
  }
}
