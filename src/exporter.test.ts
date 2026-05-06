import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  resolveOutputPath,
  ensureOutputDir,
  exportResults,
  parseExportOptions,
} from './exporter';
import { DiffResult } from './diff';

const sampleResults: DiffResult[] = [
  { key: 'API_KEY', status: 'missing', environments: ['production'] },
  { key: 'DB_HOST', status: 'mismatch', environments: ['staging', 'production'] },
];

describe('resolveOutputPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/output.txt';
    expect(resolveOutputPath(abs)).toBe(abs);
  });

  it('resolves relative path against cwd', () => {
    const result = resolveOutputPath('output/result.json');
    expect(result).toBe(path.resolve(process.cwd(), 'output/result.json'));
  });
});

describe('ensureOutputDir', () => {
  it('creates directory if it does not exist', () => {
    const tmpDir = path.join(os.tmpdir(), `envdiff-test-${Date.now()}`);
    const filePath = path.join(tmpDir, 'nested', 'output.txt');
    ensureOutputDir(filePath);
    expect(fs.existsSync(path.dirname(filePath))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('exportResults', () => {
  it('writes formatted output to file', () => {
    const tmpFile = path.join(os.tmpdir(), `envdiff-out-${Date.now()}.json`);
    exportResults(sampleResults, { outputPath: tmpFile, format: 'json' });
    const content = fs.readFileSync(tmpFile, 'utf-8');
    const parsed = JSON.parse(content);
    expect(Array.isArray(parsed)).toBe(true);
    fs.unlinkSync(tmpFile);
  });

  it('throws if file exists and overwrite is false', () => {
    const tmpFile = path.join(os.tmpdir(), `envdiff-exists-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'existing content');
    expect(() =>
      exportResults(sampleResults, { outputPath: tmpFile, format: 'text' })
    ).toThrow('already exists');
    fs.unlinkSync(tmpFile);
  });

  it('overwrites file when overwrite is true', () => {
    const tmpFile = path.join(os.tmpdir(), `envdiff-overwrite-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, 'old content');
    exportResults(sampleResults, { outputPath: tmpFile, format: 'csv', overwrite: true });
    const content = fs.readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('API_KEY');
    fs.unlinkSync(tmpFile);
  });
});

describe('parseExportOptions', () => {
  it('returns valid options for known formats', () => {
    const opts = parseExportOptions('out.csv', 'csv', false);
    expect(opts.format).toBe('csv');
    expect(opts.overwrite).toBe(false);
  });

  it('throws on unknown format', () => {
    expect(() => parseExportOptions('out.xml', 'xml', false)).toThrow(
      'Invalid export format'
    );
  });
});
