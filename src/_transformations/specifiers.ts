import { Node, type SourceFile } from "../deps.deno.ts";
import * as re from "../util/regexp.ts";

export const services = ["npm:", "https://esm.sh/", "https://cdn.skypack.dev/"];
export const name = /^(?:@[\w.-]+\/)?[\w.-]+$/;
const version = /^@[^/?]+$/;
const path = /\/[^?]*/;
const url = re.tag()`^${re.union(services)}(${name})${version}?(${path})?.*$`;

const transpileHttpsImport = (specifier: string) =>
  specifier.replace(url, "$1$2");

export const transpileExtension = (specifier: string) =>
  specifier.replace(/[jt]sx?$/i, "js");

const transpileRelativeImport = (specifier: string) =>
  transpileExtension(specifier).replace(".deno.", ".node.");

const isRelative = (specifier: string) => /^\.\.?\//.test(specifier);

export const transpileSpecifier = (specifier: string) => {
  if (isRelative(specifier)) return transpileRelativeImport(specifier);
  return transpileHttpsImport(specifier);
};

/**
 * Replaces all import/export specifiers in `sourceFile`
 * according to the specified `transpileSpecifier` function.
 * The default one makes specifiers Node-friendly.
 */
export function transpileSpecifiers(
  sourceFile: SourceFile,
  fn = transpileSpecifier,
) {
  for (const statement of sourceFile.getStatements()) {
    if (
      Node.isImportDeclaration(statement) ||
      Node.isExportDeclaration(statement)
    ) {
      const modSpecifierValue = statement.getModuleSpecifierValue();
      if (modSpecifierValue !== undefined) {
        statement.setModuleSpecifier(fn(modSpecifierValue));
      }
    }
  }
}
