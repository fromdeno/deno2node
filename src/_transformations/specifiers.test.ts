import fc from "https://esm.sh/fast-check@3.10.0";
import { name, services, transpileSpecifier } from "./specifiers.ts";

const join = (array: string[]) => array.join("");
const relativePrefix = fc.constantFrom("./", "../");
const extension = fc.constantFrom("js", "ts", "jsx", "tsx");
const version = fc.webSegment().map((s) => s ? `@${s}` : "");
const relativePath = fc.tuple(relativePrefix, fc.webPath()).map(join);

const urlSegments = fc.tuple(
  fc.constantFrom(...services),
  fc.stringMatching(name),
  version,
  fc.option(fc.webPath(), { nil: "" }),
  fc.webQueryParameters().map((s) => s ? `?${s}` : ""),
);

Deno.test(function localSpecifiers() {
  fc.assert(
    fc.property(
      relativePath,
      extension,
      (path, ext) =>
        transpileSpecifier(`${path}.deno.m${ext}`) === `${path}.node.mjs` &&
        transpileSpecifier(`${path}.deno.${ext}`) === `${path}.node.js`,
    ),
  );
});

Deno.test(function remoteSpecifiers() {
  fc.assert(
    fc.property(urlSegments, (segments) => {
      const [, scopedPackage, , path] = segments;
      return transpileSpecifier(join(segments)) === scopedPackage + path;
    }),
  );
});
