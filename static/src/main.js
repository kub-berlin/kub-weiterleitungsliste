var xhr = require('promise-xhr');

var _ = require('./helpers');
var template = require('./template');
var createApp = require('./app');


// helpers
/** Get `entries` and `categories` from the server. */
var updateModel = function() {
    return xhr.getJSON('api.php').then(function(entries) {
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

var getPath = function(state) {
    var path = location.hash.substr(2).split('/');
    return {
        view: path[0] || 'list',
        id: path[1],
    };
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
    cats.forEach(function(category) {
        category.children.forEach(function(subcategory) {
            subcategory.active = event.target.className === 'all';
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
    var newState = _.assign({}, state, getPath());
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
    return newState;
};

var onSubmit = function(event, state, app) {
    event.preventDefault();

    // prevent double-submit
    var submit = event.target.querySelector('input[type=submit]');
    submit.disabled = true;

    var data = {};

    var keys = ['name', 'subcategory', 'address', 'openinghours', 'contact', 'lang', 'note', 'map', 'rev'];
    keys.forEach(function(key) {
        data[key] = app.getValue(key);
    });

    for (var i = 0; i < state.categories.length; i++) {
        var category = state.categories[i];
        if (_.findByKey(category.children, app.getValue('subcategory'))) {
            data.category = category.key;
            break;
        }
    }

    if (app.getValue('id')) {
        data.id = app.getValue('id');
    }

    return xhr.post('api.php', JSON.stringify(data)).then(function(result) {
        return updateModel().then(function(model) {
            var r = JSON.parse(result);
            history.pushState(null, null, '#!detail/' + r.id);
            return onPopState(null, _.assign({}, state, model));
        });
    }).catch(function(err) {
        // FIXME handle error
    });
};

var onDelete = function(event, state) {
    event.preventDefault();
    if (confirm("Wirklich löschen?")) {
        return xhr.post('api.php', JSON.stringify({
            id: state.id,
        })).then(updateModel).then(function(model) {
            history.pushState(null, null, '#!list');
            return onPopState(null, _.assign({}, state, model));
        }).catch(function(err) {
            // FIXME handle error
        });
    }
};

var onMapInit = function(event) {
    var geoUri = event.target.dataset.value;
    var match = geoUri.match(/geo:([0-9\.-]+),([0-9\.-]+)\?z=([0-9]+)/);

    if (match && window.L) {
        var lng = parseFloat(match[1]);
        var lat = parseFloat(match[2]);
        var zoom = parseInt(match[3]);

        setTimeout(function() {
            var map = L.map(event.target, {
                scrollWheelZoom: false
            }).setView([lng, lat], zoom);

            L.tileLayer("https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 18}).addTo(map);
            L.marker([lng, lat]).addTo(map);
        });
    }
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
app.bindEvent('.category-filters .all', 'click', onFilterAll);
app.bindEvent('.category-filters .none', 'click', onFilterAll);
app.bindEvent('.category-filters input[type=checkbox]', 'change', onFilterChange);
app.bindEvent('.map', 'init', onMapInit);
app.bindEvent(window, 'popstate', onPopState);

updateModel().then(function(model) {
    app.init(_.assign({}, model, getPath()), document.body);
});
