import { deno2node, emitAndExit } from "../mod.ts";

const project = deno2node({
  tsConfigFilePath: Deno.args[0],
  compilerOptions: { outDir: Deno.args[1] },
});

emitAndExit(project);
