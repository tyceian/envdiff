import { watchEnvFiles, stopWatchers, WatchOptions } from "./watcher";
import { loadEnvFiles } from "./loader";
import { diffEnvMaps } from "./diff";
import { formatReport } from "./reporter";
import * as fs from "fs";

export interface WatchHandlerOptions extends WatchOptions {
  silent?: boolean;
}

export async function handleWatch(
  filePaths: string[],
  options: WatchHandlerOptions = {}
): Promise<() => void> {
  if (filePaths.length < 2) {
    throw new Error("At least two .env files are required for watching.");
  }

  const { silent = false } = options;

  const runDiff = async () => {
    try {
      const envMaps = await loadEnvFiles(filePaths);
      const results = diffEnvMaps(envMaps);
      const report = formatReport(results, filePaths);
      if (!silent) {
        console.clear();
        console.log("[envdiff] Watching for changes...\n");
        console.log(report);
      }
    } catch (err) {
      if (!silent) {
        console.error("[envdiff] Error running diff:", (err as Error).message);
      }
    }
  };

  await runDiff();

  const watchers: fs.FSWatcher[] = watchEnvFiles(
    filePaths,
    async (filePath) => {
      if (!silent) {
        console.log(`[envdiff] Change detected in: ${filePath}`);
      }
      await runDiff();
    },
    options
  );

  return () => stopWatchers(watchers);
}
