<!-- deno-fmt-ignore-file -->
# deno2node

Transpiles Deno projects into `.js` and `.d.ts` for Node.js.

Uses [`ts-morph`] to rewrite imports, typecheck, and emit.

## Motivation

Writing libraries Deno-first
makes it easy to publish to https://deno.land/x,
and simplifies development experience:

> Deno \[...\] requires no explicit transpilation step,
> and ships with 0conf tooling that works well together.

## CLI Usage

```sh
$ deno run \
  --no-check \
  --unstable  \
  --allow-read \
  --allow-write  \
  https://deno.land/x/deno2node/src/cli.ts \
  <tsConfigFilePath>
```

<!-- deno-fmt-ignore -->
As a by-product of end-to-end testing,
Node.js build is also available:

```sh
$ npm install --save-dev --save-prefix='~' deno2node
```

```sh
$ deno2node <tsConfigFilePath>
```

`tsconfig.json` is used to specify `compilerOptions` and source `files` to `include`.

[API reference] explains transformations and configuration.

Note: output and diagnostics will change across minor versions.

### Shimming

To use Deno globals not available in Node.js,
create and register a file exporting all the shims you need:

```js
// @filename: src/shim.node.ts
export * from "deno.ns";
export * from "node-fetch";
export { default as fetch } from "node-fetch";
```

```jsonc
// @filename: tsconfig.json
{
  "deno2node": {
    "shim": "src/shim.node.ts" // path to shim file, relative to tsconfig
  }
}
```

### Runtime-specific code

When the provided transformations are not enough,
you can provide a Node-specific (`<anything>.node.ts`)
and a Deno-specific (`<anything>.deno.ts`) version of any file.

`deno2node` will ignore the Deno version
and rewrite imports to use the Node.js version instead.

This technique has many uses.
`deno2node` uses it to import from https://deno.land/x.
[`grammy`] will probably also use it to abstract away platform-specific APIs.

[`grammY`]: https://github.com/grammyjs/grammY
[`ts-morph`]: https://github.com/dsherret/ts-morph
[API reference]: https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts
[`deps.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/deps.node.ts
[`shim.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/shim.node.ts
