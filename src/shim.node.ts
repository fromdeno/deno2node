// Node-only, see https://github.com/fromdeno/deno2node#shimming
import { readFile } from "node:fs/promises";
import * as process from "node:process";
import { isatty } from "node:tty";

export const Deno = {
  // please keep sorted
  args: process.argv.slice(2),
  exit: process.exit,
  isatty,
  noColor: process.env.NO_COLOR !== undefined,
  stdout: { rid: process.stdout.fd },
};

export async function fetch(fileUrl: URL) {
  const data = await readFile(fileUrl, { encoding: "utf-8" });
  return {
    json: () => JSON.parse(data),
    text: () => data,
  };
}
