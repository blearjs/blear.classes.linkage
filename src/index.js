/**
 * blear.classes.linkage
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var Events = require('blear.classes.events');
var typeis = require('blear.utils.typeis');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var howdo = require('blear.utils.howdo');
var fun = require('blear.utils.function');
var time = require('blear.utils.time');

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

        Linkage.parent(the);
        // 外部可以覆盖
        the.caches = {};
        the[_value] = [];
        the[_parent] = [];
        the[_ready] = false;
        the[_readyCallbacks] = [];
        the[_options] = object.assign({}, defaults, options);
        the[_init0]();
    },


    /**
     * 是否准备完毕
     * @param callback
     * @returns {Linkage}
     */
    ready: function (callback) {
        var the = this;

        if (!typeis.Function(callback)) {
            return the;
        }

        if (the[_ready]) {
            callback.call(the);
            return the;
        }

        the[_readyCallbacks].push(callback);

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
        the[_change](index, value, function () {
            var changeListIndex = index + 1;
            var changeValueIndex = index;

            // 清空后面的列表
            while (++changeListIndex < options.length) {
                the.emit('changeList', changeListIndex, []);
            }

            // 清空后面的选中值
            while (++changeValueIndex < options.length) {
                the[_value][changeValueIndex] = undefined;
                the.emit('changeValue', changeValueIndex, undefined);
            }

            done();
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

        done = fun.noop(done);
        the[_value] = [];
        howdo.each(new Array(options.length), function (index, _, next) {
            the[_change](index, value[index], function (list) {
                next();
            });
        }).follow(function () {
            done();
        });

        return the;
    }
});

var pro = Linkage.prototype;
var _options = Linkage.sole();
var _value = Linkage.sole();
var _parent = Linkage.sole();
var _change = Linkage.sole();
var _ready = Linkage.sole();
var _readyCallbacks = Linkage.sole();
var _init0 = Linkage.sole();
var _getData = Linkage.sole();


/**
 * 获取数据
 * @param index {Number} 级联索引值
 * @param parent {*} 父级值
 * @param [done] {Function} 回调
 */
pro[_getData] = function (index, parent, done) {
    var the = this;

    if (the.caches[index] && the.caches[index][parent]) {
        return done(the.caches[index][parent]);
    }

    the.emit('getData', index, parent, function (list) {
        list = list || [];
        the.caches[index] = the.caches[index] || {};
        the.caches[index][parent] = list;
        done(list);
    });
};


/**
 * 改变某一级数据
 * @param index {Number} 级联索引值
 * @param value {*} 值
 * @param [done] {Function} 回调
 */
pro[_change] = function (index, value, done) {
    var the = this;
    var options = the[_options];

    done = fun.noop(done);

    if (the[_value][index] === value) {
        return done();
    }

    the[_value][index] = value;

    if (the[_parent][index] !== value) {
        the.emit('changeValue', index, the[_value][index]);
    }

    if (index === options.length - 1) {
        return done();
    }

    var nextIndex = index + 1;

    the[_getData](nextIndex, value, function (list) {
        the.emit('changeList', nextIndex, list);
        the[_parent][nextIndex] = value;
        done(nextIndex, list);
    });
};


/**
 * 获取第一级数据
 */
pro[_init0] = function () {
    var the = this;

    time.nextTick(function () {
        the[_getData](0, undefined, function (list) {
            the[_ready] = true;
            array.each(the[_readyCallbacks], function (index, callback) {
                callback.call(the);
            });
            the[_readyCallbacks] = null;
            the.emit('changeList', 0, list);
            the.emit('ready');
        });
    });
};


Linkage.defaults = defaults;
module.exports = Linkage;
