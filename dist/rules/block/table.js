// 解析简单表格
function getLine(state, line) {
    const pos = state.bMarks[line] + state.tShift[line];
    const max = state.eMarks[line];
    return state.src.slice(pos, max);
}
function escapedSplit(str) {
    const result = [];
    const max = str.length;
    let pos = 0;
    let ch = str.charCodeAt(pos);
    let isEscaped = false;
    let lastPos = 0;
    let current = "";
    while (pos < max) {
        if (ch === 0x7c /* | */) {
            if (!isEscaped) {
                // pipe separating cells, '|'
                result.push(current + str.substring(lastPos, pos));
                current = "";
                lastPos = pos + 1;
            }
            else {
                // escaped pipe, '\|'
                current += str.substring(lastPos, pos - 1);
                lastPos = pos;
            }
        }
        isEscaped = ch === 0x5c /* \ */;
        pos++;
        ch = str.charCodeAt(pos);
    }
    result.push(current + str.substring(lastPos));
    return result;
}
export default function table(state, startLine, endLine, silent) {
    // should have at least two lines
    if (startLine + 2 > endLine) {
        return false;
    }
    let nextLine = startLine + 1;
    // first character of the second line should be '|', '-'
    let pos = state.bMarks[nextLine] + state.tShift[nextLine];
    if (pos >= state.eMarks[nextLine]) {
        return false;
    }
    const firstCh = state.src.charCodeAt(pos++);
    if (firstCh !== 0x7c /* | */ && firstCh !== 0x2d /* - */) {
        return false;
    }
    let lineText = getLine(state, startLine + 1);
    let columns = lineText.split("|");
    // 去除对齐的处理
    for (let i = 0; i < columns.length; i++) {
        const t = columns[i].trim();
        if (!t) {
            if (i === 0 || i === columns.length - 1) {
                continue;
            }
            else {
                return false;
            }
        }
    }
    lineText = getLine(state, startLine).trim();
    if (lineText.indexOf("|") === -1) {
        return false;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "")
        columns.shift();
    if (columns.length && columns[columns.length - 1] === "")
        columns.pop();
    const columnCount = columns.length;
    if (columnCount === 0) {
        return false;
    }
    if (silent) {
        return true;
    }
    const token_to = state.push("table_open", "table", 1);
    const token_tho = state.push("thead_open", "thead", 1);
    const token_htro = state.push("tr_open", "tr", 1);
    for (let i = 0; i < columns.length; i++) {
        const token_ho = state.push("th_open", "th", 1);
        const token_il = state.push("inline", "", 0);
        token_il.content = columns[i].trim();
        token_il.children = [];
        state.push("th_close", "th", -1);
    }
    state.push("tr_close", "tr", -1);
    state.push("thead_close", "thead", -1);
    const token_tbo = state.push("tbody_open", "tbody", 1);
    for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
        lineText = getLine(state, nextLine).trim();
        if (!lineText) {
            break;
        }
        columns = escapedSplit(lineText);
        if (columns.length && columns[0] === "")
            columns.shift();
        if (columns.length && columns[columns.length - 1] === "")
            columns.pop();
        const token_tro = state.push("tr_open", "tr", 1);
        for (let i = 0; i < columnCount; i++) {
            const token_tdo = state.push("td_open", "td", 1);
            const token_il = state.push("inline", "", 0);
            token_il.content = columns[i] ? columns[i].trim() : "";
            token_il.children = [];
            state.push("td_close", "td", -1);
        }
        state.push("tr_close", "tr", -1);
    }
    state.push("tbody_close", "tbody", -1);
    state.push("table_close", "table", -1);
    state.line = nextLine;
    return true;
}
