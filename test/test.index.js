/**
 * karma 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var Linkage = require('../src/index.js');
var object = require('blear.utils.object');
var howdo = require('blear.utils.howdo');

var dataJSON = require('./data.json');

var dataMap = {};

var each = function (list) {
    object.each(list, function (index, item) {
        dataMap[item.value] = item.children || [];

        if (item.children) {
            each(item.children);
        }
    });
};

dataMap[0] = dataJSON;
each(dataJSON);

console.log(dataMap);

describe('测试文件', function () {
    it('exports', function (done) {
        var linkage = new Linkage({
            length: 3,
            getData: function (meta, done) {
                var parent = meta.parent || 0;
                done(dataMap[parent]);
            }
        });

        howdo
            // #setValue
            .task(function (next) {
                console.log('-------------------------------');
                linkage.setValue(['1', '11', '111'], next);
            })
            // #getValue
            .task(function (next) {
                var value = linkage.getValue();
                expect(value).toEqual(['1', '11', '111']);
                next();
            })
            // #change
            .task(function (next) {
                console.log('-------------------------------');
                linkage.change(2, '112', function () {
                    next();
                });
            })
            // #getValue
            .task(function (next) {
                var value = linkage.getValue();

                expect(value[0]).toEqual('1');
                expect(value[1]).toEqual('11');
                expect(value[2]).toEqual('112');
                next();
            })
            // #change
            .task(function (next) {
                console.log('-------------------------------');
                linkage.change(1, '12', function () {
                    next();
                });
            })
            // #getValue
            .task(function (next) {
                var value = linkage.getValue();

                expect(value[0]).toEqual('1');
                expect(value[1]).toEqual('12');
                expect(value[2]).toEqual(undefined);
                next();
            })
            // #change
            .task(function (next) {
                console.log('-------------------------------');
                linkage.change(0, '2', function () {
                    next();
                });
            })
            // #getValue
            .task(function (next) {
                var value = linkage.getValue();

                expect(value[0]).toEqual('2');
                expect(value[1]).toEqual(undefined);
                expect(value[2]).toEqual(undefined);
                next();
            })
            .follow(done);
    });
});
