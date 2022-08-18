export interface Config {
  readonly shim?: string;
  readonly vendorDir?: string;
}

// deno-lint-ignore no-explicit-any
export function parse({ shim, vendorDir, ...rest }: any): Config {
  if (typeof shim !== "string" && typeof shim !== "undefined") {
    throw new TypeError(
      "deno2node option 'shim' requires a value of type string.",
    );
  }

  if (typeof vendorDir !== "string" && typeof vendorDir !== "undefined") {
    throw new TypeError(
      "deno2node option 'vendorDir' requires a value of type string.",
    );
  }

  const unknown = Object.keys(rest);
  if (unknown.length) {
    throw new TypeError(`Unknown deno2node option '${unknown[0]}'.`);
  }

  return { shim, vendorDir };
}
