// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Context } from "./context.ts";
import { Node, SourceFile } from "./deps.deno.ts";
import { transpileSpecifier } from "./_transformations/specifiers.ts";
import { vendorEverything } from "./_transformations/vendor.ts";

function transpileImportSpecifiers(sourceFile: SourceFile) {
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

function createShimmer(ctx: Context) {
  if (ctx.config.shim === undefined) {
    return () => {};
  }
  const shimFile = ctx.project.addSourceFileAtPath(
    ctx.resolve(ctx.config.shim),
  );
  const shims = Array.from(shimFile.getExportedDeclarations().keys());
  return (sourceFile: SourceFile) => {
    if (sourceFile === shimFile) return;
    const locals = new Set(
      sourceFile.getLocals().map((l) => l.getEscapedName()),
    );
    const index = sourceFile.getStatementsWithComments().length;
    sourceFile.insertImportDeclaration(index, {
      // do not shim declared locals
      namedImports: shims.filter((s) => !locals.has(s)),
      moduleSpecifier: `${
        sourceFile.getRelativePathAsModuleSpecifierTo(shimFile)
      }.js`,
    });
  };
}

const isDenoSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".deno");

const isNodeSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".node");

/**
 * Attempts to transform arbitrary `ctx.project` into a valid Node.js project:
 *
 * 1. Changes import specifiers to be Node-friendly:
 *    - changes extension in relative specifiers to `.js`,
 *    - replaces some `https://` imports with bare specifiers.
 *
 * 2. Changes `*.deno.js` imports specifiers to `*.node.js`
 *    (`import './deps.deno.ts'` -> `import './deps.node.js'`).
 *    This can be used for re-exporting dependencies
 *    and other runtime-specific code.
 *
 * 3. Vendors remaining https?:// imports
 *    into `vendorDir`, if specified:
 *    ```jsonc
 *    // @filename: tsconfig.json
 *    {
 *      "deno2node": {
 *        "vendorDir": "src/.deno2node/vendor/"
 *      }
 *    }
 *    ```
 *
 * 4. Imports Node.js shims for Deno globals
 *    from [shim file], if specified:
 *    ```jsonc
 *    // @filename: tsconfig.json
 *    {
 *      "deno2node": {
 *        "shim": "src/shim.node.ts"
 *      }
 *    }
 *    ```
 *
 * [shim file]: https://github.com/wojpawlik/deno2node/blob/main/src/shim.node.ts
 */
export async function deno2node(ctx: Context): Promise<void> {
  const shim = createShimmer(ctx);
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (isDenoSpecific(sourceFile)) {
      ctx.project.removeSourceFile(sourceFile);
      continue;
    }
    transpileImportSpecifiers(sourceFile);
  }
  await vendorEverything(ctx);
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (!isNodeSpecific(sourceFile)) {
      shim(sourceFile);
    }
  }
}
