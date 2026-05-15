/**
 * Detects duplicate keys within a single .env file content
 * and across multiple env maps.
 */

export interface DuplicateEntry {
  key: string;
  file: string;
  occurrences: number;
  lines: number[];
}

export interface DuplicatesReport {
  hasDuplicates: boolean;
  entries: DuplicateEntry[];
  totalCount: number;
}

/**
 * Scans raw .env file content for duplicate keys, returning line numbers.
 */
export function findDuplicateKeys(
  content: string,
  filename: string
): DuplicateEntry[] {
  const seen = new Map<string, number[]>();

  content.split("\n").forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    if (!key) return;
    const existing = seen.get(key) ?? [];
    existing.push(idx + 1);
    seen.set(key, existing);
  });

  const entries: DuplicateEntry[] = [];
  for (const [key, lines] of seen.entries()) {
    if (lines.length > 1) {
      entries.push({ key, file: filename, occurrences: lines.length, lines });
    }
  }
  return entries;
}

/**
 * Builds a full duplicates report from a map of filename -> raw content.
 */
export function buildDuplicatesReport(
  files: Record<string, string>
): DuplicatesReport {
  const entries: DuplicateEntry[] = [];
  for (const [filename, content] of Object.entries(files)) {
    entries.push(...findDuplicateKeys(content, filename));
  }
  return {
    hasDuplicates: entries.length > 0,
    entries,
    totalCount: entries.length,
  };
}

export function formatDuplicatesReport(report: DuplicatesReport): string {
  if (!report.hasDuplicates) return "No duplicate keys found.\n";
  const lines: string[] = [`Found ${report.totalCount} duplicate key(s):\n`];
  for (const entry of report.entries) {
    lines.push(
      `  [${entry.file}] "${entry.key}" appears ${entry.occurrences}x on lines: ${entry.lines.join(", ")}`
    );
  }
  return lines.join("\n") + "\n";
}
