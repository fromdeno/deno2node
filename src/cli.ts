import { deno2node, emitAndExit } from "./mod.ts";

if (Deno.args.length !== 1) {
  console.info("Usage: deno2node <tsConfigFilePath>");
  Deno.exit(2);
}

emitAndExit(deno2node(Deno.args[0]));
