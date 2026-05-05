/**
 * Parses a .env file string into a key-value map.
 * Handles comments, blank lines, and quoted values.
 */
export type EnvMap = Record<string, string>;

export function parseEnvFile(content: string): EnvMap {
  const result: EnvMap = {};

  const lines = content.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();

    // skip blank lines and comments
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // strip inline comments (unquoted)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    // strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}
