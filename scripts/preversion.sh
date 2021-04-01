set -euo pipefail
IFS=$'\n\t'
sed -ri'' "s:/deno2node/[^/]+:/deno2node/v$npm_new_version:g" README.md
git add README.md
