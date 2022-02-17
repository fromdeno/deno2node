#!/usr/bin/env -S deno run --no-check --allow-read --allow-write --allow-env
import { ts } from "./deps.deno.ts";
import { Command } from "./deps.vendor.ts";
import { Context, deno2node, emit } from "./mod.ts";
import { getVersion, initializeProject } from "./init.ts";

const result = await new Command<void>()
  .name("deno2node")
  .description("Compile your Deno project to run on Node.js")
  .option("-v --version", "Print version number and exit", {
    standalone: true,
    action: async () => {
      console.log("deno2node", await getVersion());
      console.log("typescript", ts.version);
      Deno.exit(0);
    },
  })
  .option("--init", "Initialize new deno2node project", {
    standalone: true,
    action: async () => {
      await initializeProject();
      Deno.exit(0);
    },
  })
  .arguments<[string]>("<tsConfigFilePath>")
  .option<{ noEmit: boolean }>("--noEmit", "Only check types, do not emit")
  .parse(Deno.args);

const [tsConfigFilePath] = result.args;
const { noEmit } = result.options;

const ctx = new Context({ tsConfigFilePath, compilerOptions: { noEmit } });

await deno2node(ctx);
const diagnostics = await emit(ctx.project);
if (diagnostics.length !== 0) {
  console.info(ctx.project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info("TypeScript", ts.version);
  console.info(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
