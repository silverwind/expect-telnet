lint:
	node_modules/.bin/eslint --color --quiet *.js

test:
	$(MAKE) lint

publish:
	git push -u --tags origin master
	npm publish

update:
	node_modules/.bin/updates -u
	rm -rf node_modules
	yarn

npm-patch:
	npm version patch

npm-minor:
	npm version minor

npm-major:
	npm version major

patch: lint npm-patch publish
minor: lint npm-minor publish
major: lint npm-major publish

.PHONY: lint publish update npm-patch npm-minor npm-major patch minor major
