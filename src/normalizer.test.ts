import {
  parseNormalizeMode,
  normalizeValue,
  normalizeEnvMap,
  normalizeAllEnvMaps,
  NormalizeMode,
} from './normalizer';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('parseNormalizeMode', () => {
  it('parses valid modes', () => {
    expect(parseNormalizeMode('trim')).toBe('trim');
    expect(parseNormalizeMode('lowercase')).toBe('lowercase');
    expect(parseNormalizeMode('uppercase')).toBe('uppercase');
    expect(parseNormalizeMode('collapse')).toBe('collapse');
    expect(parseNormalizeMode('none')).toBe('none');
  });

  it('is case-insensitive', () => {
    expect(parseNormalizeMode('TRIM')).toBe('trim');
    expect(parseNormalizeMode('Lowercase')).toBe('lowercase');
  });

  it('throws on unknown mode', () => {
    expect(() => parseNormalizeMode('fuzzy')).toThrow(/Unknown normalize mode/);
  });
});

describe('normalizeValue', () => {
  it('trims whitespace', () => {
    expect(normalizeValue('  hello  ', 'trim')).toBe('hello');
  });

  it('lowercases value', () => {
    expect(normalizeValue('  Hello World  ', 'lowercase')).toBe('hello world');
  });

  it('uppercases value', () => {
    expect(normalizeValue('  hello world  ', 'uppercase')).toBe('HELLO WORLD');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeValue('  foo   bar   baz  ', 'collapse')).toBe('foo bar baz');
  });

  it('returns value unchanged for none', () => {
    expect(normalizeValue('  hello  ', 'none')).toBe('  hello  ');
  });
});

describe('normalizeEnvMap', () => {
  it('normalizes all values in a map', () => {
    const map = makeMap({ KEY1: '  value  ', KEY2: '  HELLO  ' });
    const result = normalizeEnvMap(map, 'lowercase');
    expect(result.get('KEY1')).toBe('value');
    expect(result.get('KEY2')).toBe('hello');
  });

  it('returns original map for none mode', () => {
    const map = makeMap({ KEY: '  value  ' });
    expect(normalizeEnvMap(map, 'none')).toBe(map);
  });
});

describe('normalizeAllEnvMaps', () => {
  it('normalizes maps across all environments', () => {
    const maps = {
      dev: makeMap({ PORT: '  3000  ' }),
      prod: makeMap({ PORT: '  3000  ' }),
    };
    const result = normalizeAllEnvMaps(maps, 'trim');
    expect(result.dev.get('PORT')).toBe('3000');
    expect(result.prod.get('PORT')).toBe('3000');
  });

  it('returns original maps for none mode', () => {
    const maps = { dev: makeMap({ KEY: 'val' }) };
    expect(normalizeAllEnvMaps(maps, 'none')).toBe(maps);
  });
});
