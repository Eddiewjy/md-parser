// 标题 (#, ##, ...)

import { isSpace } from "../../common/utils";

export default function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine]; // 当前行的开始位置
  let max = state.eMarks[startLine]; // 当前行的结束位置

  // 如果当前行的缩进超过 3 个空格，则认为是代码块，而不是标题
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }

  let ch = state.src.charCodeAt(pos); // 获取当前字符

  // 如果当前字符不是 `#` 或者已经超出该行范围，则不是标题
  if (ch !== 0x23 /* # */ || pos >= max) {
    return false;
  }

  // 计算标题级别
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23 /* # */ && pos < max && level <= 6) {
    level++; // 继续增加标题的级别
    ch = state.src.charCodeAt(++pos);
  }

  // 如果标题级别超过 6，或者 `#` 后面没有空格，则不是有效标题
  if (level > 6 || (pos < max && !isSpace(ch))) {
    return false;
  }

  if (silent) {
    return true;
  } // 如果是 silent 模式，只检查是否是标题，不生成 token

  // 去掉标题末尾的空格和 `#`
  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp; // 如果标题后有空格，调整结束位置
  }

  state.line = startLine + 1; // 更新当前行号

  // 创建 'heading_open' token，表示标题开始标签
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = "########".slice(0, level); // 存储标题级别的 `#`
  token_o.map = [startLine, state.line]; // 设置 token 的行范围

  // 创建 'inline' token，表示标题的文本内容
  const token_i = state.push("inline", "", 0);
  token_i.content = state.src.slice(pos, max).trim(); // 获取标题文本内容
  token_i.map = [startLine, state.line]; // 设置 token 的行范围
  token_i.children = []; // 没有子 token

  // 创建 'heading_close' token，表示标题结束标签
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = "########".slice(0, level); // 存储标题级别的 `#`

  return true; // 返回 true，表示标题解析成功
}
