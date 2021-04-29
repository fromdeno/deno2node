// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Context } from "./context.ts";
import { Node, Project, SourceFile, validatePackageName } from "./deps.deno.ts";

function transpileExtension(moduleName: string) {
  if (validatePackageName(moduleName).validForOldPackages) return moduleName;
  return moduleName
    .replace(/\.[jt]sx?$/i, ".js")
    .replace(/\.deno\.js$/i, ".node.js");
}

function transpileShebang(sourceFile: SourceFile) {
  const regex = /^#!\/usr\/bin\/env -S deno run\b[^\n]*/;
  const match = regex.exec(sourceFile.getFullText());
  if (match !== null) {
    sourceFile.replaceText([0, match[0].length], "#!/usr/bin/env node");
  }
}

function transpileImportSpecifiers(sourceFile: SourceFile) {
  for (const statement of sourceFile.getStatements()) {
    if (
      Node.isImportDeclaration(statement) ||
      Node.isExportDeclaration(statement)
    ) {
      const modSpecifierValue = statement.getModuleSpecifierValue();
      if (modSpecifierValue !== undefined) {
        statement.setModuleSpecifier(transpileExtension(modSpecifierValue));
      }
    }
  }
}

function createShimmer(ctx: Context) {
  if (ctx.config.shim === undefined) {
    return () => {};
  }
  const shimFile = ctx.project.addSourceFileAtPath(
    ctx.resolve(ctx.config.shim),
  );
  const namedImports = Array.from(shimFile.getExportedDeclarations().keys());
  return (sourceFile: SourceFile) => {
    if (sourceFile === shimFile) return;
    sourceFile.addImportDeclaration({
      namedImports,
      moduleSpecifier: `${
        sourceFile.getRelativePathAsModuleSpecifierTo(shimFile)
      }.js`,
    });
  };
}

const isDenoSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".deno");

export function deno2node(tsConfigFilePath: string): Project {
  const ctx = new Context(tsConfigFilePath);
  const shim = createShimmer(ctx);
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (isDenoSpecific(sourceFile)) {
      ctx.project.removeSourceFile(sourceFile);
      continue;
    }
    transpileImportSpecifiers(sourceFile);
    shim(sourceFile);
    transpileShebang(sourceFile);
  }
  return ctx.project;
}
