#!/usr/bin/env -S deno run --no-check --allow-read --allow-write
import { ts } from "./deps.deno.ts";
import { deno2node, emit } from "./mod.ts";

if (Deno.args.length !== 1 || Deno.args[0].startsWith("-")) {
  console.error("Usage: deno2node <tsConfigFilePath>");
  Deno.exit(2);
}

const project = deno2node(Deno.args[0]);
const diagnostics = await emit(project);
if (diagnostics.length !== 0) {
  console.info(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
