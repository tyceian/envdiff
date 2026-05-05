import { formatAsJson, formatAsCsv, formatAsText, formatOutput, parseOutputFormat } from './formatter';
import { DiffResult } from './diff';

const mockResults: DiffResult[] = [
  { key: 'API_KEY', status: 'missing', values: { production: 'abc123', staging: undefined } },
  { key: 'DEBUG', status: 'mismatch', values: { production: 'false', staging: 'true' } },
];

describe('parseOutputFormat', () => {
  it('accepts valid formats', () => {
    expect(parseOutputFormat('text')).toBe('text');
    expect(parseOutputFormat('json')).toBe('json');
    expect(parseOutputFormat('csv')).toBe('csv');
  });

  it('is case-insensitive', () => {
    expect(parseOutputFormat('JSON')).toBe('json');
    expect(parseOutputFormat('CSV')).toBe('csv');
  });

  it('throws on unsupported format', () => {
    expect(() => parseOutputFormat('xml')).toThrow('Unsupported output format');
  });
});

describe('formatAsJson', () => {
  it('returns valid JSON string', () => {
    const output = formatAsJson(mockResults);
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].key).toBe('API_KEY');
  });
});

describe('formatAsCsv', () => {
  it('includes header row', () => {
    const output = formatAsCsv(mockResults);
    expect(output.startsWith('key,status,environments')).toBe(true);
  });

  it('includes all keys', () => {
    const output = formatAsCsv(mockResults);
    expect(output).toContain('API_KEY');
    expect(output).toContain('DEBUG');
  });
});

describe('formatAsText', () => {
  it('returns no-diff message for empty results', () => {
    expect(formatAsText([])).toBe('No differences found.');
  });

  it('shows status and key', () => {
    const output = formatAsText(mockResults);
    expect(output).toContain('[MISSING] API_KEY');
    expect(output).toContain('[MISMATCH] DEBUG');
  });

  it('shows (missing) for undefined values', () => {
    const output = formatAsText(mockResults);
    expect(output).toContain('(missing)');
  });
});

describe('formatOutput', () => {
  it('delegates to correct formatter', () => {
    expect(formatOutput(mockResults, 'json')).toEqual(formatAsJson(mockResults));
    expect(formatOutput(mockResults, 'csv')).toEqual(formatAsCsv(mockResults));
    expect(formatOutput(mockResults, 'text')).toEqual(formatAsText(mockResults));
  });
});
