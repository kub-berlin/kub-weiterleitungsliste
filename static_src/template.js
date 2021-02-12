var h = require('petit-dom/dist/petit-dom.min').h;

var _ = require('./helpers');


// constants
var LABELS = {
    name: 'Organisation',
    category: 'Bereich',
    subcategory: 'Rubrik',
    address: 'Kontaktdaten',
    openinghours: 'Öffnungszeiten',
    contact: 'Ansprechpartner_in',
    lang: 'Sprachkenntnisse',
    note: 'Kommentar',
    map: 'Karte',
    rev: 'Stand der Info',
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
    var category = _.findByKey(categories, entry.category);
    var subcategory = _.findByKey(category.children, entry.subcategory);
    return subcategory.active;
};

var checkQueryMatch = function(entry, q) {
    return !q || (!q.split(/\s/g).some(function(qq) {
        return !Object.keys(entry).some(function(key) {
            var s = entry[key];
            return s && s.toLowerCase().indexOf(qq.toLowerCase()) !== -1;
        });
    }));
};

var categoryClass = function(state, entry) {
    return 'c' + _.indexOfKey(state.categories, entry.category, 'key');
};


// templates
var error = function(msg) {
    return h('h2', {'class': 'error'}, 'Fehler: ' + msg);
};

var listItem = function(state, entry) {
    return h('a', {
        href: '#!detail/' + entry.id,
        'class': 'list-item ' + (entry.category || '').replace(/ /g, '-'),
    }, [
        h('span', {'class': 'category ' + categoryClass(state, entry)}, entry.category),
        ' ',
        h('span', {'class': 'subcategory'}, entry.subcategory),
        h('h2', {'class': 'list-item__title'}, entry.name),
        h('span', {'class': 'lang'}, entry.lang),
    ]);
};

var list = function(state) {
    return [
        h('input', {
            'class': 'filter',
            type: 'search',
            placeholder: 'Suchen in allen Feldern (z.B. "Wohnen", "Arabisch", "AWO", "Kreuzberg", ...)',
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
        h('a', {'class': 'button', href: '#!create'}, 'Hinzufügen'),
    ];
};

var categoryFilters = function(state) {
    return h('ul', {'class': 'category-filters'}, [
        h('li', {}, [
            h('button', {'class': 'js-all button--secondary button--small'}, 'alle'),
            ' ',
            h('button', {'class': 'js-none button--secondary button--small'}, 'keins'),
        ]),
    ].concat(state.categories.map(function(category, i) {
        return h('li', {
            'class': 'c' + i,
            'data-name': category.key,
        }, [
            category.key,
            ' ',
            h('button', {'class': 'js-all button--secondary button--small'}, 'alle'),
            ' ',
            h('button', {'class': 'js-none button--secondary button--small'}, 'keins'),
            h('ul', {}, category.children.map(function(subcategory) {
                return h('li', {}, [h('label', {}, [
                    h('input', {
                        type: 'checkbox',
                        name: subcategory.key,
                        checked: subcategory.active,
                    }),
                    ' ',
                    subcategory.key,
                ])]);
            })),
        ]);
    })));
};

var detail = function(state, entry) {
    if (!entry) {
        return error('404 Not Found');
    }

    var clientToggle;
    if (state.view === 'client') {
        clientToggle = h('a', {'class': 'client-toggle', href: '#!detail/' + entry.id}, 'Standardansicht');
    } else {
        clientToggle = h('a', {'class': 'client-toggle', href: '#!client/' + entry.id}, 'Ansicht für Klient*innen');
    }

    var children = [
        h('header', {'class': 'detail__header'}, [
            h('span', {'class': 'category ' + categoryClass(state, entry)}, entry.category),
            ' ',
            h('span', {'class': 'subcategory'}, entry.subcategory),
            h('h2', {}, entry.name),
            h('span', {'class': 'lang'}, entry.lang),
            clientToggle,
        ]),
        h('h3', {}, LABELS.address),
        h('p', {'class': 'address'}, autourl(entry.address)),
    ];

    ['openinghours'].forEach(function(key) {
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
        }, (new Date(entry.rev)).toLocaleDateString('de-DE')));

        children.push(h('nav', {}, [
            h('a', {'class': 'button', href: '#!edit/' + entry.id}, 'Bearbeiten'),
            h('button', {'class': 'delete'}, 'Löschen'),
            h('a', {'class': 'back button button--secondary', href: '#!list'}, 'Zurück'),
        ]));
    }

    return h('div', {
        'class': (entry.category || '').replace(/ /g, '-'),
    }, children);
};

var field = function(name, value, required, type) {
    var f;

    if (type === 'textarea') {
        f = h('textarea', {
            name: name,
            value: value,
            required: required,
        });
    } else {
        f = h('input', {
            name: name,
            value: value,
            required: required,
            type: type || 'text',
        });
    }

    return h('label', {}, [LABELS[name], f]);
};

var form = function(state, entry) {
    var categoryFields = [
        h('label', {}, [
            LABELS.category + '/' + LABELS.subcategory,
            h('select', {
                name: 'category',
                required: true,
            }, [h('option')].concat(state.categories.map(function(category) {
                return h('optgroup', {
                    label: category.key,
                }, category.children.map(function(subcategory) {
                    return h('option', {
                        value: category.key + '--' + subcategory.key,
                        selected: entry.subcategory === subcategory.key,
                    }, subcategory.key);
                }).concat([
                    h('option', {
                        value: category.key + '--',
                    }, 'neu ...'),
                ]));
            }))),
        ]),
    ];

    if (state.subcategory === '') {
        categoryFields.push(field('subcategory', '', true));
    }

    return h('form', {}, [
        field('name', entry.name, true),
        h('div', {}, categoryFields),
        field('address', entry.address, true, 'textarea'),
        field('openinghours', entry.openinghours, false, 'textarea'),
        field('contact', entry.contact, false, 'textarea'),
        field('lang', entry.lang, false, 'textarea'),
        field('note', entry.note, false, 'textarea'),
        field('map', entry.map, false, 'url'),
        h('label', {}, [LABELS.rev, h('input', {
            name: 'rev',
            value: entry.rev,
            required: true,
            type: 'date',
            pattern: '\\d{4}-\\d{2}-\\d{2}',
            placeholder: 'yyyy-mm-dd',
        })]),
        h('input', {type: 'hidden', name: 'id', value: entry.id}),
        h('nav', {}, [
            h('button', {}, 'Speichern'),
            h('a', {
                'class': 'back button button--secondary',
                href: entry.id ? '#!detail/' + entry.id : '#!list',
            }, 'Abbrechen'),
        ]),
    ]);
};

var template = function(state) {
    var main;
    var aside;

    if (state.view === 'list') {
        main = list(state);
        aside = h('aside', {}, categoryFilters(state));
    } else if (state.view === 'detail' || state.view === 'client') {
        main = detail(state, _.findByKey(state.entries, state.id, 'id'));
    } else if (state.view === 'edit') {
        main = form(state, _.findByKey(state.entries, state.id, 'id'));
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
