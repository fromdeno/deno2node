#!/usr/bin/env -S deno run --no-check --allow-read --allow-write --allow-env
import { ts } from "./deps.deno.ts";
import { Context, deno2node, emit } from "./mod.ts";

function printUsageAndExit() {
  console.error("Usage: deno2node <tsConfigFilePath>");
  Deno.exit(2);
}

if (Deno.args.length !== 1) {
  printUsageAndExit();
} else if (Deno.args[0].startsWith("-")) {
  if (Deno.args[0] === "-v" || Deno.args[0] === "--version") {
    const url = new URL("../package.json", import.meta.url);
    const res = await fetch(url);
    const packageJson = await res.json() as { version: string };
    console.log("deno2node", packageJson.version);
    console.log("typescript", ts.version);
    Deno.exit(0);
  } else {
    printUsageAndExit();
  }
}

const ctx = new Context({ tsConfigFilePath: Deno.args[0] });
await deno2node(ctx);
const diagnostics = await emit(ctx.project);
if (diagnostics.length !== 0) {
  console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
