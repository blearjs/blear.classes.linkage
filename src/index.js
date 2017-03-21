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
var time = require('blear.utils.time');
var access = require('blear.utils.access');

var nextTick = time.nextTick;
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
     * 相互之间是否相对独立，如国省市是相互联系的，
     * 但年月日是一定程度相互独立的，
     * 如果是相互联系的，则父级变化会重置子级，
     * 而如果是相互独立的，则不不会重置子级
     * @type Boolean
     */
    single: false,

    // /**
    //  * 如果未匹配，是否降级选中第一个
    //  * @type Boolean
    //  */
    // downgradeFirst: false,

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
        the[_selectedValue] = new Array(the[_options].length);
        the[_setValue] = new Array(the[_options].length);
        the[_displayText] = new Array(the[_options].length);
        the[_optionsList] = new Array(the[_options].length);
    },

    /**
     * 改变某一级数据
     * @param index {Number} 索引值
     * @param value {String|Number} 值
     * @param [callback] {Function} 回调
     * @returns {Linkage}
     */
    change: function (index, value, callback) {
        var the = this;
        var options = the[_options];
        var len = options.length;
        var start = index + 1;
        var complete = function () {
            the[_selectedValue][index] = value;
            the[_displayText][index] = the[_getTextByValue](index, value);
            the.emit('change', index, value);
            the.emit('afterLink');
        };
        callback = fun.ensure(callback);

        nextTick(function () {
            the.emit('beforeLink');
            the[_setValue][index] = value;

            // 改变的是最后一个 select
            if (start >= len) {
                complete();
                callback();
                return the;
            }

            if (!options.single) {
                the.reset(start);
            }

            the[_getData](start, function (list) {
                complete();
                the.emit('changeList', start, list,
                    options.single ? the[_setValue][start] : undefined
                );
                callback();
            });
        });

        return the;
    },

    /**
     * 全量设值
     * @param value {Array}
     * @param [callback] {Function} 回调
     * @returns {Linkage}
     */
    setValue: function (value, callback) {
        var the = this;
        var options = the[_options];
        var len = options.length;
        var arr = new Array(len);

        nextTick(function () {
            if (!options.single) {
                the.reset(0);
            }

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
                            the.emit('changeList', index, list, option.value);
                            return false;
                        }
                    });

                    if (!found) {
                        var err = new Error('');
                        err.index = index;
                        the.emit('changeList', index, list);
                        return next(err);
                    }

                    the[_selectedValue][index] = found.value;
                    the[_displayText][index] = found.text;
                    next();
                });
            }).serial(function () {
                the.emit('afterLink');
                callback();
            });
        });


        return the;
    },

    /**
     * 获取值
     * @returns {Array}
     */
    getValue: function () {
        return this[_selectedValue];
    },

    /**
     * 获取文字
     * @returns {Array}
     */
    getText: function () {
        return this[_displayText];
    },

    /**
     * 开始重置
     * @param index {Number} 开始重置的索引值，含
     * @returns {Linkage}
     */
    reset: function (index) {
        var the = this;
        var len = the[_options].length;

        do {
            the[_selectedValue][index] = undefined;
            the[_setValue][index] = undefined;
            the[_displayText][index] = undefined;
            the.emit('changeList', index, []);
            index++;
        } while (index < len);

        return the;
    },

    setList: function (index, list, selected) {
        var the = this;
        var options = the[_options];
        var caches = options.caches;
        var parent = the[_selectedValue][index - 1];
        var args = access.args(arguments);

        if (caches) {
            caches[index] = caches[index] || {};
            caches[index][parent] = list;
        }

        if (args.length === 3) {
            the[_setValue][index] = selected;
            the[_selectedValue][index] = selected;
            the[_displayText][index] = the[_getTextByValue](index, selected);
        }

        the[_optionsList][index] = list;
        the.emit('changeList', index, list, selected);
        return the;
    },

    /**
     * 销毁
     */
    destroy: function () {
        var the = this;

        the[_options].caches = the[_selectedValue] = null;
        Linkage.invoke('destroy', the);
    }
});
var sole = Linkage.sole;
var _options = sole();
var _setValue = sole();
var _selectedValue = sole();
var _displayText = sole();
var _optionsList = sole();
var _getData = sole();
var _getTextByValue = sole();
var pro = Linkage.prototype;

/**
 * 获取数据
 * @param index {Number} 需要获取的索引值
 * @param done {Function}
 */
pro[_getData] = function (index, done) {
    var the = this;
    var options = the[_options];
    var setValue = the[_setValue];
    var parent = setValue[index - 1];
    var meta = {
        index: index,
        parent: parent,
        value: setValue,
        text: the[_displayText]
    };
    var caches = options.caches;
    var complete = function (list) {
        list = list || [];
        the.emit('afterData', meta, list);

        if (caches) {
            caches[index] = caches[index] || {};
            caches[index][parent] = list;
        }

        the[_optionsList][index] = list;
        done(list);
    };

    the.emit('beforeData', meta);

    if (index > 0 && parent === undefined) {
        return complete([]);
    }

    if (caches && caches[index] && caches[index][parent]) {
        return complete(caches[index][parent]);
    }

    options.getData(meta, complete);
};


/**
 * 根据值取文本
 * @param index
 * @param value
 */
pro[_getTextByValue] = function (index, value) {
    var the = this;
    var found = null;

    array.each(the[_optionsList][index], function (_, option) {
        if (equal(option.value, value)) {
            found = option;
            return false;
        }
    });

    if (!found) {
        return value;
    }

    return found.text;
};


Linkage.defaults = defaults;
Linkage.equal = equal;
module.exports = Linkage;

// =================================
function equal(x, y) {
    return '' + x === '' + y;
}
