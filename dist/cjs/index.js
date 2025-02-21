"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParserInstance = getParserInstance;
const imd_js_1 = require("./imd.js");
// 规则映射对象
const ruleMap = {
    headings: ["heading"],
    emphasis: ["emphasis"],
    strikethrough: ["strikethrough"],
    lists: ["list"],
    link: ["link"],
    image: ["image"],
    blockquote: ["blockquote"],
    hr: ["hr"],
    tables: ["table"],
    math: ["math"],
    mermaid: ["mermaid"],
    footnotes: ["footnote"],
    taskLists: ["taskList"],
};
// getParserInstance 接口
function getParserInstance(options) {
    const { features, codeBlock, security, performance } = options;
    // 根据选项动态配置解析器的行为
    const parserOptions = {
        features: features || {},
        codeBlock: codeBlock || {},
        security: security || {},
        performance: performance || {},
    };
    const md = new imd_js_1.IMarkdown();
    const enableList = [];
    const disableList = [];
    // 遍历 features 并根据值推入 enableList 或 disableList
    Object.keys(parserOptions.features).forEach((featureCategory) => {
        const featureOptions = parserOptions.features[featureCategory];
        if (typeof featureOptions === "object") {
            Object.keys(featureOptions).forEach((feature) => {
                const isEnabled = featureOptions[feature];
                const rules = ruleMap[feature];
                if (rules) {
                    if (isEnabled) {
                        enableList.push(...rules);
                    }
                    else {
                        disableList.push(...rules);
                    }
                }
            });
        }
    });
    // 启用和禁用规则
    if (enableList.length > 0) {
        md.enable(enableList);
    }
    if (disableList.length > 0) {
        md.disable(disableList);
    }
    // 返回解析器实例
    return md;
}
