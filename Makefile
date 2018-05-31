BIN:=node_modules/.bin

test:
	$(BIN)/eslint *.js

publish:
	if git ls-remote --exit-code origin &>/dev/null; then git push -u -f --tags origin master; fi
	if git ls-remote --exit-code git &>/dev/null; then git push -u -f --tags git master; fi
	npm publish

update:
	$(BIN)/updates -u
	rm -rf node_modules
	yarn --no-lockfile

npm-patch:
	npm version patch

npm-minor:
	npm version minor

npm-major:
	npm version major

patch: lint test npm-patch publish
minor: lint test npm-minor publish
major: lint test npm-major publish

.PHONY: lint test publish update npm-patch npm-minor npm-major patch minor major
