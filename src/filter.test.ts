import { filterDiffResults, parseIgnoreList } from './filter';
import { DiffResult } from './diff';

const sampleResults: DiffResult[] = [
  { key: 'DATABASE_URL', type: 'missing', envName: 'production' },
  { key: 'API_KEY', type: 'mismatch', envName: 'staging', values: { base: 'abc', compare: 'xyz' } },
  { key: 'SECRET_TOKEN', type: 'missing', envName: 'staging' },
  { key: 'DEBUG', type: 'mismatch', envName: 'production', values: { base: 'true', compare: 'false' } },
];

describe('filterDiffResults', () => {
  it('returns all results when no options provided', () => {
    expect(filterDiffResults(sampleResults)).toHaveLength(4);
  });

  it('filters by severity: missing', () => {
    const result = filterDiffResults(sampleResults, { severity: 'missing' });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.type === 'missing')).toBe(true);
  });

  it('filters by severity: mismatch', () => {
    const result = filterDiffResults(sampleResults, { severity: 'mismatch' });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.type === 'mismatch')).toBe(true);
  });

  it('filters by keyPattern string', () => {
    const result = filterDiffResults(sampleResults, { keyPattern: 'KEY' });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('API_KEY');
  });

  it('filters by keyPattern RegExp', () => {
    const result = filterDiffResults(sampleResults, { keyPattern: /^(DATABASE|SECRET)/ });
    expect(result).toHaveLength(2);
  });

  it('ignores specified keys', () => {
    const result = filterDiffResults(sampleResults, { ignoreKeys: ['DEBUG', 'API_KEY'] });
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.key === 'DEBUG')).toBeUndefined();
    expect(result.find((r) => r.key === 'API_KEY')).toBeUndefined();
  });

  it('ignores keys case-insensitively', () => {
    const result = filterDiffResults(sampleResults, { ignoreKeys: ['database_url'] });
    expect(result.find((r) => r.key === 'DATABASE_URL')).toBeUndefined();
  });

  it('combines severity and keyPattern filters', () => {
    const result = filterDiffResults(sampleResults, { severity: 'mismatch', keyPattern: 'DEBUG' });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('DEBUG');
  });
});

describe('parseIgnoreList', () => {
  it('parses comma-separated keys', () => {
    expect(parseIgnoreList('KEY1,KEY2,KEY3')).toEqual(['KEY1', 'KEY2', 'KEY3']);
  });

  it('trims whitespace around keys', () => {
    expect(parseIgnoreList(' KEY1 , KEY2 ')).toEqual(['KEY1', 'KEY2']);
  });

  it('filters out empty entries', () => {
    expect(parseIgnoreList('KEY1,,KEY2')).toEqual(['KEY1', 'KEY2']);
  });

  it('returns empty array for empty string', () => {
    expect(parseIgnoreList('')).toEqual([]);
  });
});
