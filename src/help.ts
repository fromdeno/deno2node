export function getHelpText(version: string) {
  return `\
deno2node: Compile Deno code for Node - Version ${version}

${bold("COMMON COMMANDS")}

  ${blue("deno2node")}
  Compiles the current project (tsconfig.json in the working directory.)

  ${blue("deno2node --project <tsconfig.json>")}
  Compiles the current project with the specified tsconfig.json file.

  ${blue("deno2node --init")}
  Creates a tsconfig.json with the recommended settings in the working directory.

${bold("COMMAND LINE FLAGS")}

${blue("     --help, -h  ")}Print this message.

${blue("  --version, -v  ")}Print the CLI's version.

${blue("         --init  ")}Initializes a deno2node project \
and creates a tsconfig.json file.

You can learn about the compiler options at https://aka.ms/tsc
`;
}

export const useColors = Deno.stdout.isTerminal() && !Deno.noColor;

function bold(text: string) {
  return format(text, 1);
}
function blue(text: string) {
  return format(text, 34);
}
function format(text: string, ansi: number) {
  return useColors ? `\u001b[${ansi}m${text}\u001b[0m` : text;
}
