import { auditDiffResults, buildAuditReport, hasAuditErrors } from './audit';
import { formatAuditEntry, formatAuditReport, summarizeAuditReport, severityLabel } from './audit-reporter';
import { DiffResult } from './diff';

const envNames = ['dev', 'prod'];

function makeResults(overrides: Partial<DiffResult>[] = []): DiffResult[] {
  return overrides.map((o) => ({ key: 'KEY', type: 'missing', values: {}, ...o } as DiffResult));
}

test('auditDiffResults returns error for missing keys', () => {
  const results = makeResults([{ key: 'DB_URL', type: 'missing' }]);
  const entries = auditDiffResults(results, envNames);
  expect(entries).toHaveLength(1);
  expect(entries[0].severity).toBe('error');
  expect(entries[0].key).toBe('DB_URL');
});

test('auditDiffResults returns warn for mismatch', () => {
  const results = makeResults([{ key: 'API_KEY', type: 'mismatch' }]);
  const entries = auditDiffResults(results, envNames);
  expect(entries[0].severity).toBe('warn');
});

test('auditDiffResults returns info for extra keys', () => {
  const results = makeResults([{ key: 'DEBUG', type: 'extra' }]);
  const entries = auditDiffResults(results, envNames);
  expect(entries[0].severity).toBe('info');
});

test('buildAuditReport counts severities correctly', () => {
  const results = makeResults([
    { key: 'A', type: 'missing' },
    { key: 'B', type: 'mismatch' },
    { key: 'C', type: 'extra' },
  ]);
  const entries = auditDiffResults(results, envNames);
  const report = buildAuditReport(entries);
  expect(report.errorCount).toBe(1);
  expect(report.warnCount).toBe(1);
  expect(report.infoCount).toBe(1);
});

test('hasAuditErrors returns true when errors exist', () => {
  const entries = auditDiffResults(makeResults([{ type: 'missing' }]), envNames);
  expect(hasAuditErrors(buildAuditReport(entries))).toBe(true);
});

test('hasAuditErrors returns false with no errors', () => {
  const entries = auditDiffResults(makeResults([{ type: 'extra' }]), envNames);
  expect(hasAuditErrors(buildAuditReport(entries))).toBe(false);
});

test('severityLabel returns correct labels', () => {
  expect(severityLabel('error')).toBe('[ERROR]');
  expect(severityLabel('warn')).toBe('[WARN] ');
  expect(severityLabel('info')).toBe('[INFO] ');
});

test('formatAuditEntry includes message', () => {
  const entry = { key: 'X', severity: 'warn' as const, message: 'some warning', environments: [] };
  const out = formatAuditEntry(entry, false);
  expect(out).toContain('some warning');
  expect(out).toContain('[WARN]');
});

test('formatAuditReport returns clean message when no entries', () => {
  const report = buildAuditReport([]);
  expect(formatAuditReport(report, false)).toBe('Audit passed — no issues found.');
});

test('summarizeAuditReport lists all counts', () => {
  const report = { entries: [], errorCount: 2, warnCount: 1, infoCount: 0 };
  const summary = summarizeAuditReport(report);
  expect(summary).toContain('2 error(s)');
  expect(summary).toContain('1 warning(s)');
});
