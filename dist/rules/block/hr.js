// 水平线 ---, ***, ___
import { isSpace } from "../../common/utils.js";
export default function hr(state, startLine, endLine, silent) {
    const max = state.eMarks[startLine];
    // 如果缩进超过3个空格，则应为代码块
    if (state.sCount[startLine] - state.blkIndent >= 4) {
        return false;
    }
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);
    // 检查水平线标记
    if (marker !== 0x2a /* * */ &&
        marker !== 0x2d /* - */ &&
        marker !== 0x5f /* _ */) {
        return false;
    }
    // 标记可以与空格混合，但至少应有3个标记
    let cnt = 1;
    while (pos < max) {
        const ch = state.src.charCodeAt(pos++);
        if (ch !== marker && !isSpace(ch)) {
            return false;
        }
        if (ch === marker) {
            cnt++;
        }
    }
    if (cnt < 3) {
        return false;
    }
    if (silent) {
        return true;
    }
    state.line = startLine + 1;
    const token = state.push("hr", "hr", 0);
    token.map = [startLine, state.line];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
    return true;
}
