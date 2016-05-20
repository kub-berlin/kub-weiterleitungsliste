var h = require('virtual-dom/h');

var labels = {
    name: 'Organisation',
    category: 'Bereich',
    subcategory: 'Rubrik',
    address: 'Kontaktdaten',
    openinghours: 'Öffnungszeiten',
    contact: 'Ansprechpartner_in',
    lang: 'Sprachkenntnisse',
    note: 'Kommentar',
    rev: 'Stand der Info',
};

var indexOfKey = function(list, key) {
    return list.map(function(x) {return x.key;}).indexOf(key);
};

var findByKey = function(list, key) {
    return list[indexOfKey(list, key)];
};

var obAny = function(obj, fn) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (fn(obj[key])) {
                return true;
            }
        }
    }
    return false;
};

var listItem = function(entry, categories) {
    return h('a', {
        href: '#!detail/' + entry.id,
        className: (entry.category || '').replace(/ /g, '-'),
    }, [
        h('span', {
            className: 'category c' + indexOfKey(categories, entry.category)
        }, entry.category),
        ' ',
        h('span', {className: 'subcategory'}, entry.subcategory),
        h('h2', {}, entry.name),
        h('span', {className: 'lang'}, entry.lang),
    ]);
};

var categoryFilters = function(categories) {
    return h('ul', {
        className: 'category-filters'
    }, [
        h('li', {}, [
            h('a', {href: '#', className: 'all'}, '(alle)'),
            ' ',
            h('a', {href: '#', className: 'none'}, '(keins)'),
        ]),
    ].concat(categories.map(function(category, i) {
        return h('li', {
            className: 'c' + i,
            dataset: {
                name: category.key,
            },
        }, [
            category.key,
            ' ',
            h('a', {href: '#', className: 'all'}, '(alle)'),
            ' ',
            h('a', {href: '#', className: 'none'}, '(keins)'),
            h('ul', {}, category.children.map(function(subcategory) {
                return h('li', {}, [
                    h('label', {}, [
                        h('input', {
                            type: 'checkbox',
                            name: subcategory.key,
                            checked: subcategory.active,
                        }),
                        ' ',
                        subcategory.key,
                    ])
                ]);
            })),
        ]);
    })));
};

var checkCategoryMatch = function(entry, categories) {
    var category = findByKey(categories, entry.category);
    var subcategory = findByKey(category.children, entry.subcategory);
    return subcategory.active;
};

var checkQueryMatch = function(entry, q) {
    return !q || (!q.split(/\s/g).some(function(qq) {
        return !obAny(entry, function(s) {
            return s && s.toLowerCase().indexOf(qq.toLowerCase()) !== -1;
        });
    }));
};

var list = function(entries, categories, q) {
    return [
        h('input', {
            type: 'search',
            className: 'filter',
            placeholder: 'Filter'
        }),
        h('ul', {}, entries.filter(function(entry) {
            return checkCategoryMatch(entry, categories) && checkQueryMatch(entry, q);
        }).map(function(entry) {
            return h('li', {}, [listItem(entry, categories)]);
        })),
        h('a', {href: '#!create', className: 'button m-cta'}, 'Hinzufügen'),
    ];
};

var detail = function(entry, categories) {
    return h('div', {
        className: (entry.category || '').replace(/ /g, '-'),
    }, [
        h('span', {
            className: 'category c' + indexOfKey(categories, entry.category)
        }, entry.category),
        ' ',
        h('span', {className: 'subcategory'}, entry.subcategory),
        h('h2', {}, entry.name),
        h('span', {className: 'lang'}, entry.lang),
        h('h3', {}, labels.address),
        h('p', {className: 'address'}, entry.address),
        h('h3', {}, labels.openinghours),
        h('p', {className: 'openinghours'}, entry.openinghours),
        h('h3', {}, labels.contact),
        h('p', {className: 'contact'}, entry.contact),
        h('h3', {}, labels.note),
        h('p', {className: 'note'}, entry.note),
        h('h3', {}, labels.rev),
        h('span', {className: 'rev'}, entry.rev),
        h('nav', {}, [
            h('a', {
                href: '#!edit/' + entry.id,
                className: 'button m-cta',
            }, 'Bearbeiten'),
            ' ',
            h('a', {className: 'back button', href: '#!list'}, 'Zurück'),
        ]),
    ]);
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

    return h('label', {}, [labels[name], f]);
};

var form = function(entry, categories) {
    return h('form', {}, [
        field('name', entry.name, true),
        h('label', {}, [
            labels.category + '/' + labels.subcategory,
            h('select', {
                name: 'subcategory',
                value: entry.subcategory,
                required: true,
            }, categories.map(function(category) {
                return h('optgroup', {
                    label: category.key,
                }, category.children.map(function(subcategory) {
                    return h('option', {}, subcategory.key);
                }));
            })),
        ]),
        field('subcategory', entry.subcategory, true),
        field('address', entry.address, true, 'textarea'),
        field('openinghours', entry.openinghours, false, 'textarea'),
        field('contact', entry.contact, false, 'textarea'),
        field('lang', entry.lang, false, 'textarea'),
        field('note', entry.note, false, 'textarea'),
        field('rev', entry.rev, true, 'date'),
        h('input', {type: 'hidden', name: 'id', value: entry.id}),
        h('nav', {}, [
            h('input', {type: 'submit', value: 'Speichern'}),
            h('a', {
                className: 'back button',
                href: entry.id ? '#!detail/' + entry.id : '#!list'
            }, 'Abbrechen'),
        ]),
    ]);
};

var template = function(entries, categories, languages, view, arg) {
    var main;
    var aside;

    if (view === 'list') {
        main = list(entries, categories, arg);
        aside = categoryFilters(categories);
    } else if (view === 'detail') {
        main = detail(entries[arg - 1], categories);
    } else if (view === 'edit') {
        main = form(entries[arg - 1], categories);
    } else if (view === 'create') {
        main = form({}, categories);
    } else {
        throw new Error('Invalid view');
    }

    return h('div', {}, [
        h('aside', {}, aside),
        h('main', {className: view}, main),
    ]);
};

module.exports = template;
