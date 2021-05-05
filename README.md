# deno2node

<a href="https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts"><img src="https://doc.deno.land/badge.svg" alt="deno doc"></a>
<a href="https://discord.gg/SdVDrZDsW9"><img src="https://badgen.net/discord/members/SdVDrZDsW9?icon=discord" alt="discord"></a>

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

## CLI Usage

```sh
$ deno run \
  --no-check \
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

[`deps.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/deps.node.ts
[`shim.node.ts`]: https://github.com/wojpawlik/deno2node/blob/main/src/shim.node.ts
