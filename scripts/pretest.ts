#!/usr/bin/env -S node_modules/.bin/deno run --allow-read --allow-write="src/deps.deno.ts"
const { version } = JSON.parse(
  await Deno.readTextFile("node_modules/ts-morph/package.json"),
);
const deps = await Deno.readTextFile("src/deps.deno.ts");
await Deno.writeTextFile(
  "src/deps.deno.ts",
  deps.replace(/(?<=ts-morph@)[\d.]+/, version),
);
