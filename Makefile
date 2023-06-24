export PATH := ${PWD}/node_modules/.bin:${PATH}
SRC := ${shell find src/}

.PHONY: clean watch

lib/.tested: lib/
	deno test --allow-read=.
	fdt lib/**/*.test.js
	@touch lib/.tested

lib/: ${SRC} node_modules/
	deno lint
	src/cli.ts
	@touch lib/

node_modules/: *.json
	npm install --ignore-scripts
	scripts/pretest.ts
	@touch node_modules/

watch:
	deno test --allow-read=. --quiet --watch

clean:
	@touch package-lock.json
	@git clean -fXde !node_modules/
