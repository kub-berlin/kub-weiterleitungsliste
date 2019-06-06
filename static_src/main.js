var _ = require('./helpers');
var template = require('./template');
var createApp = require('./app');

var baseTitle = document.title;

var extractJSON = function(response) {
    return response.ok ? response.json() : Promise.reject(response);
};

// helpers
/** Get `entries` and `categories` from the server. */
var updateModel = function() {
    return fetch('api.php', {
        credentials: 'same-origin',
    }).then(extractJSON).then(function(entries) {
        var model = {
            entries: entries,
            categories: [],
        };

        entries.forEach(function(entry) {
            var category = _.findByKey(model.categories, entry.category);
            if (!category) {
                category = {
                    key: entry.category,
                    children: [],
                };
                model.categories.push(category);
            }

            if (!_.findByKey(category.children, entry.subcategory)) {
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

var getPath = function() {
    var path = location.hash.substr(2).split('/');
    return {
        view: path[0] || 'list',
        id: path[1],
    };
};

var getTitle = function(state) {
    var stack = [baseTitle];

    if (state.view === 'list') {
        // do nothing
    } else if (state.view === 'detail') {
        var entry = _.findByKey(state.entries, state.id, 'id');
        stack.push(entry.name || '404');
    } else if (state.view === 'edit') {
        stack.push('edit');
    } else if (state.view === 'create') {
        stack.push('create');
    } else {
        stack.push('error');
    }

    return stack.join(' - ');
};


// events
var onFilter = function(event, state) {
    state.q = event.target.value;
    return state;
};

var onFilterAll = function(event, state) {
    event.preventDefault();
    var key = event.target.parentElement.dataset.name;
    var category = _.findByKey(state.categories, key);
    var cats = category ? [category] : state.categories;
    cats.forEach(function(cat) {
        cat.children.forEach(function(subcategory) {
            subcategory.active = event.target.classList.contains('js-all');
        });
    });
    return state;
};

var onFilterChange = function(event, state) {
    var subkey = event.target.name;
    var key = event.target.parentElement.parentElement.parentElement.parentElement.dataset.name;
    var subcategory = _.findByKey(_.findByKey(state.categories, key).children, subkey);
    subcategory.active = event.target.checked;
    return state;
};

var onPopState = function(event, state) {
    var newState = Object.assign({}, state, getPath());
    if (state.view !== newState.view) {
        if (newState.view === 'list') {
            newState.$scrollTop = state._listScrollTop;
        } else {
            newState.$scrollTop = 0;
        }
        if (state.view === 'list') {
            newState._listScrollTop = scrollY;
        }
    }
    document.title = getTitle(newState);
    return newState;
};

var onSubmit = function(event, state, app) {
    event.preventDefault();

    // prevent double-submit
    var submit = event.target.querySelector('button');
    submit.disabled = true;

    var data = {};

    // HACK: These inputs are not synced with the vdom.
    // They are overwritten as long as the vdom does not change.
    var keys = ['name', 'gender', 'email', 'phone', 'availability', 'lang', 'note', 'rev'];
    keys.forEach(function(key) {
        data[key] = app.getValue(key);
    });

    var categoryParts = app.getValue('category').split('--');
    data.category = categoryParts[0];
    data.subcategory = categoryParts[1] || app.getValue('subcategory');

    if (app.getValue('id')) {
        data.id = app.getValue('id');
    }

    return fetch('api.php', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'same-origin',
    }).then(extractJSON).then(function(result) {
        return updateModel().then(function(model) {
            history.pushState(null, null, '#!detail/' + result.id);
            return onPopState(null, Object.assign({}, state, model));
        });
    }).catch(function(err) {
        console.error(err);
    });
};

var onDelete = function(event, state) {
    event.preventDefault();
    if (confirm('Wirklich löschen?')) {
        return fetch('api.php', {
            method: 'POST',
            body: JSON.stringify({
                id: state.id,
            }),
            credentials: 'same-origin',
        })
        .then(extractJSON)
        .then(updateModel)
        .then(function(model) {
            history.pushState(null, null, '#!list');
            return onPopState(null, Object.assign({}, state, model));
        }).catch(function(err) {
            console.error(err);
        });
    }
};

var onCategoryChange = function(event, state, app) {
    var parts = app.getValue('category').split('--');
    state.subcategory = parts[1];
    return state;
};


// main
var app = createApp(template);

app.bindEvent('.filter', 'change', onFilter);
app.bindEvent('.filter', 'search', onFilter);
app.bindEvent('.filter', 'keyup', onFilter);
app.bindEvent('form', 'submit', onSubmit);
app.bindEvent('.delete', 'click', onDelete);
app.bindEvent('textarea', 'init', resize);
app.bindEvent('textarea', 'change', resize);
app.bindEvent('textarea', 'keydown', resize);
app.bindEvent('.category-filters .js-all', 'click', onFilterAll);
app.bindEvent('.category-filters .js-none', 'click', onFilterAll);
app.bindEvent('.category-filters input[type=checkbox]', 'change', onFilterChange);
app.bindEvent('[name=category]', 'change', onCategoryChange);
app.bindEvent('[name=category]', 'init', onCategoryChange);
app.bindEvent(window, 'popstate', onPopState);

updateModel().then(function(model) {
    app.init(Object.assign({}, model, getPath()), document.body);
});
