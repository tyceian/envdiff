import { sortDiffResults, groupDiffResults, parseSortOrder } from './sorter';
import { DiffResult } from './diff';

const sampleResults: DiffResult[] = [
  { key: 'DB_HOST', type: 'mismatch', valueA: 'localhost', valueB: 'prod-db' },
  { key: 'API_KEY', type: 'missing', valueA: undefined, valueB: 'secret' },
  { key: 'PORT', type: 'extra', valueA: '3000', valueB: undefined },
  { key: 'APP_NAME', type: 'mismatch', valueA: 'dev', valueB: 'prod' },
  { key: 'SECRET', type: 'missing', valueA: undefined, valueB: 'xyz' },
];

describe('sortDiffResults', () => {
  it('sorts by severity: missing first, then mismatch, then extra', () => {
    const sorted = sortDiffResults(sampleResults, 'severity');
    expect(sorted[0].type).toBe('missing');
    expect(sorted[1].type).toBe('missing');
    expect(sorted[2].type).toBe('mismatch');
    expect(sorted[3].type).toBe('mismatch');
    expect(sorted[4].type).toBe('extra');
  });

  it('sorts by key alphabetically', () => {
    const sorted = sortDiffResults(sampleResults, 'key');
    const keys = sorted.map((r) => r.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('returns original order when sort is none', () => {
    const sorted = sortDiffResults(sampleResults, 'none');
    expect(sorted.map((r) => r.key)).toEqual(sampleResults.map((r) => r.key));
  });

  it('does not mutate the original array', () => {
    const original = [...sampleResults];
    sortDiffResults(sampleResults, 'severity');
    expect(sampleResults).toEqual(original);
  });

  it('defaults to severity sort', () => {
    const sorted = sortDiffResults(sampleResults);
    expect(sorted[0].type).toBe('missing');
  });
});

describe('groupDiffResults', () => {
  it('groups results by type', () => {
    const groups = groupDiffResults(sampleResults);
    expect(groups['missing']).toHaveLength(2);
    expect(groups['mismatch']).toHaveLength(2);
    expect(groups['extra']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupDiffResults([])).toEqual({});
  });
});

describe('parseSortOrder', () => {
  it('returns valid sort orders as-is', () => {
    expect(parseSortOrder('key')).toBe('key');
    expect(parseSortOrder('severity')).toBe('severity');
    expect(parseSortOrder('none')).toBe('none');
  });

  it('falls back to severity for unknown values', () => {
    expect(parseSortOrder('random')).toBe('severity');
    expect(parseSortOrder(undefined)).toBe('severity');
  });
});
