.PHONY: all
all: dist/static/style.css dist/static/petit-dom

.PHONY: serve
serve:
	php -S localhost:8000

dist/static/petit-dom: node_modules
	mkdir -p static/petit-dom
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/h.js" > "static/petit-dom/h.js"
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/vdom.js" > "static/petit-dom/vdom.js"
	sed 's/^\(import .* from "[^"]*\)/\1.js/' "node_modules/petit-dom/src/utils.js" > "static/petit-dom/utils.js"

dist/static/style.css: style.css node_modules
	cat node_modules/mfbs/css/base.css node_modules/mfbs/css/form.css $< > $@

node_modules: package.json
	npm install
	touch node_modules

.PHONY: clean
clean:
	rm -rf dist/static/style.css dist/static/petit-dom node_modules
