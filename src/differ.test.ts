import { runDiff, hasDifferences } from './differ';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('runDiff', () => {
  it('returns empty array when all maps are identical', () => {
    const maps = {
      dev: makeMap({ FOO: 'bar', BAZ: 'qux' }),
      prod: makeMap({ FOO: 'bar', BAZ: 'qux' }),
    };
    const results = runDiff(maps);
    const problems = results.filter((r) => r.status !== 'ok');
    expect(problems).toHaveLength(0);
  });

  it('detects missing keys', () => {
    const maps = {
      dev: makeMap({ FOO: 'bar', SECRET: 'abc' }),
      prod: makeMap({ FOO: 'bar' }),
    };
    const results = runDiff(maps);
    const missing = results.filter((r) => r.status === 'missing');
    expect(missing.some((r) => r.key === 'SECRET')).toBe(true);
  });

  it('detects mismatched values', () => {
    const maps = {
      dev: makeMap({ API_URL: 'http://localhost' }),
      prod: makeMap({ API_URL: 'https://example.com' }),
    };
    const results = runDiff(maps);
    const mismatched = results.filter((r) => r.status === 'mismatched');
    expect(mismatched.some((r) => r.key === 'API_URL')).toBe(true);
  });

  it('respects ignore list', () => {
    const maps = {
      dev: makeMap({ FOO: 'bar', IGNORED_KEY: 'x' }),
      prod: makeMap({ FOO: 'bar' }),
    };
    const results = runDiff(maps, { ignore: ['IGNORED_KEY'] });
    expect(results.find((r) => r.key === 'IGNORED_KEY')).toBeUndefined();
  });

  it('filters to only missing when onlyMissing is true', () => {
    const maps = {
      dev: makeMap({ FOO: 'a', BAR: 'b' }),
      prod: makeMap({ FOO: 'different' }),
    };
    const results = runDiff(maps, { onlyMissing: true });
    expect(results.every((r) => r.status === 'missing')).toBe(true);
  });
});

describe('hasDifferences', () => {
  it('returns false when envs match', () => {
    const maps = {
      dev: makeMap({ KEY: 'val' }),
      prod: makeMap({ KEY: 'val' }),
    };
    expect(hasDifferences(maps)).toBe(false);
  });

  it('returns true when keys differ', () => {
    const maps = {
      dev: makeMap({ KEY: 'val', EXTRA: '1' }),
      prod: makeMap({ KEY: 'val' }),
    };
    expect(hasDifferences(maps)).toBe(true);
  });
});
