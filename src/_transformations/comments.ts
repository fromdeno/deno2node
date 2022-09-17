import strip from "https://cdn.skypack.dev/strip-comments@2.0.1?dts";
import type { MemoryEmitResultFile } from "../deps.deno.ts";

export function stripJsComments(files: readonly MemoryEmitResultFile[]) {
  for (const file of files) {
    if (!file.filePath.endsWith("js")) continue;
    if (file.text.includes("//# sourceMappingURL=")) continue;
    file.text = strip(file.text);
  }
}
