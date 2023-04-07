// Node-only, see https://github.com/fromdeno/deno2node#shimming
import { test } from "@fromdeno/test";
import { chmod, readFile } from "node:fs/promises";
import process from "node:process";
import { isatty } from "node:tty";

const os = process.platform === "win32" ? "windows" : process.platform;

export const Deno = {
  // please keep sorted
  args: process.argv.slice(2),
  build: { os },
  chmod,
  exit: process.exit,
  isatty,
  stdout: { rid: process.stdout.fd },
  test,
};

export async function fetch(fileUrl: URL) {
  const data = await readFile(fileUrl, { encoding: "utf-8" });
  return {
    json: () => JSON.parse(data),
    text: () => data,
  };
}
