module.exports.indexOfKey = function(list, key, kkey) {
    return list.map(x => x[kkey]).indexOf(key);
};

module.exports.findByKey = function(list, key, kkey) {
    return list[module.exports.indexOfKey(list, key, kkey || 'key')];
};
