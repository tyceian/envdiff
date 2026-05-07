import { formatProfileReport, summarizeProfiles } from "./profile-reporter";
import { EnvProfile } from "./profiler";

function makeProfile(overrides: Partial<EnvProfile> = {}): EnvProfile {
  return {
    totalKeys: 5,
    emptyValues: [],
    duplicateKeys: [],
    longValues: [],
    numericOnlyValues: [],
    booleanLikeValues: [],
    ...overrides,
  };
}

describe("formatProfileReport", () => {
  it("includes env name and total keys", () => {
    const report = formatProfileReport("dev", makeProfile({ totalKeys: 3 }));
    expect(report).toContain("dev");
    expect(report).toContain("3");
  });

  it("reports empty values", () => {
    const report = formatProfileReport("dev", makeProfile({ emptyValues: ["SECRET"] }));
    expect(report).toContain("SECRET");
    expect(report).toContain("Empty values");
  });

  it("reports duplicate keys", () => {
    const report = formatProfileReport("dev", makeProfile({ duplicateKeys: ["KEY"] }));
    expect(report).toContain("Duplicate keys");
    expect(report).toContain("KEY");
  });

  it("shows no anomalies message when clean", () => {
    const report = formatProfileReport("prod", makeProfile());
    expect(report).toContain("No anomalies");
  });

  it("reports long values", () => {
    const report = formatProfileReport("dev", makeProfile({ longValues: ["BLOB"] }));
    expect(report).toContain("Long values");
    expect(report).toContain("BLOB");
  });

  it("reports numeric-only values", () => {
    const report = formatProfileReport("dev", makeProfile({ numericOnlyValues: ["PORT"] }));
    expect(report).toContain("Numeric values");
    expect(report).toContain("PORT");
  });
});

describe("summarizeProfiles", () => {
  it("includes all environments", () => {
    const profiles = {
      dev: makeProfile({ emptyValues: ["A"] }),
      prod: makeProfile(),
    };
    const summary = summarizeProfiles(profiles);
    expect(summary).toContain("dev");
    expect(summary).toContain("prod");
  });

  it("returns a non-empty string", () => {
    const profiles = { staging: makeProfile() };
    expect(summarizeProfiles(profiles).length).toBeGreaterThan(0);
  });
});
