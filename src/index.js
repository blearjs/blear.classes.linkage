/**
 * 文件描述
 * @author ydr.me
 * @create 2017-03-20 14:56
 * @update 2017-03-20 14:56
 */


'use strict';

var Events = require('blear.classes.events');
var object = require('blear.utils.object');
var plan = require('blear.utils.plan');
var array = require('blear.utils.array');
var typeis = require('blear.utils.typeis');
var fun = require('blear.utils.function');

var defaults = {
    /**
     * 缓存
     * @type Object|null|Boolean
     */
    caches: {},

    /**
     * 联动长度
     * @type Number
     */
    length: 1,

    /**
     * 获取数据
     * @param meta
     * @param meta.index
     * @param meta.parent
     * @param meta.value
     * @param done
     */
    getData: function (meta, done) {
        done([]);
    }
};
var Linkage = Events.extend({
    constructor: function (options) {
        var the = this;

        Linkage.parent(the);
        the[_options] = object.assign({}, defaults, options);
        the[_value] = new Array(the[_options].length);
        the[_text] = new Array(the[_options].length);
    },

    change: function (index, value, callback) {
        callback = fun.ensure(callback);

    },

    setValue: function (value, callback) {
        var the = this;
        var options = the[_options];
        var len = options.length;
        var arr = new Array(len);

        the.reset(0);
        the[_setValue] = value;
        callback = fun.ensure(callback);
        the.emit('beforeLink');
        plan.each(arr, function (index, _, next) {
            the[_getData](index, function (list) {
                var found = null;

                array.each(list, function (_, option) {
                    if (typeis.String(option)) {
                        option = {
                            value: option,
                            text: option
                        };
                    }

                    if (equal(option.value, value[index])) {
                        found = option;
                        return false;
                    }
                });

                if (!found) {
                    var err = new Error('');
                    err.index = index;
                    return next(err);
                }

                the[_value][index] = found.value;
                the[_text][index] = found.text;
                next();
            });
        }).serial(function () {
            the.emit('afterLink');
            callback();
        });

        return the;
    },

    /**
     * 获取值
     * @returns {Array}
     */
    getValue: function () {
        return this[_value];
    },

    /**
     * 获取文字
     * @returns {Array}
     */
    getText: function () {
        return this[_text];
    },

    /**
     * 开始重置
     * @param index
     * @returns {Linkage}
     */
    reset: function (index) {
        var the = this;
        var len = the[_options].length;

        while (index++ < len - 1) {
            the[_value][index] = undefined;
            the[_text][index] = undefined;
            the.emit('reset', index);
        }

        return the;
    },


    /**
     * 销毁
     */
    destroy: function () {
        var the = this;

        the[_options].cache = the[_value] = null;
        Linkage.invoke('destroy', the);
    }
});
var sole = Linkage.sole;
var _options = sole();
var _setValue = sole();
var _value = sole();
var _text = sole();
var _getData = sole();
var _linkage = sole();
var pro = Linkage.prototype;

/**
 * 获取数据
 * @param index {Number} 需要获取的索引值
 * @param done {Function}
 */
pro[_getData] = function (index, done) {
    var the = this;
    var options = the[_options];
    var value = the[_setValue];
    var parent = value[index - 1] || 0;
    var meta = {
        index: index,
        parent: parent,
        value: value
    };
    var cache = options.cache;
    var complete = function (list) {
        the.emit('afterData', meta, list);
        done(list);
    };

    the.emit('beforeData', meta);

    if (cache && cache[index] && cache[index][parent]) {
        return complete(cache[index][parent]);
    }

    options.getData(meta, complete);
};

/**
 * 开始变化
 * @param value {*}
 */
pro[_linkage] = function (value) {
    var the = this;

};


Linkage.defaults = defaults;
module.exports = Linkage;

// =================================
function equal(x, y) {
    return '' + x === '' + y;
}
