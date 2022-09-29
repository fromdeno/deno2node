import type { Diagnostic, MemoryEmitResultFile, Project } from "./deps.deno.ts";

const anyShebang = /^#![^\n]*\n/;
const denoShebang = /^#!\/usr\/bin\/env -S deno run\b[^\n]*\n/;
const nodeShebang = "#!/usr/bin/env node\n";

function transpileShebang(file: MemoryEmitResultFile) {
  file.text = file.filePath.endsWith(".js")
    ? file.text.replace(denoShebang, nodeShebang)
    : file.text.replace(anyShebang, "\n");
}

async function markExecutableIfNeeded(file: MemoryEmitResultFile) {
  if (Deno.build.os === "windows") return;
  if (!file.text.startsWith(nodeShebang)) return;
  await Deno.chmod(file.filePath, 0o755);
}

/**
 * Emits project to the filesystem.
 * Returns diagnostics.
 *
 * Replaces Deno shebang with Node.js shebang in JS outputs.
 * Removes shebangs from non-JS outputs.
 * Then `chmod +x`'s outputs with Node.js shebang.
 */
export async function emit(project: Project): Promise<Diagnostic[]> {
  const result = project.emitToMemory();
  const files = result.getFiles();
  files.forEach(transpileShebang);
  await result.saveFiles();
  await Promise.all(files.map(markExecutableIfNeeded));
  const preEmitDiagnostics = project.getPreEmitDiagnostics();
  if (preEmitDiagnostics.length !== 0) return preEmitDiagnostics;
  return result.getDiagnostics();
}
