var virtualDom = require('virtual-dom');

var _ = require('./helpers');


module.exports = function(template) {
    var element;
    var tree;
    var state;
    var events = [];
    var self = {};

    var initEvent = function(element, fn) {
        if (!element.$init) {
            setTimeout(function() {
                fn({target: element});
            });
            element.$init = true;
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
        var patches = virtualDom.diff(tree, newTree);
        virtualDom.patch(element, patches);
        attachEventListeners();
        tree = newTree;
        state = newState;
    };

    var eventWrapper = function(fn) {
        return function(event) {
            var val = fn(event, _.assign({}, state), self);
            Promise.resolve(val).then(function(newState) {
                if (newState != null) {
                    update(newState);

                    if (newState.$scrollTop != null) {
                        scrollTo(0, newState.$scrollTop);
                        delete newState['$scrollTop'];
                    }
                }
            });
        };
    };

    self.init = function(newState, wrapper) {
        tree = template(newState);
        element = virtualDom.create(tree);
        attachEventListeners();
        wrapper.innerHTML = '';
        wrapper.appendChild(element);
        state = newState;
    };

    self.bindEvent = function(selector, eventName, fn) {
        events.push([selector, eventName, eventWrapper(fn)]);
    };

    self.getValue = function(name) {
        var el = element.querySelector('[name=' + name + ']');
        return el ? el.value : null;
    };

    return self;
};
