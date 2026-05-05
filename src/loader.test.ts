import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadEnvFile, loadEnvFiles, resolveEnvPath } from './loader';

function writeTempEnv(content: string): string {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('resolveEnvPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = '/tmp/some.env';
    expect(resolveEnvPath(abs)).toBe(abs);
  });

  it('resolves relative path against cwd', () => {
    const result = resolveEnvPath('some.env');
    expect(result).toBe(path.resolve(process.cwd(), 'some.env'));
  });
});

describe('loadEnvFile', () => {
  it('loads and parses a valid env file', () => {
    const fp = writeTempEnv('KEY=value\nFOO=bar\n');
    const loaded = loadEnvFile(fp);
    expect(loaded.map.get('KEY')).toBe('value');
    expect(loaded.map.get('FOO')).toBe('bar');
    expect(loaded.label).toBe(path.basename(fp));
    fs.unlinkSync(fp);
  });

  it('throws if file does not exist', () => {
    expect(() => loadEnvFile('/nonexistent/path/.env')).toThrow('File not found');
  });
});

describe('loadEnvFiles', () => {
  it('loads multiple env files', () => {
    const fp1 = writeTempEnv('A=1\nB=2\n');
    const fp2 = writeTempEnv('A=1\nC=3\n');
    const results = loadEnvFiles([fp1, fp2]);
    expect(results).toHaveLength(2);
    expect(results[0].map.get('B')).toBe('2');
    expect(results[1].map.get('C')).toBe('3');
    fs.unlinkSync(fp1);
    fs.unlinkSync(fp2);
  });

  it('throws if fewer than two files are provided', () => {
    const fp = writeTempEnv('A=1\n');
    expect(() => loadEnvFiles([fp])).toThrow('At least two');
    fs.unlinkSync(fp);
  });
});
