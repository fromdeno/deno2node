# deno2node

Drop-in `tsc` replacement for transpiling [Deno] libraries to run on [Node.js].
Essentially a thin wrapper around `tsc` to work on Deno code.

![Because Deno's tooling is way simpler than
Node's](https://pbs.twimg.com/media/FBba11IXMAQB7pX?format=jpg)

## Quick Setup

> If you don't already have a `package.json`, you may find [`dnt`] easier to
> use.

Run `npx deno2node --init` in an empty directory.

## CLI Usage From Node.js

First, install `deno2node`.

```sh
npm install --save-dev deno2node
```

Next, run it with `npx`:

```sh
npx deno2node
```

It is useful to put `deno2node` in a prepare script. You can configure this by
running the following command.

```sh
npm set-script prepare deno2node
```

You can now simply run

```sh
npm run prepare
```

to run `deno2node`. In addition, this will be executed automatically when you
run `npm install`.

## CLI Usage From Deno

`deno2node` is actually a Deno project that compiles itself to run on Node.js.
(This is a great way to test the tool, too.)

```sh
deno run --no-prompt --allow-read=. --allow-write=. \
  https://deno.land/x/deno2node/src/cli.ts
```

## How It Works

There are three main steps to this.

1. Transform the code base in-memory, by rewriting all import statements.
2. Typecheck the code.
3. Emit `.js` and `.d.ts` files. These files can directly be run by Node or
   published on npm.

`deno2node` uses [`ts-morph`] under the hood, which in turn builds on top of the
TypeScript compiler `tsc`. Hence, you get the same behaviour as if you had
developed your code directly for Node.

`deno2node` can perform more powerful transpilation steps that make it flexible
enough for most needs.

### Shimming

Some things are global in Deno, but not in Node.js. One example for this is
`fetch`. Consequently, you need to _shim_ them, i.e. provide code that
supplements the missing globals.

> Note that `deno2node` does not actually touch global definitions. Instead, it
> only injects import statements in the respective modules.

Install the packages providing the shims.

Now, create a file that exports the globals you need:

```ts
// @filename: src/shim.node.ts
export { Blob } from "buffer";
export { webcrypto as crypto } from "crypto";

export { fetch, File, FormData, Headers, Request, Response } from "undici";
export { Deno } from "@deno/shim-deno";
export { alert, confirm, prompt } from "@deno/shim-prompts";
```

Lastly, you need to register your shims in `tsconfig.json` so `deno2node` can
inject them for you:

```jsonc
// @filename: tsconfig.json
{
  "deno2node": {
    "shim": "src/shim.node.ts" // path to shim file, relative to tsconfig
  }
}
```

### Runtime-specific code

In same cases you may want to have two different implementations, depending on
whether you're running on Deno or on Node. When shimming is not enough, you can
provide a Node-specific `<anything>.node.ts` and a Deno-specific
`<anything>.deno.ts` version of any file. They need to reside next to each other
in the same directory.

`deno2node` will ignore the Deno version and rewrite imports to use the Node.js
version instead. Thus, the Deno-specific file will not be part of the build
output.

For example, provide `greet.deno.ts` for Deno:

```ts
// @filename: src/greet.deno.ts
export function greet() {
  console.log("Hello Deno!");
  // access Deno-specific APIs here
}
```

Now, provide `greet.node.ts` for Node:

```ts
// @filename: src/greet.node.ts
export function greet() {
  console.log("Hello Node!");
  // access Node-specific APIs here
}
```

Finally, use it in `foo.ts`:

```ts
import { greet } from "./platform.deno.ts";

// Prints "Hello Deno!" on Deno,
// and "Hello Node!" on Node:
greet();
```

This technique has many uses. `deno2node` itself uses it to import from
https://deno.land/x. The Telegram bot framework [`grammY`] uses it to abstract
away platform-specific APIs.

### Vendoring

To import a module which has no npm equivalent, first set up `vendorDir`.

```jsonc
// @filename: tsconfig.json
{
  "deno2node": {
    "vendorDir": "src/vendor/" // path within `rootDir`
  }
}
```

Then, populate it: `deno vendor src/deps.vendor.ts --output src/vendor/`.

Vendoring is still experimental, so be welcome to open an issue if you encounter
a problem with it!

Also, consider recommending [`pnpm`] to users of your library. It might be able
to deduplicate vendored files across packages.

## API

Confer the automatically generated [API Reference] if you want to use
`deno2node` from code.

## Versioning

Similar to `tsc`, new features or TypeScript upgrades may alter output or
diagnostics of the CLI across minor versions. While this usually does not break
anything, you may still want to pin the minor version, hence only allowing patch
updates. You can do this by adding a `~` prefix to the version in your
`package.json` file.

```sh
npm install --save-dev --save-prefix='~' deno2node
```

[deno]: https://deno.land/
[node.js]: https://nodejs.org/
[`dnt`]: https://github.com/denoland/dnt
[`grammy`]: https://github.com/grammyjs/grammY
[`pnpm`]: https://github.com/pnpm/pnpm#background
[`ts-morph`]: https://github.com/dsherret/ts-morph
[api reference]: https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts
