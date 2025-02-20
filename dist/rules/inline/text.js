// Skip text characters for text token, place those to pending buffer
// and increment current pos
// 跳过纯文本的规则
// '{}$%@~+=:' 保留用于扩展
// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, 或 ~
// !!!! 不要与“Markdown ASCII 标点”字符混淆
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
function isTerminatorChar(ch) {
    switch (ch) {
        case 0x0a /* \n */:
        case 0x21 /* ! */:
        case 0x23 /* # */:
        case 0x24 /* $ */:
        case 0x25 /* % */:
        case 0x26 /* & */:
        case 0x2a /* * */:
        case 0x2b /* + */:
        case 0x2d /* - */:
        case 0x3a /* : */:
        case 0x3c /* < */:
        case 0x3d /* = */:
        case 0x3e /* > */:
        case 0x40 /* @ */:
        case 0x5b /* [ */:
        case 0x5c /* \ */:
        case 0x5d /* ] */:
        case 0x5e /* ^ */:
        case 0x5f /* _ */:
        case 0x60 /* ` */:
        case 0x7b /* { */:
        case 0x7d /* } */:
        case 0x7e /* ~ */:
            return true;
        default:
            return false;
    }
}
export default function text(state, silent) {
    // console.log("lll");
    let pos = state.pos;
    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
        pos++;
    }
    if (pos === state.pos) {
        return false;
    }
    if (!silent) {
        state.pending += state.src.slice(state.pos, pos);
    }
    state.pos = pos;
    return true;
}
