var xhr = require('promise-xhr');
var virtualDom = require('virtual-dom');
var assign = require('lodash.assign');

var template = require('./template');


// globals
var element;
var tree;
var listScrollTop;
var state = {
    entries: [],
    categories: [],
    q: null,
};

var update;


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

/** Get `entries` and `categories` from the server. */
var updateModel = function() {
    return xhr.getJSON('api.php').then(function(entries) {
        var model = {
            entries: entries,
            categories: [],
        };

        entries.forEach(function(entry) {
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
        });

        return model;
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

var getPath = function(state) {
    var path = location.hash.substr(2).split('/');
    return {
        view: path[0] || 'list',
        id: path[1],
    };
};


// events
var onFilter = function(event) {
    state.q = event.target.value;
    update();
};

var onFilterAll = function(event) {
    event.preventDefault();
    var key = event.target.parentElement.dataset.name;
    var category = findByKey(state.categories, key);
    var cats = category ? [category] : state.categories;
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
    var subcategory = findByKey(findByKey(state.categories, key).children, subkey);
    subcategory.active = event.target.checked;
    update();
};

var onSubmit = function(event) {
    event.preventDefault();

    // prevent double-submit
    var submit = event.target.querySelector('input[type=submit]');
    submit.disabled = true;

    var data = {};

    var keys = ['name', 'subcategory', 'address', 'openinghours', 'contact', 'lang', 'note', 'rev'];
    keys.forEach(function(key) {
        data[key] = getValue(key);
    });

    for (var i = 0; i < state.categories.length; i++) {
        var category = state.categories[i];
        if (findByKey(category.children, getValue('subcategory'))) {
            data.category = category.key;
            break;
        }
    }

    if (getValue('id')) {
        data.id = getValue('id');
    }

    xhr.post('api.php', JSON.stringify(data)).then(function(result) {
        return updateModel().then(function(model) {
            var r = JSON.parse(result);
            history.pushState(null, null, '#!detail/' + r.id);
            assign(state, model);
            update();
        });
    }).catch(function(err) {
        // FIXME handle error
    });
};

var onDelete = function(event) {
    event.preventDefault();
    if (confirm("Wirklich löschen?")) {
        xhr.post('api.php', JSON.stringify({
            id: state.id,
        })).then(updateModel).then(function(model) {
            history.pushState(null, null, '#!list');
            assign(state, model);
            update();
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
};


// main
var beforeUpdate = function(oldState, newState) {
    if (newState.view !== oldState.view && oldState.view === 'list') {
        listScrollTop = scrollY;
    }
};

var afterUpdate = function(oldState, newState) {
    if (newState.view !== oldState.view) {
        scrollTo(0, newState.view === 'list' ? listScrollTop : 0);
    }
};

updateModel().then(function(model) {
    assign(state, model, getPath());
    tree = template(state);
    element = virtualDom.create(tree);
    attachEventListeners();
    document.body.innerHTML = '';
    document.body.appendChild(element);
});

update = function() {
    var newState = assign({}, state, getPath());
    beforeUpdate(state, newState);
    var newTree = template(newState);
    var patches = virtualDom.diff(tree, newTree);
    virtualDom.patch(element, patches);
    attachEventListeners();
    tree = newTree;
    afterUpdate(state, newState);
    state = newState;
};

window.addEventListener('popstate', update);
});
