import * as fs from 'fs';
import { formatReport, summarize } from './reporter';
import { diffEnvMaps } from './diff';
import { parseEnvFile } from './parser';

// Integration-style tests for the CLI pipeline
describe('CLI pipeline integration', () => {
  const baseEnvContent = [
    'DB_HOST=localhost',
    'DB_PORT=5432',
    'API_KEY=secret123',
    'LOG_LEVEL=info',
  ].join('\n');

  const stagingEnvContent = [
    'DB_HOST=staging.db.example.com',
    'DB_PORT=5432',
    'LOG_LEVEL=debug',
    // API_KEY is missing
  ].join('\n');

  it('full pipeline produces expected output', () => {
    const baseMap = parseEnvFile(baseEnvContent);
    const stagingMap = parseEnvFile(stagingEnvContent);
    const diff = diffEnvMaps(baseMap, stagingMap);

    expect(diff.missingKeys).toContain('API_KEY');
    expect(diff.mismatchedKeys.map((m) => m.key)).toContain('LOG_LEVEL');
    expect(diff.mismatchedKeys.map((m) => m.key)).toContain('DB_HOST');

    const report = formatReport({ staging: diff }, { format: 'text' });
    expect(report).toContain('MISSING: API_KEY');
    expect(report).toContain('MISMATCH: LOG_LEVEL');
  });

  it('json format round-trips correctly', () => {
    const baseMap = parseEnvFile(baseEnvContent);
    const stagingMap = parseEnvFile(stagingEnvContent);
    const diff = diffEnvMaps(baseMap, stagingMap);

    const report = formatReport({ staging: diff }, { format: 'json' });
    const parsed = JSON.parse(report);

    expect(parsed).toHaveProperty('staging');
    expect(parsed.staging.missingKeys).toContain('API_KEY');
  });

  it('summary reflects correct counts', () => {
    const baseMap = parseEnvFile(baseEnvContent);
    const stagingMap = parseEnvFile(stagingEnvContent);
    const diff = diffEnvMaps(baseMap, stagingMap);

    const summary = summarize({ staging: diff });
    expect(summary).toContain('1 missing');
    expect(summary).toContain('1 environment(s)');
  });

  it('no issues when envs match', () => {
    const baseMap = parseEnvFile(baseEnvContent);
    const diff = diffEnvMaps(baseMap, baseMap);

    const report = formatReport({ copy: diff }, { format: 'text' });
    expect(report).toContain('No issues found');

    const summary = summarize({ copy: diff });
    expect(summary).toContain('0 missing');
    expect(summary).toContain('0 mismatched');
  });

  it('summary reflects multiple mismatched keys', () => {
    const baseMap = parseEnvFile(baseEnvContent);
    const stagingMap = parseEnvFile(stagingEnvContent);
    const diff = diffEnvMaps(baseMap, stagingMap);

    // DB_HOST and LOG_LEVEL are both mismatched
    const summary = summarize({ staging: diff });
    expect(summary).toContain('2 mismatched');
  });
});
