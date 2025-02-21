"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("./common/utils.js");
const default_rules = {};
// 渲染内联代码
default_rules.code_inline = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return ("<code" +
        slf.renderAttrs(token) +
        ">" +
        (0, utils_js_1.escapeHtml)(token.content) +
        "</code>");
};
// 渲染代码块
default_rules.code_block = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return ("<pre" +
        slf.renderAttrs(token) +
        "><code>" +
        (0, utils_js_1.escapeHtml)(tokens[idx].content) +
        "</code></pre>\n");
};
// 渲染带有语言高亮的代码块
default_rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? (0, utils_js_1.unescapeAll)(token.info).trim() : "";
    let langName = "";
    let langAttrs = "";
    if (info) {
        const arr = info.split(/(\s+)/g);
        langName = arr[0];
        langAttrs = arr.slice(2).join("");
    }
    let highlighted;
    if (options.highlight) {
        highlighted =
            options.highlight(token.content, langName, langAttrs) ||
                (0, utils_js_1.escapeHtml)(token.content);
    }
    else {
        highlighted = (0, utils_js_1.escapeHtml)(token.content);
    }
    if (highlighted.indexOf("<pre") === 0) {
        return highlighted + "\n";
    }
    if (info) {
        const i = token.attrIndex("class");
        const tmpAttrs = token.attrs ? token.attrs.slice() : [];
        if (i < 0) {
            tmpAttrs.push(["class", options.langPrefix + langName]);
        }
        else {
            tmpAttrs[i] = [tmpAttrs[i][0], tmpAttrs[i][1]];
            tmpAttrs[i][1] += " " + options.langPrefix + langName;
        }
        const tmpToken = {
            attrs: tmpAttrs,
        };
        return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`;
    }
    return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`;
};
// 渲染文本
default_rules.text = function (tokens, idx /*, options, env */) {
    return (0, utils_js_1.escapeHtml)(tokens[idx].content);
};
// 渲染 HTML 块
default_rules.html_block = function (tokens, idx /*, options, env */) {
    return tokens[idx].content;
};
// 渲染内联 HTML
default_rules.html_inline = function (tokens, idx /*, options, env */) {
    return tokens[idx].content;
};
// 创建新的 Renderer 实例，并填充默认的 rules
class Renderer {
    constructor() {
        this.rules = (0, utils_js_1.assign)({}, default_rules);
    }
    // 渲染 token 的属性为字符串
    renderAttrs(token) {
        if (!token.attrs) {
            return "";
        }
        return token.attrs
            .map((attr) => ` ${(0, utils_js_1.escapeHtml)(attr[0])}="${(0, utils_js_1.escapeHtml)(attr[1])}"`)
            .join("");
    }
    // 默认的 token 渲染器
    renderToken(tokens, idx, options) {
        const token = tokens[idx];
        let result = "";
        if (token.hidden) {
            return "";
        }
        if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
            result += "\n";
        }
        result += (token.nesting === -1 ? "</" : "<") + token.tag;
        result += this.renderAttrs(token);
        if (token.nesting === 0 && options.xhtmlOut) {
            result += " /";
        }
        let needLf = false;
        if (token.block) {
            needLf = true;
            if (token.nesting === 1) {
                if (idx + 1 < tokens.length) {
                    const nextToken = tokens[idx + 1];
                    if (nextToken.type === "inline" || nextToken.hidden) {
                        needLf = false;
                    }
                    else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
                        needLf = false;
                    }
                }
            }
        }
        result += needLf ? ">\n" : ">";
        return result;
    }
    // 渲染内联 token
    renderInline(tokens, options, env) {
        let result = "";
        const rules = this.rules;
        for (let i = 0, len = tokens.length; i < len; i++) {
            const type = tokens[i].type;
            if (typeof rules[type] !== "undefined") {
                result += rules[type](tokens, i, options, env, this);
            }
            else {
                result += this.renderToken(tokens, i, options);
            }
        }
        return result;
    }
    // 渲染 token 流并生成 HTML
    render(tokens, options, env) {
        let result = "";
        const rules = this.rules;
        for (let i = 0, len = tokens.length; i < len; i++) {
            const type = tokens[i].type;
            if (type === "inline") {
                result += this.renderInline(tokens[i].children, options, env);
            }
            else if (typeof rules[type] !== "undefined") {
                result += rules[type](tokens, i, options, env, this);
            }
            else {
                result += this.renderToken(tokens, i, options);
            }
        }
        return result;
    }
}
exports.default = Renderer;
