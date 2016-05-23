var virtualDom = require('virtual-dom');

var _ = require('./helpers');


module.exports = function(template) {
    var element;
    var tree;
    var state;
    var events = [];
    var self = {};

    var attachEventListeners = function() {
        events.forEach(function(ev) {
            var elements;
            var selector = ev[0];
            var eventName = ev[1];
            var fn = ev[2];

            if (typeof selector === 'string') {
                elements = element.querySelectorAll(selector);
            } else {
                elements = [selector];
            }

            for (var i = 0; i < elements.length; i++) {
                if (eventName === 'init') {
                    fn({target: elements[i]});
                } else {
                    elements[i].addEventListener(eventName, fn);
                }
            }
        });
    };

    var update = function(newState) {
        if (self.beforeUpdate) self.beforeUpdate(state, newState);
        var newTree = template(newState);
        var patches = virtualDom.diff(tree, newTree);
        virtualDom.patch(element, patches);
        attachEventListeners();
        tree = newTree;
        if (self.afterUpdate) self.afterUpdate(state, newState);
        state = newState;
    };

    var eventWrapper = function(fn) {
        return function(event) {
            var val = fn(event, _.assign({}, state), self);
            Promise.resolve(val).then(function(newState) {
                if (newState) {
                    update(newState);
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
