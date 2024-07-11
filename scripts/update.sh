#!/bin/bash
set -eu

export NPM_CONFIG_COMMIT_HOOKS=false

git diff --quiet || {
  echo 'Stash or stage all changes.'
  exit 2
}

NPM_CONFIG_PACKAGE_LOCK_ONLY=1 \
npm query --expect-results '#ts-morph:outdated(major)' &>/dev/null || {
  echo 'ts-morph already up to date.'
  exit 0
}

NPM_CONFIG_PACKAGE_LOCK_ONLY=1 \
npm install --save-dev --save-prefix='~' deno-bin@latest
npm install-test ts-morph@latest
! git diff --quiet src/deps.deno.ts

tsVersion="$(scripts/ts-version.ts)" || exit 0
npm run prepare
lib/cli.js --noEmit

git add src/deps.deno.ts
npm version "${1:-minor}" --force --message "Upgrade to TypeScript $tsVersion"
