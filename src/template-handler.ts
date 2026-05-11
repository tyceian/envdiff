import * as fs from "fs";
import * as path from "path";
import { loadEnvFiles } from "./loader";
import {
  generateTemplate,
  mergeTemplates,
  parsePlaceholderStyle,
  TemplateOptions,
} from "./templater";

export type TemplateHandlerOptions = {
  files: string[];
  output?: string;
  placeholderStyle?: string;
  includeComments?: boolean;
};

export async function handleTemplate(opts: TemplateHandlerOptions): Promise<void> {
  if (opts.files.length === 0) {
    console.error("error: at least one env file is required");
    process.exit(1);
  }

  const envMaps = await loadEnvFiles(opts.files);

  // Merge all loaded maps into a single template base
  let merged = envMaps[0];
  for (let i = 1; i < envMaps.length; i++) {
    merged = mergeTemplates(merged, envMaps[i]);
  }

  const templateOptions: Partial<TemplateOptions> = {
    placeholderStyle: parsePlaceholderStyle(opts.placeholderStyle),
    includeComments: opts.includeComments !== false,
  };

  const output = generateTemplate(merged, templateOptions);

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf-8");
    console.log(`template written to ${outPath}`);
  } else {
    console.log(output);
  }
}
