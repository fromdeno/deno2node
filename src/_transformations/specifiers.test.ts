import fc from "https://cdn.skypack.dev/fast-check@3.8.0?dts";
import { transpileSpecifier } from "./specifiers.ts";

const join = (array: string[]) => array.join("");
const path = fc.option(fc.webPath(), { nil: "" });
const relativePrefix = fc.constantFrom("./", "../");
const extension = fc.constantFrom("js", "ts", "jsx", "tsx");
const version = fc.webSegment().map((s) => s ? `@${s}` : "");
const query = fc.webQueryParameters().map((s) => s ? `?${s}` : "");
const name = fc.stringOf(fc.char().filter((c) => /[\w.-]/.test(c)));
const relativePath = fc.tuple(relativePrefix, fc.webPath()).map(join);

const scopedPackage = fc.tuple(
  name.map((s) => s ? `@${s}/` : ""),
  name.filter(Boolean),
).map(join);

const service = fc.constantFrom(
  "npm:",
  "https://esm.sh/",
  "https://cdn.skypack.dev/",
);

Deno.test(function localSpecifiers() {
  fc.assert(
    fc.property(
      relativePath,
      extension,
      (path, ext) =>
        transpileSpecifier(`${path}.deno.${ext}`) === `${path}.node.js`,
    ),
  );
});

Deno.test(function remoteSpecifiers() {
  fc.assert(
    fc.property(service, scopedPackage, version, path, query, (...segments) => {
      const [, scopedPackage, , path] = segments;
      return transpileSpecifier(join(segments)) === scopedPackage + path;
    }),
  );
});
