#!node_modules/.bin/deno run
import { ts } from "../src/deps.deno.ts";

const minor = (version: string) => version.split(".", 2).join(".");
const deno_s = minor(Deno.version.typescript);
const ts_morph_s = minor(ts.version);

if (deno_s !== ts_morph_s) {
  console.error(
    "Deno's TypeScript version (%s) doesn't match ts-morph's (%s).",
    deno_s,
    ts_morph_s,
  );
  Deno.exit(1);
}

console.info(ts_morph_s);
