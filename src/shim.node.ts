// Node-only, see https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts#deno2node
import { chmod } from "fs/promises";
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
