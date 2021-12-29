// Node-only, see https://github.com/fromdeno/deno2node#shimming
import { chmod, mkdir, readFile, writeFile } from "fs/promises";
import { URL } from "url";
export { URL };
const os = process.platform === "win32" ? "windows" : process.platform;
export const Deno = {
  // please keep sorted
  args: process.argv.slice(2),
  build: { os },
  chmod,
  cwd: process.cwd,
  env: { get: (key: string) => process.env[key] },
  exit: process.exit,
  mkdir,
  writeTextFile: writeFile,
};

export async function fetch(fileUrl: URL) {
  if (fileUrl.protocol !== "file:") {
    throw new Error("Can only read local files!");
  }
  const data = await readFile(fileUrl, { encoding: "utf-8" });
  return {
    json: () => JSON.parse(data),
    text: () => data,
  };
}
