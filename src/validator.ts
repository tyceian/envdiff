/**
 * Validates parsed env maps for common issues like empty keys,
 * invalid characters, or suspicious values.
 */

export interface ValidationIssue {
  key: string;
  message: string;
  severity: 'warn' | 'error';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const VALID_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SUSPICIOUS_VALUE_PATTERN = /^(true|false|null|undefined|0)$/i;

export function validateEnvMap(
  envMap: Map<string, string>,
  label = 'env'
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of envMap.entries()) {
    if (!key.trim()) {
      issues.push({ key, message: `Empty key found in ${label}`, severity: 'error' });
      continue;
    }

    if (!VALID_KEY_PATTERN.test(key)) {
      issues.push({
        key,
        message: `Key "${key}" contains invalid characters`,
        severity: 'error',
      });
    }

    if (value.trim() === '') {
      issues.push({
        key,
        message: `Key "${key}" has an empty value in ${label}`,
        severity: 'warn',
      });
    }

    if (SUSPICIOUS_VALUE_PATTERN.test(value.trim())) {
      issues.push({
        key,
        message: `Key "${key}" has a suspicious placeholder value: "${value}"`,
        severity: 'warn',
      });
    }
  }

  return {
    valid: issues.every((i) => i.severity !== 'error'),
    issues,
  };
}

export function validateAllEnvMaps(
  envMaps: Record<string, Map<string, string>>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  for (const [label, map] of Object.entries(envMaps)) {
    results[label] = validateEnvMap(map, label);
  }
  return results;
}
