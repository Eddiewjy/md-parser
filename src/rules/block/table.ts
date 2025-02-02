// GFM 表格, https://github.github.com/gfm/#tables-extension-

import { isSpace } from "../../common/utils";

// 限制表格中自动完成的空单元格数量，
// 参见 https://github.com/markdown-it/markdown-it/issues/1000,
//
// pulldown-cmark 和 commonmark-hs 都将单元格数量限制在约 200k。
// 我们将其设置为 65k，这可以将用户输入扩展 x370 倍
// (256x256 的方形是 1.8kB，扩展到 650kB)。
const MAX_AUTOCOMPLETED_CELLS = 0x10000;

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
        // 分隔单元格的竖线 '|'
        result.push(current + str.substring(lastPos, pos));
        current = "";
        lastPos = pos + 1;
      } else {
        // 转义的竖线 '\|'
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
  // 至少应有两行
  if (startLine + 2 > endLine) {
    return false;
  }

  let nextLine = startLine + 1;

  if (state.sCount[nextLine] < state.blkIndent) {
    return false;
  }

  // 如果缩进超过 3 个空格，则应为代码块
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }

  // 第二行的第一个字符应为 '|', '-', ':',
  // 其他字符不允许，除了空格；
  // 基本上，相当于 /^[-:|][-:|\s]*$/ 正则表达式

  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }

  const firstCh = state.src.charCodeAt(pos++);
  if (
    firstCh !== 0x7c /* | */ &&
    firstCh !== 0x2d /* - */ &&
    firstCh !== 0x3a /* : */
  ) {
    return false;
  }

  if (pos >= state.eMarks[nextLine]) {
    return false;
  }

  const secondCh = state.src.charCodeAt(pos++);
  if (
    secondCh !== 0x7c /* | */ &&
    secondCh !== 0x2d /* - */ &&
    secondCh !== 0x3a /* : */ &&
    !isSpace(secondCh)
  ) {
    return false;
  }

  // 如果第一个字符是 '-'，则第二个字符不能是空格
  // (由于解析歧义与列表)
  if (firstCh === 0x2d /* - */ && isSpace(secondCh)) {
    return false;
  }

  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);

    if (
      ch !== 0x7c /* | */ &&
      ch !== 0x2d /* - */ &&
      ch !== 0x3a /* : */ &&
      !isSpace(ch)
    ) {
      return false;
    }

    pos++;
  }

  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i = 0; i < columns.length; i++) {
    const t = columns[i].trim();
    if (!t) {
      // 允许表格前后的空列，但不允许中间的空列；
      // 例如，允许 ` |---| `，不允许 ` ---||--- `
      if (i === 0 || i === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) {
      return false;
    }
    if (t.charCodeAt(t.length - 1) === 0x3a /* : */) {
      aligns.push(t.charCodeAt(0) === 0x3a /* : */ ? "center" : "right");
    } else if (t.charCodeAt(0) === 0x3a /* : */) {
      aligns.push("left");
    } else {
      aligns.push("");
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf("|") === -1) {
    return false;
  }
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();

  // 表头行将定义整个表格中的列数，
  // 对齐行应完全相同（其余行可以不同）
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) {
    return false;
  }

  if (silent) {
    return true;
  }

  const oldParentType = state.parentType;
  state.parentType = "table";

  // 使用 'blockquote' 列表进行终止，因为它
  // 与表格最相似
  const terminatorRules = state.md.block.ruler.getRules("blockquote");

  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;

  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];

  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];

  for (let i = 0; i < columns.length; i++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i]) {
      token_ho.attrs = [["style", "text-align:" + aligns[i]]];
    }

    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i].trim();
    token_il.children = [];

    state.push("th_close", "th", -1);
  }

  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);

  let tbodyLines;
  let autocompletedCells = 0;

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }

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
    lineText = getLine(state, nextLine).trim();
    if (!lineText) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();

    // 注意：如果用户指定的列数多于表头，自动完成的计数可以为负数，
    // 但这不会影响预期用途（即限制扩展）
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
      break;
    }

    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }

    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];

    for (let i = 0; i < columnCount; i++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i]) {
        token_tdo.attrs = [["style", "text-align:" + aligns[i]]];
      }

      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i] ? columns[i].trim() : "";
      token_il.children = [];

      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }

  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }

  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;

  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}
