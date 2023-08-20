.PHONY: all
all: static/style.css static/petit-dom

.PHONY: serve
serve:
	php -S localhost:8000

static/petit-dom: node_modules
	mkdir -p static/petit-dom
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/h.js" > "static/petit-dom/h.js"
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/vdom.js" > "static/petit-dom/vdom.js"
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/utils.js" > "static/petit-dom/utils.js"

static/style.css: static_src/style.scss static_src/scss/*.scss node_modules
	npx sass --no-source-map --no-error-css $< $@

node_modules/petit-dom/src/%.js: node_modules

node_modules: package.json
	npm install
	touch node_modules

.PHONY: clean
clean:
	rm -rf static/style.css static/petit-dom node_modules
