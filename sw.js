var CACHE = 'v1';

var _fetch = function(request) {
    return fetch(request).then(function(response) {
        if (response.ok) {
            return response;
        } else {
            throw response;
        }
    });
};

var fromNetwork = function(request) {
    return _fetch(request).then(function(response) {
        return caches.open(CACHE).then(function(cache) {
            return cache.put(request, response.clone());
        }).then(function() {
            return response;
        });
    });
};

var fromCache = function(request) {
    return caches.open(CACHE).then(function(cache) {
        return cache.match(request).then(function(response) {
            return response || Promise.reject('no-match');
        });
    });
};

this.addEventListener('fetch', function(event) {
    event.respondWith(
        fromNetwork(event.request).catch(function() {
            return fromCache(event.request);
        })
    );
});
