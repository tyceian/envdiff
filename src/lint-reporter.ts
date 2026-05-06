import type { LintResult, LintIssue } from './linter';

function severityLabel(severity: LintIssue['severity']): string {
  return severity === 'error' ? '\x1b[31m[error]\x1b[0m' : '\x1b[33m[warn]\x1b[0m';
}

export function formatLintReport(results: LintResult[]): string {
  const lines: string[] = [];

  for (const result of results) {
    if (result.issues.length === 0) {
      lines.push(`\x1b[32m✔ ${result.file}\x1b[0m — no issues`);
      continue;
    }

    lines.push(`\x1b[1m${result.file}\x1b[0m (${result.issues.length} issue(s))`);
    for (const issue of result.issues) {
      lines.push(`  ${severityLabel(issue.severity)} ${issue.key}: ${issue.message}`);
    }
  }

  return lines.join('\n');
}

export function summarizeLintResults(results: LintResult[]): string {
  const totalFiles = results.length;
  const filesWithIssues = results.filter(r => r.issues.length > 0).length;
  const totalWarns = results.flatMap(r => r.issues).filter(i => i.severity === 'warn').length;
  const totalErrors = results.flatMap(r => r.issues).filter(i => i.severity === 'error').length;

  const parts = [`${totalFiles} file(s) checked`, `${filesWithIssues} with issues`];
  if (totalWarns > 0) parts.push(`${totalWarns} warning(s)`);
  if (totalErrors > 0) parts.push(`${totalErrors} error(s)`);

  return parts.join(', ');
}
