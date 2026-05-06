import * as path from "path";
import { loadEnvFile } from "./loader";
import {
  createBaseline,
  saveBaseline,
  loadBaseline,
  diffAgainstBaseline,
} from "./baseline";
import {
  formatBaselineReport,
  summarizeBaselineDiff,
} from "./baseline-reporter";

export interface BaselineHandlerOptions {
  envFile: string;
  baselineFile?: string;
  save?: boolean;
  quiet?: boolean;
}

const DEFAULT_BASELINE_FILE = ".env.baseline.json";

export function handleBaseline(options: BaselineHandlerOptions): {
  summary: string;
  report: string;
  hasChanges: boolean;
} {
  const baselineFile = options.baselineFile ?? DEFAULT_BASELINE_FILE;
  const envPath = path.resolve(options.envFile);
  const envMap = loadEnvFile(envPath);

  if (options.save) {
    const baseline = createBaseline(envMap);
    saveBaseline(baseline, baselineFile);
    const msg = `Baseline saved to ${baselineFile} (${Object.keys(envMap).length} keys)`;
    return { summary: msg, report: msg, hasChanges: false };
  }

  const baseline = loadBaseline(baselineFile);
  const diffResult = diffAgainstBaseline(envMap, baseline);
  const hasChanges =
    diffResult.added.length > 0 ||
    diffResult.removed.length > 0 ||
    diffResult.changed.length > 0;

  const report = options.quiet
    ? summarizeBaselineDiff(diffResult)
    : formatBaselineReport(diffResult);

  const summary = summarizeBaselineDiff(diffResult);

  return { summary, report, hasChanges };
}
