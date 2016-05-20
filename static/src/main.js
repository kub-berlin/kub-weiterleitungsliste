var xhr = require('promise-xhr');
var virtualDom = require('virtual-dom');

var template = require('./template');


// globals
var element;
var tree;
var entries;
var categories;
var languages;


var findByKey = function(list, key) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].key === key) {
            return list[i];
        }
    }
};

/** Add event listener to all elements matching `selector` inside `element`. */
var attachEventListener = function(selector, eventName, fn) {
    var elements = element.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        if (eventName === 'init') {
            fn({target: elements[i]});
        } else {
            elements[i].addEventListener(eventName, fn);
        }
    }
};

/** Get value of form input. */
var getValue = function(name) {
    var el = element.querySelector('[name=' + name + ']');
    return el ? el.value : null;
};

/** Change URL from JavaScript. */
var link = function(path, replace) {
    var url = location.pathname + location.search + '#!' + path;
    if (replace) {
        history.replaceState(null, null, url);
    } else {
        history.pushState(null, null, url);
    }
    window.dispatchEvent(new Event('popstate'));
};

/** Update `entries` from the server. */
var updateEntries = function() {
    return xhr.getJSON('api.php').then(function(data) {
        entries = data;
        categories = [];
        languages = [];

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];

            var category = findByKey(categories, entry.category);
            if (!category) {
                category = {
                    key: entry.category,
                    children: [],
                };
                categories.push(category);
            }

            if (!findByKey(category.children, entry.subcategory)) {
                category.children.push({
                    key: entry.subcategory,
                    active: true,
                });
            }

            var l = entry.lang.split(/, /g);
            for (var j = 0; j < l.length; j++) {
                if (l[j] && languages.indexOf(l[j]) === -1) {
                    languages.push(l[j]);
                }
            }
        }
    });
};

/** Autoresize text areas. */
// https://stackoverflow.com/questions/454202
var resize = function(event) {
    /* 0-timeout to get the already changed text */
    setTimeout(function() {
        event.target.style.height = 'auto';
        event.target.style.height = event.target.scrollHeight + 5 + 'px';
    }, 0);
};


// events
var onFilter = function(event) {
    link('list/' + event.target.value, true);
};

var onSubmit = function(event) {
    event.preventDefault();

    var data = {
        name: getValue('name'),
        subcategory: getValue('subcategory'),
        address: getValue('address'),
        openinghours: getValue('openinghours'),
        contact: getValue('contact'),
        lang: getValue('lang'),
        note: getValue('note'),
        rev: getValue('rev'),
    };

    for (var i = 0; i < categories.length; i++) {
        if (findByKey(categories[i].children, getValue('subcategory'))) {
            data.category = categories[i].key;
        }
    }

    if (getValue('id')) {
        data.id = getValue('id');
    }

    xhr.post('api.php', JSON.stringify(data)).then(function(result) {
        return updateEntries().then(function() {
            var r = JSON.parse(result);
            link('detail/' + r.id);
        });
    }).catch(function(err) {
        // FIXME handle error
    });
};

var onBack = function(event) {
    if (history.length > 2) {
        event.preventDefault();
        history.back();
    }
};

var attachEventListeners = function() {
    attachEventListener('.filter', 'change', onFilter);
    attachEventListener('.filter', 'search', onFilter);
    attachEventListener('.filter', 'keyup', onFilter);
    attachEventListener('form', 'submit', onSubmit);
    attachEventListener('.back', 'click', onBack);
    attachEventListener('textarea', 'init', resize);
    attachEventListener('textarea', 'change', resize);
    attachEventListener('textarea', 'cut', resize);
    attachEventListener('textarea', 'paste', resize);
    attachEventListener('textarea', 'drop', resize);
    attachEventListener('textarea', 'keydown', resize);
};


// main
var buildTree = function() {
    var loc = location.hash.substr(2).split('/');
    return template(entries, categories, languages, loc[0] || 'list', loc[1]);
};

updateEntries().then(function() {
    tree = buildTree();
    element = virtualDom.create(tree);
    attachEventListeners();
    document.body.innerHTML = '';
    document.body.appendChild(element);
});

var update = function() {
    var newTree = buildTree();
    var patches = virtualDom.diff(tree, newTree);
    virtualDom.patch(element, patches);
    attachEventListeners();
    tree = newTree;
};

window.addEventListener('popstate', update, false);
