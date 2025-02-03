// 有序列表和无序列表

import { isSpace } from "../../common/utils";

// 搜索 `[-+*][\n ]`，成功时返回标记后的下一个位置，否则返回 -1。
function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];

  const marker = state.src.charCodeAt(pos++);
  // 检查项目符号
  if (
    marker !== 0x2a /* * */ &&
    marker !== 0x2d /* - */ &&
    marker !== 0x2b /* + */
  ) {
    return -1;
  }

  if (pos < max) {
    const ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " -test " - 不是列表项
      return -1;
    }
  }

  return pos;
}

// 搜索 `\d+[.)][\n ]`，成功时返回标记后的下一个位置，否则返回 -1。
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;

  // 列表标记应至少有2个字符（数字 + 点）
  if (pos + 1 >= max) {
    return -1;
  }

  let ch = state.src.charCodeAt(pos++);

  if (ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
    return -1;
  }

  for (;;) {
    // EOL -> 失败
    if (pos >= max) {
      return -1;
    }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) {
      // 列表标记不应超过9位数字
      // （防止浏览器中的整数溢出）
      if (pos - start >= 10) {
        return -1;
      }

      continue;
    }

    // 找到有效标记
    if (ch === 0x29 /* ) */ || ch === 0x2e /* . */) {
      break;
    }

    return -1;
  }

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " 1.test " - 不是列表项
      return -1;
    }
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  const level = state.level + 2;

  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (
      state.tokens[i].level === level &&
      state.tokens[i].type === "paragraph_open"
    ) {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}

export default function list(state, startLine, endLine, silent) {
  let max, pos, start, token;
  let nextLine = startLine;
  let tight = true;

  // 如果缩进超过3个空格，则应为代码块
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }

  // 特殊情况：
  //  - 项目 1
  //   - 项目 2
  //    - 项目 3
  //     - 项目 4
  //      - 这是段落的延续
  if (
    state.listIndent >= 0 &&
    state.sCount[nextLine] - state.listIndent >= 4 &&
    state.sCount[nextLine] < state.blkIndent
  ) {
    return false;
  }

  let isTerminatingParagraph = false;

  // 限制列表可以中断段落的条件（仅验证模式）
  if (silent && state.parentType === "paragraph") {
    // 下一个列表项仍应终止前一个列表项；
    //
    // 如果插件同时使用 blkIndent 和列表，则此代码可能会失败，
    // 但我希望规范在此之前得到修复。
    //
    if (state.sCount[nextLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }

  // 检测列表类型和标记后的位置
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));

    // 如果我们在段落之后开始一个新的有序列表，则应从1开始。
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }

  // 如果我们在段落之后开始一个新的无序列表，则第一行不应为空。
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine])
      return false;
  }

  // 对于验证模式，我们可以立即终止
  if (silent) {
    return true;
  }

  // 我们应在样式更改时终止列表。记住第一个以进行比较。
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // 开始列表
  const listTokIdx = state.tokens.length;

  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) {
      token.attrs = [["start", markerValue]];
    }
  } else {
    token = state.push("bullet_list_open", "ul", 1);
  }

  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);

  //
  // 迭代列表项
  //

  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");

  const oldParentType = state.parentType;
  state.parentType = "list";

  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];

    const initial =
      state.sCount[nextLine] +
      posAfterMarker -
      (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;

    while (pos < max) {
      const ch = state.src.charCodeAt(pos);

      if (ch === 0x09) {
        offset += 4 - ((offset + state.bsCount[nextLine]) % 4);
      } else if (ch === 0x20) {
        offset++;
      } else {
        break;
      }

      pos++;
    }

    const contentStart = pos;
    let indentAfterMarker;

    if (contentStart >= max) {
      // 在 "-    \n  3" 情况下修剪空格，此处缩进为1
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }

    // 如果我们有超过4个空格，则缩进为1
    // （其余部分只是缩进的代码块）
    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    }

    // "  -  测试"
    //  ^^^^^ - 计算此内容的总长度
    const indent = initial + indentAfterMarker;

    // 运行子解析器并写入标记
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) {
      token.info = state.src.slice(start, posAfterMarker - 1);
    }

    // 更改当前状态，然后在解析器子调用后恢复
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];

    //  - 示例列表
    // ^ listIndent 位置在这里
    //   ^ blkIndent 位置在这里
    //
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;

    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;

    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
      // 解决此情况的变通方法
      // （列表项为空，列表在 "foo" 之前终止）：
      // ~~~~~~~~
      //   -
      //
      //     foo
      // ~~~~~~~~
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, nextLine, endLine, true);
    }

    // 如果任何列表项是紧凑的，则将列表标记为紧凑
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // 如果以空行结束，则项目变为松散，
    // 但我们应过滤最后一个元素，因为它表示列表结束
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;

    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);

    nextLine = state.line;
    itemLines[1] = nextLine;

    if (nextLine >= endLine) {
      break;
    }

    //
    // 尝试检查列表是否终止或继续。
    //
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }

    // 如果缩进超过3个空格，则应为代码块
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }

    // 如果找到终止块，则失败
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

    // 如果列表有另一种类型，则失败
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  }

  // 完成列表
  if (isOrdered) {
    token = state.push("ordered_list_close", "ol", -1);
  } else {
    token = state.push("bullet_list_close", "ul", -1);
  }
  token.markup = String.fromCharCode(markerCharCode);

  listLines[1] = nextLine;
  state.line = nextLine;

  state.parentType = oldParentType;

  // 如果需要，标记段落为紧凑
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
}
