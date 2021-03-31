import type { Project } from "./deps.deno.ts";

export function emitAndExit(project: Project): never {
  const result = project.emitSync();
  const diagnostics = result.getDiagnostics();
  if (diagnostics.length === 0) return Deno.exit(0);
  console.info(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info(`Found ${diagnostics.length} errors.`);
  return Deno.exit(1);
}
