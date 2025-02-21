// 段落标签<p>
export default function paragraph(state, startLine, endLine) {
    const terminatorRules = state.md.block.ruler.getRules("paragraph");
    const oldParentType = state.parentType;
    let nextLine = startLine + 1;
    state.parentType = "paragraph";
    // 逐行跳过，直到空行或文件结束
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
        // 这通常是一个代码块，但在段落之后
        // 无论内容是什么，都被视为懒惰的延续
        if (state.sCount[nextLine] - state.blkIndent > 3) {
            continue;
        }
        // 引用块的特殊情况，这一行应该已经被该规则检查过
        if (state.sCount[nextLine] < 0) {
            continue;
        }
        // 一些标签可以在没有空行的情况下终止段落。
        let terminate = false;
        for (let i = 0, l = terminatorRules.length; i < l; i++) {
            if (terminatorRules[i](state, nextLine, endLine, true)) {
                terminate = true;
                break;
            }
        }
        if (terminate) {
            break;
        }
    }
    const content = state
        .getLines(startLine, nextLine, state.blkIndent, false)
        .trim();
    state.line = nextLine;
    const token_o = state.push("paragraph_open", "p", 1);
    token_o.map = [startLine, state.line];
    const token_i = state.push("inline", "", 0);
    token_i.content = content;
    token_i.map = [startLine, state.line];
    token_i.children = [];
    state.push("paragraph_close", "p", -1);
    state.parentType = oldParentType;
    return true;
}
