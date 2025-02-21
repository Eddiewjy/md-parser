"use strict";
/**
 * class Ruler 规则管理器
 *
 * 帮助类，用于管理规则序列（函数）：
 *
 * - 保持规则的顺序
 * - 给每个规则分配名字
 * - 启用/禁用规则
 * - 缓存启用规则的列表，以便快速查找
 **/
Object.defineProperty(exports, "__esModule", { value: true });
class Ruler {
    constructor() {
        this.__rules__ = [];
        this.__cache__ = null;
    }
    // 查找规则的索引
    __find__(name) {
        return this.__rules__.findIndex((rule) => rule.name === name);
    }
    // 构建规则查找缓存，可以将时间复杂度从O(n^2)降低到O(n)
    __compile__() {
        const chains = [""];
        // 收集唯一的链名称
        this.__rules__.forEach((rule) => {
            if (!rule.enabled)
                return;
            rule.alt.forEach((altName) => {
                if (!chains.includes(altName)) {
                    chains.push(altName);
                }
            });
        });
        this.__cache__ = {};
        chains.forEach((chain) => {
            this.__cache__[chain] = [];
            this.__rules__.forEach((rule) => {
                if (!rule.enabled)
                    return;
                if (chain && !rule.alt.includes(chain))
                    return;
                this.__cache__[chain].push(rule.fn);
            });
        });
    }
    // 添加规则到链尾
    push(ruleName, fn, options) {
        const opt = options || {};
        this.__rules__.push({
            name: ruleName,
            enabled: true,
            fn,
            alt: opt.alt || [],
        });
        this.__cache__ = null;
    }
    //启用给定名称的规则，如果未找到规则，抛出错误
    enable(list, ignoreInvalid) {
        if (!Array.isArray(list)) {
            list = [list];
        }
        const result = [];
        // 查找并启用规则
        list.forEach((name) => {
            const idx = this.__find__(name);
            if (idx < 0) {
                if (ignoreInvalid)
                    return;
                throw new Error("规则管理: 无效的规则名称 " + name);
            }
            this.__rules__[idx].enabled = true;
            result.push(name);
        });
        this.__cache__ = null;
        return result;
    }
    //禁用给定名称的规则，如果未找到规则，抛出错误
    disable(list, ignoreInvalid) {
        if (!Array.isArray(list)) {
            list = [list];
        }
        const result = [];
        // 查找并禁用规则
        list.forEach((name) => {
            const idx = this.__find__(name);
            if (idx < 0) {
                if (ignoreInvalid)
                    return;
                throw new Error("规则管理: 无效的规则名称 " + name);
            }
            this.__rules__[idx].enabled = false;
            result.push(name);
        });
        this.__cache__ = null;
        return result;
    }
    //获取给定链名称的规则列表
    getRules(chainName) {
        if (this.__cache__ === null) {
            this.__compile__();
        }
        // 如果规则被禁用，链可以是空的。但仍然返回一个数组
        return this.__cache__[chainName] || [];
    }
}
exports.default = Ruler;
