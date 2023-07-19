import { Node, type SourceFile } from "../deps.deno.ts";
import * as re from "../util/regexp.ts";

export const services = ["npm:", "https://esm.sh/", "https://cdn.skypack.dev/"];
export const name = /^(?:@[\w.-]+\/)?[\w.-]+$/;
const version = /^@[^/?]+$/;
const path = /\/[^?]*/;
const url = re.tag()`^${re.union(services)}(${name})${version}?(${path})?.*$`;

const transpileHttpsImport = (specifier: string) =>
  specifier.replace(url, "$1$2");

const transpileRelativeImport = (specifier: string) =>
  specifier
    .replace(/\.[jt]sx?$/i, ".js")
    .replace(/\.deno\.js$/i, ".node.js");

const isRelative = (specifier: string) => /^\.\.?\//.test(specifier);

export const transpileSpecifier = (specifier: string) => {
  if (isRelative(specifier)) return transpileRelativeImport(specifier);
  return transpileHttpsImport(specifier);
};

export function transpileSpecifiers(sourceFile: SourceFile) {
  for (const statement of sourceFile.getStatements()) {
    if (
      Node.isImportDeclaration(statement) ||
      Node.isExportDeclaration(statement)
    ) {
      const modSpecifierValue = statement.getModuleSpecifierValue();
      if (modSpecifierValue !== undefined) {
        statement.setModuleSpecifier(transpileSpecifier(modSpecifierValue));
      }
    }
  }
}
