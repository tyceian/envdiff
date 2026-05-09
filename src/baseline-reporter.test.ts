import { formatBaselineReport, summarizeBaselineDiff } from "./baseline-reporter";

const empty = { added: [], removed: [], changed: [] };

describe("formatBaselineReport", () => {
  it("shows success message when no changes", () => {
    const output = formatBaselineReport(empty);
    expect(output).toContain("No changes from baseline");
  });

  it("lists added keys", () => {
    const output = formatBaselineReport({ ...empty, added: ["NEW_KEY"] });
    expect(output).toContain("+ NEW_KEY");
    expect(output).toContain("Added (1)");
  });

  it("lists removed keys", () => {
    const output = formatBaselineReport({ ...empty, removed: ["OLD_KEY"] });
    expect(output).toContain("- OLD_KEY");
    expect(output).toContain("Removed (1)");
  });

  it("lists changed keys", () => {
    const output = formatBaselineReport({ ...empty, changed: ["CHANGED_KEY"] });
    expect(output).toContain("~ CHANGED_KEY");
    expect(output).toContain("Changed (1)");
  });

  it("shows all sections when all types present", () => {
    const output = formatBaselineReport({
      added: ["A"],
      removed: ["B"],
      changed: ["C"],
    });
    expect(output).toContain("+ A");
    expect(output).toContain("- B");
    expect(output).toContain("~ C");
  });

  it("does not show Added section when there are no added keys", () => {
    const output = formatBaselineReport({ ...empty, removed: ["OLD_KEY"] });
    expect(output).not.toContain("Added");
  });

  it("does not show Removed section when there are no removed keys", () => {
    const output = formatBaselineReport({ ...empty, added: ["NEW_KEY"] });
    expect(output).not.toContain("Removed");
  });

  it("does not show Changed section when there are no changed keys", () => {
    const output = formatBaselineReport({ ...empty, added: ["NEW_KEY"] });
    expect(output).not.toContain("Changed");
  });
});

describe("summarizeBaselineDiff", () => {
  it("returns no changes message for empty result", () => {
    expect(summarizeBaselineDiff(empty)).toBe("No changes from baseline.");
  });

  it("returns counts for each category", () => {
    const summary = summarizeBaselineDiff({
      added: ["A", "B"],
      removed: ["C"],
      changed: [],
    });
    expect(summary).toContain("2 added");
    expect(summary).toContain("1 removed");
    expect(summary).toContain("0 changed");
  });
});
