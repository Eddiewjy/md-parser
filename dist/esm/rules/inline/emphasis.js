// 解析 *this* 和 **this** 的强调标记，也支持 _this_ 和 __this__
// 插入每个标记作为单独的文本标记，并将其添加到分隔符列表中
//
function emphasis_tokenize(state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    if (silent) {
        return false;
    }
    if (marker !== 0x5f /* _ */ && marker !== 0x2a /* * */) {
        return false;
    }
    const scanned = state.scanDelims(state.pos, marker === 0x2a);
    for (let i = 0; i < scanned.length; i++) {
        const token = state.push("text", "", 0);
        token.content = String.fromCharCode(marker);
        state.delimiters.push({
            marker, // 起始标记的字符代码（数字）
            length: scanned.length, // 这些分隔符系列的总长度
            token: state.tokens.length - 1, // 该分隔符对应的标记的位置
            end: -1, // 如果该分隔符匹配为有效的起始标记，`end` 将等于其位置，否则为 `-1`
            open: scanned.can_open, // 布尔标志，确定该分隔符是否可以打开强调
            close: scanned.can_close, // 布尔标志，确定该分隔符是否可以关闭强调
        });
    }
    state.pos += scanned.length;
    return true;
}
function postProcess(state, delimiters) {
    const max = delimiters.length;
    for (let i = max - 1; i >= 0; i--) {
        const startDelim = delimiters[i];
        if (startDelim.marker !== 0x5f /* _ */ &&
            startDelim.marker !== 0x2a /* * */) {
            continue;
        }
        // 仅处理起始标记
        if (startDelim.end === -1) {
            continue;
        }
        const endDelim = delimiters[startDelim.end];
        // 如果前一个分隔符具有相同的标记并且与此分隔符相邻，则将它们合并为一个强分隔符
        //
        // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
        //
        const isStrong = i > 0 &&
            delimiters[i - 1].end === startDelim.end + 1 &&
            delimiters[i - 1].marker === startDelim.marker &&
            delimiters[i - 1].token === startDelim.token - 1 &&
            delimiters[startDelim.end + 1].token === endDelim.token + 1;
        const ch = String.fromCharCode(startDelim.marker);
        const token_o = state.tokens[startDelim.token];
        token_o.type = isStrong ? "strong_open" : "em_open";
        token_o.tag = isStrong ? "strong" : "em";
        token_o.nesting = 1;
        token_o.markup = isStrong ? ch + ch : ch;
        token_o.content = "";
        const token_c = state.tokens[endDelim.token];
        token_c.type = isStrong ? "strong_close" : "em_close";
        token_c.tag = isStrong ? "strong" : "em";
        token_c.nesting = -1;
        token_c.markup = isStrong ? ch + ch : ch;
        token_c.content = "";
        if (isStrong) {
            state.tokens[delimiters[i - 1].token].content = "";
            state.tokens[delimiters[startDelim.end + 1].token].content = "";
            i--;
        }
    }
}
// 遍历分隔符列表并用标签替换文本标记
//
function emphasis_post_process(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    postProcess(state, state.delimiters);
    for (let curr = 0; curr < max; curr++) {
        if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
            postProcess(state, tokens_meta[curr].delimiters);
        }
    }
}
export default {
    tokenize: emphasis_tokenize,
    postProcess: emphasis_post_process,
};
