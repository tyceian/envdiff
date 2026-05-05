import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';

export interface LoadedEnv {
  filePath: string;
  label: string;
  map: Map<string, string>;
}

export function resolveEnvPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

export function loadEnvFile(filePath: string): LoadedEnv {
  const resolved = resolveEnvPath(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  const map = parseEnvFile(content);
  const label = path.basename(resolved);

  return { filePath: resolved, label, map };
}

export function loadEnvFiles(filePaths: string[]): LoadedEnv[] {
  if (filePaths.length < 2) {
    throw new Error('At least two .env files are required for comparison.');
  }

  return filePaths.map((fp) => loadEnvFile(fp));
}
