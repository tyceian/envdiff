// Normalizes env values for consistent comparison across environments

export type NormalizeMode = 'trim' | 'lowercase' | 'uppercase' | 'collapse' | 'none';

export function parseNormalizeMode(raw: string): NormalizeMode {
  const valid: NormalizeMode[] = ['trim', 'lowercase', 'uppercase', 'collapse', 'none'];
  const mode = raw.trim().toLowerCase() as NormalizeMode;
  if (!valid.includes(mode)) {
    throw new Error(`Unknown normalize mode: "${raw}". Valid modes: ${valid.join(', ')}`);
  }
  return mode;
}

export function normalizeValue(value: string, mode: NormalizeMode): string {
  switch (mode) {
    case 'trim':
      return value.trim();
    case 'lowercase':
      return value.trim().toLowerCase();
    case 'uppercase':
      return value.trim().toUpperCase();
    case 'collapse':
      // trim + collapse internal whitespace
      return value.trim().replace(/\s+/g, ' ');
    case 'none':
    default:
      return value;
  }
}

export function normalizeEnvMap(
  map: Map<string, string>,
  mode: NormalizeMode
): Map<string, string> {
  if (mode === 'none') return map;
  const result = new Map<string, string>();
  for (const [key, value] of map.entries()) {
    result.set(key, normalizeValue(value, mode));
  }
  return result;
}

export function normalizeAllEnvMaps(
  maps: Record<string, Map<string, string>>,
  mode: NormalizeMode
): Record<string, Map<string, string>> {
  if (mode === 'none') return maps;
  const result: Record<string, Map<string, string>> = {};
  for (const [env, map] of Object.entries(maps)) {
    result[env] = normalizeEnvMap(map, mode);
  }
  return result;
}
