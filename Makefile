.PHONY: all
all: static/main.js static/style.css

.PHONY: serve
serve:
	php -S localhost:8000

static/main.js: static_src/main.js static_src/*.js node_modules
	npx browserify $< -o $@

static/style.css: static_src/style.scss static_src/scss/*.scss node_modules
	npx sass --no-error-css $< $@

node_modules: package.json
	npm install
	touch node_modules
