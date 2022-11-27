#!/bin/bash
set -eu

export PATH="$PWD/node_modules/.bin:$PATH"

cp package.json package.json~

oldTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"
npm install --save-dev --save-prefix='~' 'deno-bin@*'
newTsVersion="$(deno eval --print 'Deno.version.typescript.match(/^\d+\.\d+/, "")[0]')"

if [ "$oldTsVersion" == "$newTsVersion" ]; then
  echo 'Already up to date.'
  mv package.json~ package.json
  exit
fi

npm install-test 'ts-morph@*'
git add src/deps.deno.ts

npm version minor --force --message "Upgrade to TypeScript ${newTsVersion}"

rm package.json~
