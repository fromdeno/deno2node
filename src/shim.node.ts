// Node-only, see https://github.com/fromdeno/deno2node#shimming
import { test } from "@deno/shim-deno-test";
import { chmod, readFile } from "node:fs/promises";
import * as process from "node:process";
import { isatty } from "node:tty";

const os = process.platform === "win32" ? "windows" : process.platform;

export const Deno = {
  // please keep sorted
  build: { os },
  chmod,
  isatty,
  noColor: process.env.NO_COLOR !== undefined,
  stdout: { rid: process.stdout.fd },
  test,
};

export async function fetch(fileUrl: URL) {
  return new Response(await readFile(fileUrl));
}
