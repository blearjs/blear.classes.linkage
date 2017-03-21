/**
 * 文件描述
 * @author ydr.me
 * @create 2017-03-21 10:24
 * @update 2017-03-21 10:24
 */


'use strict';

var Linkage = require('../src/index');
var date = require('blear.utils.date');
var array = require('blear.utils.array');
var plan = require('blear.utils.plan');

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

linkage.on('change', function (index, value) {
    switch (index) {
        // 改变的是年
        case 0:
        // 改变月
        case 1:
            var getValue = linkage.getValue();
            var selectedDate = getValue[2];
            var list = buildDateList({
                value: getValue
            });

            if (selectedDate > list.length) {
                selectedDate = list.length;
            }

            linkage.setList(2, list, selectedDate);
            break;
    }
});

describe('年月日时分秒选择器', function () {
    it('main', function (done) {
        plan
            .task(function (next) {
                var d = new Date();
                var setValue = [
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate(),
                    d.getHours(),
                    parseInt(d.getMinutes() / 10) * 10,
                    parseInt(d.getSeconds() / 10) * 10
                ];
                linkage.setValue(setValue, function () {
                    var value = linkage.getValue();

                    expect(Linkage.equal(value[0], setValue[0])).toBe(true);
                    expect(Linkage.equal(value[1], setValue[1])).toBe(true);
                    expect(Linkage.equal(value[2], setValue[2])).toBe(true);
                    expect(Linkage.equal(value[3], setValue[3])).toBe(true);
                    expect(Linkage.equal(value[4], setValue[4])).toBe(true);
                    expect(Linkage.equal(value[5], setValue[5])).toBe(true);

                    next();
                });
            })
            // 先设置为 2016年3月31日
            .task(function (done) {
                linkage.change(0, 2016, done);
            })
            .task(function (done) {
                linkage.change(1, 2, done);
            })
            .task(function (done) {
                linkage.change(2, 31, done);
            })
            .taskSync(function () {
                var value = linkage.getValue();

                // 此时等于 2016年3月31日
                expect(Linkage.equal(value[0], 2016)).toBe(true);
                expect(Linkage.equal(value[1], 2)).toBe(true);
                expect(Linkage.equal(value[2], 31)).toBe(true);

                // 此时月份列表有 31 个
                expect(linkage.getList(2).length).toBe(31);
            })
            // 再设置为 2016年2月（闰年）
            .task(function (done) {
                linkage.change(1, 1, done);
            })
            .taskSync(function () {
                var value = linkage.getValue();

                // 上一次是 2016年3月31日
                // 此时等于 2016年2月29日
                expect(Linkage.equal(value[0], 2016)).toBe(true);
                expect(Linkage.equal(value[1], 1)).toBe(true);
                expect(Linkage.equal(value[2], 29)).toBe(true);

                // 此时月份列表有 29 个
                expect(linkage.getList(2).length).toBe(29);
            })
            .taskSync(function () {
                linkage.destroy();
            })
            .serial(done);
    });
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
            value: index + 1,
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



