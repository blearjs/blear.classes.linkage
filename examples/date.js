/**
 * 文件描述
 * @author ydr.me
 * @create 2017-03-20 17:55
 * @update 2017-03-20 17:55
 */


'use strict';

var s1El = document.getElementById('s1');
var s2El = document.getElementById('s2');
var s3El = document.getElementById('s3');
var s4El = document.getElementById('s4');
var s5El = document.getElementById('s5');
var s6El = document.getElementById('s6');
var retEl = document.getElementById('ret');
var selectEls = [s1El, s2El, s3El, s4El, s5El, s6El];

var array = require('blear.utils.array');
var date = require('blear.utils.date');
var Linkage = require('../src/index');
var utils = require('./utils');

var linkage = new Linkage({
    caches: false,
    single: true,
    length: 6,
    getData: function (meta, done) {
        switch (meta.index) {
            case 0:
                return done(buildYearList(meta));

            case 1:
                return done(buildMonthList(meta));

            case 2:
                return done(buildDateList(meta));

            case 3:
                return done(buildHourList(meta));

            case 4:
                return done(buildMinuteList(meta));

            case 5:
                return done(buildSecondList(meta));
        }
    }
});

array.each(selectEls, function (index, el) {
    el.onchange = function () {
        linkage.change(index, el.value);
    };
});

var d = new Date();
linkage.setValue([
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    parseInt(d.getMinutes() / 10) * 10,
    parseInt(d.getSeconds() / 10) * 10
]);

linkage.on('beforeLink', function () {
    selectEls.forEach(function (el) {
        el.disabled = true;
    });
});

linkage.on('afterLink', function () {
    selectEls.forEach(function (el) {
        el.disabled = false;
    });
    retEl.innerHTML = '当前选择的是：' +
        '<br>' + linkage.getValue().join('-') +
        '<br>' + linkage.getText().join('');
});

linkage.on('changeList', function (index, list, selected) {
    utils.setOptions(
        selectEls[index],
        list,
        selected,
        false
    );
});


// ===============================

function buildYearList() {
    var arr = new Array(10);

    arr = array.map(arr, function (item, index) {
        return {
            value: 2010 + index,
            text: 2010 + index + '年'
        };
    });

    return arr;
}


function buildMonthList() {
    var arr = new Array(12);

    arr = array.map(arr, function (item, index) {
        return {
            value: index,
            text: 1 + index + '月'
        };
    });

    return arr;
}


function buildDateList(meta) {
    var arr = new Array(date.getDaysInMonth(meta.value[0], meta.value[1]));

    arr = array.map(arr, function (item, index) {
        return {
            value: index,
            text: 1 + index + '日'
        };
    });

    return arr;
}


function buildHourList(meta) {
    var arr = new Array(24);

    arr = array.map(arr, function (item, index) {
        return {
            value: index,
            text: index + '时'
        };
    });

    return arr;
}

function buildMinuteList(meta) {
    var arr = new Array(6);

    arr = array.map(arr, function (item, index) {
        return {
            value: index * 10,
            text: index * 10 + '分'
        };
    });

    return arr;
}


function buildSecondList(meta) {
    var arr = new Array(6);

    arr = array.map(arr, function (item, index) {
        return {
            value: index * 10,
            text: index * 10 + '秒'
        };
    });

    return arr;
}

