/**
 * blear.classes.linkage
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var Events = require('blear.classes.events');

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
    },

    /**
     * 获取数据
     * @param index
     * @param parent
     * @param done
     * @returns {Linkage}
     */
    getList: function (index, parent, done) {
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

    change: function (index, value, done) {

    }
});

Linkage.defaults = defaults;
module.exports = Linkage;
