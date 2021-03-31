# deno2node

<a href="https://doc.deno.land/https/raw.githubusercontent.com/wojpawlik/deno2node/main/src/mod.ts"><img src="https://doc.deno.land/badge.svg" alt="deno doc"></a>

Transpiles Deno projects into `.js` and `.d.ts` for Node.js.

## Preparing your project

Rename `deps.ts` to `deps.deno.ts`, create corresponding `deps.node.ts`.

## Usage from Node.js

```sh
$ npm install --save-dev deno2node
```

```sh
$ deno2node <tsConfigFilePath>
```

## Usage from Deno

```sh
$ deno run --unstable --allow-read --allow-write <src/cli.ts> <tsConfigFilePath>
```
