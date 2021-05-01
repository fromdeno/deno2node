import type { Diagnostic, MemoryEmitResultFile, Project } from "./deps.deno.ts";

function transpileShebang(file: MemoryEmitResultFile) {
  const regex = /^#!\/usr\/bin\/env -S deno run\b[^\n]*/;
  const match = regex.exec(file.text);
  if (match === null) return false;
  const isJs = file.filePath.endsWith(".js");
  const newShebang = isJs ? "#!/usr/bin/env node" : "";
  file.text = newShebang + file.text.slice(match[0].length);
  return isJs;
}

async function markExecutable({ filePath }: MemoryEmitResultFile) {
  if (Deno.build.os === "windows") return;
  await Deno.chmod(filePath, 0o755);
}

export async function emit(project: Project): Promise<Diagnostic[]> {
  const result = project.emitToMemory();
  const executables = result.getFiles().filter(transpileShebang);
  await result.saveFiles();
  await Promise.all(executables.map(markExecutable));
  const preEmitDiagnostics = project.getPreEmitDiagnostics();
  if (preEmitDiagnostics.length !== 0) return preEmitDiagnostics;
  return result.getDiagnostics();
}
