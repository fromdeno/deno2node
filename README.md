# deno2node

<a href="https://doc.deno.land/https/raw.githubusercontent.com/wojpawlik/deno2node/main/src/mod.ts"><img src="https://doc.deno.land/badge.svg" alt="deno doc"></a>

Transpiles Deno projects into `.js` and `.d.ts` for Node.js.

## Preparing your project

Rename `deps.ts` to `deps.deno.ts`, create corresponding [`deps.node.ts`].

<!-- deno-fmt-ignore -->
If you're using some Deno globals not available in Node (`Deno`, `fetch`...),
export their shims from [`shim.node.ts`],
and add the following to your `tsconfig.json`:

```jsonc
// tsconfig.json
{
  "deno2node": {
    "shim": "src/shim.node.ts"
  }
}
```

## Usage from Node.js

```sh
$ npm install --save-dev deno2node
```

```sh
$ deno2node <tsConfigFilePath>
```

## Usage from Deno

```sh
$ deno run --unstable --allow-read --allow-write https://raw.githubusercontent.com/wojpawlik/deno2node/v0.3.0/src/cli.ts <tsConfigFilePath>
```

[`deps.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/deps.node.ts
[`shim.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/shim.node.ts
