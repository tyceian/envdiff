/**
 * Resolves variable references within env values, e.g. PORT=${BASE_PORT}
 */

export type InterpolationMode = "strict" | "loose" | "none";

export function parseInterpolationMode(value: string): InterpolationMode {
  if (value === "strict" || value === "loose" || value === "none") return value;
  throw new Error(`Unknown interpolation mode: ${value}`);
}

/**
 * Interpolate a single value against a map of known variables.
 * In strict mode, unresolved references throw. In loose mode they are left as-is.
 */
export function interpolateValue(
  value: string,
  vars: Map<string, string>,
  mode: InterpolationMode = "loose"
): string {
  if (mode === "none") return value;

  return value.replace(/\$\{([^}]+)\}/g, (match, key) => {
    if (vars.has(key)) return vars.get(key) as string;
    if (mode === "strict") throw new Error(`Unresolved variable reference: ${key}`);
    return match; // leave as-is in loose mode
  });
}

/**
 * Interpolate all values in an env map. Variables may reference earlier keys
 * in the same map (resolved in insertion order) or an optional base map.
 */
export function interpolateEnvMap(
  envMap: Map<string, string>,
  mode: InterpolationMode = "loose",
  baseVars?: Map<string, string>
): Map<string, string> {
  const resolved = new Map<string, string>(baseVars ?? []);
  const result = new Map<string, string>();

  for (const [key, raw] of envMap) {
    const interpolated = interpolateValue(raw, resolved, mode);
    result.set(key, interpolated);
    resolved.set(key, interpolated);
  }

  return result;
}

/**
 * Returns keys whose values contain unresolved placeholders after interpolation.
 */
export function findUnresolvedRefs(envMap: Map<string, string>): string[] {
  const unresolved: string[] = [];
  for (const [key, value] of envMap) {
    if (/\$\{[^}]+\}/.test(value)) unresolved.push(key);
  }
  return unresolved;
}
