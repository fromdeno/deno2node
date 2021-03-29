deno run \
  --unstable \
  --allow-read='.' \
  --allow-write='lib/' \
  src/scripts/bootstrap_node_build.ts \
  src/tsconfig.json \
  lib/
