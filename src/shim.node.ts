// Node-only, see https://github.com/wojpawlik/deno2node/#preparing-your-project
import { chmod } from "fs/promises";
const os = process.platform === "win32" ? "windows" : process.platform;
export const Deno = {
  // please keep sorted
  args: process.argv.slice(2),
  build: { os },
  chmod,
  exit: process.exit,
};
