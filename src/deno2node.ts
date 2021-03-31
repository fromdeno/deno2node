// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Node, Project, ts, validatePackageName } from "./deps.deno.ts";

function transpileExtension(moduleName: string) {
  if (validatePackageName(moduleName).validForOldPackages) return moduleName;
  return moduleName
    .replace(/\.[jt]sx?$/i, ".js")
    .replace(/\.deno\.js$/i, ".node.js");
}

const identity = <T>(t: T) => t;

export interface Options {
  /**
   * ⚠ Some errors are only reported with `noEmitOnError`!
   */
  readonly compilerOptions?: ts.CompilerOptions;
  readonly transformModuleSpecifier?: (specifier: string) => string;
  readonly tsConfigFilePath: string;
}

export function deno2node(options: Options): Project {
  const { transformModuleSpecifier = identity } = options;
  const project = new Project({
    tsConfigFilePath: options.tsConfigFilePath,
    compilerOptions: options.compilerOptions,
  });
  for (const sourceFile of project.getSourceFiles()) {
    if (
      sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".deno")
    ) {
      project.removeSourceFile(sourceFile);
      continue;
    }
    for (const statement of sourceFile.getStatements()) {
      if (
        Node.isImportDeclaration(statement) ||
        Node.isExportDeclaration(statement)
      ) {
        const modSpecifierValue = statement.getModuleSpecifierValue();
        if (modSpecifierValue !== undefined) {
          statement.setModuleSpecifier(
            transpileExtension(transformModuleSpecifier(modSpecifierValue)),
          );
        }
      }
    }
    sourceFile.fixMissingImports();
  }
  return project;
}
