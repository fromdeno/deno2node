#!/usr/bin/env -S deno run --allow-read --allow-write='.'
import * as fs from "node:fs/promises";

const shimFile = "// See https://github.com/fromdeno/deno2node#shimming";
const gitignore = "/lib/\n/node_modules/\n/src/vendor/";
const denoJson = '{ "exclude": ["lib/"] }';

async function download(url: URL, target: string) {
  const response = await fetch(url);
  await fs.writeFile(target, await response.text(), { flag: "wx" });
}

export async function getVersion(): Promise<string> {
  const packageUrl = new URL("../package.json", import.meta.url);
  const response = await fetch(packageUrl);
  const { version } = await response.json();
  return version;
}

async function createPackageJson() {
  const pkg = {
    "type": "module",
    "version": "0.0.0",
    "exports": "./lib/mod.js",
    "typings": "./lib/mod.d.ts",
    "files": [
      "lib/",
      "!lib/**/*.test.*",
      "!*/vendor/**/*.ts*",
    ],
    "scripts": {
      "fmt": "deno fmt",
      "lint": "deno lint",
      "test": "deno test",
      "prepare": "deno2node",
      "postprepare": "node --test lib/",
      "clean": "git clean -fXde !node_modules/",
    },
    "devDependencies": {
      "deno2node": `~${await getVersion()}`,
    },
  };
  await fs.writeFile("package.json", JSON.stringify(pkg, null, 2), {
    flag: "wx",
  });
}

export async function initializeProject() {
  const tsconfigUrl = new URL("../tsconfig.json", import.meta.url);
  await fs.mkdir("src/");
  await Promise.all([
    createPackageJson(),
    download(tsconfigUrl, "tsconfig.json"),
    fs.writeFile("deno.json", denoJson, { flag: "wx" }),
    fs.writeFile(".gitignore", gitignore, { flag: "wx" }),
    fs.writeFile("src/shim.node.ts", shimFile, { flag: "wx" }),
  ]);
}

// @ts-ignore not available on Node.js: https://github.com/nodejs/modules/issues/274
if (import.meta.main) {
  await initializeProject();
}
