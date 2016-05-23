module.exports.indexOfKey = function(list, key, kkey) {
    return list.map(function(x) {return x[kkey];}).indexOf(key);
};

module.exports.findByKey = function(list, key, kkey) {
    return list[module.exports.indexOfKey(list, key, kkey || 'key')];
};

module.exports.assign = function(target) {
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < sources.length; i++) {
        for (var key in sources[i]) {
            if (sources[i].hasOwnProperty(key)) {
                target[key] = sources[i][key];
            }
        }
    }
    return target;
};
