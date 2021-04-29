import type { Diagnostic, Project, ts } from "./deps.deno.ts";

function diagnoze(
  project: Project,
  diagnostics: readonly Diagnostic<ts.Diagnostic>[],
) {
  if (diagnostics.length === 0) return;
  console.info(project.formatDiagnosticsWithColorAndContext(diagnostics));
  console.info(`Found ${diagnostics.length} errors.`);
  return Deno.exit(1);
}

export function emitAndExit(project: Project): never {
  const result = project.emitSync();
  diagnoze(project, project.getPreEmitDiagnostics());
  diagnoze(project, result.getDiagnostics());
  return Deno.exit(0);
}
