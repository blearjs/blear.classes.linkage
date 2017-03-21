/**
 * 文件描述
 * @author ydr.me
 * @create 2017-03-20 17:59
 * @update 2017-03-20 17:59
 */


'use strict';

var Linkage = require('../src/index');

/**
 * 设置 options
 * @param el
 * @param list
 * @param selected
 * @param placehold
 */
exports.setOptions = function (el, list, selected, placehold) {
    var options = [];

    if (placehold) {
        options.push(
            buildOptionHTML({
                value: 0,
                text: '请选择'
            }, selected)
        );
    }

    list.forEach(function (item) {
        options.push(
            buildOptionHTML(item, selected)
        );
    });

    el.innerHTML = options.join('');
};

/**
 * JSON 转换为 MAP
 * @param json
 * @returns {{}}
 * @constructor
 */
exports.jsonToMap = function JSON2Map(json) {
    var map = {};
    var to = function (key, list) {
        map[key] = list;
        list.forEach(function (item) {
            if (item.children) {
                to(item.value, item.children);
            } else {
                to(item.value, []);
            }
        });
    };

    to(0, json);
    return map
};

// ===============================

function buildOptionHTML(option, selected) {
    return '<option value="' + option.value + '"' +
        (Linkage.equal(option.value, selected) ? ' selected' : '') +
        '>' +
        option.text +
        '</option>';
}

