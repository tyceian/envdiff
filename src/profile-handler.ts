import { loadEnvFiles } from "./loader";
import { profileAllEnvMaps } from "./profiler";
import { summarizeProfiles } from "./profile-reporter";

export interface ProfileOptions {
  files: string[];
  envNames?: string[];
  silent?: boolean;
}

export async function handleProfile(options: ProfileOptions): Promise<{
  profiles: ReturnType<typeof profileAllEnvMaps>;
  report: string;
  hasAnomalies: boolean;
}> {
  const { files, envNames, silent = false } = options;

  const labels = envNames ?? files.map((f) => f.replace(/^.*[\/\\]/, ""));

  const loaded = await loadEnvFiles(files);
  const maps: Record<string, Map<string, string>> = {};
  loaded.forEach((map, i) => {
    maps[labels[i] ?? `env${i}`] = map;
  });

  const profiles = profileAllEnvMaps(maps);
  const report = summarizeProfiles(profiles);

  const hasAnomalies = Object.values(profiles).some(
    (p) => p.emptyValues.length > 0 || p.duplicateKeys.length > 0 || p.longValues.length > 0
  );

  if (!silent) {
    console.log(report);
  }

  return { profiles, report, hasAnomalies };
}
