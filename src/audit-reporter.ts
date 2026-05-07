import { AuditReport, AuditEntry, AuditSeverity } from './audit';

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
};
const RESET = '\x1b[0m';

export function severityLabel(severity: AuditSeverity): string {
  const labels: Record<AuditSeverity, string> = {
    error: '[ERROR]',
    warn: '[WARN] ',
    info: '[INFO] ',
  };
  return labels[severity];
}

export function formatAuditEntry(entry: AuditEntry, useColor = true): string {
  const color = useColor ? SEVERITY_COLORS[entry.severity] : '';
  const reset = useColor ? RESET : '';
  const label = severityLabel(entry.severity);
  return `${color}${label}${reset} ${entry.message}`;
}

export function formatAuditReport(report: AuditReport, useColor = true): string {
  if (report.entries.length === 0) {
    return 'Audit passed — no issues found.';
  }

  const lines = report.entries.map((e) => formatAuditEntry(e, useColor));
  lines.push('');
  lines.push(summarizeAuditReport(report));
  return lines.join('\n');
}

export function summarizeAuditReport(report: AuditReport): string {
  const parts: string[] = [];
  if (report.errorCount > 0) parts.push(`${report.errorCount} error(s)`);
  if (report.warnCount > 0) parts.push(`${report.warnCount} warning(s)`);
  if (report.infoCount > 0) parts.push(`${report.infoCount} info(s)`);
  return parts.length > 0 ? `Summary: ${parts.join(', ')}` : 'No issues.';
}
