#!/bin/bash
set -eu

export NPM_CONFIG_COMMIT_HOOKS=false

git diff --quiet || {
  echo 'Stash or stage all changes.'
  exit 2
}

if npm outdated ts-morph --json | jq --exit-status '."ts-morph" | .latest == .wanted' >/dev/null; then
  echo 'ts-morph already up to date.'
  exit 0
fi

npm install --save-dev --save-prefix='~' deno-bin@latest
npm install-test ts-morph@latest
! git diff --quiet src/deps.deno.ts

newTsVersion=$(scripts/ts-version.ts || exit 0)
npm run prepare
lib/cli.js --noEmit

git add src/deps.deno.ts
npm version minor --force --message "Upgrade to TypeScript ${newTsVersion}"
