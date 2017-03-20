/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var array = require('blear.utils.array');

var Linkage = require('../src/index');
var districtMap = JSON2Map(require('./district.json'));

var linkage = new Linkage({
    length: 3,
    getData: function (meta, done) {
        console.log('获取索引：', meta.index, '父值为：', meta.parent);
        done(districtMap[meta.parent]);
    }
});

linkage.setValue([1, 11, 111], function () {
    console.log(linkage.getValue());
});



// ===================================
/**
 * JSON 转换为 MAP
 * @param json
 * @returns {{}}
 * @constructor
 */
function JSON2Map(json) {
    var map = {};
    var to = function (key, list) {
        map[key] = list;
        array.each(list, function (index, item) {
            if (item.children) {
                to(item.value, item.children);
            } else {
                to(item.value, []);
            }
        });
    };

    to(0, json);
    return map
}

