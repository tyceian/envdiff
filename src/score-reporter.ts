import { EnvScore } from './scorer';
import { colorize } from './reporter';

function gradeColor(grade: EnvScore['grade']): string {
  switch (grade) {
    case 'A': return 'green';
    case 'B': return 'cyan';
    case 'C': return 'yellow';
    case 'D': return 'magenta';
    case 'F': return 'red';
  }
}

function scoreBar(value: number, width = 20): string {
  const filled = Math.round((value / 100) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

export function formatScoreReport(label: string, score: EnvScore): string {
  const lines: string[] = [];
  const gradeStr = colorize(score.grade, gradeColor(score.grade));
  lines.push(`Score Report: ${label}`);
  lines.push(`  Grade   : ${gradeStr} (${score.total}/100)`);
  lines.push(`  Complete: ${scoreBar(score.completeness)} ${score.completeness}%`);
  lines.push(`  Consist : ${scoreBar(score.consistency)} ${score.consistency}%`);
  lines.push(`  Quality : ${scoreBar(score.quality)} ${score.quality}%`);
  return lines.join('\n');
}

export function summarizeScores(scores: Record<string, EnvScore>): string {
  const entries = Object.entries(scores);
  if (entries.length === 0) return 'No scores available.';
  const avg = Math.round(
    entries.reduce((sum, [, s]) => sum + s.total, 0) / entries.length
  );
  const best = entries.reduce((a, b) => (a[1].total >= b[1].total ? a : b));
  const worst = entries.reduce((a, b) => (a[1].total <= b[1].total ? a : b));
  return [
    `Environments scored: ${entries.length}`,
    `Average score: ${avg}/100`,
    `Best : ${best[0]} (${best[1].total})`,
    `Worst: ${worst[0]} (${worst[1].total})`,
  ].join('\n');
}
