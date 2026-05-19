import { formatIssue, formatTrimReport, summarizeTrimReport } from "./trimmer-reporter";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("formatIssue", () => {
  it("includes key, raw and trimmed values", () => {
    const result = formatIssue({ key: "DB_HOST", raw: "  localhost  ", trimmed: "localhost" });
    expect(result).toContain("DB_HOST");
    expect(result).toContain("localhost");
  });
});

describe("formatTrimReport", () => {
  it("returns success message when no issues", () => {
    const maps = { dev: makeMap({ KEY: "clean" }) };
    const report = formatTrimReport(maps);
    expect(report).toContain("No untrimmed values found");
  });

  it("lists issues per environment", () => {
    const maps = {
      dev: makeMap({ DB_HOST: "  localhost  " }),
      prod: makeMap({ DB_HOST: "clean" }),
    };
    const report = formatTrimReport(maps);
    expect(report).toContain("dev");
    expect(report).toContain("DB_HOST");
    expect(report).not.toContain("prod");
  });

  it("includes total count in summary line", () => {
    const maps = {
      dev: makeMap({ A: "  x  ", B: '"y"' }),
    };
    const report = formatTrimReport(maps);
    expect(report).toContain("2 untrimmed");
  });

  it("handles multiple environments with issues", () => {
    const maps = {
      dev: makeMap({ KEY: "  val  " }),
      staging: makeMap({ KEY: '"val"' }),
    };
    const report = formatTrimReport(maps);
    expect(report).toContain("dev");
    expect(report).toContain("staging");
  });
});

describe("summarizeTrimReport", () => {
  it("returns zero total when all clean", () => {
    const maps = { dev: makeMap({ KEY: "value" }) };
    const summary = summarizeTrimReport(maps);
    expect(summary.total).toBe(0);
    expect(summary.envs).toHaveLength(0);
  });

  it("counts issues and affected envs", () => {
    const maps = {
      dev: makeMap({ A: "  x  ", B: "  y  " }),
      prod: makeMap({ A: "clean" }),
    };
    const summary = summarizeTrimReport(maps);
    expect(summary.total).toBe(2);
    expect(summary.envs).toEqual(["dev"]);
  });

  it("includes all affected envs", () => {
    const maps = {
      dev: makeMap({ A: "  x  " }),
      prod: makeMap({ B: '"y"' }),
    };
    const summary = summarizeTrimReport(maps);
    expect(summary.total).toBe(2);
    expect(summary.envs).toContain("dev");
    expect(summary.envs).toContain("prod");
  });
});
