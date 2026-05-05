import { diffEnvMaps } from './diff';

describe('diffEnvMaps', () => {
  it('returns all matching when maps are identical', () => {
    const map = { FOO: 'bar', BAZ: 'qux' };
    const result = diffEnvMaps(map, { ...map });
    expect(result.matching).toEqual(['BAZ', 'FOO']);
    expect(result.missingInBase).toEqual([]);
    expect(result.missingInCompare).toEqual([]);
    expect(result.mismatched).toEqual([]);
  });

  it('detects keys missing in compare', () => {
    const base = { FOO: 'bar', SECRET: 'abc' };
    const compare = { FOO: 'bar' };
    const result = diffEnvMaps(base, compare);
    expect(result.missingInCompare).toEqual(['SECRET']);
  });

  it('detects keys missing in base', () => {
    const base = { FOO: 'bar' };
    const compare = { FOO: 'bar', EXTRA: 'value' };
    const result = diffEnvMaps(base, compare);
    expect(result.missingInBase).toEqual(['EXTRA']);
  });

  it('detects mismatched values', () => {
    const base = { PORT: '3000' };
    const compare = { PORT: '8080' };
    const result = diffEnvMaps(base, compare);
    expect(result.mismatched).toEqual([
      { key: 'PORT', baseValue: '3000', compareValue: '8080' },
    ]);
  });

  it('handles completely different maps', () => {
    const base = { A: '1', B: '2' };
    const compare = { C: '3', D: '4' };
    const result = diffEnvMaps(base, compare);
    expect(result.missingInCompare).toEqual(['A', 'B']);
    expect(result.missingInBase).toEqual(['C', 'D']);
    expect(result.mismatched).toEqual([]);
    expect(result.matching).toEqual([]);
  });

  it('returns sorted keys for deterministic output', () => {
    const base = { Z: '1', A: '2', M: '3' };
    const compare = { Z: '1', A: '9', M: '3' };
    const result = diffEnvMaps(base, compare);
    expect(result.matching).toEqual(['M', 'Z']);
    expect(result.mismatched[0].key).toBe('A');
  });
});
