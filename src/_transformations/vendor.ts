import { Node, SourceFile } from "../deps.deno.ts";
import type { Context } from "../context.ts";

interface LocalFile {
  readonly sourceFile: SourceFile;
  readonly url: URL;
}

function getVendoredPath(url: URL) {
  // FIXME respect ${vendorDir}/import_map.json
  return url.hostname + "/" + url.pathname;
}

const createVendorSpecifiersFn =
  (ctx: Context) => ({ sourceFile, url }: LocalFile) => {
    if (!ctx.config.vendorDir) return;
    for (const statement of sourceFile.getStatements()) {
      if (
        Node.isImportDeclaration(statement) ||
        Node.isExportDeclaration(statement)
      ) {
        const oldSpecifierValue = statement.getModuleSpecifierValue();
        if (oldSpecifierValue === undefined) continue;
        const newUrl = new URL(oldSpecifierValue, url);
        if (newUrl.protocol !== "https:") continue;
        const newSpecifierValue = sourceFile.getRelativePathAsModuleSpecifierTo(
          ctx.resolve(ctx.config.vendorDir, getVendoredPath(newUrl)),
        ) + ".js";
        statement.setModuleSpecifier(newSpecifierValue);
      }
    }
  };

function addUrl(sourceFile: SourceFile): LocalFile {
  return {
    sourceFile,
    url: new URL("./" + sourceFile.getFilePath(), "file:"),
  };
}

export function vendorEverything(ctx: Context) {
  if (!ctx.config.vendorDir) return;
  console.time("Vendoring");
  const vendorSpecifiers = createVendorSpecifiersFn(ctx);
  ctx.project.getSourceFiles().map(addUrl).forEach(vendorSpecifiers);
  console.timeEnd("Vendoring");
}
