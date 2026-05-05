import { parseEnvFile } from './parser';

describe('parseEnvFile', () => {
  it('parses simple key=value pairs', () => {
    const input = 'FOO=bar\nBAZ=qux';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const input = '# this is a comment\nFOO=bar';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar' });
  });

  it('ignores blank lines', () => {
    const input = '\nFOO=bar\n\nBAZ=qux\n';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips double-quoted values', () => {
    const input = 'FOO="hello world"';
    expect(parseEnvFile(input)).toEqual({ FOO: 'hello world' });
  });

  it('strips single-quoted values', () => {
    const input = "FOO='hello world'";
    expect(parseEnvFile(input)).toEqual({ FOO: 'hello world' });
  });

  it('strips inline comments from unquoted values', () => {
    const input = 'FOO=bar # inline comment';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar' });
  });

  it('does not strip inline comments from quoted values', () => {
    const input = 'FOO="bar # not a comment"';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar # not a comment' });
  });

  it('handles values with equals signs', () => {
    const input = 'DATABASE_URL=postgres://user:pass@host/db?ssl=true';
    expect(parseEnvFile(input)).toEqual({
      DATABASE_URL: 'postgres://user:pass@host/db?ssl=true',
    });
  });

  it('returns empty object for empty input', () => {
    expect(parseEnvFile('')).toEqual({});
  });

  it('skips lines without an equals sign', () => {
    const input = 'INVALID_LINE\nFOO=bar';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar' });
  });

  it('handles keys with surrounding whitespace', () => {
    const input = '  FOO  =bar';
    expect(parseEnvFile(input)).toEqual({ FOO: 'bar' });
  });
});
