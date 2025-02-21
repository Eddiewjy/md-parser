"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** 内部实现
 * class ParserBlock
 *
 * 块级解析器。
 **/
//这里rule的参数要包括起始行和结束行，因为块级解析器是一块一块解析的
const ruler_js_1 = __importDefault(require("./ruler.js"));
const state_block_js_1 = __importDefault(require("./fsm/state_block.js"));
const paragraph_js_1 = __importDefault(require("./rules/block/paragraph.js"));
const heading_js_1 = __importDefault(require("./rules/block/heading.js"));
const list_js_1 = __importDefault(require("./rules/block/list.js"));
const table_js_1 = __importDefault(require("./rules/block/table.js"));
const blockquote_js_1 = __importDefault(require("./rules/block/blockquote.js"));
const hr_js_1 = __importDefault(require("./rules/block/hr.js"));
const code_js_1 = __importDefault(require("./rules/block/code.js"));
const fence_js_1 = __importDefault(require("./rules/block/fence.js"));
const reference_js_1 = __importDefault(require("./rules/block/reference.js"));
const html_block_js_1 = __importDefault(require("./rules/block/html_block.js"));
const lheading_js_1 = __importDefault(require("./rules/block/lheading.js"));
// 定义核心解析规则
const _rules = [
    ["table", table_js_1.default, ["paragraph", "reference"]],
    ["code", code_js_1.default],
    ["fence", fence_js_1.default, ["paragraph", "reference", "blockquote", "list"]],
    [
        "blockquote",
        blockquote_js_1.default,
        ["paragraph", "reference", "blockquote", "list"],
    ],
    ["hr", hr_js_1.default, ["paragraph", "reference", "blockquote", "list"]],
    ["list", list_js_1.default, ["paragraph", "reference", "blockquote"]],
    ["reference", reference_js_1.default],
    ["html_block", html_block_js_1.default, ["paragraph", "reference", "blockquote"]],
    ["heading", heading_js_1.default, ["paragraph", "reference", "blockquote"]],
    ["lheading", lheading_js_1.default],
    ["paragraph", paragraph_js_1.default],
];
/**
 * 块级解析器
 */
class ParserBlock {
    constructor() {
        this.ruler = new ruler_js_1.default();
        for (const [name, rule, alt] of _rules) {
            this.ruler.push(name, rule, {
                alt: alt ? [...alt] : [],
            });
        }
        this.State = state_block_js_1.default;
    }
    /**
     * 解析输入范围并生成 Token
     * @param state 解析状态
     * @param startLine 起始行
     * @param endLine 结束行
     */
    tokenize(state, startLine, endLine) {
        const rules = this.ruler.getRules("");
        let line = startLine;
        let hasEmptyLines = false;
        while (line < endLine) {
            state.line = line = state.skipEmptyLines(line);
            if (line >= endLine)
                break;
            if (state.sCount[line] < state.blkIndent) {
                break;
            }
            if (state.level >= 20) {
                state.line = endLine;
                break;
            }
            const prevLine = state.line;
            let matched = false;
            for (const rule of rules) {
                matched = rule(state, line, endLine, false);
                if (matched) {
                    if (prevLine >= state.line) {
                        throw new Error("块规则未正确递增state.line");
                    }
                    break;
                }
            }
            if (!matched)
                throw new Error("没有匹配的块规则");
            line = state.line;
            if (line < endLine && state.isEmpty(line)) {
                hasEmptyLines = true;
                line++;
                state.line = line;
            }
        }
    }
    /**
     * 解析输入字符串并推送块级 Tokens
     * @param src 输入字符串
     * @param md Markdown 实例
     * @param env 环境变量
     * @param outTokens core 传入的token
     */
    parse(src, md, env, outTokens) {
        if (!src)
            return;
        const state = new this.State(src, md, env, outTokens);
        this.tokenize(state, state.line, state.lineMax);
    }
}
exports.default = ParserBlock;
