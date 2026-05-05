import { validateAgainstSchema, parseSchemaFile } from './schema';
import type { EnvSchema } from './schema';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('validateAgainstSchema', () => {
  const schema: EnvSchema = {
    API_KEY: { required: true },
    PORT: { required: true, pattern: /^\d+$/ },
    NODE_ENV: { pattern: /^(development|staging|production)$/ },
  };

  it('returns no violations for a fully valid env map', () => {
    const map = makeMap({ API_KEY: 'secret', PORT: '8080', NODE_ENV: 'production' });
    const violations = validateAgainstSchema(map, schema);
    expect(violations).toHaveLength(0);
  });

  it('flags missing required keys', () => {
    const map = makeMap({ PORT: '3000' });
    const violations = validateAgainstSchema(map, schema, 'staging');
    expect(violations.some((v) => v.key === 'API_KEY')).toBe(true);
  });

  it('flags values that do not match pattern', () => {
    const map = makeMap({ API_KEY: 'key', PORT: 'not-a-number' });
    const violations = validateAgainstSchema(map, schema);
    expect(violations.some((v) => v.key === 'PORT')).toBe(true);
  });

  it('does not flag optional keys that are absent', () => {
    const map = makeMap({ API_KEY: 'key', PORT: '80' });
    const violations = validateAgainstSchema(map, schema);
    expect(violations.some((v) => v.key === 'NODE_ENV')).toBe(false);
  });

  it('flags optional key with bad value when present', () => {
    const map = makeMap({ API_KEY: 'k', PORT: '80', NODE_ENV: 'test' });
    const violations = validateAgainstSchema(map, schema);
    expect(violations.some((v) => v.key === 'NODE_ENV')).toBe(true);
  });
});

describe('parseSchemaFile', () => {
  it('parses required keys', () => {
    const raw = 'API_KEY=required\nPORT=required';
    const schema = parseSchemaFile(raw);
    expect(schema['API_KEY'].required).toBe(true);
    expect(schema['PORT'].required).toBe(true);
  });

  it('ignores comment lines', () => {
    const raw = '# this is a comment\nAPI_KEY=required';
    const schema = parseSchemaFile(raw);
    expect(Object.keys(schema)).toHaveLength(1);
  });

  it('returns empty schema for empty input', () => {
    const schema = parseSchemaFile('');
    expect(Object.keys(schema)).toHaveLength(0);
  });
});
