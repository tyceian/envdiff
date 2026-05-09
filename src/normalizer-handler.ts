import { parseNormalizeMode, normalizeAllEnvMaps, NormalizeMode } from './normalizer';
import { loadEnvFiles } from './loader';
import { diffEnvMaps } from './diff';
import { formatReport } from './reporter';

export interface NormalizeHandlerOptions {
  files: string[];
  mode: string;
  verbose?: boolean;
}

export async function handleNormalize(options: NormalizeHandlerOptions): Promise<void> {
  const { files, mode, verbose } = options;

  if (files.length < 2) {
    console.error('Error: at least two env files are required for comparison.');
    process.exit(1);
  }

  let normalizeMode: NormalizeMode;
  try {
    normalizeMode = parseNormalizeMode(mode);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  let envMaps: Record<string, Map<string, string>>;
  try {
    envMaps = await loadEnvFiles(files);
  } catch (err: any) {
    console.error(`Error loading files: ${err.message}`);
    process.exit(1);
  }

  const normalized = normalizeAllEnvMaps(envMaps, normalizeMode);

  if (verbose) {
    console.log(`Normalize mode: ${normalizeMode}`);
    for (const [env, map] of Object.entries(normalized)) {
      console.log(`  ${env}: ${map.size} keys`);
    }
  }

  const results = diffEnvMaps(normalized);
  const report = formatReport(results);
  console.log(report);
}
