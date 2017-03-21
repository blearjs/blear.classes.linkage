/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var array = require('blear.utils.array');

var Linkage = require('../src/index');
var utils = require('./utils');
var districtMap = utils.jsonToMap(require('./district.json'));

var linkage = new Linkage({
    length: 3,
    getData: function (meta, done) {
        setTimeout(function () {
            if (meta.index === 0) {
                return done(districtMap[0]);
            }

            done(districtMap[meta.parent]);
        }, 500);
    }
});
var s1El = document.getElementById('s1');
var s2El = document.getElementById('s2');
var s3El = document.getElementById('s3');
var retEl = document.getElementById('ret');
var selectEls = [s1El, s2El, s3El];

// linkage.setValue([1, 11, 111], function () {
//     console.log(linkage.getValue());
// });

linkage.setValue([]);

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
    utils.setOptions(
        selectEls[index],
        list,
        selected,
        true
    );
});


// ===================================

