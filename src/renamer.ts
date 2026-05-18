// Suggests or applies key renames across env maps

export type RenameMap = Record<string, string>;

export interface RenameResult {
  file: string;
  from: string;
  to: string;
  applied: boolean;
}

export function parseRenameMap(raw: string): RenameMap {
  const map: RenameMap = {};
  for (const pair of raw.split(',')) {
    const [from, to] = pair.split(':').map(s => s.trim());
    if (from && to) map[from] = to;
  }
  return map;
}

export function applyRenames(
  envMap: Map<string, string>,
  renameMap: RenameMap
): { result: Map<string, string>; changes: RenameResult[] } {
  const result = new Map<string, string>();
  const changes: RenameResult[] = [];

  for (const [key, value] of envMap.entries()) {
    if (renameMap[key]) {
      result.set(renameMap[key], value);
      changes.push({ file: '', from: key, to: renameMap[key], applied: true });
    } else {
      result.set(key, value);
    }
  }

  return { result, changes };
}

export function applyRenamesToAll(
  envMaps: Map<string, Map<string, string>>,
  renameMap: RenameMap
): { results: Map<string, Map<string, string>>; allChanges: RenameResult[] } {
  const results = new Map<string, Map<string, string>>();
  const allChanges: RenameResult[] = [];

  for (const [file, envMap] of envMaps.entries()) {
    const { result, changes } = applyRenames(envMap, renameMap);
    results.set(file, result);
    allChanges.push(...changes.map(c => ({ ...c, file })));
  }

  return { results, allChanges };
}

export function suggestRenames(
  envMaps: Map<string, Map<string, string>>,
  renameMap: RenameMap
): RenameResult[] {
  const suggestions: RenameResult[] = [];
  for (const [file, envMap] of envMaps.entries()) {
    for (const key of envMap.keys()) {
      if (renameMap[key]) {
        suggestions.push({ file, from: key, to: renameMap[key], applied: false });
      }
    }
  }
  return suggestions;
}
