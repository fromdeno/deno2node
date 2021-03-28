// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Node, Project } from "https://deno.land/x/ts_morph@10.0.2/mod.ts";

function removeTsExtension(moduleName: string) {
  return moduleName.replace(/\.[jt]sx?$/i, "");
}

export interface Options {
  readonly tsConfigFilePath: string;
}

export function deno2node(options: Options) {
  const project = new Project({
    tsConfigFilePath: options.tsConfigFilePath,
    compilerOptions: { noEmitOnError: true },
  });
  for (const sourceFile of project.getSourceFiles()) {
    for (const statement of sourceFile.getStatements()) {
      if (
        Node.isImportDeclaration(statement) ||
        Node.isExportDeclaration(statement)
      ) {
        const modSpecifierValue = statement.getModuleSpecifierValue();
        if (modSpecifierValue !== undefined) {
          statement.setModuleSpecifier(removeTsExtension(modSpecifierValue));
        }
      }
    }
  }
  return project;
}
