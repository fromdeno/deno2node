import type { Context } from "../context.ts";
import type { SourceFile } from "../deps.deno.ts";

function createShimmer(ctx: Context) {
  if (ctx.config.shim === undefined) {
    return () => {};
  }
  const shimFile = ctx.project.addSourceFileAtPath(
    ctx.resolve(ctx.config.shim),
  );
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
}

const isNodeSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".node");

export function shimEverything(ctx: Context) {
  if (!ctx.config.shim) return;
  console.time("Shimming");
  const shim = createShimmer(ctx);
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (!isNodeSpecific(sourceFile)) {
      shim(sourceFile);
    }
  }
  console.timeEnd("Shimming");
}
