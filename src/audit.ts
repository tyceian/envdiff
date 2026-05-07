import { DiffResult } from './diff';

export type AuditSeverity = 'info' | 'warn' | 'error';

export interface AuditEntry {
  key: string;
  severity: AuditSeverity;
  message: string;
  environments: string[];
}

export interface AuditReport {
  entries: AuditEntry[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

export function auditDiffResults(
  results: DiffResult[],
  envNames: string[]
): AuditEntry[] {
  const entries: AuditEntry[] = [];

  for (const result of results) {
    if (result.type === 'missing') {
      entries.push({
        key: result.key,
        severity: 'error',
        message: `Key "${result.key}" is missing in one or more environments`,
        environments: envNames,
      });
    } else if (result.type === 'mismatch') {
      entries.push({
        key: result.key,
        severity: 'warn',
        message: `Key "${result.key}" has different values across environments`,
        environments: envNames,
      });
    } else if (result.type === 'extra') {
      entries.push({
        key: result.key,
        severity: 'info',
        message: `Key "${result.key}" exists only in some environments`,
        environments: envNames,
      });
    }
  }

  return entries;
}

export function buildAuditReport(entries: AuditEntry[]): AuditReport {
  return {
    entries,
    errorCount: entries.filter((e) => e.severity === 'error').length,
    warnCount: entries.filter((e) => e.severity === 'warn').length,
    infoCount: entries.filter((e) => e.severity === 'info').length,
  };
}

export function hasAuditErrors(report: AuditReport): boolean {
  return report.errorCount > 0;
}
