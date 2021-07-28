import { cache, File, Node, path, SourceFile } from "../deps.deno.ts";
import type { Context } from "../context.ts";

interface LocalFile {
  readonly sourceFile: SourceFile;
  readonly url: URL;
}

const createVendorSpecifiersFn = (ctx: Context) =>
  async ({ sourceFile, url }: LocalFile) => {
    if (!ctx.config.vendorDir) return [];
    const cachedFiles = [];
    for (const statement of sourceFile.getStatements()) {
      if (
        Node.isImportDeclaration(statement) ||
        Node.isExportDeclaration(statement)
      ) {
        const oldSpecifierValue = statement.getModuleSpecifierValue();
        if (oldSpecifierValue === undefined) continue;
        const newUrl = new URL(oldSpecifierValue, url);
        if (newUrl.protocol === "file:") continue;
        const cachedFile = await cache(newUrl);
        cachedFiles.push(cachedFile);
        const newSpecifierValue = sourceFile.getRelativePathAsModuleSpecifierTo(
          ctx.resolve(ctx.config.vendorDir, cachedFile.hash),
        ) + ".js";
        statement.setModuleSpecifier(newSpecifierValue);
      }
    }
    return cachedFiles;
  };

const createVendorFileFn = (ctx: Context) =>
  async (file: File): Promise<LocalFile[]> => {
    const vendoredPath = ctx.resolve(
      ctx.config.vendorDir!,
      `${file.hash}${path.extname(file.path)}`,
    );
    if (ctx.project.getSourceFile(vendoredPath) !== undefined) return [];
    const sourceFile = ctx.project.createSourceFile(
      vendoredPath,
      await ctx.project.getFileSystem().readFile(file.path),
      { overwrite: true },
    );
    return [{ sourceFile, url: file.url }];
  };

const pMap = async <T, U>(array: T[], fn: (t: T) => Promise<U>) =>
  await Promise.all(array.map(fn));

const pFlatMap = async <T, U>(array: T[], fn: (t: T) => Promise<U[]>) =>
  (await pMap(array, fn)).flat();

function addUrl(sourceFile: SourceFile): LocalFile {
  return {
    sourceFile,
    url: new URL("./" + sourceFile.getFilePath(), "file:"),
  };
}

export async function vendorEverything(ctx: Context) {
  const vendorSpecifiers = createVendorSpecifiersFn(ctx);
  const vendorFile = createVendorFileFn(ctx);

  let toVendor = await pFlatMap(
    ctx.project.getSourceFiles().map(addUrl),
    vendorSpecifiers,
  );

  while (toVendor.length !== 0) {
    toVendor = await pFlatMap(
      await pFlatMap(toVendor, vendorFile),
      vendorSpecifiers,
    );
  }
}
