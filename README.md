# deno2node

Compile your [Deno] project to run on [Node.js].

## CLI Usage from Deno

No installation needed. Simply `cd` into the directory of your project, and run:

```sh
deno run --no-check --allow-read=. --allow-write=. \
    https://deno.land/x/deno2node/src/cli.ts <tsConfigFilePath>
```

You need to substitute `<tsConfigFilePath>` by a path to your `tsconfig.json`
file. `deno2node` passes it on to the shipped `tsc` for compiling your code.

## CLI Usage from Node.js

As a by-product of end-to-end testing, a Node.js build is also available:

```sh
npm install --save-dev --save-prefix='~' deno2node
```

Now add a script to `package.json` so you can run it with `npm run build`:

```jsonc
{
  // yada yada ...
  "scripts": {
    "build": "deno2node <tsConfigFilePath>"
  }
}
```

Instead of adding a script, you can also run it directly:

```sh
npx deno2node <tsConfigFilePath>
```

## Motivation

Writing code for Deno is fun. It's so much simpler.

If you have tried it, you know what we mean.

If not, here is how you develop for Deno: Don't wait for TypeScript to
transpile. Just run it. Don't wait for unit tests. They are truly fast. Linting?
It is always instant. Zero configuration files. The tooling is standardised,
built-in, and works well together. No `package.json` to tediously fill out. No
more “did you try `rm -rf node_modules`?” Everything just works out of the box.
What a relief.

Try it, and you will know what we mean.

## How it Works

There are three main steps to this.

1. Transform the code base. This means:
   - Rewrite all import statements, e.g. to handle explicit vs. implicit file
     extensions
   - Reverse npm package transformations from `skypack.dev`, `esm.sh`,
     `deno.land/std`, and `nest.land/std`.
2. Typecheck the code. You want that.
3. Emit `.js` and `.d.ts` files. These files can directly be run by Node or
   published on npm.

Note that `deno2node` does all of this in memory. It does not touch your source
files, and only writes the build artefacts to your disk.

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

For instance, you can use [`node-fetch`] as a substitue for the built-in `fetch`
of Deno.

```sh
npm install node-fetch
```

Now, create a file that exports the globals you need:

```ts
// src/shim.node.ts
export { default as fetch } from "node-fetch";

// more shims exported here
```

Lastly, you need to register your shims in `tsconfig.json` so `deno2node` can
inject them for you:

```jsonc
{
  "deno2node": {
    "shim": "src/shim.node.ts" // path to shim file, relative to tsconfig
  }
}
```

If you simply want to shim all Deno globals, you can install the `deno.ns`
package. Then do:

```ts
// src/shim.node.ts
export * from "deno.ns";
```

That package was specifically created for this use case.

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
// src/greet.deno.ts
export function greet() {
  console.log("Hello Deno!");
  // access Deno-specific APIs here
}
```

Now, provide `greet.node.ts` for Node:

```ts
// src/greet.node.ts
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
https://deno.land/x. The Telegram bot framework [`grammY`] uses it
to abstract away platform-specific APIs.

### Vendoring

If you import a module which has no npm equivalent, `deno2node` can extract the
code out of Deno's module cache. On Deno, this directory can be used for
vendoring (by specifying the `$DENO_DIR` environment variable), so `deno2node`
calls it `vendorDir`.

```jsonc
// tsconfig.json
{
  "deno2node": {
    "vendorDir": "src/.deno2node/vendor/" // path within `rootDir`
  }
}
```

> Note that vendoring requires `--allow-env` in order to locate Deno cache.

Vendoring is still experimental, so be welcome to open an issue if you encounter
a problem with it!

Also, consider recommending [`pnpm`] to users of your library. It might be able
to deduplicate vendored files across packages.

## API

Confer the automatically generated [API Reference] if you want to use
`deno2node` from code.

Note that updates to the `tsc` dependency will be performed in minor versions of
`deno2node`, so output and diagnostics will change across them.

[deno]: https://deno.land/
[node.js]: https://nodejs.org/
[`grammy`]: https://github.com/grammyjs/grammY
[`pnpm`]: https://github.com/pnpm/pnpm#background
[`ts-morph`]: https://github.com/dsherret/ts-morph
[`node-fetch`]: https://github.com/node-fetch/node-fetch
[api reference]: https://doc.deno.land/https/deno.land/x/deno2node/src/mod.ts
