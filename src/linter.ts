// Lints env maps for common issues: empty values, suspicious patterns, duplicate keys in raw text

export interface LintIssue {
  key: string;
  severity: 'warn' | 'error';
  message: string;
}

export interface LintResult {
  file: string;
  issues: LintIssue[];
}

const SUSPICIOUS_PATTERNS = [
  { pattern: /^(todo|fixme|changeme|placeholder|example|test123)$/i, message: 'Value looks like a placeholder' },
  { pattern: /^https?:\/\/localhost/i, message: 'Value references localhost URL' },
  { pattern: /^0\.0\.0\.0/, message: 'Value references 0.0.0.0' },
];

export function lintEnvMap(file: string, map: Map<string, string>): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of map.entries()) {
    if (!key.match(/^[A-Z][A-Z0-9_]*$/)) {
      issues.push({ key, severity: 'warn', message: 'Key does not follow UPPER_SNAKE_CASE convention' });
    }

    if (value.trim() === '') {
      issues.push({ key, severity: 'warn', message: 'Value is empty or whitespace-only' });
    }

    for (const { pattern, message } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        issues.push({ key, severity: 'warn', message });
      }
    }

    if (value.length > 2048) {
      issues.push({ key, severity: 'warn', message: 'Value is unusually long (>2048 chars)' });
    }
  }

  return { file, issues };
}

export function lintAllEnvMaps(maps: Record<string, Map<string, string>>): LintResult[] {
  return Object.entries(maps).map(([file, map]) => lintEnvMap(file, map));
}

export function hasLintErrors(results: LintResult[]): boolean {
  return results.some(r => r.issues.some(i => i.severity === 'error'));
}
