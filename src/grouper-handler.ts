import { loadEnvFiles } from './loader';
import { buildGroupedReport, formatGroupedReport, summarizeGroups } from './grouper';

export interface GrouperOptions {
  files: string[];
  env?: string;
  summary?: boolean;
}

export async function handleGrouper(options: GrouperOptions): Promise<void> {
  const { files, env, summary = false } = options;

  if (files.length === 0) {
    console.error('No env files specified.');
    process.exit(1);
  }

  const envMaps = await loadEnvFiles(files, env);

  for (const [filePath, envMap] of Object.entries(envMaps)) {
    const keys = Object.keys(envMap);
    const groups = buildGroupedReport(keys);

    console.log(`\n=== ${filePath} ===`);

    if (summary) {
      console.log(summarizeGroups(groups));
    } else {
      process.stdout.write(formatGroupedReport(groups));
      console.log(`Summary: ${summarizeGroups(groups)}`);
    }
  }
}
