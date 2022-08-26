#!/usr/bin/env -S deno run --no-check --allow-read --allow-write --allow-env
import { ts } from "./deps.deno.ts";
import { Context, deno2node, emit } from "./mod.ts";
import { getVersion, initializeProject } from "./init.ts";

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

const ctx = new Context({ tsConfigFilePath, compilerOptions: options });

await deno2node(ctx);
const diagnostics = await emit(ctx.project);
if (diagnostics.length !== 0) {
  console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
