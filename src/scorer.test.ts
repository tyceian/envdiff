import { describe, it, expect } from 'vitest';
import {
  scoreCompleteness,
  scoreConsistency,
  scoreQuality,
  gradeScore,
  computeEnvScore,
} from './scorer';
import { DiffResult } from './diff';
import { LintResult } from './linter';
import { AuditResult } from './audit';

const makeDiff = (type: 'missing' | 'mismatch' | 'ok', key = 'KEY'): DiffResult =>
  ({ key, type } as DiffResult);

const makeLint = (severity: 'error' | 'warning', key = 'K'): LintResult =>
  ({ key, severity, message: 'test' } as LintResult);

const makeAudit = (severity: 'error' | 'warning', key = 'K'): AuditResult =>
  ({ key, severity, message: 'test' } as AuditResult);

describe('scoreCompleteness', () => {
  it('returns 100 for no results', () => {
    expect(scoreCompleteness([])).toBe(100);
  });

  it('penalizes missing keys', () => {
    const results = [makeDiff('missing'), makeDiff('ok'), makeDiff('ok'), makeDiff('ok')];
    expect(scoreCompleteness(results)).toBe(75);
  });

  it('returns 0 when all are missing', () => {
    expect(scoreCompleteness([makeDiff('missing'), makeDiff('missing')])).toBe(0);
  });

  it('ignores mismatch entries', () => {
    const results = [makeDiff('mismatch'), makeDiff('ok')];
    expect(scoreCompleteness(results)).toBe(100);
  });
});

describe('scoreConsistency', () => {
  it('returns 100 for no results', () => {
    expect(scoreConsistency([])).toBe(100);
  });

  it('penalizes mismatches', () => {
    const results = [makeDiff('mismatch'), makeDiff('ok')];
    expect(scoreConsistency(results)).toBe(50);
  });

  it('returns 0 when all are mismatches', () => {
    const results = [makeDiff('mismatch'), makeDiff('mismatch')];
    expect(scoreConsistency(results)).toBe(0);
  });
});

describe('scoreQuality', () => {
  it('returns 100 with no issues', () => {
    expect(scoreQuality([], [])).toBe(100);
  });

  it('deducts 10 per error', () => {
    expect(scoreQuality([makeLint('error'), makeLint('error')], [])).toBe(80);
  });

  it('deducts 3 per warning', () => {
    expect(scoreQuality([], [makeAudit('warning')])).toBe(97);
  });

  it('does not go below 0', () => {
    const errors = Array.from({ length: 15 }, () => makeLint('error'));
    expect(scoreQuality(errors, [])).toBe(0);
  });
});

describe('gradeScore', () => {
  it.each([
    [95, 'A'], [80, 'B'], [65, 'C'], [50, 'D'], [30, 'F'],
  ] as const)('grades %i as %s', (score, grade) => {
    expect(gradeScore(score)).toBe(grade);
  });
});

describe('computeEnvScore', () => {
  it('produces a weighted total', () => {
    const score = computeEnvScore([], [], []);
    expect(score.total).toBe(100);
    expect(score.grade).toBe('A');
  });

  it('reflects mixed inputs', () => {
    const diffs = [makeDiff('missing'), makeDiff('ok')];
    const score = computeEnvScore(diffs, [makeLint('error')], []);
    expect(score.total).toBeLessThan(100);
    expect(score.completeness).toBe(50);
  });

  it('exposes individual dimension scores', () => {
    const score = computeEnvScore([], [], []);
    expect(score).toHaveProperty('completeness');
    expect(score).toHaveProperty('consistency');
    expect(score).toHaveProperty('quality');
  });
});
