import { deno2node } from "../deno2node.ts";

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

const result = await project.emit({});
const diagnostics = result.getDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.error(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
