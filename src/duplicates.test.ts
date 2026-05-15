import {
  findDuplicateKeys,
  buildDuplicatesReport,
  formatDuplicatesReport,
} from "./duplicates";

const sampleWithDupes = `
DB_HOST=localhost
DB_PORT=5432
DB_HOST=remotehost
API_KEY=abc
API_KEY=xyz
`.trim();

const sampleNoDupes = `
DB_HOST=localhost
DB_PORT=5432
API_KEY=abc
`.trim();

const sampleWithComments = `
# DB_HOST=commented
DB_HOST=localhost
DB_HOST=duplicate
`.trim();

describe("findDuplicateKeys", () => {
  it("detects duplicate keys and records correct line numbers", () => {
    const result = findDuplicateKeys(sampleWithDupes, ".env");
    expect(result).toHaveLength(2);
    const dbHost = result.find((e) => e.key === "DB_HOST");
    expect(dbHost).toBeDefined();
    expect(dbHost!.occurrences).toBe(2);
    expect(dbHost!.lines).toEqual([1, 3]);
  });

  it("returns empty array when no duplicates exist", () => {
    const result = findDuplicateKeys(sampleNoDupes, ".env");
    expect(result).toHaveLength(0);
  });

  it("ignores comment lines", () => {
    const result = findDuplicateKeys(sampleWithComments, ".env");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("DB_HOST");
    expect(result[0].lines).toEqual([2, 3]);
  });

  it("attaches the correct filename", () => {
    const result = findDuplicateKeys(sampleWithDupes, ".env.staging");
    expect(result[0].file).toBe(".env.staging");
  });
});

describe("buildDuplicatesReport", () => {
  it("aggregates duplicates across multiple files", () => {
    const report = buildDuplicatesReport({
      ".env": sampleWithDupes,
      ".env.staging": sampleNoDupes,
    });
    expect(report.hasDuplicates).toBe(true);
    expect(report.totalCount).toBe(2);
  });

  it("reports no duplicates when all files are clean", () => {
    const report = buildDuplicatesReport({ ".env": sampleNoDupes });
    expect(report.hasDuplicates).toBe(false);
    expect(report.totalCount).toBe(0);
  });
});

describe("formatDuplicatesReport", () => {
  it("returns a clean message when no duplicates", () => {
    const report = buildDuplicatesReport({ ".env": sampleNoDupes });
    expect(formatDuplicatesReport(report)).toContain("No duplicate keys");
  });

  it("includes key names and line numbers in output", () => {
    const report = buildDuplicatesReport({ ".env": sampleWithDupes });
    const output = formatDuplicatesReport(report);
    expect(output).toContain("DB_HOST");
    expect(output).toContain("lines:");
  });
});
