import assert from "node:assert/strict";
import { Project, ts } from "../deps.deno.ts";
import { vendorFile } from "./vendor.ts";

Deno.test(function vendoring() {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true,
  });
  const vendorDir = project.createDirectory("src/vendor");
  const file = project.addSourceFileAtPath("src/deps.deno.ts");
  const exportDeclaration =
    file.getChildrenOfKind(ts.SyntaxKind.ExportDeclaration)[0];

  vendorFile(vendorDir.getPath())(file);
  const specifierValue = exportDeclaration.getModuleSpecifierValue()!;
  assert.match(specifierValue, /^.\/vendor\//);

  // test idempotence
  vendorFile(vendorDir.getPath())(file);
  assert.equal(exportDeclaration.getModuleSpecifierValue(), specifierValue);
});
