export var indexOfKey = function(list, key, kkey) {
    return list.map(x => x[kkey]).indexOf(key);
};

export var findByKey = function(list, key, kkey) {
    return list[indexOfKey(list, key, kkey || 'key')];
};
