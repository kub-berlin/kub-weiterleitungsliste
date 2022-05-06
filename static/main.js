(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(e.petitDom=e.petitDom||{})}(this,function(e){"use strict";function n(e,n){for(var t=1,r=e.length-1;t<=r;){var o=Math.ceil((t+r)/2);n<e[o]?r=o-1:t=o+1}return t}function t(e,n,t,r,o,i,l){for(var f=o,u=-1,a=i-o+1;t<=r;){if(l(e[t],n[f])){if(u<0&&(u=t),++f>i)return u}else{if(t+a>r)return-1;u=-1,f=o}t++}return-1}function r(e,n){for(var t=0;t<e.length;t++){var r=e[t];if(S(r))return o(e,t,e.slice(0,t),n);V(r)?n&&!r.isSVG&&(r.isSVG=!0):e[t]={_text:null==r?"":r}}return e}function o(e,n,t,r){for(var i=n;i<e.length;i++){var l=e[i];S(l)?o(l,0,t,r):V(l)?(r&&!l.isSVG&&(l.isSVG=!0),t.push(l)):t.push({_text:null==l?"":l})}return t}function i(e,n,t,r){if(t!==r)return!0;for(var o in e)if(e[o]!==n[o])return!0;return!1}function l(e){var n;if(null!=e._text)n=document.createTextNode(e._text);else if(!0===e._vnode){var t=e.type,r=e.props,o=e.content,i=e.isSVG;if("string"==typeof t){var u;u=d(n=i?document.createElementNS(G,t):document.createElement(t),r,void 0,i),S(o)?f(n,o):n.appendChild(l(o)),null!=u&&v(n,r,void 0,u)}else if(b(t))n=t.mount(r,o);else if("function"==typeof t)if(b(t.prototype)){var a=new t(r,o);n=a.mount(r,o),e._data=a}else{var p=t(r,o);n=l(p),e._data=p}}if(null==n)throw new Error("Unkown node type!");return e._node=n,n}function f(e,n){for(var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:n.length-1,o=arguments[4];t<=r;){var i=n[t++];e.insertBefore(l(i),o)}}function u(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:n.length-1,o=void 0;for(e.childNodes.length===r-t+1&&(e.textContent="",o=!0);t<=r;){var i=n[t++];o||e.removeChild(i._node),a(i)}}function a(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e._node;if(S(e))for(var t=0;t<e.length;t++)a(e[t]);else!0===e._vnode&&(b(e.type)?e.type.unmount(n):"function"==typeof e.type&&b(e.type.prototype)?e._data.unmount(n):null!=e.content&&a(e.content))}function v(e,n,t,r){for(var o,i=0;i<r.length;i++){o=r[i];var l=t&&t[o],f=n[o];l!==f&&(e[o]=f)}}function d(e,n,t,r){var o=[];for(var i in n)if(i.startsWith("on")||i in C)o.push(i);else{var l=null!=t?t[i]:void 0,f=n[i];l!==f&&p(e,i,f,r)}for(i in t)i in n||e.removeAttribute(i);if(o.length>0)return o}function p(e,n,t,r){if(!0===t)e.setAttribute(n,"");else if(!1===t)e.removeAttribute(n);else{var o=r?M[n]:void 0;void 0!==o?e.setAttributeNS(o,n,t):e.setAttribute(n,t)}}function s(e,n,t){var r=n._node;if(n===e)return r;var o,f;if(null!=(o=n._text)&&null!=(f=e._text))o!==f&&(r.nodeValue=f);else if(n.type===e.type&&n.isSVG===e.isSVG){var u=n.type;if(b(u))u.patch(r,e.props,n.props,e.content,n.content);else if("function"==typeof u)if(b(u.prototype)){var p=n._data;p.patch(r,e.props,n.props,e.content,n.content),e._data=p}else if((u.shouldUpdate||i)(e.props,n.props,e.content,n.content)){var h=u(e.props,e.content);r=s(h,n._data,t),e._data=h}else e._data=n._data;else{if("string"!=typeof u)throw new Error("Unkown node type! "+u);var y=d(r,e.props,n.props,e.isSVG);c(r,e.content,n.content),null!=y&&v(r,e.props,n.props,y)}}else{r=l(e);var g=n._node;t&&(t.replaceChild(r,n._node),n._node=r),a(n,g)}return e._node=r,r}function c(e,n,t){S(n)||S(t)?S(n)&&S(t)?y(e,n,t):(u(e,t,0,t.length-1),f(e,n)):n!==t&&s(n,t,e)}function h(e,n){return null==e.key&&null==n.key||e.key===n.key}function y(e,n,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:n.length-1,v=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,d=arguments.length>6&&void 0!==arguments[6]?arguments[6]:r.length-1;if(n!==r){var p,c=g(n,r,o,i,v,d,h,e);if(o+=c,v+=c,c=_(n,r,o,i,v,d,h,e),i-=c,d-=c,!(o>i&&v>d)){if(o<=i&&v>d)return p=r[v],void f(e,n,o,i,p&&p._node);if(v<=d&&o>i)u(e,r,v,d);else{var y=d-v+1,k=i-o+1;if(c=-1,y<k){if((c=t(n,r,o,i,v,d,h))>=0){f(e,n,o,c-1,(p=r[v])._node);var x=c+y;for(o=c;o<x;)s(n[o++],r[v++],e);return p=r[d],void f(e,n,o,i,p&&p._node.nextSibling)}}else if(y>k&&(c=t(r,n,v,d,o,i,h))>=0){for(u(e,r,v,c-1),x=c+k,v=c;v<x;)s(n[o++],r[v++],e);return void u(e,r,v,d)}if(v===d){var A=r[v]._node;return f(e,n,o,i,A),e.removeChild(A),void a(A)}if(o===i)return e.insertBefore(l(n[o]),r[v]._node),void u(e,r,v,d);m(e,n,r,o,i,v,d)&&w(e,n,r,o,i,v,d)}}}}function g(e,n,t,r,o,i,l,f){for(var u,a,v=0;t<=r&&o<=i&&l(u=e[t],a=n[o]);)f&&s(u,a,f),t++,o++,v++;return v}function _(e,n,t,r,o,i,l,f){for(var u,a,v=0;t<=r&&o<=i&&l(u=e[r],a=n[i]);)f&&s(u,a,f),r--,i--,v++;return v}function m(e,n,t){var r,o,i,l,f,u,a,v=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,d=arguments.length>4&&void 0!==arguments[4]?arguments[4]:n.length-1,p=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=d-v+1,c=(arguments.length>6&&void 0!==arguments[6]?arguments[6]:t.length-1)-p+1,y=s+c,g=[];e:for(r=0;r<=y;r++){if(r>50)return!0;for(a=r-1,f=r?g[r-1]:[0,0],u=g[r]=[],o=-r;o<=r;o+=2){for(i=(l=o===-r||o!==r&&f[a+o-1]<f[a+o+1]?f[a+o+1]:f[a+o-1]+1)-o;l<c&&i<s&&h(t[p+l],n[v+i]);)l++,i++;if(l===c&&i===s)break e;u[r+o]=l}}var _,m=Array(r/2+y/2),w={},x=m.length-1;for(r=g.length-1;r>=0;r--){for(;l>0&&i>0&&h(t[p+l-1],n[v+i-1]);)m[x--]=N,l--,i--;if(!r)break;a=r-1,f=r?g[r-1]:[0,0],(o=l-i)===-r||o!==r&&f[a+o-1]<f[a+o+1]?(i--,m[x--]=B):(l--,m[x--]=U,null!=(_=t[p+l]).key&&(w[_.key]=p+l))}k(e,m,n,t,v,p,w)}function k(e,n,t,r,o,i,f){for(var u,v,d,p,c={},h=0,y=o,g=i;h<n.length;h++){var _=n[h];_===N?s(t[y++],r[g++],e):_===B?(p=null,null!=(u=t[y++]).key&&(p=f[u.key]),null!=p?(d=s(u,r[p]),c[u.key]=p):d=l(u),e.insertBefore(d,g<r.length?r[g]._node:null)):_===U&&g++}for(h=0,g=i;h<n.length;h++){var m=n[h];m===N?g++:m===U&&(null!=(v=r[g++]).key&&null!=c[v.key]||(e.removeChild(v._node),a(v)))}}function w(e,t,r,o,i,l,f){var u,a,v,d,p={},s=[],c=0,h=i-o+1,y=f-l+1,g=Math.min(h,y),_=Array(g+1);_[0]=-1;for(var m=1;m<_.length;m++)_[m]=f+1;var w=Array(g);for(m=l;m<=f;m++)null!=(d=r[m].key)?p[d]=m:s.push(m);for(m=o;m<=i;m++)null!=(v=null==(u=t[m]).key?s[c++]:p[u.key])&&(a=n(_,v))>=0&&(_[a]=v,w[a]={newi:m,oldi:v,prev:w[a-1]});for(a=_.length-1;_[a]>f;)a--;for(var x=w[a],A=Array(y+h-a),S=i,V=f,b=A.length-1;x;){for(var G=x,C=G.newi,E=G.oldi;S>C;)A[b--]=B,S--;for(;V>E;)A[b--]=U,V--;A[b--]=N,S--,V--,x=x.prev}for(;S>=o;)A[b--]=B,S--;for(;V>=l;)A[b--]=U,V--;k(e,A,t,r,o,l,p)}var x={},A=[],S=Array.isArray,V=function(e){return e&&(null!=e._vnode||null!=e._text)},b=function(e){return e&&e.mount&&e.patch&&e.unmount},G="http://www.w3.org/2000/svg",C={selected:!0,value:!0,checked:!0,innerHTML:!0},E="http://www.w3.org/1999/xlink",M={show:E,actuate:E,href:E},N=2,B=4,U=8;e.h=function(e,n,t){var o,i,l,f=!1,u=arguments.length-2;if("string"!=typeof e){if(1===u)o=t;else if(u>1){for(i=Array(u),l=0;l<u;l++)i[l]=arguments[l+2];o=i}}else if(f="svg"===e,1===u)S(t)?o=r(t,f):V(t)?(t.isSVG=f,o=[t]):o=[{_text:null==t?"":t}];else if(u>1){for(i=Array(u),l=0;l<u;l++)i[l]=arguments[l+2];o=r(i,f)}else o=A;return{_vnode:!0,isSVG:f,type:e,key:n&&n.key||null,props:n||x,content:o}},e.mount=l,e.patch=s,e.unmount=a,e.diffChildren=y,Object.defineProperty(e,"__esModule",{value:!0})});


},{}],2:[function(require,module,exports){
var vdom = require('petit-dom/dist/petit-dom.min');


module.exports = function(template) {
    var element;
    var tree;
    var state;
    var events = [];
    var self = {};

    var initEvent = function(el, fn) {
        if (!el.$init) {
            setTimeout(function() {
                fn({target: el});
            });
            el.$init = true;
        }
    };

    var attachEventListeners = function() {
        events.forEach(function(ev) {
            var selector = ev[0];
            var eventName = ev[1];
            var fn = ev[2];

            var elements = [selector];
            if (typeof selector === 'string') {
                elements = element.querySelectorAll(selector);
            }

            for (var i = 0; i < elements.length; i++) {
                if (eventName === 'init') {
                    initEvent(elements[i], fn);
                } else {
                    elements[i].addEventListener(eventName, fn);
                }
            }
        });
    };

    var update = function(newState) {
        var newTree = template(newState);
        vdom.patch(newTree, tree);
        attachEventListeners();
        tree = newTree;
        state = newState;
    };

    var eventWrapper = function(fn) {
        return function(event) {
            var val = fn(event, Object.assign({}, state), self);
            Promise.resolve(val).then(function(newState) {
                if (newState != null) {
                    update(newState);

                    if (newState.$scrollTop != null) {
                        scrollTo(0, newState.$scrollTop);
                        delete newState.$scrollTop;
                    }
                }
            });
        };
    };

    self.init = function(newState, wrapper) {
        wrapper.innerHTML = '';
        tree = template(newState);
        element = vdom.mount(tree);
        wrapper.append(element);
        attachEventListeners();
        state = newState;
    };

    self.bindEvent = function(selector, eventName, fn) {
        events.push([selector, eventName, eventWrapper(fn)]);
    };

    self.getValue = function(name) {
        var el = element.querySelector('[name="' + name + '"]');
        return el ? el.value : null;
    };

    self.setValue = function(name, value) {
        var el = element.querySelector('[name="' + name + '"]');
        el.value = value;
    };

    return self;
};

},{"petit-dom/dist/petit-dom.min":1}],3:[function(require,module,exports){
module.exports.indexOfKey = function(list, key, kkey) {
    return list.map(x => x[kkey]).indexOf(key);
};

module.exports.findByKey = function(list, key, kkey) {
    return list[module.exports.indexOfKey(list, key, kkey || 'key')];
};

},{}],4:[function(require,module,exports){
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
    app.init(applyPath(model), document.body);
});

},{"./app":2,"./helpers":3,"./template":5}],5:[function(require,module,exports){
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

},{"./helpers":3,"petit-dom/dist/petit-dom.min":1}]},{},[4]);
