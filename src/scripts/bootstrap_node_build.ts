import { deno2node } from "../deno2node.ts";

const project = deno2node({ tsConfigFilePath: Deno.args[0] });

const result = await project.emit({});
const diagnostics = result.getDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.error(`Found ${diagnostics.length} errors.`);
  Deno.exit(1);
}
