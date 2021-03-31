import { deno2node, emitAndExit } from "../mod.ts";

function transformModuleSpecifier(specifier: string): string {
  if (specifier.startsWith("https://deno.land/x/ts_morph@")) {
    return "ts-morph";
  }
  return specifier;
}

const project = deno2node({
  tsConfigFilePath: Deno.args[0],
  compilerOptions: { outDir: Deno.args[1] },
  transformModuleSpecifier,
});

emitAndExit(project);
