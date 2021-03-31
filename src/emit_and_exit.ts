import type { Project } from "https://deno.land/x/ts_morph@10.0.2/mod.ts";

export function emitAndExit(project: Project): never {
  const result = project.emitSync();
  const diagnostics = result.getDiagnostics();
  if (diagnostics.length === 0) return Deno.exit(0);
  console.info(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info(`Found ${diagnostics.length} errors.`);
  return Deno.exit(1);
}
