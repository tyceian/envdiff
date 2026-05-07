/**
 * annotator.ts
 * Adds inline comments/annotations to env keys based on diff results.
 */

import { DiffResult } from "./diff";

export type AnnotationLevel = "info" | "warn" | "error";

export interface Annotation {
  key: string;
  level: AnnotationLevel;
  message: string;
}

export function annotationLevel(status: DiffResult["status"]): AnnotationLevel {
  switch (status) {
    case "missing":
      return "error";
    case "mismatch":
      return "warn";
    case "ok":
      return "info";
    default:
      return "info";
  }
}

export function buildAnnotation(result: DiffResult): Annotation {
  const level = annotationLevel(result.status);
  let message: string;

  switch (result.status) {
    case "missing":
      message = `Key "${result.key}" is missing in one or more environments.`;
      break;
    case "mismatch":
      message = `Key "${result.key}" has mismatched values across environments.`;
      break;
    case "ok":
      message = `Key "${result.key}" is consistent across all environments.`;
      break;
    default:
      message = `Key "${result.key}" has an unknown status.`;
  }

  return { key: result.key, level, message };
}

export function annotateResults(results: DiffResult[]): Annotation[] {
  return results.map(buildAnnotation);
}

export function filterAnnotationsByLevel(
  annotations: Annotation[],
  level: AnnotationLevel
): Annotation[] {
  return annotations.filter((a) => a.level === level);
}

export function formatAnnotation(annotation: Annotation): string {
  const prefix = `[${annotation.level.toUpperCase()}]`;
  return `${prefix} ${annotation.key}: ${annotation.message}`;
}

export function formatAnnotations(annotations: Annotation[]): string {
  if (annotations.length === 0) return "No annotations.";
  return annotations.map(formatAnnotation).join("\n");
}
