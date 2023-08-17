var _ = require('./helpers');
var template = require('./template');
var createApp = require('./app');

var baseTitle = document.title;

var extractJSON = function(response) {
    return response.ok ? response.json() : Promise.reject(response);
};

// helpers
/** Get `entries` and `categories` from the server. */
var updateModel = function(state) {
    return fetch('api.php', {
        credentials: 'same-origin',
    }).then(extractJSON).then(function(entries) {
        var model = {
            entries: entries,
            categories: [],
        };

        entries.forEach(function(entry) {
            entry.categories.forEach(function(c) {
                var category = _.findByKey(model.categories, c[0]);
                if (!category) {
                    category = {
                        key: c[0],
                        children: [],
                    };
                    model.categories.push(category);
                }

                if (!_.findByKey(category.children, c[1])) {
                    var active = true;
                    if (state) {
                        var oldCategory = _.findByKey(state.categories, c[0]);
                        if (oldCategory) {
                            var oldSubcategory = _.findByKey(oldCategory.children, c[1]);
                            if (oldSubcategory) {
                                active = oldSubcategory.active;
                            }
                        }
                    }

                    category.children.push({
                        key: c[1],
                        active: active,
                    });
                }
            });
        });

        return model;
    });
};

/** Autoresize text areas. */
// https://projects.verou.me/stretchy/
var resize = function(event) {
    event.target.style.height = '0';
    event.target.style.height = event.target.scrollHeight + event.target.offsetHeight + 'px';
};

var applyPath = function(state) {
    var path = location.hash.substr(2).split('/');
    var newState = Object.assign({}, state, {
        view: path[0] || 'list',
        id: path[1],
    });
    if (newState.view === 'edit') {
        var entry = _.findByKey(newState.entries, newState.id, 'id');
        newState.formCategories = entry.categories.slice();
    } else {
        newState.formCategories = [];
    }
    return newState;
};

var getTitle = function(state) {
    var stack = [baseTitle];

    if (state.view === 'list') {
        // do nothing
    } else if (state.view === 'detail' || state.view === 'client') {
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
    var key = event.target.dataset.category;
    var cats = key ? [_.findByKey(state.categories, key)] : state.categories;
    cats.forEach(function(cat) {
        cat.children.forEach(function(subcategory) {
            subcategory.active = event.target.classList.contains('js-all');
        });
    });
    return state;
};

var onFilterChange = function(event, state) {
    var parts = event.target.name.split('--');
    var subcategory = _.findByKey(_.findByKey(state.categories, parts[0]).children, parts[1]);
    subcategory.active = event.target.checked;
    return state;
};

var onNavigate = function(event, state) {
    var newState = applyPath(state);
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

    if (state.formCategories.length === 0) {
        alert('Bitte füge eine Rubrik hinzu!');
        return;
    }

    // prevent double-submit
    var submit = event.target.querySelector('nav button');
    submit.disabled = true;

    var collator = new Intl.Collator('de');
    var data = {
        categories: state.formCategories.slice().sort(collator.compare),
    };

    // HACK: These inputs are not synced with the vdom.
    // They are overwritten as long as the vdom does not change.
    var keys = ['name', 'address', 'openinghours', 'contact', 'lang', 'note', 'map', 'rev'];
    keys.forEach(function(key) {
        data[key] = app.getValue(key);
    });

    if (app.getValue('id')) {
        data.id = app.getValue('id');
    }

    return fetch('api.php', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'same-origin',
    }).then(extractJSON).then(function(result) {
        return updateModel(state).then(function(model) {
            history.pushState(null, null, '#!detail/' + result.id);
            return onNavigate(null, Object.assign({}, state, model));
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
        .then(function() {
            return updateModel(state);
        }).then(function(model) {
            history.pushState(null, null, '#!list');
            return onNavigate(null, Object.assign({}, state, model));
        }).catch(function(err) {
            console.error(err);
        });
    }
};

var onMapInit = function(event) {
    var geoUri = event.target.dataset.value;
    var match = geoUri.match(/geo:([0-9.-]+),([0-9.-]+)\?z=([0-9]+)/);

    if (match && window.L) {
        var lng = parseFloat(match[1]);
        var lat = parseFloat(match[2]);
        var zoom = Math.min(parseInt(match[3], 10), 18);

        setTimeout(function() {
            var map = L.map(event.target, {
                scrollWheelZoom: false,
            }).setView([lng, lat], zoom);

            L.tileLayer('https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map);
            L.marker([lng, lat]).addTo(map);
        });
    }
};

var onCategoryChange = function(event, state, app) {
    var parts = app.getValue('category-select').split('--');
    app.setValue('category', parts[0]);
    app.setValue('subcategory', parts[1] || '');
    state.categoryTextFieldsShown = parts[1] === '';
    return state;
};

var onCategoryAdd = function(event, state, app) {
    event.preventDefault();
    state.formCategories.push([
        app.getValue('category'),
        app.getValue('subcategory'),
    ]);
    state.categoryTextFieldsShown = false;
    event.target.reset();
    return state;
};

var onCategoryRemove = function(event, state, app) {
    var el = event.target.closest('li');
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    state.formCategories.splice(i, 1);
    return state;
};

// main
var app = createApp(template);

app.bindEvent('.filter', 'change', onFilter);
app.bindEvent('.filter', 'search', onFilter);
app.bindEvent('.filter', 'keyup', onFilter);
app.bindEvent('#form', 'submit', onSubmit);
app.bindEvent('.delete', 'click', onDelete);
app.bindEvent('textarea', 'init', resize);
app.bindEvent('textarea', 'input', resize);
app.bindEvent('.category-filters .js-all', 'click', onFilterAll);
app.bindEvent('.category-filters .js-none', 'click', onFilterAll);
app.bindEvent('.category-filters input[type=checkbox]', 'change', onFilterChange);
app.bindEvent('.map', 'init', onMapInit);
app.bindEvent('[name="category-select"]', 'change', onCategoryChange);
app.bindEvent('[name="category-select"]', 'init', onCategoryChange);
app.bindEvent('#category-add-form', 'submit', onCategoryAdd);
app.bindEvent('.category-remove', 'click', onCategoryRemove);
app.bindEvent(window, 'popstate', onNavigate);

updateModel().then(function(model) {
    app.init(onNavigate(null, model), document.body);
});
