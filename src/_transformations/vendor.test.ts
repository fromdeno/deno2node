import * as assert from "node:assert/strict";
import test from "node:test";
import { Project, ts } from "../deps.deno.ts";
import { vendorSpecifiers } from "./vendor.ts";

test(function vendoring() {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true,
  });
  const vendorDir = project.createDirectory("src/vendor");
  const file = project.addSourceFileAtPath("src/deps.deno.ts");
  const exportDeclaration =
    file.getChildrenOfKind(ts.SyntaxKind.ExportDeclaration)[0];

  vendorSpecifiers(vendorDir.getPath())(file);
  const specifierValue = exportDeclaration.getModuleSpecifierValue()!;
  assert.match(specifierValue, /^.\/vendor\//);
  assert.match(specifierValue, /\.js$/);

  // test idempotence
  vendorSpecifiers(vendorDir.getPath())(file);
  assert.equal(exportDeclaration.getModuleSpecifierValue(), specifierValue);
});
