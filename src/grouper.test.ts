import { describe, it, expect } from 'vitest';
import {
  extractPrefix,
  groupKeysByPrefix,
  buildGroupedReport,
  formatGroupedReport,
  summarizeGroups,
} from './grouper';

describe('extractPrefix', () => {
  it('returns prefix before first underscore', () => {
    expect(extractPrefix('DB_HOST')).toBe('DB');
    expect(extractPrefix('AWS_SECRET_KEY')).toBe('AWS');
  });

  it('returns (none) when no underscore', () => {
    expect(extractPrefix('PORT')).toBe('(none)');
  });
});

describe('groupKeysByPrefix', () => {
  it('groups keys correctly', () => {
    const keys = ['DB_HOST', 'DB_PORT', 'AWS_KEY', 'PORT'];
    const groups = groupKeysByPrefix(keys);
    expect(groups.get('DB')).toEqual(['DB_HOST', 'DB_PORT']);
    expect(groups.get('AWS')).toEqual(['AWS_KEY']);
    expect(groups.get('(none)')).toEqual(['PORT']);
  });

  it('returns empty map for empty input', () => {
    expect(groupKeysByPrefix([])).toEqual(new Map());
  });
});

describe('buildGroupedReport', () => {
  it('returns sorted groups with sorted keys', () => {
    const keys = ['DB_PORT', 'AWS_KEY', 'DB_HOST'];
    const report = buildGroupedReport(keys);
    expect(report[0].prefix).toBe('AWS');
    expect(report[1].prefix).toBe('DB');
    expect(report[1].keys).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('handles empty input', () => {
    expect(buildGroupedReport([])).toEqual([]);
  });
});

describe('formatGroupedReport', () => {
  it('formats groups into readable string', () => {
    const groups = [{ prefix: 'DB', keys: ['DB_HOST', 'DB_PORT'] }];
    const output = formatGroupedReport(groups);
    expect(output).toContain('[DB]');
    expect(output).toContain('- DB_HOST');
    expect(output).toContain('2 keys');
  });

  it('returns fallback for empty groups', () => {
    expect(formatGroupedReport([])).toBe('No keys found.\n');
  });
});

describe('summarizeGroups', () => {
  it('summarizes group count and total keys', () => {
    const groups = [
      { prefix: 'DB', keys: ['DB_HOST', 'DB_PORT'] },
      { prefix: 'AWS', keys: ['AWS_KEY'] },
    ];
    expect(summarizeGroups(groups)).toBe('2 prefix groups, 3 keys total');
  });

  it('uses singular forms correctly', () => {
    const groups = [{ prefix: 'DB', keys: ['DB_HOST'] }];
    expect(summarizeGroups(groups)).toBe('1 prefix group, 1 key total');
  });
});
