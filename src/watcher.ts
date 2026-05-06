import * as fs from "fs";
import * as path from "path";

export type WatchCallback = (filePath: string, event: "change" | "rename") => void;

export interface WatchOptions {
  debounceMs?: number;
  recursive?: boolean;
}

const DEFAULT_DEBOUNCE_MS = 300;

export function watchEnvFile(
  filePath: string,
  callback: WatchCallback,
  options: WatchOptions = {}
): fs.FSWatcher {
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const resolved = path.resolve(filePath);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fs.watch(resolved, (event) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const eventType = event === "rename" ? "rename" : "change";
      callback(resolved, eventType);
    }, debounceMs);
  });

  return watcher;
}

export function watchEnvFiles(
  filePaths: string[],
  callback: WatchCallback,
  options: WatchOptions = {}
): fs.FSWatcher[] {
  return filePaths.map((fp) => watchEnvFile(fp, callback, options));
}

export function stopWatchers(watchers: fs.FSWatcher[]): void {
  for (const watcher of watchers) {
    watcher.close();
  }
}
