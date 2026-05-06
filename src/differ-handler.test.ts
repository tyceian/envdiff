import { handleDiff } from './differ-handler';
import * as loader from './loader';
import * as differ from './differ';
import * as formatter from './formatter';

const mockEnvMaps: Map<string, Map<string, string>> = new Map([
  ['dev.env', new Map([['KEY_A', 'foo'], ['KEY_B', 'bar']])],
  ['prod.env', new Map([['KEY_A', 'foo'], ['KEY_C', 'baz']])],
]);

const mockResults = [
  { key: 'KEY_B', type: 'missing' as const, files: { 'dev.env': 'bar', 'prod.env': undefined } },
  { key: 'KEY_C', type: 'missing' as const, files: { 'dev.env': undefined, 'prod.env': 'baz' } },
];

beforeEach(() => {
  jest.spyOn(loader, 'loadEnvFiles').mockResolvedValue(mockEnvMaps);
  jest.spyOn(differ, 'runDiff').mockReturnValue(mockResults);
  jest.spyOn(differ, 'hasDifferences').mockReturnValue(true);
  jest.spyOn(formatter, 'formatOutput').mockReturnValue('mocked output');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleDiff', () => {
  it('returns output and changed flag', async () => {
    const result = await handleDiff({ files: ['dev.env', 'prod.env'] });
    expect(result.output).toBe('mocked output');
    expect(result.changed).toBe(true);
  });

  it('throws if fewer than 2 files provided', async () => {
    await expect(handleDiff({ files: ['only.env'] })).rejects.toThrow(
      'At least two env files are required'
    );
  });

  it('calls loadEnvFiles with provided file paths', async () => {
    await handleDiff({ files: ['dev.env', 'prod.env'] });
    expect(loader.loadEnvFiles).toHaveBeenCalledWith(['dev.env', 'prod.env']);
  });

  it('calls formatOutput with correct format', async () => {
    await handleDiff({ files: ['dev.env', 'prod.env'], format: 'json' });
    expect(formatter.formatOutput).toHaveBeenCalledWith(
      expect.any(Array),
      'json',
      ['dev.env', 'prod.env']
    );
  });

  it('applies redaction when redact option is true', async () => {
    const redactSpy = jest.spyOn(require('./redactor'), 'redactAllEnvMaps').mockReturnValue(mockEnvMaps);
    await handleDiff({ files: ['dev.env', 'prod.env'], redact: true });
    expect(redactSpy).toHaveBeenCalled();
  });

  it('returns changed false when no differences', async () => {
    jest.spyOn(differ, 'hasDifferences').mockReturnValue(false);
    const result = await handleDiff({ files: ['dev.env', 'prod.env'] });
    expect(result.changed).toBe(false);
  });
});
