<!-- deno-fmt-ignore-file -->
# deno2node

Transpiles Deno projects into `.js` and `.d.ts` for Node.js.

## Motivation

> Deno provides the superior developer experience:
> it requires no explicit transpilation step,
> and ships with 0conf tooling that works well together.
>
> We \[https://fromdeno.org\]
> prefer to write code targeting Deno,
> and use tools to create the Node.js variant,
> rather than vice-versa.

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

[API reference]: https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts
[`deps.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/deps.node.ts
[`shim.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/shim.node.ts
