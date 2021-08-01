import { Node, SourceFile } from "../deps.deno.ts";
import type { Context } from "../context.ts";
import * as cache from "../cache.ts";

interface LocalFile {
  readonly sourceFile: SourceFile;
  readonly url: URL;
}

const createVendorSpecifiersFn = (ctx: Context) =>
  ({ sourceFile, url }: LocalFile): cache.Entry[] => {
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
        const cachedFile = cache.entry(newUrl);
        cachedFiles.push(cachedFile);
        const newSpecifierValue = sourceFile.getRelativePathAsModuleSpecifierTo(
          ctx.resolve(ctx.config.vendorDir, newUrl.hostname, cachedFile.hash),
        ) + ".js";
        statement.setModuleSpecifier(newSpecifierValue);
      }
    }
    return cachedFiles;
  };

const createVendorFileFn = (ctx: Context) => {
  const seen = new Set<string>();
  return async (file: cache.Entry): Promise<LocalFile[]> => {
    if (seen.has(file.url.href)) return [];
    seen.add(file.url.href);
    const vendoredPath = ctx.resolve(
      ctx.config.vendorDir!,
      file.url.hostname,
      `${file.hash}.ts`,
    );
    const sourceFile = ctx.project.createSourceFile(
      vendoredPath,
      await ctx.project.getFileSystem().readFile(file.path),
    );
    return [{ sourceFile, url: file.url }];
  };
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

  let toVendor = ctx.project.getSourceFiles().map(addUrl).flatMap(
    vendorSpecifiers,
  );

  while (toVendor.length !== 0) {
    toVendor = (await pFlatMap(toVendor, vendorFile)).flatMap(vendorSpecifiers);
  }
}
