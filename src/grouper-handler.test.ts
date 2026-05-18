import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGrouper } from './grouper-handler';
import * as loader from './loader';

const mockEnvMaps = {
  '.env.production': {
    DB_HOST: 'prod-db',
    DB_PORT: '5432',
    AWS_KEY: 'abc',
    PORT: '8080',
  },
};

beforeEach(() => {
  vi.spyOn(loader, 'loadEnvFiles').mockResolvedValue(mockEnvMaps);
});

describe('handleGrouper', () => {
  it('prints grouped output for each file', async () => {
    const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleGrouper({ files: ['.env.production'] });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('.env.production'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[AWS]'));

    spy.mockRestore();
    logSpy.mockRestore();
  });

  it('prints only summary when summary=true', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleGrouper({ files: ['.env.production'], summary: true });

    const calls = logSpy.mock.calls.flat().join(' ');
    expect(calls).toContain('prefix group');

    logSpy.mockRestore();
  });

  it('exits with error when no files provided', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);

    await handleGrouper({ files: [] });

    expect(errSpy).toHaveBeenCalledWith('No env files specified.');
    expect(exitSpy).toHaveBeenCalledWith(1);

    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
