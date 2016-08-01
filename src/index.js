/**
 * blear.classes.linkage
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var Events = require('blear.classes.events');
var object = require('blear.utils.object');
var howdo = require('blear.utils.howdo');
var fun = require('blear.utils.function');

var defaults = {
    /**
     * 是否保留缓存
     * @type Boolean
     */
    cacheable: true,

    /**
     * 联动长度
     * @type Number
     */
    length: 1
};
var Linkage = Events.extend({
    className: 'Linkage',
    constructor: function (options) {
        var the = this;

        // 外部可以覆盖
        the.caches = {};
        the[_value] = [];
        the[_options] = object.assign({}, defaults, options);
    },

    /**
     * 获取数据
     * @param index {Number} 级联索引值
     * @param parent {*} 父级值
     * @param [done] {Function} 回调
     * @returns {Linkage}
     */
    getData: function (index, parent, done) {
        var the = this;

        if (the.caches[index] && the.caches[index][parent]) {
            done(the.caches[index][parent]);
            return the;
        }

        the.emit('data', index, parent, function (list) {
            list = list || [];
            the.caches[index][parent] = list;
        });
        return the;
    },


    /**
     * 改变某一级数据
     * @param index {Number} 级联索引值
     * @param value {*} 值
     * @param [done] {Function} 回调
     * @returns {Linkage}
     */
    change: function (index, value, done) {
        var the = this;
        var options = the[_options];

        done = fun.noop(done);
        the[_value][index] = value;

        if (index === options.length - 1) {
            return the;
        }

        var nextIndex = index + 1;
        the.getData(nextIndex, value, function (list) {
            the.emit('change', nextIndex, list);
            done(nextIndex, list);
        });

        return the;
    },


    /**
     * 获取当前选中的值
     * @returns {Array}
     */
    getValue: function () {
        return [].concat(this[_value]);
    },


    /**
     * 设置值
     * @param value {Array} 值数组
     * @param [done] {Function} 回调
     * @returns {Linkage}
     */
    setValue: function (value, done) {
        var the = this;
        var options = the[_options];

        the[_value] = [];
        howdo.each(new Array(options.length), function (index, _, next) {
            the.change(index, value[index], next)
        }).follow(function () {
            done();
        });

        return the;
    }
});

var _options = Linkage.sole();
var _value = Linkage.sole();

Linkage.defaults = defaults;
module.exports = Linkage;
