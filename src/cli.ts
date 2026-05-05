#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { formatReport, summarize, ReportFormat } from './reporter';

function printUsage(): void {
  console.log('Usage: envdiff <base.env> <compare.env> [compare2.env ...] [--json] [--color]');
  console.log('');
  console.log('Options:');
  console.log('  --json    Output results as JSON');
  console.log('  --color   Enable colored output');
  console.log('  --help    Show this help message');
}

function parseArgs(argv: string[]): {
  files: string[];
  format: ReportFormat;
  color: boolean;
} {
  const args = argv.slice(2);
  const files: string[] = [];
  let format: ReportFormat = 'text';
  let color = false;

  for (const arg of args) {
    if (arg === '--json') format = 'json';
    else if (arg === '--color') color = true;
    else if (arg === '--help') {
      printUsage();
      process.exit(0);
    } else {
      files.push(arg);
    }
  }

  return { files, format, color };
}

function run(): void {
  const { files, format, color } = parseArgs(process.argv);

  if (files.length < 2) {
    console.error('Error: at least two .env files are required.');
    printUsage();
    process.exit(1);
  }

  const [baseFile, ...compareFiles] = files;

  let baseContent: string;
  try {
    baseContent = fs.readFileSync(path.resolve(baseFile), 'utf-8');
  } catch {
    console.error(`Error: could not read base file "${baseFile}"`);
    process.exit(1);
  }

  const baseMap = parseEnvFile(baseContent);
  const results: Record<string, ReturnType<typeof diffEnvMaps>> = {};

  for (const compareFile of compareFiles) {
    let compareContent: string;
    try {
      compareContent = fs.readFileSync(path.resolve(compareFile), 'utf-8');
    } catch {
      console.error(`Error: could not read file "${compareFile}"`);
      process.exit(1);
    }
    const compareMap = parseEnvFile(compareContent);
    results[compareFile] = diffEnvMaps(baseMap, compareMap);
  }

  const report = formatReport(results, { format, color });
  console.log(report);
  console.log('\n' + summarize(results));

  const hasIssues = Object.values(results).some(
    (d) => d.missingKeys.length > 0 || d.mismatchedKeys.length > 0
  );
  process.exit(hasIssues ? 1 : 0);
}

run();
