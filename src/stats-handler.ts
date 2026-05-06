import { DiffResult } from "./diff";
import { computeStats, formatStats, hasIssues, EnvStats } from "./stats";
import { colorize } from "./reporter";

export interface StatsHandlerOptions {
  json?: boolean;
  color?: boolean;
}

export function handleStats(
  results: DiffResult[],
  options: StatsHandlerOptions = {}
): { output: string; stats: EnvStats; exitCode: number } {
  const stats = computeStats(results);

  let output: string;

  if (options.json) {
    output = JSON.stringify(stats, null, 2);
  } else {
    const text = formatStats(stats);
    output =
      options.color !== false && hasIssues(stats)
        ? colorize(text, "yellow")
        : text;
  }

  const exitCode = hasIssues(stats) ? 1 : 0;

  return { output, stats, exitCode };
}

export function printStats(
  results: DiffResult[],
  options: StatsHandlerOptions = {}
): number {
  const { output, exitCode } = handleStats(results, options);
  console.log(output);
  return exitCode;
}
