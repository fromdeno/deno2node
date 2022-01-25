// Node-only, see https://github.com/fromdeno/deno2node#shimming
import { readFile } from "fs/promises";

export * from "deno.ns";

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
