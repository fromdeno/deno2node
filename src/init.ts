#!/usr/bin/env -S deno run --no-check --allow-read --allow-write='.'
import fs from "node:fs/promises";

const shimFile = "// See https://github.com/fromdeno/deno2node#shimming";
const gitignore = "/lib/\n/node_modules/\n/src/vendor/";

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
      "!*/vendor/**/*.ts*",
    ],
    "scripts": {
      "prepare": "deno2node --project tsconfig.json",
      "clean": "git clean -fXde !node_modules/",
      "fmt": "deno fmt",
      "lint": "deno lint",
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
  const denoJsonUrl = new URL("../deno.json", import.meta.url);
  const tsconfigUrl = new URL("../tsconfig.json", import.meta.url);
  await fs.mkdir("src/");
  await Promise.all([
    createPackageJson(),
    download(denoJsonUrl, "deno.json"),
    download(tsconfigUrl, "tsconfig.json"),
    fs.writeFile(".gitignore", gitignore, { flag: "wx" }),
    fs.writeFile("src/shim.node.ts", shimFile, { flag: "wx" }),
  ]);
}

// @ts-ignore not available on Node.js: https://github.com/nodejs/modules/issues/274
if (import.meta.main) {
  await initializeProject();
}
