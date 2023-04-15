import * as RE from "../_util/regex.ts";

export const scopedPackage = /(?:@[\w.-]+\/)?[\w.-]+/;
const version = /[^/?]+/;
const path = /\/[^?]*/;

const patterns = [
  RE.tag`^npm:(${scopedPackage})(?:@${version})?(${path})?`,
  RE.tag`^https://esm\.sh/(${scopedPackage})(?:@${version})?(${path})?`,
  RE.tag`^https://cdn\.skypack\.dev/(${scopedPackage})(?:@${version})?(${path})?`,
  RE.tag`^https://deno\.land/std(?:@${version})?/node/([\w/]+)\.ts$`,
  RE.tag`^https://nest\.land/std/node/${version}/([\w/]+)\.ts$`,
];

const transpileHttpsImport = (specifier: string) => {
  for (const pattern of patterns) {
    const match = pattern.exec(specifier);
    if (match === null) continue;
    const [, pkg, path = ""] = match;
    return pkg + path;
  }
  return specifier;
};

const transpileRelativeImport = (specifier: string) =>
  specifier
    .replace(/\.[jt]sx?$/i, ".js")
    .replace(/\.deno\.js$/i, ".node.js");

const isRelative = (specifier: string) => /^\.\.?\//.test(specifier);

export const transpileSpecifier = (specifier: string) => {
  if (isRelative(specifier)) return transpileRelativeImport(specifier);
  return transpileHttpsImport(specifier);
};
