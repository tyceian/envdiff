import { formatRenameEntry, formatRenameReport, summarizeRenames } from './renamer-reporter';
import { RenameResult } from './renamer';

function makeResult(overrides: Partial<RenameResult> = {}): RenameResult {
  return {
    file: 'dev.env',
    from: 'OLD_KEY',
    to: 'NEW_KEY',
    applied: true,
    ...overrides,
  };
}

describe('formatRenameEntry', () => {
  it('includes RENAMED tag for applied results', () => {
    const entry = formatRenameEntry(makeResult({ applied: true }));
    expect(entry).toContain('RENAMED');
    expect(entry).toContain('OLD_KEY');
    expect(entry).toContain('NEW_KEY');
  });

  it('includes SUGGEST tag for non-applied results', () => {
    const entry = formatRenameEntry(makeResult({ applied: false }));
    expect(entry).toContain('SUGGEST');
  });

  it('shows file name', () => {
    const entry = formatRenameEntry(makeResult({ file: 'prod.env' }));
    expect(entry).toContain('prod.env');
  });
});

describe('formatRenameReport', () => {
  it('returns no-op message when empty', () => {
    const output = formatRenameReport([]);
    expect(output).toContain('No renames');
  });

  it('shows dry-run header when dryRun is true', () => {
    const output = formatRenameReport([makeResult()], true);
    expect(output).toContain('dry-run');
  });

  it('shows results header when not dry-run', () => {
    const output = formatRenameReport([makeResult()], false);
    expect(output).toContain('Rename Results');
  });

  it('includes all entries', () => {
    const results = [makeResult({ from: 'A', to: 'B' }), makeResult({ from: 'C', to: 'D' })];
    const output = formatRenameReport(results);
    expect(output).toContain('A');
    expect(output).toContain('C');
  });
});

describe('summarizeRenames', () => {
  it('reports applied count', () => {
    const output = summarizeRenames([makeResult({ applied: true })]);
    expect(output).toContain('1 renamed');
  });

  it('reports suggested count', () => {
    const output = summarizeRenames([makeResult({ applied: false })]);
    expect(output).toContain('1 suggested');
  });

  it('returns nothing-to-rename when empty', () => {
    const output = summarizeRenames([]);
    expect(output).toContain('Nothing to rename');
  });

  it('reports both applied and suggested', () => {
    const results = [makeResult({ applied: true }), makeResult({ applied: false })];
    const output = summarizeRenames(results);
    expect(output).toContain('renamed');
    expect(output).toContain('suggested');
  });
});
