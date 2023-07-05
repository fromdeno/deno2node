#!/bin/bash
set -eu

export PATH="$PWD/node_modules/.bin:$PATH"
export NPM_CONFIG_COMMIT_HOOKS=false

git diff --quiet || {
  echo 'Stash or stage all changes.'
  exit 2
}

if npm outdated ts-morph --json | jq --exit-status '."ts-morph" | .latest == .wanted' >/dev/null; then
  echo 'ts-morph already up to date.'
  exit
fi

npm install --ignore-scripts
oldTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"
npm install --save-dev --save-prefix='~' deno-bin@latest
newTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"

if [ "$oldTsVersion" == "$newTsVersion" ]; then
  echo 'Deno already up to date.'
  git restore 'package*.json'
  exit
fi

npm install-test ts-morph@latest
! git diff --quiet src/deps.deno.ts
src/cli.ts --noEmit
tsMorphTsVersion=$(node --print 'require("ts-morph").ts.version.match(/^\d+\.\d+/, "")[0]')

if [[ "$tsMorphTsVersion" != "$newTsVersion" ]]; then
  echo "TypeScript version mismatch! Deno's: $newTsVersion, ts-morph's: $tsMorphTsVersion"
  exit 1
fi

git add src/deps.deno.ts

npm version minor --force --message "Upgrade to TypeScript ${newTsVersion}"
