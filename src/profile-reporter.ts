import { EnvProfile, hasProfileAnomalies } from "./profiler";
import { colorize } from "./reporter";

export function formatProfileReport(
  env: string,
  profile: EnvProfile
): string {
  const lines: string[] = [];
  lines.push(colorize(`Profile: ${env}`, "cyan"));
  lines.push(`  Total keys     : ${profile.totalKeys}`);

  if (profile.emptyValues.length > 0) {
    lines.push(colorize(`  Empty values   : ${profile.emptyValues.join(", ")}`, "yellow"));
  }

  if (profile.duplicateKeys.length > 0) {
    lines.push(colorize(`  Duplicate keys : ${profile.duplicateKeys.join(", ")}`, "red"));
  }

  if (profile.longValues.length > 0) {
    lines.push(colorize(`  Long values    : ${profile.longValues.join(", ")}`, "yellow"));
  }

  if (profile.numericOnlyValues.length > 0) {
    lines.push(`  Numeric values : ${profile.numericOnlyValues.join(", ")}`);
  }

  if (profile.booleanLikeValues.length > 0) {
    lines.push(`  Boolean-like   : ${profile.booleanLikeValues.join(", ")}`);
  }

  if (!hasProfileAnomalies(profile)) {
    lines.push(colorize("  No anomalies detected.", "green"));
  }

  return lines.join("\n");
}

export function summarizeProfiles(
  profiles: Record<string, EnvProfile>
): string {
  const lines: string[] = [];
  for (const [env, profile] of Object.entries(profiles)) {
    lines.push(formatProfileReport(env, profile));
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
