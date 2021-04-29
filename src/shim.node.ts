// Node-only, see https://github.com/wojpawlik/deno2node/#preparing-your-project
// deno-lint-ignore-file
export const Deno = {
  exit: process.exit,
  args: process.argv.slice(2),
};
