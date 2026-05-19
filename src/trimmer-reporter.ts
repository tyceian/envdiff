/**
 * trimmer-reporter.ts — formats untrimmed key findings for display.
 */

import { findUntrimmedKeys } from "./trimmer";
import { colorize } from "./reporter";

export interface UntrimmedIssue {
  key: string;
  raw: string;
  trimmed: string;
}

export function formatIssue(issue: UntrimmedIssue): string {
  return (
    `  ${colorize(issue.key, "yellow")}: ` +
    `${JSON.stringify(issue.raw)} → ${JSON.stringify(issue.trimmed)}`
  );
}

export function formatTrimReport(
  maps: Record<string, Map<string, string>>
): string {
  const lines: string[] = [];
  let totalIssues = 0;

  for (const [env, map] of Object.entries(maps)) {
    const issues = findUntrimmedKeys(map);
    if (issues.length === 0) continue;
    totalIssues += issues.length;
    lines.push(colorize(`[${env}]`, "cyan"));
    for (const issue of issues) {
      lines.push(formatIssue(issue));
    }
  }

  if (lines.length === 0) {
    return colorize("✔ No untrimmed values found.", "green");
  }

  lines.push("");
  lines.push(
    colorize(`${totalIssues} untrimmed value(s) found across ${Object.keys(maps).length} environment(s).`, "red")
  );
  return lines.join("\n");
}

export function summarizeTrimReport(
  maps: Record<string, Map<string, string>>
): { total: number; envs: string[] } {
  const envs: string[] = [];
  let total = 0;
  for (const [env, map] of Object.entries(maps)) {
    const issues = findUntrimmedKeys(map);
    if (issues.length > 0) {
      total += issues.length;
      envs.push(env);
    }
  }
  return { total, envs };
}
