import { DiffResult } from './diff';

export type ReportFormat = 'text' | 'json';

export interface ReportOptions {
  format?: ReportFormat;
  color?: boolean;
}

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';

function colorize(text: string, code: string, useColor: boolean): string {
  return useColor ? `${code}${text}${RESET}` : text;
}

export function formatReport(
  results: Record<string, DiffResult>,
  options: ReportOptions = {}
): string {
  const { format = 'text', color = false } = options;

  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  const lines: string[] = [];

  for (const [envName, diff] of Object.entries(results)) {
    lines.push(colorize(`\n=== ${envName} ===`, BOLD, color));

    if (diff.missingKeys.length === 0 && diff.mismatchedKeys.length === 0) {
      lines.push(colorize('  ✓ No issues found', GREEN, color));
      continue;
    }

    for (const key of diff.missingKeys) {
      lines.push(colorize(`  ✗ MISSING: ${key}`, RED, color));
    }

    for (const { key, baseValue, compareValue } of diff.mismatchedKeys) {
      lines.push(colorize(`  ~ MISMATCH: ${key}`, YELLOW, color));
      lines.push(`      base:    ${baseValue}`);
      lines.push(`      compare: ${compareValue}`);
    }
  }

  return lines.join('\n');
}

export function summarize(results: Record<string, DiffResult>): string {
  let totalMissing = 0;
  let totalMismatch = 0;

  for (const diff of Object.values(results)) {
    totalMissing += diff.missingKeys.length;
    totalMismatch += diff.mismatchedKeys.length;
  }

  return `Summary: ${totalMissing} missing key(s), ${totalMismatch} mismatched key(s) across ${Object.keys(results).length} environment(s).`;
}
