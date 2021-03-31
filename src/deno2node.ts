// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Node, Project, ts, validatePackageName } from "./deps.deno.ts";

function transpileExtension(moduleName: string) {
  if (validatePackageName(moduleName).validForOldPackages) return moduleName;
  return moduleName
    .replace(/\.[jt]sx?$/i, ".js")
    .replace(/\.deno\.js$/i, ".node.js");
}

export function deno2node(tsConfigFilePath: string): Project {
  const project = new Project({
    tsConfigFilePath,
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      noEmitOnError: true,
      strict: true,
    },
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
          statement.setModuleSpecifier(transpileExtension(modSpecifierValue));
        }
      }
    }
    sourceFile.fixMissingImports();
  }
  return project;
}
