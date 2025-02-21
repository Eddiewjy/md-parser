"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ruler_js_1 = __importDefault(require("./ruler.js"));
const state_inline_js_1 = __importDefault(require("./fsm/state_inline.js"));
// 基础语法规则
const text_js_1 = __importDefault(require("./rules/inline/text.js"));
const linkify_js_1 = __importDefault(require("./rules/inline/linkify.js"));
const escape_js_1 = __importDefault(require("./rules/inline/escape.js"));
const strikethrough_js_1 = __importDefault(require("./rules/inline/strikethrough.js"));
const emphasis_js_1 = __importDefault(require("./rules/inline/emphasis.js"));
const link_js_1 = __importDefault(require("./rules/inline/link.js"));
const image_js_1 = __importDefault(require("./rules/inline/image.js"));
const entity_js_1 = __importDefault(require("./rules/inline/entity.js"));
const balance_pairs_js_1 = __importDefault(require("./rules/inline/balance_pairs.js"));
const fragments_join_js_1 = __importDefault(require("./rules/inline/fragments_join.js"));
// 主解析规则
const _rules = [
    ["text", text_js_1.default], // 跳过普通文本
    ["linkify", linkify_js_1.default], // 链接识别
    ["escape", escape_js_1.default], // 识别转义字符
    ["strikethrough", strikethrough_js_1.default.tokenize], // 删除线
    ["emphasis", emphasis_js_1.default.tokenize], // 粗体
    ["link", link_js_1.default], // 链接
    ["image", image_js_1.default], // 图片
    ["entity", entity_js_1.default], // HTML实体，即无法在html中表示的字符
];
//解析成对标签,针对强调和删除线
const _rules2 = [
    ["balance_pairs", balance_pairs_js_1.default],
    ["strikethrough", strikethrough_js_1.default.postProcess],
    ["emphasis", emphasis_js_1.default.postProcess],
    // 规则用于将成对的 '**' 分隔成独立的文本标记，这些标记可能会被遗弃，
    // 下面的规则将未使用的片段重新合并到文本中
    ["fragments_join", fragments_join_js_1.default],
];
class ParserInline {
    constructor() {
        this.ruler = new ruler_js_1.default();
        this.ruler2 = new ruler_js_1.default();
        for (const [name, rule] of _rules) {
            this.ruler.push(name, rule);
        }
        for (const [name, rule] of _rules2) {
            this.ruler2.push(name, rule);
        }
        this.State = state_inline_js_1.default;
    }
    // 跳过单个token，通过验证模式运行所有规则；
    // 如果任何规则成功，返回`true`
    skipToken(state) {
        const pos = state.pos;
        const rules = this.ruler.getRules("");
        const cache = state.cache;
        if (typeof cache[pos] !== "undefined") {
            state.pos = cache[pos];
            return;
        }
        let ok = false;
        for (const rule of rules) {
            state.level++;
            ok = rule(state, true);
            state.level--;
            if (ok) {
                if (pos >= state.pos) {
                    throw new Error("inline rule didn't increment state.pos");
                }
                break;
            }
        }
        if (!ok) {
            state.pos++;
        }
        cache[pos] = state.pos;
    }
    tokenize(state) {
        const rules = this.ruler.getRules("");
        const end = state.posMax;
        while (state.pos < end) {
            const prevPos = state.pos;
            let ok = false;
            for (const rule of rules) {
                ok = rule(state, false);
                if (ok) {
                    if (prevPos >= state.pos) {
                        throw new Error("inline rule didn't increment state.pos");
                    }
                    break;
                }
            }
            if (ok) {
                if (state.pos >= end) {
                    break;
                }
                continue;
            }
            state.pending += state.src[state.pos++];
        }
        if (state.pending) {
            state.pushPending();
        }
    }
    /**
     * ParserInline.parse(str, md, env, outTokens)
     *
     * 处理输入字符串并将内联tokens推送到`outTokens`
     **/
    parse(str, md, env, outTokens) {
        const state = new this.State(str, md, env, outTokens);
        this.tokenize(state);
        const rules = this.ruler2.getRules("");
        for (const rule of rules) {
            rule(state);
        }
    }
}
exports.default = ParserInline;
