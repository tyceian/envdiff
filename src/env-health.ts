import { DiffResult } from "./diff";
import { LintResult } from "./linter";
import { AuditReport } from "./audit";
import { EnvScore } from "./scorer";

export type HealthStatus = "healthy" | "warning" | "critical";

export interface EnvHealthReport {
  status: HealthStatus;
  score: number;
  issues: string[];
  summary: string;
}

/**
 * Maps a numeric score to a health status.
 * - 80–100: healthy
 * - 50–79: warning
 * - 0–49: critical
 */
export function computeHealthStatus(score: number): HealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

export function collectIssues(
  diffs: DiffResult[],
  lintResults: LintResult[],
  auditReport: AuditReport | null
): string[] {
  const issues: string[] = [];

  const missing = diffs.filter((d) => d.type === "missing");
  if (missing.length > 0) {
    issues.push(`${missing.length} missing key(s) detected`);
  }

  const mismatched = diffs.filter((d) => d.type === "mismatch");
  if (mismatched.length > 0) {
    issues.push(`${mismatched.length} mismatched value(s) detected`);
  }

  const errors = lintResults.filter((r) => r.severity === "error");
  if (errors.length > 0) {
    issues.push(`${errors.length} lint error(s) found`);
  }

  if (auditReport && auditReport.errors > 0) {
    issues.push(`${auditReport.errors} audit error(s) found`);
  }

  return issues;
}

export function buildHealthReport(
  score: EnvScore,
  diffs: DiffResult[],
  lintResults: LintResult[],
  auditReport: AuditReport | null
): EnvHealthReport {
  const overallScore = Math.round(
    (score.completeness + score.consistency + score.quality) / 3
  );
  const status = computeHealthStatus(overallScore);
  const issues = collectIssues(diffs, lintResults, auditReport);

  const summary =
    issues.length === 0
      ? "All checks passed. Environment looks healthy."
      : `Found ${issues.length} issue(s): ${issues[0]}${
          issues.length > 1 ? ` (+${issues.length - 1} more)` : ""
        }`;

  return { status, score: overallScore, issues, summary };
}

export function formatHealthReport(report: EnvHealthReport): string {
  const statusIcon =
    report.status === "healthy"
      ? "✅"
      : report.status === "warning"
      ? "⚠️"
      : "❌";
  const lines: string[] = [
    `${statusIcon} Health Status: ${report.status.toUpperCase()} (score: ${report.score}/100)`,
    `Summary: ${report.summary}`,
  ];
  if (report.issues.length > 0) {
    lines.push("Issues:");
    report.issues.forEach((issue) => lines.push(`  - ${issue}`));
  }
  return lines.join("\n");
}

/**
 * Returns true if the report indicates no issues and a healthy status.
 * Useful for quick pass/fail checks in CI pipelines.
 */
export function isHealthy(report: EnvHealthReport): boolean {
  return report.status === "healthy" && report.issues.length === 0;
}
