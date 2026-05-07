// Profiles .env files to detect patterns, anomalies, and key statistics

export interface EnvProfile {
  totalKeys: number;
  emptyValues: string[];
  duplicateKeys: string[];
  longValues: string[]; // values > 256 chars
  numericOnlyValues: string[];
  booleanLikeValues: string[];
}

const BOOLEAN_LIKE = new Set(["true", "false", "yes", "no", "1", "0", "on", "off"]);

export function profileEnvMap(map: Map<string, string>): EnvProfile {
  const seen = new Set<string>();
  const duplicateKeys: string[] = [];
  const emptyValues: string[] = [];
  const longValues: string[] = [];
  const numericOnlyValues: string[] = [];
  const booleanLikeValues: string[] = [];

  for (const [key, value] of map.entries()) {
    if (seen.has(key)) {
      duplicateKeys.push(key);
    } else {
      seen.add(key);
    }

    if (value.trim() === "") emptyValues.push(key);
    if (value.length > 256) longValues.push(key);
    if (/^\d+$/.test(value)) numericOnlyValues.push(key);
    if (BOOLEAN_LIKE.has(value.toLowerCase())) booleanLikeValues.push(key);
  }

  return {
    totalKeys: map.size,
    emptyValues,
    duplicateKeys,
    longValues,
    numericOnlyValues,
    booleanLikeValues,
  };
}

export function profileAllEnvMaps(
  maps: Record<string, Map<string, string>>
): Record<string, EnvProfile> {
  const result: Record<string, EnvProfile> = {};
  for (const [env, map] of Object.entries(maps)) {
    result[env] = profileEnvMap(map);
  }
  return result;
}

export function hasProfileAnomalies(profile: EnvProfile): boolean {
  return (
    profile.emptyValues.length > 0 ||
    profile.duplicateKeys.length > 0 ||
    profile.longValues.length > 0
  );
}
