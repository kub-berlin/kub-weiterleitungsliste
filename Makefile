all: static/main.js static/style.css

static/main.js: static_src/main.js static_src/*.js node_modules
	npx browserify $< -o $@

static/style.css: static_src/style.scss static_src/scss/*.scss node_modules
	sassc $< $@

node_modules: package.json
	npm install
	touch node_modules
