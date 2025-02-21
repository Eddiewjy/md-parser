"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = block;
const state_core_js_1 = __importDefault(require("../../fsm/state_core.js"));
function block(state) {
    let token;
    if (state.inlineMode) {
        // 如果是内联模式，创建一个内联 token
        token = new state_core_js_1.default.Token("inline", "", 0);
        token.content = state.src;
        token.map = [0, 1];
        token.children = [];
        state.tokens.push(token);
    }
    else {
        // 否则，解析块元素
        state.md.block.parse(state.src, state.md, state.env, state.tokens);
    }
}
