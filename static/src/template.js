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

var listItem = function(entry) {
    return h('a', {
        href: '#!detail/' + entry.id,
        className: (entry.category || '').replace(/ /g, '-'),
    }, [
        h('span', {className: 'category c2'}, entry.category),
        ' ',
        h('span', {className: 'subcategory'}, entry.subcategory),
        h('h2', {}, entry.name),
        h('span', {className: 'lang'}, entry.lang),
    ]);
};

var list = function(entries, q) {
    return [
        h('input', {
            type: 'search',
            className: 'filter',
            placeholder: 'Filter'
        }),
        h('ul', {}, entries.filter(function(entry) {
            return !q || (entry.name || '').indexOf(q) !== -1;
        }).map(function(entry) {
            return h('li', {}, [listItem(entry)]);
        })),
        h('a', {href: '#!create'}, 'Hinzufügen'),
    ];
};

var detail = function(entry) {
    return h('div', {
        className: (entry.category || '').replace(/ /g, '-'),
    }, [
        h('span', {className: 'category'}, entry.category),
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
            h('a', {className: 'back', href: '#!list'}, 'Zurück'),
            ' ',
            h('a', {href: '#!edit/' + entry.id}, 'Bearbeiten'),
        ]),
    ]);
    return listItem(entry);
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

var form = function(entry) {
    return h('form', {}, [
        field('name', entry.name, true),
        field('category', entry.category, true),
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
                className: 'back',
                href: entry.id ? '#!detail/' + entry.id : '#!list'
            }, 'Abbrechen'),
        ]),
    ]);
};

var template = function(entries, view, arg) {
    var child;

    if (view === 'list') {
        child = list(entries, arg);
    } else if (view === 'detail') {
        child = detail(entries[arg - 1]);
    } else if (view === 'edit') {
        child = form(entries[arg - 1]);
    } else if (view === 'create') {
        child = form({});
    } else {
        throw new Error('Invalid view');
    }

    return h('div', {className: view}, [child]);
};

module.exports = template
