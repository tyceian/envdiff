/**
 * Redactor: masks sensitive values in env maps before output
 */

export type RedactOptions = {
  patterns?: RegExp[];
  replacement?: string;
};

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

export function isSensitiveKey(
  key: string,
  patterns: RegExp[] = DEFAULT_SENSITIVE_PATTERNS
): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

export function redactValue(
  value: string,
  replacement: string = "***"
): string {
  if (value.length === 0) return value;
  return replacement;
}

export function redactEnvMap(
  envMap: Map<string, string>,
  options: RedactOptions = {}
): Map<string, string> {
  const patterns = options.patterns ?? DEFAULT_SENSITIVE_PATTERNS;
  const replacement = options.replacement ?? "***";
  const result = new Map<string, string>();

  for (const [key, value] of envMap.entries()) {
    if (isSensitiveKey(key, patterns)) {
      result.set(key, redactValue(value, replacement));
    } else {
      result.set(key, value);
    }
  }

  return result;
}

export function redactAllEnvMaps(
  envMaps: Map<string, Map<string, string>>,
  options: RedactOptions = {}
): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  for (const [name, envMap] of envMaps.entries()) {
    result.set(name, redactEnvMap(envMap, options));
  }
  return result;
}
