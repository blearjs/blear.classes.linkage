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
        setTimeout(function () {
            console.log('获取索引：', meta.index, '父值为：', meta.parent);
            done(districtMap[meta.parent] || []);
        }, 500);
    }
});
var s1El = document.getElementById('s1');
var s2El = document.getElementById('s2');
var s3El = document.getElementById('s3');
var retEl = document.getElementById('ret');
var selectEls = [s1El, s2El, s3El];

linkage.setValue([1, 11, 111], function () {
    console.log(linkage.getValue());
});

array.each(selectEls, function (index, el) {
    el.onchange = function () {
        linkage.change(index, el.value);
    };
});

linkage.on('beforeLink', function () {
    array.each(selectEls, function (index, el) {
        el.disabled = true;
    });
});

linkage.on('afterLink', function () {
    array.each(selectEls, function (index, el) {
        el.disabled = false;
    });
    retEl.innerHTML = '选择的是：' + linkage.getText().join('-');
});

linkage.on('changeList', function (index, list, selected) {
    var options = [];

    options.push(
        buildOptionHTML({
            value: 0,
            text: '请选择'
        }, selected)
    );

    array.each(list, function (index, option) {
        options.push(buildOptionHTML(option, selected));
    });

    selectEls[index].innerHTML = options.join('');
});


// ===================================
function buildOptionHTML(option, selected) {
    return '<option value="' + option.value + '"' +
        (Linkage.equal(option.value, selected) ? ' selected' : '') +
        '>' +
        option.text +
        '</option>';
}


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

