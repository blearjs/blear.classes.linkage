/**
 * 文件描述
 * @author ydr.me
 * @create 2017-03-21 10:07
 * @update 2017-03-21 10:07
 */


'use strict';

var utils = require('./utils');
var Linkage = require('../src/index');
var plan = require('blear.utils.plan');

var districtMap = utils.jsonToMap(require('./district.json'));

var linkage = new Linkage({
    length: 3,
    getData: function (meta, done) {
        if (meta.index === 0) {
            return done(districtMap[0]);
        }

        done(districtMap[meta.parent]);
    }
});

describe('地址选择器', function () {
    it('main', function (done) {
        plan
            .taskSync(function () {
                var value = linkage.getValue();

                expect(value.length).toBe(3);
                expect(value[0]).toBe(undefined);
                expect(value[1]).toBe(undefined);
                expect(value[2]).toBe(undefined);
            })
            .taskSync(function () {
                var text = linkage.getText();

                expect(text.length).toBe(3);
                expect(text[0]).toBe(undefined);
                expect(text[1]).toBe(undefined);
                expect(text[2]).toBe(undefined);
            })
            // 设置一个不存在的值
            .task(function (next) {
                linkage.setValue([3, 33, 333], function () {
                    var value = linkage.getValue();
                    expect(value.length).toBe(3);
                    expect(Linkage.equal(value[0], undefined)).toBe(true);
                    expect(Linkage.equal(value[1], undefined)).toBe(true);
                    expect(Linkage.equal(value[2], undefined)).toBe(true);

                    var text = linkage.getText();
                    expect(text.length).toBe(3);
                    expect(text[0]).toBe(undefined);
                    expect(text[1]).toBe(undefined);
                    expect(text[2]).toBe(undefined);

                    next();
                });
            })
            .task(function (next) {
                linkage.setValue([1, 11, 111], function () {
                    var value = linkage.getValue();
                    expect(value.length).toBe(3);
                    expect(Linkage.equal(value[0], 1)).toBe(true);
                    expect(Linkage.equal(value[1], 11)).toBe(true);
                    expect(Linkage.equal(value[2], 111)).toBe(true);

                    var text = linkage.getText();
                    expect(text.length).toBe(3);
                    expect(text[0]).toBe('浙江省');
                    expect(text[1]).toBe('杭州市');
                    expect(text[2]).toBe('西湖区');

                    next();
                });
            })
            .task(function (next) {
                linkage.change(2, 112, function () {
                    var value = linkage.getValue();
                    expect(value.length).toBe(3);
                    expect(Linkage.equal(value[0], 1)).toBe(true);
                    expect(Linkage.equal(value[1], 11)).toBe(true);
                    expect(Linkage.equal(value[2], 112)).toBe(true);

                    var text = linkage.getText();
                    expect(text.length).toBe(3);
                    expect(text[0]).toBe('浙江省');
                    expect(text[1]).toBe('杭州市');
                    expect(text[2]).toBe('滨江区');

                    next();
                });
            })
            .task(function (next) {
                linkage.change(1, 12, function () {
                    var value = linkage.getValue();
                    expect(value.length).toBe(3);
                    expect(Linkage.equal(value[0], 1)).toBe(true);
                    expect(Linkage.equal(value[1], 12)).toBe(true);
                    expect(Linkage.equal(value[2], undefined)).toBe(true);

                    var text = linkage.getText();
                    expect(text.length).toBe(3);
                    expect(text[0]).toBe('浙江省');
                    expect(text[1]).toBe('金华市');
                    expect(text[2]).toBe(undefined);

                    next();
                });
            })
            .task(function (next) {
                linkage.change(0, 2, function () {
                    var value = linkage.getValue();
                    expect(value.length).toBe(3);
                    expect(Linkage.equal(value[0], 2)).toBe(true);
                    expect(Linkage.equal(value[1], undefined)).toBe(true);
                    expect(Linkage.equal(value[2], undefined)).toBe(true);

                    var text = linkage.getText();
                    expect(text.length).toBe(3);
                    expect(text[0]).toBe('安徽省');
                    expect(text[1]).toBe(undefined);
                    expect(text[2]).toBe(undefined);

                    next();
                });
            })
            .taskSync(function () {
                linkage.destroy();
            })
            .serial(done);
    });
});

