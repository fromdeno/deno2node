#!/usr/bin/env -S deno run --unstable --allow-read --allow-write
import { deno2node, emitAndExit } from "./mod.ts";

if (Deno.args.length !== 1 || Deno.args[0].startsWith("-")) {
  console.error("Usage: deno2node <tsConfigFilePath>");
  Deno.exit(2);
}

emitAndExit(deno2node(Deno.args[0]));
