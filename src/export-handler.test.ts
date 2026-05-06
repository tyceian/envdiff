import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { handleExport } from './export-handler';
import { DiffResult } from './diff';

const results: DiffResult[] = [
  { key: 'SECRET', status: 'missing', environments: ['prod'] },
  { key: 'PORT', status: 'mismatch', environments: ['dev', 'prod'] },
];

describe('handleExport', () => {
  it('returns false and logs error when no output path given', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleExport({ results });
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('no output path'));
    spy.mockRestore();
  });

  it('returns false silently when no output path and silent=true', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleExport({ results, silent: true });
    expect(result).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('exports to json and returns true', () => {
    const tmpFile = path.join(os.tmpdir(), `eh-test-${Date.now()}.json`);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = handleExport({ results, output: tmpFile, format: 'json' });
    expect(result).toBe(true);
    expect(fs.existsSync(tmpFile)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    expect(parsed.length).toBe(2);
    spy.mockRestore();
    fs.unlinkSync(tmpFile);
  });

  it('returns false on invalid format', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleExport({ results, output: 'out.xml', format: 'xml' });
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Export failed'));
    spy.mockRestore();
  });

  it('returns false when file exists and overwrite is false', () => {
    const tmpFile = path.join(os.tmpdir(), `eh-exists-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'old');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleExport({ results, output: tmpFile, format: 'text', overwrite: false });
    expect(result).toBe(false);
    spy.mockRestore();
    fs.unlinkSync(tmpFile);
  });

  it('overwrites existing file when overwrite is true', () => {
    const tmpFile = path.join(os.tmpdir(), `eh-overwrite-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, 'old content');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = handleExport({ results, output: tmpFile, format: 'csv', overwrite: true });
    expect(result).toBe(true);
    const content = fs.readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('SECRET');
    spy.mockRestore();
    fs.unlinkSync(tmpFile);
  });
});
