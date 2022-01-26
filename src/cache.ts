// based on https://deno.land/x/cache@0.2.13

// deno2node-friendly imports
import { Sha256 } from "https://deno.land/std@0.122.0/hash/sha256.ts";
import { path as Path } from "./deps.deno.ts";

export interface Entry {
  readonly url: URL;
  readonly hash: string;
  readonly path: string;
  readonly metaPath: string;
}

const POSIX_HOME = "HOME";

function getCacheDir(): string {
  const env = Deno.env.get;
  const os = Deno.build.os;

  const deno = env("DENO_DIR");

  if (deno) return deno;

  let home: string | undefined;
  let path: string;
  switch (os) {
    case "linux": {
      const xdg = env("XDG_CACHE_HOME");
      home = xdg ?? env(POSIX_HOME);
      path = xdg ? "deno" : ".cache/deno/";
      break;
    }

    case "darwin":
      home = env(POSIX_HOME);
      path = "Library/Caches/deno/";
      break;

    case "windows":
      home = env("LOCALAPPDATA") ?? env("USERPROFILE");
      path = "deno";
      break;

    default:
      throw new Error(`Unsupported OS: ${os}`);
  }

  if (!home) return ".deno";
  return Path.join(home, path);
}

export function entry(url: URL): Entry {
  const formatted = url.search ? `${url.pathname}?${url.search}` : url.pathname;
  const hash = new Sha256().update(formatted).toString();
  const path = Path.resolve(
    getCacheDir(),
    "deps/",
    url.protocol.slice(0, -1),
    url.hostname,
    hash,
  );
  const metaPath = `${path}.metadata.json`;
  return { url, hash, path, metaPath };
}
