/** internal
 * class Core
 *
 * 顶层规则执行器。连接块解析器和行内解析器，并执行中间转换。
 **/
import Ruler from "./ruler.js";
import StateCore from "./fsm/state_core.js";
import r_normalize from "./rules/core/normalize.js";
import r_block from "./rules/core/block.js";
import r_inline from "./rules/core/inline.js";
import r_text_join from "./rules/core/text_join.js";
//先将字符串正规化，然后解析块级元素，最后解析内联元素
const _rules = [
    ["normalize", r_normalize],
    ["block", r_block],
    ["inline", r_inline],
    ["text_join", r_text_join],
];
/**
 * new Core()
 **/
export default class Core {
    constructor() {
        // 将 StateCore 类型暴露出来
        this.State = StateCore;
        // 创建规则管理器
        this.ruler = new Ruler();
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
