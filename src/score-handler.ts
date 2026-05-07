import { loadEnvFiles } from './loader';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { computeEnvScore } from './scorer';
import { formatScoreReport, summarizeScores } from './score-reporter';

export interface ScoreHandlerOptions {
  files: string[];
  json?: boolean;
  threshold?: number;
}

export async function handleScore(options: ScoreHandlerOptions): Promise<void> {
  const { files, json = false, threshold } = options;

  if (files.length < 1) {
    console.error('Error: at least one .env file is required for scoring');
    process.exit(1);
  }

  const envMaps = await loadEnvFiles(files);
  const baseline = envMaps[0];
  const rest = envMaps.slice(1);

  const scores = envMaps.map((map, i) => {
    const label = files[i];
    const diffResults = rest.length > 0 ? diffEnvMaps(baseline, map) : [];
    return computeEnvScore(label, map, diffResults);
  });

  if (json) {
    console.log(JSON.stringify(scores, null, 2));
    return;
  }

  const report = formatScoreReport(scores);
  console.log(report);

  const summary = summarizeScores(scores);
  console.log(summary);

  if (threshold !== undefined) {
    const failing = scores.filter(s => s.overall < threshold);
    if (failing.length > 0) {
      console.error(
        `\nFailed threshold: ${failing.length} file(s) scored below ${threshold}`
      );
      process.exit(1);
    }
  }
}

export function parseScoreOptions(argv: string[]): ScoreHandlerOptions {
  const files: string[] = [];
  let json = false;
  let threshold: number | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--threshold' && argv[i + 1]) {
      threshold = parseFloat(argv[++i]);
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }

  return { files, json, threshold };
}
