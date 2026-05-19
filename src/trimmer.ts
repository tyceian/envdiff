/**
 * trimmer.ts — strips leading/trailing whitespace from env values,
 * optionally normalising quotes and removing inline comments.
 */

export type TrimMode = "values" | "keys" | "both";

export function parseTrimMode(raw: string | undefined): TrimMode {
  if (raw === "keys" || raw === "both") return raw;
  return "values";
}

export function trimValue(value: string): string {
  // strip inline comments (unquoted # preceded by whitespace)
  const withoutComment = value.replace(/\s+#.*$/, "");
  // strip surrounding quotes if they match
  const unquoted = withoutComment.replace(/^(['"`])(.*?)\1$/, "$2");
  return unquoted.trim();
}

export function trimKey(key: string): string {
  return key.trim();
}

export function trimEnvMap(
  map: Map<string, string>,
  mode: TrimMode = "values"
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [k, v] of map) {
    const trimmedKey = mode === "keys" || mode === "both" ? trimKey(k) : k;
    const trimmedVal = mode === "values" || mode === "both" ? trimValue(v) : v;
    result.set(trimmedKey, trimmedVal);
  }
  return result;
}

export function trimAllEnvMaps(
  maps: Record<string, Map<string, string>>,
  mode: TrimMode = "values"
): Record<string, Map<string, string>> {
  const result: Record<string, Map<string, string>> = {};
  for (const [env, map] of Object.entries(maps)) {
    result[env] = trimEnvMap(map, mode);
  }
  return result;
}

export function findUntrimmedKeys(
  map: Map<string, string>
): Array<{ key: string; raw: string; trimmed: string }> {
  const issues: Array<{ key: string; raw: string; trimmed: string }> = [];
  for (const [k, v] of map) {
    const trimmed = trimValue(v);
    if (trimmed !== v) {
      issues.push({ key: k, raw: v, trimmed });
    }
  }
  return issues;
}
