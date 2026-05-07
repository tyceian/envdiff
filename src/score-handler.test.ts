import { parseScoreOptions } from './score-handler';

describe('parseScoreOptions', () => {
  it('parses file arguments', () => {
    const opts = parseScoreOptions(['.env.dev', '.env.prod']);
    expect(opts.files).toEqual(['.env.dev', '.env.prod']);
    expect(opts.json).toBe(false);
    expect(opts.threshold).toBeUndefined();
  });

  it('parses --json flag', () => {
    const opts = parseScoreOptions(['--json', '.env']);
    expect(opts.json).toBe(true);
    expect(opts.files).toEqual(['.env']);
  });

  it('parses --threshold option', () => {
    const opts = parseScoreOptions(['.env', '--threshold', '0.8']);
    expect(opts.threshold).toBeCloseTo(0.8);
    expect(opts.files).toEqual(['.env']);
  });

  it('parses all options together', () => {
    const opts = parseScoreOptions(['--json', '--threshold', '0.75', '.env.a', '.env.b']);
    expect(opts.json).toBe(true);
    expect(opts.threshold).toBeCloseTo(0.75);
    expect(opts.files).toEqual(['.env.a', '.env.b']);
  });

  it('returns empty files array when none provided', () => {
    const opts = parseScoreOptions(['--json']);
    expect(opts.files).toEqual([]);
  });

  it('handles threshold of 0', () => {
    const opts = parseScoreOptions(['--threshold', '0', '.env']);
    expect(opts.threshold).toBe(0);
  });

  it('handles threshold of 1', () => {
    const opts = parseScoreOptions(['--threshold', '1', '.env']);
    expect(opts.threshold).toBe(1);
  });
});
