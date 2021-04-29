set -euo pipefail
IFS=$'\n\t'
sed -ri'' "s:/deno2node/[^/]/src/cli.ts:/deno2node/v$npm_new_version/src/cli.ts:g" README.md
git add README.md
