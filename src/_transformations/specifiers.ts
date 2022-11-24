import XR from "https://cdn.skypack.dev/xregexp@5.1.0?dts";

const scopedPackage = /^(?:@[\w.-]+\/)?[\w.-]+$/;
const version = /^[^/?]+$/;

const services = [
  XR.tag("x")`^npm:	(${scopedPackage})(?:@${version})?$`,
  XR.tag(
    "x",
  )`^https://cdn\.skypack\.dev/	(${scopedPackage})(?:@${version})?\?`,
  XR.tag("x")`^https://esm\.sh/	(${scopedPackage})(?:@${version})?$`,
  XR.tag("x")`^https://deno\.land/	std(?:@${version})?/node/([\w/]+)\.ts$`,
  XR.tag("x")`^https://nest\.land/	std/node/${version}/([\w/]+)\.ts$`,
];

const transpileHttpsImport = (specifier: string) => {
  for (const service of services) {
    const match = service.exec(specifier);
    if (match) return match[1];
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
