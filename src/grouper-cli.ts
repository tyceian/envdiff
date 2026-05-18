import { handleGrouper } from './grouper-handler';

export interface GrouperArgs {
  files: string[];
  env?: string;
  summary: boolean;
}

export function parseGrouperArgs(argv: string[]): GrouperArgs {
  const files: string[] = [];
  let env: string | undefined;
  let summary = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env' && argv[i + 1]) {
      env = argv[++i];
    } else if (arg === '--summary') {
      summary = true;
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }

  return { files, env, summary };
}

export function printGrouperUsage(): void {
  console.log(`
Usage: envdiff group [files...] [options]

Groups env keys by prefix for each specified file.

Options:
  --env <name>   Filter by environment name
  --summary      Print only the summary line, not full key list

Example:
  envdiff group .env.staging .env.production
  envdiff group .env.production --summary
`);
}

export async function runGrouper(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printGrouperUsage();
    return;
  }

  const args = parseGrouperArgs(argv);
  await handleGrouper(args);
}
