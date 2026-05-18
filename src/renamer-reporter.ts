import { RenameResult } from './renamer';
import { colorize } from './reporter';

export function formatRenameEntry(entry: RenameResult): string {
  const tag = entry.applied ? colorize('green', 'RENAMED') : colorize('yellow', 'SUGGEST');
  const file = colorize('cyan', entry.file || 'unknown');
  return `  [${tag}] ${file}: ${entry.from} → ${entry.to}`;
}

export function formatRenameReport(results: RenameResult[], dryRun = false): string {
  if (results.length === 0) {
    return colorize('green', 'No renames to apply.');
  }

  const header = dryRun
    ? colorize('yellow', '--- Rename Preview (dry-run) ---')
    : colorize('cyan', '--- Rename Results ---');

  const lines = results.map(formatRenameEntry);
  return [header, ...lines].join('\n');
}

export function summarizeRenames(results: RenameResult[]): string {
  const applied = results.filter(r => r.applied).length;
  const suggested = results.filter(r => !r.applied).length;

  const parts: string[] = [];
  if (applied > 0) parts.push(colorize('green', `${applied} renamed`));
  if (suggested > 0) parts.push(colorize('yellow', `${suggested} suggested`));
  if (parts.length === 0) return colorize('green', 'Nothing to rename.');

  return `Renames: ${parts.join(', ')}`;
}
