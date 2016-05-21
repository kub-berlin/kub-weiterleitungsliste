var xhr = require('promise-xhr');
var virtualDom = require('virtual-dom');

var template = require('./template');


// globals
var element;
var tree;
var listScrollTop;
var model = {
    entries: [],
    categories: [],
    q: null,
};

var update;
var onNavigate;


// helpers
var findByKey = function(list, key) {
    var i = list.map(function(x) {return x.key;}).indexOf(key);
    return list[i];
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
    onNavigate();
    var url = location.pathname + location.search + '#!' + path;
    if (replace) {
        history.replaceState(null, null, url);
    } else {
        history.pushState(null, null, url);
    }
    window.dispatchEvent(new Event('popstate'));
};

/** Update `model` from the server. */
var updateModel = function() {
    return xhr.getJSON('api.php').then(function(entries) {
        model.entries = entries;
        model.categories = [];

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];

            var category = findByKey(model.categories, entry.category);
            if (!category) {
                category = {
                    key: entry.category,
                    children: [],
                };
                model.categories.push(category);
            }

            if (!findByKey(category.children, entry.subcategory)) {
                category.children.push({
                    key: entry.subcategory,
                    active: true,
                });
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

var getPath = function() {
    var path = location.hash.substr(2).split('/');
    path[0] = path[0] || 'list';
    return path;
};


// events
onNavigate = function() {
    if (getPath()[0] === 'list') {
        listScrollTop = scrollY;
    }
};

var onFilter = function(event) {
    model.q = event.target.value;
    update();
};

var onFilterAll = function(event) {
    event.preventDefault();
    var key = event.target.parentElement.dataset.name;
    var category = findByKey(model.categories, key);
    var cats = category ? [category] : model.categories;
    cats.forEach(function(category) {
        category.children.forEach(function(subcategory) {
            subcategory.active = event.target.className === 'all';
        });
    });
    update();
};

var onFilterChange = function(event) {
    var subkey = event.target.name;
    var key = event.target.parentElement.parentElement.parentElement.parentElement.dataset.name;
    var subcategory = findByKey(findByKey(model.categories, key).children, subkey);
    subcategory.active = event.target.checked;
    update();
};

var onSubmit = function(event) {
    event.preventDefault();

    // prevent double-submit
    var submit = event.target.querySelector('input[type=submit]');
    submit.disabled = true;

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

    for (var i = 0; i < model.categories.length; i++) {
        var category = model.categories[i];
        if (findByKey(category.children, getValue('subcategory'))) {
            data.category = category.key;
        }
    }

    if (getValue('id')) {
        data.id = getValue('id');
    }

    xhr.post('api.php', JSON.stringify(data)).then(function(result) {
        return updateModel().then(function() {
            var r = JSON.parse(result);
            link('detail/' + r.id);
        });
    }).catch(function(err) {
        // FIXME handle error
    });
};

var onDelete = function(event) {
    event.preventDefault();
    if (confirm("Wirklich löschen?")) {
        xhr.post('api.php', JSON.stringify({
            id: getPath()[1],
        })).then(updateModel).then(function() {
            link('list');
        }).catch(function(err) {
            // FIXME handle error
        });
    }
};

var attachEventListeners = function() {
    attachEventListener('.filter', 'change', onFilter);
    attachEventListener('.filter', 'search', onFilter);
    attachEventListener('.filter', 'keyup', onFilter);
    attachEventListener('form', 'submit', onSubmit);
    attachEventListener('.delete', 'click', onDelete);
    attachEventListener('textarea', 'init', resize);
    attachEventListener('textarea', 'change', resize);
    attachEventListener('textarea', 'keydown', resize);
    attachEventListener('.category-filters .all', 'click', onFilterAll);
    attachEventListener('.category-filters .none', 'click', onFilterAll);
    attachEventListener('.category-filters input[type=checkbox]', 'change', onFilterChange);
    attachEventListener('[href^="#"]', 'click', onNavigate);
};


// main
updateModel().then(function() {
    tree = template(model, getPath());
    element = virtualDom.create(tree);
    attachEventListeners();
    document.body.innerHTML = '';
    document.body.appendChild(element);
});

update = function() {
    var newTree = template(model, getPath());
    var patches = virtualDom.diff(tree, newTree);
    virtualDom.patch(element, patches);
    attachEventListeners();
    tree = newTree;
};

window.addEventListener('popstate', function() {
    update();
    scrollTo(0, getPath()[0] === 'list' ? listScrollTop : 0);
});
