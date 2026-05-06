import { lintEnvMap, lintAllEnvMaps, hasLintErrors } from './linter';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('lintEnvMap', () => {
  it('returns no issues for a clean map', () => {
    const map = makeMap({ DATABASE_URL: 'postgres://prod:5432/db', API_KEY: 'abc123secure' });
    const result = lintEnvMap('prod.env', map);
    expect(result.file).toBe('prod.env');
    expect(result.issues).toHaveLength(0);
  });

  it('flags empty values', () => {
    const map = makeMap({ SECRET: '' });
    const result = lintEnvMap('dev.env', map);
    expect(result.issues.some(i => i.key === 'SECRET' && i.message.includes('empty'))).toBe(true);
  });

  it('flags non-UPPER_SNAKE_CASE keys', () => {
    const map = makeMap({ myKey: 'value' });
    const result = lintEnvMap('dev.env', map);
    expect(result.issues.some(i => i.key === 'myKey' && i.message.includes('UPPER_SNAKE_CASE'))).toBe(true);
  });

  it('flags placeholder values', () => {
    const map = makeMap({ API_TOKEN: 'changeme' });
    const result = lintEnvMap('dev.env', map);
    expect(result.issues.some(i => i.key === 'API_TOKEN' && i.message.includes('placeholder'))).toBe(true);
  });

  it('flags localhost URLs', () => {
    const map = makeMap({ SERVICE_URL: 'http://localhost:3000' });
    const result = lintEnvMap('dev.env', map);
    expect(result.issues.some(i => i.message.includes('localhost'))).toBe(true);
  });

  it('flags unusually long values', () => {
    const map = makeMap({ BIG_VALUE: 'x'.repeat(2049) });
    const result = lintEnvMap('dev.env', map);
    expect(result.issues.some(i => i.message.includes('unusually long'))).toBe(true);
  });
});

describe('lintAllEnvMaps', () => {
  it('returns results for each file', () => {
    const maps = {
      'dev.env': makeMap({ API_KEY: 'changeme' }),
      'prod.env': makeMap({ API_KEY: 'realvalue' }),
    };
    const results = lintAllEnvMaps(maps);
    expect(results).toHaveLength(2);
    expect(results.find(r => r.file === 'dev.env')?.issues.length).toBeGreaterThan(0);
    expect(results.find(r => r.file === 'prod.env')?.issues.length).toBe(0);
  });
});

describe('hasLintErrors', () => {
  it('returns false when no error-severity issues', () => {
    const results = [{ file: 'a.env', issues: [{ key: 'X', severity: 'warn' as const, message: 'warn' }] }];
    expect(hasLintErrors(results)).toBe(false);
  });

  it('returns true when error-severity issue present', () => {
    const results = [{ file: 'a.env', issues: [{ key: 'X', severity: 'error' as const, message: 'err' }] }];
    expect(hasLintErrors(results)).toBe(true);
  });
});
