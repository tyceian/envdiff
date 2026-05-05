import { validateEnvMap, validateAllEnvMaps } from './validator';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('validateEnvMap', () => {
  it('returns valid for a clean env map', () => {
    const map = makeMap({ API_KEY: 'abc123', PORT: '3000' });
    const result = validateEnvMap(map, 'production');
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('flags keys with invalid characters as errors', () => {
    const map = makeMap({ 'INVALID-KEY': 'value' });
    const result = validateEnvMap(map);
    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('error');
    expect(result.issues[0].key).toBe('INVALID-KEY');
  });

  it('flags empty values as warnings', () => {
    const map = makeMap({ EMPTY_VAR: '' });
    const result = validateEnvMap(map);
    expect(result.valid).toBe(true);
    const warn = result.issues.find((i) => i.key === 'EMPTY_VAR');
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe('warn');
  });

  it('flags suspicious placeholder values as warnings', () => {
    const map = makeMap({ DEBUG: 'false', TOKEN: 'null' });
    const result = validateEnvMap(map);
    expect(result.valid).toBe(true);
    const keys = result.issues.map((i) => i.key);
    expect(keys).toContain('DEBUG');
    expect(keys).toContain('TOKEN');
  });

  it('allows keys starting with underscore', () => {
    const map = makeMap({ _INTERNAL: 'value' });
    const result = validateEnvMap(map);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports errors for keys starting with a digit', () => {
    const map = makeMap({ '1INVALID': 'val' });
    const result = validateEnvMap(map);
    expect(result.valid).toBe(false);
  });
});

describe('validateAllEnvMaps', () => {
  it('validates multiple env maps and returns keyed results', () => {
    const maps = {
      staging: makeMap({ API_URL: 'https://staging.example.com' }),
      production: makeMap({ 'BAD KEY': 'value' }),
    };
    const results = validateAllEnvMaps(maps);
    expect(results.staging.valid).toBe(true);
    expect(results.production.valid).toBe(false);
  });
});
