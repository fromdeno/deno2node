#!/bin/bash
set -eu

export PATH="$PWD/node_modules/.bin:$PATH"
export DENO_NO_PACKAGE_JSON=1

if npm outdated ts-morph --json | jq --exit-status '."ts-morph" | .latest == .wanted' >/dev/null; then
  echo 'ts-morph already up to date.'
  exit
fi

cp package.json package.json~

oldTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"
npm install --save-dev --save-prefix='~' deno-bin@latest
newTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"

if [ "$oldTsVersion" == "$newTsVersion" ]; then
  echo 'Deno already up to date.'
  mv package.json~ package.json
  exit
fi

npm install-test ts-morph@latest
tsMorphTsVersion=$(node --print 'require("ts-morph").ts.version.match(/^\d+\.\d+/, "")[0]')

if [[ "$tsMorphTsVersion" != "$newTsVersion" ]]; then
  echo "TypeScript version mismatch! Deno's: $newTsVersion, ts-morph's: $tsMorphTsVersion"
  exit 1
fi

git add src/deps.deno.ts

npm version minor --force --message "Upgrade to TypeScript ${newTsVersion}"

rm package.json~
