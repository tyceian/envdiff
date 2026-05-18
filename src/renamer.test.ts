import { parseRenameMap, applyRenames, applyRenamesToAll, suggestRenames } from './renamer';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('parseRenameMap', () => {
  it('parses comma-separated from:to pairs', () => {
    const result = parseRenameMap('OLD_KEY:NEW_KEY,FOO:BAR');
    expect(result).toEqual({ OLD_KEY: 'NEW_KEY', FOO: 'BAR' });
  });

  it('trims whitespace', () => {
    const result = parseRenameMap(' A : B ');
    expect(result).toEqual({ A: 'B' });
  });

  it('ignores malformed pairs', () => {
    const result = parseRenameMap('ONLY,A:B');
    expect(result).toEqual({ A: 'B' });
  });
});

describe('applyRenames', () => {
  it('renames matching keys', () => {
    const map = makeMap({ OLD_KEY: 'value', KEEP: 'yes' });
    const { result, changes } = applyRenames(map, { OLD_KEY: 'NEW_KEY' });
    expect(result.get('NEW_KEY')).toBe('value');
    expect(result.has('OLD_KEY')).toBe(false);
    expect(result.get('KEEP')).toBe('yes');
    expect(changes).toHaveLength(1);
    expect(changes[0].applied).toBe(true);
  });

  it('preserves value after rename', () => {
    const map = makeMap({ FOO: '123' });
    const { result } = applyRenames(map, { FOO: 'BAR' });
    expect(result.get('BAR')).toBe('123');
  });

  it('returns no changes when no keys match', () => {
    const map = makeMap({ X: '1' });
    const { changes } = applyRenames(map, { Y: 'Z' });
    expect(changes).toHaveLength(0);
  });
});

describe('applyRenamesToAll', () => {
  it('applies renames across multiple files', () => {
    const maps = new Map([
      ['a.env', makeMap({ OLD: 'v1' })],
      ['b.env', makeMap({ OLD: 'v2', EXTRA: 'x' })],
    ]);
    const { results, allChanges } = applyRenamesToAll(maps, { OLD: 'NEW' });
    expect(results.get('a.env')?.get('NEW')).toBe('v1');
    expect(results.get('b.env')?.get('NEW')).toBe('v2');
    expect(allChanges).toHaveLength(2);
    expect(allChanges[0].file).toBe('a.env');
  });
});

describe('suggestRenames', () => {
  it('suggests renames without applying', () => {
    const maps = new Map([['dev.env', makeMap({ OLD_KEY: 'abc' })]]);
    const suggestions = suggestRenames(maps, { OLD_KEY: 'NEW_KEY' });
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].applied).toBe(false);
    expect(suggestions[0].from).toBe('OLD_KEY');
    expect(suggestions[0].to).toBe('NEW_KEY');
  });
});
