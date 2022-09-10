#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env=NODE_DEBUG
import { ts } from "./deps.deno.ts";
import { getHelpText } from "./help.ts";
import { getVersion, initializeProject } from "./init.ts";
import { Context, deno2node, emit } from "./mod.ts";

const HELP_ARGS = new Set(["-h", "--help", "-help", "-?"]);

if (Deno.args.some((arg) => HELP_ARGS.has(arg.trim()))) {
  console.log(getHelpText(await getVersion()));
  Deno.exit(0);
}

const { options, fileNames, errors } = ts.parseCommandLine(Deno.args);
const tsConfigFilePath = options.project ?? fileNames[0] ?? "tsconfig.json";

if (errors.length) {
  for (const error of errors) {
    console.error(error.messageText);
  }
  Deno.exit(2);
}

if (options.version) {
  console.log("deno2node", await getVersion());
  console.log("typescript", ts.version);
  Deno.exit(0);
}

if (options.init) {
  await initializeProject();
  Deno.exit(0);
}

console.time("Loading tsconfig");
const ctx = new Context({ tsConfigFilePath, compilerOptions: options });
console.timeEnd("Loading tsconfig");

await deno2node(ctx);
console.time("Emitting");
const diagnostics = await emit(ctx.project);
console.timeEnd("Emitting");
if (diagnostics.length !== 0) {
  console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
