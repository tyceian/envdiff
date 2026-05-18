import { computeStats, formatStats, hasIssues } from "./stats";
import { DiffResult } from "./diff";

function makeResults(overrides: Partial<DiffResult>[] = []): DiffResult[] {
  return overrides.map((o) => ({
    key: "KEY",
    status: "matching",
    values: {},
    ...o,
  }));
}

describe("computeStats", () => {
  it("returns zeros for empty results", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.missing).toBe(0);
    expect(stats.matchingPercent).toBe(0);
  });

  it("counts each status correctly", () => {
    const results = makeResults([
      { status: "matching" },
      { status: "matching" },
      { status: "missing" },
      { status: "extra" },
      { status: "mismatched" },
    ]);
    const stats = computeStats(results);
    expect(stats.total).toBe(5);
    expect(stats.matching).toBe(2);
    expect(stats.missing).toBe(1);
    expect(stats.extra).toBe(1);
    expect(stats.mismatched).toBe(1);
  });

  it("calculates percentages", () => {
    const results = makeResults([
      { status: "matching" },
      { status: "matching" },
      { status: "matching" },
      { status: "missing" },
    ]);
    const stats = computeStats(results);
    expect(stats.matchingPercent).toBe(75);
    expect(stats.missingPercent).toBe(25);
  });

  it("percentages sum to 100 for all-matching results", () => {
    const results = makeResults([
      { status: "matching" },
      { status: "matching" },
    ]);
    const stats = computeStats(results);
    expect(stats.matchingPercent).toBe(100);
    expect(stats.missingPercent).toBe(0);
  });
});

describe("formatStats", () => {
  it("includes all fields in output", () => {
    const stats = computeStats(
      makeResults([{ status: "matching" }, { status: "missing" }])
    );
    const output = formatStats(stats);
    expect(output).toContain("Total keys");
    expect(output).toContain("Missing");
    expect(output).toContain("Matching");
    expect(output).toContain("Extra");
    expect(output).toContain("Mismatched");
  });

  it("includes the actual counts in output", () => {
    const stats = computeStats(
      makeResults([{ status: "matching" }, { status: "missing" }])
    );
    const output = formatStats(stats);
    expect(output).toContain("2"); // total
    expect(output).toContain("1"); // missing / matching
  });
});

describe("hasIssues", () => {
  it("returns false when all matching", () => {
    const stats = computeStats(makeResults([{ status: "matching" }]));
    expect(hasIssues(stats)).toBe(false);
  });

  it("returns true when there are missing keys", () => {
    const stats = computeStats(makeResults([{ status: "missing" }]));
    expect(hasIssues(stats)).toBe(true);
  });

  it("returns true when there are mismatched keys", () => {
    const stats = computeStats(makeResults([{ status: "mismatched" }]));
    expect(hasIssues(stats)).toBe(true);
  });

  it("returns true when there are extra keys", () => {
    const stats = computeStats(makeResults([{ status: "extra" }]));
    expect(hasIssues(stats)).toBe(true);
  });
});
