"use strict";
// 该对象用于管理解析器的状态，以及解析器的输入和输出
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_js_1 = __importDefault(require("../token.js"));
class StateCore {
    constructor(src, md, env) {
        this.src = src;
        this.env = env;
        this.tokens = [];
        this.inlineMode = false;
        this.md = md; // 解析器实例的链接
    }
}
// 将 Token 静态类型暴露出来
StateCore.Token = token_js_1.default;
exports.default = StateCore;
