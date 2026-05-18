/**
 * Groups env keys by prefix (e.g. DB_, AWS_, APP_) for organized reporting.
 */

export interface GroupedEnvMap {
  prefix: string;
  keys: string[];
}

export function extractPrefix(key: string): string {
  const idx = key.indexOf('_');
  if (idx === -1) return '(none)';
  return key.slice(0, idx);
}

export function groupKeysByPrefix(keys: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const key of keys) {
    const prefix = extractPrefix(key);
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix)!.push(key);
  }
  return groups;
}

export function buildGroupedReport(keys: string[]): GroupedEnvMap[] {
  const groups = groupKeysByPrefix(keys);
  const result: GroupedEnvMap[] = [];
  for (const [prefix, groupKeys] of groups) {
    result.push({ prefix, keys: groupKeys.sort() });
  }
  return result.sort((a, b) => a.prefix.localeCompare(b.prefix));
}

export function formatGroupedReport(groups: GroupedEnvMap[]): string {
  if (groups.length === 0) return 'No keys found.\n';
  const lines: string[] = [];
  for (const group of groups) {
    lines.push(`[${group.prefix}] (${group.keys.length} key${group.keys.length === 1 ? '' : 's'})`);
    for (const key of group.keys) {
      lines.push(`  - ${key}`);
    }
  }
  return lines.join('\n') + '\n';
}

export function summarizeGroups(groups: GroupedEnvMap[]): string {
  const total = groups.reduce((sum, g) => sum + g.keys.length, 0);
  return `${groups.length} prefix group${groups.length === 1 ? '' : 's'}, ${total} key${total === 1 ? '' : 's'} total`;
}
