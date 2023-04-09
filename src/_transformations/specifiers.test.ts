import fc from "https://cdn.skypack.dev/fast-check@3.8.0?dts";
import { transpileSpecifier } from "./specifiers.ts";

const empty = fc.constant("");
const join = (array: unknown[]) => array.join("");
const relativePrefix = fc.constantFrom(".", "..");
const version = fc.webSegment().map((s) => s ? `@${s}` : "");
const path = fc.webPath().filter((s) => /^\/[\w/.-]+$/.test(s));
const name = fc.stringOf(fc.char().filter((c) => /[\w.-]/.test(c)));
const query = fc.oneof(empty, fc.webQueryParameters().map((s) => `?${s}`));

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
      relativePrefix,
      fc.webPath(),
      (prefix, path) =>
        transpileSpecifier(`${prefix}/${path}.deno.ts`) ===
          `${prefix}/${path}.node.js`,
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
