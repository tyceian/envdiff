/**
 * Optional schema support: define required keys and expected value patterns
 * per environment, then validate env maps against the schema.
 */

export interface SchemaEntry {
  required?: boolean;
  pattern?: RegExp;
  description?: string;
}

export type EnvSchema = Record<string, SchemaEntry>;

export interface SchemaViolation {
  key: string;
  message: string;
}

export function validateAgainstSchema(
  envMap: Map<string, string>,
  schema: EnvSchema,
  label = 'env'
): SchemaViolation[] {
  const violations: SchemaViolation[] = [];

  for (const [key, entry] of Object.entries(schema)) {
    const value = envMap.get(key);

    if (entry.required && (value === undefined || value.trim() === '')) {
      violations.push({
        key,
        message: `Required key "${key}" is missing or empty in ${label}`,
      });
      continue;
    }

    if (value !== undefined && entry.pattern && !entry.pattern.test(value)) {
      violations.push({
        key,
        message: `Key "${key}" value "${value}" does not match expected pattern in ${label}`,
      });
    }
  }

  return violations;
}

export function parseSchemaFile(raw: string): EnvSchema {
  const schema: EnvSchema = {};
  const lines = raw.split('\n').filter((l) => l.trim() && !l.startsWith('#'));

  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    const meta = rest.join('=').trim();
    const entry: SchemaEntry = {};

    if (meta.includes('required')) entry.required = true;
    const patternMatch = meta.match(/pattern:(\/.*?\/)/);
    if (patternMatch) {
      try {
        entry.pattern = new RegExp(patternMatch[1].replace(/\//g, ''));
      } catch {
        // ignore invalid patterns
      }
    }

    schema[key.trim()] = entry;
  }

  return schema;
}
