import { formatLintReport, summarizeLintResults } from './lint-reporter';
import type { LintResult } from './linter';

const clean: LintResult = { file: 'prod.env', issues: [] };

const withWarning: LintResult = {
  file: 'dev.env',
  issues: [{ key: 'API_KEY', severity: 'warn', message: 'Value looks like a placeholder' }],
};

const withError: LintResult = {
  file: 'staging.env',
  issues: [{ key: 'SECRET', severity: 'error', message: 'Some error' }],
};

describe('formatLintReport', () => {
  it('shows no-issues message for clean files', () => {
    const output = formatLintReport([clean]);
    expect(output).toContain('prod.env');
    expect(output).toContain('no issues');
  });

  it('shows issue count and details for files with issues', () => {
    const output = formatLintReport([withWarning]);
    expect(output).toContain('dev.env');
    expect(output).toContain('1 issue(s)');
    expect(output).toContain('API_KEY');
    expect(output).toContain('placeholder');
  });

  it('includes severity label for warnings', () => {
    const output = formatLintReport([withWarning]);
    expect(output).toContain('[warn]');
  });

  it('includes severity label for errors', () => {
    const output = formatLintReport([withError]);
    expect(output).toContain('[error]');
  });

  it('handles multiple files', () => {
    const output = formatLintReport([clean, withWarning, withError]);
    expect(output).toContain('prod.env');
    expect(output).toContain('dev.env');
    expect(output).toContain('staging.env');
  });
});

describe('summarizeLintResults', () => {
  it('reports zero issues correctly', () => {
    const summary = summarizeLintResults([clean]);
    expect(summary).toContain('1 file(s) checked');
    expect(summary).toContain('0 with issues');
    expect(summary).not.toContain('warning');
    expect(summary).not.toContain('error');
  });

  it('counts warnings', () => {
    const summary = summarizeLintResults([withWarning]);
    expect(summary).toContain('1 warning(s)');
  });

  it('counts errors', () => {
    const summary = summarizeLintResults([withError]);
    expect(summary).toContain('1 error(s)');
  });

  it('aggregates across multiple files', () => {
    const summary = summarizeLintResults([clean, withWarning, withError]);
    expect(summary).toContain('3 file(s) checked');
    expect(summary).toContain('2 with issues');
    expect(summary).toContain('1 warning(s)');
    expect(summary).toContain('1 error(s)');
  });
});
