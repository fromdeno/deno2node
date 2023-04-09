import type { Context } from "../context.ts";
import { Node, SourceFile } from "../deps.deno.ts";

const https = /^https:\//ui;

export const vendorFile = (vendorDir: string) => (sourceFile: SourceFile) => {
  for (const statement of sourceFile.getStatements()) {
    if (
      Node.isImportDeclaration(statement) ||
      Node.isExportDeclaration(statement)
    ) {
      const oldSpecifierValue = statement.getModuleSpecifierValue();
      if (oldSpecifierValue === undefined) continue;
      if (!https.test(oldSpecifierValue)) continue;
      const newSpecifierValue = sourceFile.getRelativePathAsModuleSpecifierTo(
        oldSpecifierValue.replace(https, vendorDir),
      ) + ".js";
      statement.setModuleSpecifier(newSpecifierValue);
    }
  }
};

export function vendorEverything(ctx: Context) {
  if (!ctx.config.vendorDir) return;
  console.time("Vendoring");
  const vendorSpecifiers = vendorFile(
    ctx.resolve(ctx.config.vendorDir),
  );
  ctx.project.getSourceFiles().forEach(vendorSpecifiers);
  console.timeEnd("Vendoring");
}
