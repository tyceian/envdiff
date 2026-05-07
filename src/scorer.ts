// Scores env files based on completeness, consistency, and quality metrics

import { DiffResult } from './diff';
import { LintResult } from './linter';
import { AuditResult } from './audit';

export interface EnvScore {
  total: number;
  completeness: number;
  consistency: number;
  quality: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ScoreWeights {
  completeness: number;
  consistency: number;
  quality: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  completeness: 0.5,
  consistency: 0.3,
  quality: 0.2,
};

export function scoreCompleteness(diffResults: DiffResult[]): number {
  if (diffResults.length === 0) return 100;
  const missing = diffResults.filter((r) => r.type === 'missing').length;
  const total = diffResults.length;
  return Math.max(0, Math.round(((total - missing) / total) * 100));
}

export function scoreConsistency(diffResults: DiffResult[]): number {
  if (diffResults.length === 0) return 100;
  const mismatched = diffResults.filter((r) => r.type === 'mismatch').length;
  const total = diffResults.length;
  return Math.max(0, Math.round(((total - mismatched) / total) * 100));
}

export function scoreQuality(lintResults: LintResult[], auditResults: AuditResult[]): number {
  const errors = [
    ...lintResults.filter((r) => r.severity === 'error'),
    ...auditResults.filter((r) => r.severity === 'error'),
  ].length;
  const warnings = [
    ...lintResults.filter((r) => r.severity === 'warning'),
    ...auditResults.filter((r) => r.severity === 'warning'),
  ].length;
  const deduction = errors * 10 + warnings * 3;
  return Math.max(0, 100 - deduction);
}

export function gradeScore(score: number): EnvScore['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export function computeEnvScore(
  diffResults: DiffResult[],
  lintResults: LintResult[],
  auditResults: AuditResult[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): EnvScore {
  const completeness = scoreCompleteness(diffResults);
  const consistency = scoreConsistency(diffResults);
  const quality = scoreQuality(lintResults, auditResults);
  const total = Math.round(
    completeness * weights.completeness +
    consistency * weights.consistency +
    quality * weights.quality
  );
  return { total, completeness, consistency, quality, grade: gradeScore(total) };
}
