import { formatReport, summarize } from './reporter';
import { DiffResult } from './diff';

const mockDiff: DiffResult = {
  missingKeys: ['DB_PASSWORD', 'API_SECRET'],
  mismatchedKeys: [
    { key: 'LOG_LEVEL', baseValue: 'info', compareValue: 'debug' },
  ],
  extraKeys: [],
};

const cleanDiff: DiffResult = {
  missingKeys: [],
  mismatchedKeys: [],
  extraKeys: [],
};

describe('formatReport - text format', () => {
  it('shows missing keys', () => {
    const output = formatReport({ staging: mockDiff }, { format: 'text' });
    expect(output).toContain('MISSING: DB_PASSWORD');
    expect(output).toContain('MISSING: API_SECRET');
  });

  it('shows mismatched keys with values', () => {
    const output = formatReport({ staging: mockDiff }, { format: 'text' });
    expect(output).toContain('MISMATCH: LOG_LEVEL');
    expect(output).toContain('info');
    expect(output).toContain('debug');
  });

  it('shows success message when no issues', () => {
    const output = formatReport({ production: cleanDiff }, { format: 'text' });
    expect(output).toContain('No issues found');
  });

  it('includes environment name as header', () => {
    const output = formatReport({ staging: mockDiff }, { format: 'text' });
    expect(output).toContain('staging');
  });
});

describe('formatReport - json format', () => {
  it('returns valid JSON', () => {
    const output = formatReport({ staging: mockDiff }, { format: 'json' });
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains diff data in JSON output', () => {
    const output = formatReport({ staging: mockDiff }, { format: 'json' });
    const parsed = JSON.parse(output);
    expect(parsed.staging.missingKeys).toContain('DB_PASSWORD');
  });
});

describe('summarize', () => {
  it('counts missing and mismatched keys', () => {
    const summary = summarize({ staging: mockDiff });
    expect(summary).toContain('2 missing');
    expect(summary).toContain('1 mismatched');
  });

  it('reports zero issues when clean', () => {
    const summary = summarize({ production: cleanDiff });
    expect(summary).toContain('0 missing');
    expect(summary).toContain('0 mismatched');
  });

  it('counts across multiple environments', () => {
    const summary = summarize({ staging: mockDiff, production: mockDiff });
    expect(summary).toContain('2 environment(s)');
  });
});
