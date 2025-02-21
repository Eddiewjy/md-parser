"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = entity;
const entities_1 = require("entities");
const utils_js_1 = require("../../common/utils.js");
const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
const NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
    const pos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(pos) !== 0x26 /* & */)
        return false;
    if (pos + 1 >= max)
        return false;
    const ch = state.src.charCodeAt(pos + 1);
    if (ch === 0x23 /* # */) {
        const match = state.src.slice(pos).match(DIGITAL_RE);
        if (match) {
            if (!silent) {
                const code = match[1][0].toLowerCase() === "x"
                    ? parseInt(match[1].slice(1), 16)
                    : parseInt(match[1], 10);
                const token = state.push("text_special", "", 0);
                token.content = (0, utils_js_1.isValidEntityCode)(code)
                    ? (0, utils_js_1.fromCodePoint)(code)
                    : (0, utils_js_1.fromCodePoint)(0xfffd);
                token.markup = match[0];
                token.info = "entity";
            }
            state.pos += match[0].length;
            return true;
        }
    }
    else {
        const match = state.src.slice(pos).match(NAMED_RE);
        if (match) {
            const decoded = (0, entities_1.decodeHTML)(match[0]);
            if (decoded !== match[0]) {
                if (!silent) {
                    const token = state.push("text_special", "", 0);
                    token.content = decoded;
                    token.markup = match[0];
                    token.info = "entity";
                }
                state.pos += match[0].length;
                return true;
            }
        }
    }
    return false;
}
