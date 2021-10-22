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
