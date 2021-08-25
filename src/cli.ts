#!/usr/bin/env -S deno run --no-check --allow-read --allow-write --allow-env
import { ts } from "./deps.deno.ts";
import { Context, deno2node, emit } from "./mod.ts";

async function cli(tsConfigFilePath?: string) {
  const ctx = new Context({ tsConfigFilePath });
  await deno2node(ctx);
  const diagnostics = await emit(ctx.project);
  if (diagnostics.length !== 0) {
    console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
    console.info("TypeScript", ts.version);
    console.info(`Found ${diagnostics.length} errors.`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  if (Deno.args.length !== 1 || Deno.args[0].startsWith("-")) {
    console.error("Usage: deno2node <tsConfigFilePath>");
    Deno.exit(2);
  }
  const tsConfigFilePath = Deno.args[0];
  await cli(tsConfigFilePath);
}
