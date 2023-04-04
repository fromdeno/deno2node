// based on https://github.com/dsherret/code-block-writer/blob/99454249cd13bd89befa45ac815b37b3e02896f5/scripts/build_npm.ts

import { Context } from "./context.ts";
import { Node, SourceFile } from "./deps.deno.ts";
import { transpileSpecifier } from "./_transformations/specifiers.ts";
import { vendorEverything } from "./_transformations/vendor.ts";
import { shimEverything } from "./_transformations/shim.ts";

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

const isDenoSpecific = (sourceFile: SourceFile) =>
  sourceFile.getBaseNameWithoutExtension().toLowerCase().endsWith(".deno");

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
 * 3. Rewrites remaining https: imports to point
 *    into `vendorDir`, if specified:
 *    ```json
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
 *    ```json
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
  console.time("Basic transformations");
  for (const sourceFile of ctx.project.getSourceFiles()) {
    if (isDenoSpecific(sourceFile)) {
      ctx.project.removeSourceFile(sourceFile);
      continue;
    }
    transpileImportSpecifiers(sourceFile);
  }
  console.timeEnd("Basic transformations");
  await vendorEverything(ctx);
  shimEverything(ctx);
}
