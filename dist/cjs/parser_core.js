"use strict";
/** internal
 * class Core
 *
 * 顶层规则执行器。连接块解析器和行内解析器，并执行中间转换。
 **/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ruler_js_1 = __importDefault(require("./ruler.js"));
const state_core_js_1 = __importDefault(require("./fsm/state_core.js"));
const normalize_js_1 = __importDefault(require("./rules/core/normalize.js"));
const block_js_1 = __importDefault(require("./rules/core/block.js"));
const inline_js_1 = __importDefault(require("./rules/core/inline.js"));
const text_join_js_1 = __importDefault(require("./rules/core/text_join.js"));
//先将字符串正规化，然后解析块级元素，最后解析内联元素
const _rules = [
    ["normalize", normalize_js_1.default],
    ["block", block_js_1.default],
    ["inline", inline_js_1.default],
    ["text_join", text_join_js_1.default],
];
/**
 * new Core()
 **/
class Core {
    constructor() {
        // 将 StateCore 类型暴露出来
        this.State = state_core_js_1.default;
        // 创建规则管理器
        this.ruler = new ruler_js_1.default();
        // 添加核心规则
        for (const [name, rule] of _rules) {
            this.ruler.push(name, rule);
        }
    }
    // 启用规则链
    process(state) {
        const rules = this.ruler.getRules("");
        for (const rule of rules) {
            rule(state);
        }
    }
}
exports.default = Core;
