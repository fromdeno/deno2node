#!/usr/bin/env -S deno run --no-prompt --allow-read=. --allow-write=lib/
import { existsSync } from "node:fs";
import * as process from "node:process";
import { ts } from "./deps.deno.ts";
import { getHelpText } from "./help.ts";
import { getVersion, initializeProject } from "./init.ts";
import { Context, deno2node, emit } from "./mod.ts";

const args = process.argv.slice(2);
const { options, fileNames, errors } = ts.parseCommandLine(args);
const tsConfigFilePath = options.project ??
  ts.findConfigFile(process.cwd(), existsSync);

if (errors.length) {
  for (const error of errors) {
    console.error(error.messageText);
  }
  process.exit(2);
}

if (options.help) {
  console.log(getHelpText(await getVersion()));
  process.exit(0);
}

if (options.version) {
  console.log("deno2node", await getVersion());
  console.log("typescript", ts.version);
  process.exit(0);
}

if (options.init) {
  await initializeProject();
  process.exit(0);
}

const ctx = new Context({
  tsConfigFilePath,
  compilerOptions: options,
  skipAddingFilesFromTsConfig: true,
});

console.time("Loading source files");
if (fileNames.length) {
  ctx.project.addSourceFilesAtPaths(fileNames);
} else if (tsConfigFilePath) {
  ctx.project.addSourceFilesFromTsConfig(tsConfigFilePath);
} else {
  console.error("Specify entry points.");
  process.exit(2);
}
ctx.project.resolveSourceFileDependencies();
console.timeEnd("Loading source files");

deno2node(ctx);

console.time("Emitting");
const diagnostics = await emit(ctx.project);
console.timeEnd("Emitting");
if (diagnostics.length !== 0) {
  console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  process.exit(1);
}
