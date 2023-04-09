import type { Context } from "../context.ts";
import type { SourceFile } from "../deps.deno.ts";

export const shimFile = (shimFile: SourceFile) => {
  const shims = Array.from(shimFile.getExportedDeclarations().keys());
  return (sourceFile: SourceFile) => {
    if (sourceFile === shimFile) return;
    const locals = new Set(
      sourceFile.getLocals().map((l) => l.getEscapedName()),
    );
    const index = sourceFile.getStatementsWithComments().length;
    const moduleSpecifier = "./" +
      sourceFile.getRelativePathTo(shimFile).replace(
        /tsx?$/,
        "js",
      );
    sourceFile.insertImportDeclaration(index, {
      // do not shim declared locals
      namedImports: shims.filter((s) => !locals.has(s)),
      moduleSpecifier,
    });
  };
};

const isNodeSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".node");

export function shimEverything(ctx: Context) {
  if (!ctx.config.shim) return;
  console.time("Shimming");
  const shim = shimFile(ctx.project.getSourceFileOrThrow(ctx.config.shim));
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (!isNodeSpecific(sourceFile)) {
      shim(sourceFile);
    }
  }
  console.timeEnd("Shimming");
}
