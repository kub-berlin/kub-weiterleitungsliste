module.exports.indexOfKey = function(list, key, kkey) {
    return list.map(x => x[kkey]).indexOf(key);
};

module.exports.findByKey = function(list, key, kkey) {
    return list[module.exports.indexOfKey(list, key, kkey || 'key')];
};

// https://stackoverflow.com/a/7616484
module.exports.hash = function(s) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) {
        var chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
