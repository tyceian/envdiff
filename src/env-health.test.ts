import {
  computeHealthStatus,
  collectIssues,
  buildHealthReport,
  formatHealthReport,
} from "./env-health";
import { DiffResult } from "./diff";
import { LintResult } from "./linter";
import { AuditReport } from "./audit";
import { EnvScore } from "./scorer";

const makeScore = (overrides: Partial<EnvScore> = {}): EnvScore => ({
  completeness: 100,
  consistency: 100,
  quality: 100,
  grade: "A",
  ...overrides,
});

const makeDiff = (type: "missing" | "mismatch" | "extra"): DiffResult => ({
  key: "SOME_KEY",
  type,
  environments: [],
});

const makeLint = (severity: "error" | "warning"): LintResult => ({
  key: "SOME_KEY",
  message: "issue",
  severity,
});

const makeAudit = (errors: number): AuditReport => ({
  entries: [],
  errors,
  warnings: 0,
});

describe("computeHealthStatus", () => {
  it("returns healthy for score >= 80", () => {
    expect(computeHealthStatus(80)).toBe("healthy");
    expect(computeHealthStatus(100)).toBe("healthy");
  });

  it("returns warning for score 50-79", () => {
    expect(computeHealthStatus(50)).toBe("warning");
    expect(computeHealthStatus(79)).toBe("warning");
  });

  it("returns critical for score < 50", () => {
    expect(computeHealthStatus(49)).toBe("critical");
    expect(computeHealthStatus(0)).toBe("critical");
  });
});

describe("collectIssues", () => {
  it("returns empty array when no issues", () => {
    expect(collectIssues([], [], null)).toEqual([]);
  });

  it("reports missing and mismatched diffs", () => {
    const diffs = [makeDiff("missing"), makeDiff("mismatch"), makeDiff("mismatch")];
    const issues = collectIssues(diffs, [], null);
    expect(issues).toContain("1 missing key(s) detected");
    expect(issues).toContain("2 mismatched value(s) detected");
  });

  it("reports lint errors", () => {
    const issues = collectIssues([], [makeLint("error")], null);
    expect(issues).toContain("1 lint error(s) found");
  });

  it("reports audit errors", () => {
    const issues = collectIssues([], [], makeAudit(3));
    expect(issues).toContain("3 audit error(s) found");
  });
});

describe("buildHealthReport", () => {
  it("builds a healthy report when no issues", () => {
    const report = buildHealthReport(makeScore(), [], [], null);
    expect(report.status).toBe("healthy");
    expect(report.score).toBe(100);
    expect(report.issues).toHaveLength(0);
  });

  it("builds a critical report with low scores", () => {
    const score = makeScore({ completeness: 20, consistency: 20, quality: 20 });
    const report = buildHealthReport(score, [makeDiff("missing")], [], null);
    expect(report.status).toBe("critical");
    expect(report.issues.length).toBeGreaterThan(0);
  });
});

describe("formatHealthReport", () => {
  it("includes status icon and summary", () => {
    const report = buildHealthReport(makeScore(), [], [], null);
    const output = formatHealthReport(report);
    expect(output).toContain("✅");
    expect(output).toContain("HEALTHY");
  });

  it("lists issues when present", () => {
    const score = makeScore({ completeness: 40, consistency: 40, quality: 40 });
    const report = buildHealthReport(score, [makeDiff("missing")], [], null);
    const output = formatHealthReport(report);
    expect(output).toContain("Issues:");
  });
});
