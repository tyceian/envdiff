/**
 * annotator-handler.ts
 * CLI handler for the annotate command — runs diff and prints annotations.
 */

import { loadEnvFiles } from "./loader";
import { parseEnvFile } from "./parser";
import { diffEnvMaps } from "./diff";
import {
  annotateResults,
  filterAnnotationsByLevel,
  formatAnnotations,
  AnnotationLevel,
} from "./annotator";

export interface AnnotateOptions {
  files: string[];
  level?: AnnotationLevel;
  silent?: boolean;
}

export async function handleAnnotate(options: AnnotateOptions): Promise<void> {
  const { files, level, silent = false } = options;

  if (files.length < 2) {
    if (!silent) console.error("annotate requires at least 2 env files.");
    process.exitCode = 1;
    return;
  }

  const rawMaps = await loadEnvFiles(files);
  const envMaps = rawMaps.map((raw) => parseEnvFile(raw));

  const labels = files.map((f) => f.replace(/.*[\/\\]/, ""));
  const results = diffEnvMaps(envMaps, labels);

  let annotations = annotateResults(results);

  if (level) {
    annotations = filterAnnotationsByLevel(annotations, level);
  }

  if (!silent) {
    console.log(formatAnnotations(annotations));
  }

  const hasErrors = annotations.some((a) => a.level === "error");
  if (hasErrors) {
    process.exitCode = 1;
  }
}
