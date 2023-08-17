var h = require('petit-dom/dist/petit-dom.min').h;

var _ = require('./helpers');


// constants
var LOCALE = 'de-DE';
var LABELS = {
    name: 'Organisation',
    category: 'Bereich',
    subcategory: 'Rubrik',
    address: 'Kontaktdaten',
    openinghours: 'Öffnungszeiten',
    contact: 'Ansprechpartner_in',
    lang: 'Sprachkenntnisse',
    note: 'Kommentar',
    map: 'Karte (Geo-URI)',
    rev: 'Stand der Info',

    _search: 'Suchen in allen Feldern (z.B. "Wohnen", "Arabisch", "AWO", "Kreuzberg", ...)',
    _filter_toggle: 'Filter anzeigen',
    _add: 'Hinzufügen',
    _edit: 'Bearbeiten',
    _delete: 'Löschen',
    _save: 'Speichern',
    _back: 'Zurück',
    _cancel: 'Abbrechen',
    _error: 'Fehler',
    _all: 'alle',
    _none: 'keins',
    _new: 'neu…',
};

var RE_URL = /\b((https?:\/\/|www.)[a-zA-Z0-9./_-]+|[a-z0-9_.-]+@[a-z0-9.-]+)\b/;

// helpers
var autourl = function(text) {
    var match = text.match(RE_URL);
    if (match) {
        var url = match[0];
        var i = text.indexOf(url);
        var before = text.substr(0, i);
        var after = text.substr(i + url.length);
        var surl = url;
        if (!surl.startsWith('http')) {
            surl = (url.indexOf('@') !== -1 ? 'mailto:' : 'http://') + surl;
        }
        return [before, h('a', {href: surl}, url)].concat(autourl(after));
    } else {
        return [text];
    }
};

var checkCategoryMatch = function(entry, categories) {
    return entry.categories.some(function(c) {
        var category = _.findByKey(categories, c[0]);
        var subcategory = _.findByKey(category.children, c[1]);
        return subcategory.active;
    });
};

var checkQueryMatch = function(entry, q) {
    return !q || (q.toLowerCase().split(/\s/g).every(function(qq) {
        return Object.keys(entry).some(function(key) {
            if (key === 'categories') {
                return entry.categories.some(function(c) {
                    return c[0].toLowerCase().includes(qq) || c[1].toLowerCase().includes(qq);
                });
            } else {
                var s = entry[key];
                return s && s.toLowerCase().includes(qq);
            }
        });
    }));
};

var categoryClass = function(state, c) {
    return 'c' + _.indexOfKey(state.categories, c[0], 'key');
};


// templates
var error = function(msg) {
    return h('h2', {'class': 'error'}, LABELS._error + ': ' + msg);
};

var categoryList = function(state, categories, button) {
    return h('ul', {'class': 'category-list'}, categories.map(function(c) {
        return h('li', {}, [
            h('span', {'class': 'category ' + categoryClass(state, c)}, c[0]),
            ' ',
            h('span', {'class': 'subcategory'}, c[1]),
            ' ',
            button && h('button', {'class': 'category-remove button--secondary button--small', type: 'button'}, LABELS._delete),
        ]);
    }));
};

var listItem = function(state, entry) {
    return h('a', {
        href: '#!detail/' + entry.id,
        'class': 'list-item',
    }, [
        categoryList(state, entry.categories),
        h('h2', {'class': 'list-item__title'}, entry.name),
        h('span', {'class': 'subtitle'}, entry.lang),
    ]);
};

var list = function(state) {
    return [
        h('input', {
            'class': 'filter',
            type: 'search',
            placeholder: LABELS._search,
            value: state.q,
        }),
        h('ul', {}, state.entries.filter(function(entry) {
            return checkCategoryMatch(entry, state.categories) &&
                checkQueryMatch(entry, state.q);
        }).sort(function(a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        }).map(function(entry) {
            return h('li', {key: entry.id}, [listItem(state, entry)]);
        })),
        h('a', {'class': 'button button--block', href: '#!create'}, LABELS._add),
    ];
};

var categoryFilters = function(state) {
    return h('div', {'class': 'category-filters'}, [
        h('fieldset', {}, [
            h('button', {'class': 'js-all button--secondary button--small', type: 'button'}, LABELS._all),
            ' ',
            h('button', {'class': 'js-none button--secondary button--small', type: 'button'}, LABELS._none),
        ]),
    ].concat(state.categories.map(function(category, i) {
        return h('fieldset', {}, [
            h('legend', {}, [
                category.key,
                ' ',
                h('button', {'class': 'js-all button--secondary button--small', type: 'button', 'data-category': category.key}, LABELS._all),
                ' ',
                h('button', {'class': 'js-none button--secondary button--small', type: 'button', 'data-category': category.key}, LABELS._none),
            ]),
            category.children.map(function(subcategory) {
                return h('label', {}, [
                    h('input', {
                        type: 'checkbox',
                        name: category.key + '--' + subcategory.key,
                        checked: subcategory.active,
                    }),
                    ' ',
                    subcategory.key,
                ]);
            }),
        ]);
    })));
};

var detail = function(state, entry) {
    var clientToggle;
    if (state.view === 'client') {
        clientToggle = h('a', {'class': 'client-toggle', href: '#!detail/' + entry.id}, 'Standardansicht');
    } else {
        clientToggle = h('a', {'class': 'client-toggle', href: '#!client/' + entry.id}, 'Ansicht für Klient*innen');
    }

    var children = [
        h('header', {'class': 'detail__header'}, [
            categoryList(state, entry.categories),
            h('h2', {}, entry.name),
            h('span', {'class': 'subtitle'}, entry.lang),
            clientToggle,
        ]),
    ];

    ['address', 'openinghours'].forEach(function(key) {
        if (entry[key]) {
            children.push(h('h3', {}, LABELS[key]));
            children.push(h('p', {'class': key}, autourl(entry[key])));
        }
    });

    if (state.view === 'client') {
        if (entry.map) {
            children.push(h('h3', {}, LABELS.map));
            children.push(h('div', {'class': 'map', 'data-value': entry.map}));
        }
    } else {
        ['contact', 'note'].forEach(function(key) {
            if (entry[key]) {
                children.push(h('h3', {}, LABELS[key]));
                children.push(h('p', {'class': key}, autourl(entry[key])));
            }
        });

        children.push(h('h3', {}, LABELS.rev));
        children.push(h('time', {
            'class': 'rev',
            datetime: entry.rev,
        }, (new Date(entry.rev)).toLocaleDateString(LOCALE)));

        children.push(h('nav', {}, [
            h('a', {'class': 'button button--block', href: '#!edit/' + entry.id}, LABELS._edit),
            h('button', {'class': 'delete button--block'}, LABELS._delete),
            h('a', {'class': 'back button button--block button--secondary', href: '#!list'}, LABELS._back),
        ]));
    }

    return h('div', {}, children);
};

var field = function(name, value, params, type) {
    var f;

    if (type === 'textarea') {
        f = h('textarea', Object.assign({
            name: name,
            value: value,
        }, params));
    } else {
        f = h('input', Object.assign({
            name: name,
            value: value,
            type: type || 'text',
        }, params));
    }

    return h('label', {}, [LABELS[name], f]);
};

var categoryOptions = function(state) {
    return [
        h('option'),
        state.categories.map(function(category) {
            return h('optgroup', {
                label: category.key,
            }, category.children.map(function(subcategory) {
                return h('option', {
                    value: category.key + '--' + subcategory.key,
                }, subcategory.key);
            }).concat([
                h('option', {
                    value: category.key + '--',
                }, 'neu ...'),
            ]));
        }),
        h('option', {value: '--'}, LABELS._new),
    ];
};

var form = function(state, entry) {
    var categoryFields = [
        h('div', {'class': 'category-row'}, [
            h('label', {}, [
                LABELS.category + '/' + LABELS.subcategory,
                h('select', {name: 'category-select', form: 'category-add-form'}, categoryOptions(state)),
            ]),
            h('button', {'class': 'category-add', form: 'category-add-form'}, LABELS._add),
        ]),
        h('div', {'class': 'category-row', hidden: !state.categoryTextFieldsShown}, [
            field('category', '', {required: true, form: 'category-add-form'}),
            field('subcategory', '', {required: true, form: 'category-add-form'}),
        ]),
        categoryList(state, state.formCategories, true),
    ];

    var form = h('form', {id: 'form'}, [
        field('name', entry.name, {required: true}),
        h('fieldset', {}, categoryFields),
        field('address', entry.address, {required: true}, 'textarea'),
        field('openinghours', entry.openinghours, {}, 'textarea'),
        field('contact', entry.contact, {}, 'textarea'),
        field('lang', entry.lang, {}, 'textarea'),
        field('note', entry.note, {}, 'textarea'),
        field('map', entry.map, {}, 'url'),
        field('rev', entry.rev || new Date().toISOString().slice(0, 10), {required: true}, 'date'),
        h('input', {type: 'hidden', name: 'id', value: entry.id}),
        h('nav', {}, [
            h('button', {'class': 'button--block'}, LABELS._save),
            h('a', {
                'class': 'back button button--block button--secondary',
                href: entry.id ? '#!detail/' + entry.id : '#!list',
            }, LABELS._cancel),
        ]),
    ]);

    return h('div', {}, [
        form,
        h('form', {id: 'category-add-form'}),
    ]);
};

var template = function(state) {
    var main;
    var aside;

    if (state.view === 'list') {
        main = list(state);
        aside = h('aside', {}, [
            h('input', {type: 'checkbox', id: 'filter-toggle'}),
            h('label', {'for': 'filter-toggle'}, LABELS._filter_toggle),
            categoryFilters(state),
        ]);
    } else if (state.view === 'detail' || state.view === 'client') {
        main = state.entry ? detail(state, state.entry) : error('404 Not Found');
    } else if (state.view === 'edit') {
        main = state.entry ? form(state, state.entry) : error('404 Not Found');
    } else if (state.view === 'create') {
        main = form(state, {});
    } else {
        main = error('Invalid view');
    }

    return h('div', {'class': 'l-grid'}, [
        aside,
        h('main', {'class': state.view}, main),
    ]);
};

module.exports = template;
