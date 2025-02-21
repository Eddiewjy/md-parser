"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMarkdown = void 0;
// 主解析器类
const utils = __importStar(require("./common/utils.js"));
const helpers = __importStar(require("./helpers/index.js"));
const renderer_js_1 = __importDefault(require("./renderer.js"));
const parser_core_js_1 = __importDefault(require("./parser_core.js"));
const parser_block_js_1 = __importDefault(require("./parser_block.js"));
const parser_inline_js_1 = __importDefault(require("./parser_inline.js"));
class IMarkdown {
    constructor() {
        this.inline = new parser_inline_js_1.default();
        this.block = new parser_block_js_1.default();
        this.core = new parser_core_js_1.default();
        this.renderer = new renderer_js_1.default();
        this.options = {};
        this.utils = utils;
        this.helpers = utils.assign({}, helpers);
    }
    parse(src, env) {
        if (typeof src !== "string") {
            throw new Error("Input source should be a string");
        }
        const state = new this.core.State(src, this, env);
        this.core.process(state);
        return state.tokens;
    }
    enable(list) {
        // 启用规则
        let result = [];
        ["core", "block", "inline"].forEach((chain) => {
            result = result.concat(this[chain].ruler.enable(list, true));
        });
        result = result.concat(this.inline.ruler2.enable(list, true));
        const missed = list.filter((name) => {
            return result.indexOf(name) < 0;
        });
        if (missed.length) {
            throw new Error("Failed to enable unknown rule(s): " + missed);
        }
        return this;
    }
    disable(list) {
        // 禁用规则
        let result = [];
        ["core", "block", "inline"].forEach((chain) => {
            result = result.concat(this[chain].ruler.disable(list, true));
        });
        result = result.concat(this.inline.ruler2.disable(list, true));
        const missed = list.filter((name) => {
            return result.indexOf(name) < 0;
        });
        if (missed.length) {
            throw new Error("Failed to disable unknown rule(s): " + missed);
        }
        return this;
    }
    render(src, env) {
        env = env || {};
        return this.renderer.render(this.parse(src, env), this.options, env);
    }
}
exports.IMarkdown = IMarkdown;
