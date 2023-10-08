import { Node, type SourceFile } from "../deps.deno.ts";
import * as re from "../util/regexp.ts";

export const services = ["npm:", "https://esm.sh/", "https://cdn.skypack.dev/"];
export const name = /^(?:@[\w.-]+\/)?[\w.-]+$/;
const version = /^@[^/?]+$/;
const path = /\/[^?]*/;
const url = re.tag()`^${re.union(services)}(${name})${version}?(${path})?.*$`;

export const transpileHttpsImport = (specifier: string) =>
  specifier.replace(url, "$1$2");

export const transpileExtension = (specifier: string) =>
  specifier.replace(/[jt]sx?$/i, "js");

const isRelative = (specifier: string) => /^\.\.?\//.test(specifier);

export const transpileSpecifier =
  (oldRuntime: string, newRuntime: string) => (specifier: string) =>
    isRelative(specifier)
      ? transpileExtension(specifier).replace(
        `.${oldRuntime}.`,
        `.${newRuntime}.`,
      )
      : transpileHttpsImport(specifier);

/**
 * Replaces all import/export specifiers in `sourceFile`
 * according to the specified `fn`.
 */
export function replaceSpecifiers(
  sourceFile: SourceFile,
  fn: (specifier: string) => string,
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
