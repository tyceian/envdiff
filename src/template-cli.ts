// CLI entry point for the `template` subcommand
// Usage: envdiff template [options] <file1> [file2...]

import { handleTemplate } from "./template-handler";

export type TemplateCLIArgs = {
  files: string[];
  output?: string;
  style?: string;
  noComments?: boolean;
};

export function parseTemplateArgs(argv: string[]): TemplateCLIArgs {
  const args: TemplateCLIArgs = { files: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--output" || arg === "-o") {
      args.output = argv[++i];
    } else if (arg === "--style" || arg === "-s") {
      args.style = argv[++i];
    } else if (arg === "--no-comments") {
      args.noComments = true;
    } else if (!arg.startsWith("--")) {
      args.files.push(arg);
    }
    i++;
  }
  return args;
}

export function printTemplateUsage(): void {
  console.log([
    "Usage: envdiff template [options] <file1> [file2...]",
    "",
    "Options:",
    "  --output, -o <path>    Write template to file instead of stdout",
    "  --style, -s <mode>     Placeholder style: empty (default), type, example",
    "  --no-comments          Omit header comment from output",
  ].join("\n"));
}

export async function runTemplateCommand(argv: string[]): Promise<void> {
  if (argv.includes("--help") || argv.includes("-h")) {
    printTemplateUsage();
    return;
  }

  const args = parseTemplateArgs(argv);

  await handleTemplate({
    files: args.files,
    output: args.output,
    placeholderStyle: args.style,
    includeComments: !args.noComments,
  });
}
