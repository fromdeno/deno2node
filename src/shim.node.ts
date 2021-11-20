// Node-only, see https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts#deno2node
import { chmod, readFile } from "fs/promises";
const os = process.platform === "win32" ? "windows" : process.platform;
export const Deno = {
  // please keep sorted
  args: process.argv.slice(2),
  build: { os },
  chmod,
  cwd: process.cwd,
  env: { get: (key: string) => process.env[key] },
  exit: process.exit,
};

export async function fetch(
  localPath: string,
  // deno-lint-ignore no-explicit-any
): Promise<{ json: () => Promise<any> }> {
  if (!localPath.startsWith("file:")) {
    throw new Error("Can only read local files!");
  }
  const data = await readFile(localPath.substr(5), { encoding: "utf-8" });
  return { json: () => Promise.resolve(JSON.parse(data)) };
}
