import assert from "node:assert/strict";
import { ts } from "../deps.deno.ts";
import { Context } from "../mod.ts";
import { vendorEverything } from "./vendor.ts";

Deno.test(function vendoring() {
  const ctx = new Context({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true,
  });
  const file = ctx.project.addSourceFileAtPath("src/deps.deno.ts");
  ctx.config = { vendorDir: "src/vendor/" };

  vendorEverything(ctx);
  const exportDeclaration =
    file.getChildrenOfKind(ts.SyntaxKind.ExportDeclaration)[0];
  const specifierValue = exportDeclaration.getModuleSpecifierValue()!;
  assert.match(specifierValue, /^.\/vendor\//);

  // test idempotence
  vendorEverything(ctx);
  assert.equal(exportDeclaration.getModuleSpecifierValue(), specifierValue);
});
