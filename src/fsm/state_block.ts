// 用于解析块级元素的状态类

import Token from "../token.js";
import { isSpace } from "../common/utils.js";
import { IMarkdown } from "../imd.js";

export default class StateBlock {
  src: string;
  md: any;
  env: any;
  tokens: Token[];
  bMarks: number[];
  eMarks: number[];
  tShift: number[];
  sCount: number[];
  bsCount: number[];
  blkIndent: number;
  line: number;
  lineMax: number;
  tight: boolean;
  ddIndent: number;
  listIndent: number;
  parentType: string;
  level: number;

  constructor(src: string, md: IMarkdown, env: any, tokens: Token[]) {
    this.src = src;

    // 解析器实例的链接
    this.md = md;

    this.env = env;

    // 内部状态变量
    this.tokens = tokens;

    this.bMarks = []; // 行开始偏移量，用于快速跳转
    this.eMarks = []; // 行结束偏移量，用于快速跳转
    this.tShift = []; // 第一个非空字符的偏移量（制表符未展开）
    this.sCount = []; // 每行的缩进（制表符已展开）
    // 每行开始（bMarks）和该行实际开始之间的虚拟空格数（制表符已展开）。
    this.bsCount = [];
    // 块解析器变量
    this.blkIndent = 0;
    this.line = 0; // src 中的行索引
    this.lineMax = 0; // 行数
    this.tight = false; // 列表的松散/紧凑模式
    this.ddIndent = -1; // 当前 dd 块的缩进（如果没有，则为 -1）
    this.listIndent = -1; // 当前列表块的缩进（如果没有，则为 -1）
    // 可以是 'blockquote'、'list'、'root'、'paragraph' 或 'reference'
    this.parentType = "root";
    this.level = 0;

    // 创建缓存
    const s = this.src;
    for (
      let start = 0,
        pos = 0,
        indent = 0,
        offset = 0,
        len = s.length,
        indent_found = false;
      pos < len;
      pos++
    ) {
      const ch = s.charCodeAt(pos);

      if (!indent_found) {
        if (isSpace(ch)) {
          indent++;

          if (ch === 0x09) {
            offset += 4 - (offset % 4);
          } else {
            offset++;
          }
          continue;
        } else {
          indent_found = true;
        }
      }

      if (ch === 0x0a || pos === len - 1) {
        if (ch !== 0x0a) {
          pos++;
        }
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);

        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }

    // 推入假条目以简化缓存边界检查
    this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);

    this.lineMax = this.bMarks.length - 1; // 不计算最后一个假行
  }

  // 推送新标记到“token流”中。
  push(type: string, tag: string, nesting: number) {
    const token = new Token(type, tag, nesting);
    token.block = true;

    if (nesting < 0) this.level--; // 关闭标签
    token.level = this.level;
    if (nesting > 0) this.level++; // 打开标签

    this.tokens.push(token);
    return token;
  }

  isEmpty(line: number): boolean {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  }

  skipEmptyLines(from: number): number {
    for (let max = this.lineMax; from < max; from++) {
      if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
        break;
      }
    }
    return from;
  }

  // 从给定位置跳过空格。
  skipSpaces(pos: number): number {
    for (let max = this.src.length; pos < max; pos++) {
      const ch = this.src.charCodeAt(pos);
      if (!isSpace(ch)) {
        break;
      }
    }
    return pos;
  }

  // 从给定位置反向跳过空格。
  skipSpacesBack(pos: number, min: number): number {
    if (pos <= min) {
      return pos;
    }

    while (pos > min) {
      if (!isSpace(this.src.charCodeAt(--pos))) {
        return pos + 1;
      }
    }
    return pos;
  }

  // 从给定位置跳过字符代码
  skipChars(pos: number, code: number): number {
    for (let max = this.src.length; pos < max; pos++) {
      if (this.src.charCodeAt(pos) !== code) {
        break;
      }
    }
    return pos;
  }

  // 从给定位置 - 1 反向跳过字符代码
  skipCharsBack(pos: number, code: number, min: number): number {
    if (pos <= min) {
      return pos;
    }

    while (pos > min) {
      if (code !== this.src.charCodeAt(--pos)) {
        return pos + 1;
      }
    }
    return pos;
  }

  //从源代码中剪切行范围。
  getLines(
    begin: number,
    end: number,
    indent: number,
    keepLastLF: boolean
  ): string {
    if (begin >= end) {
      return "";
    }

    const queue = new Array(end - begin);

    for (let i = 0, line = begin; line < end; line++, i++) {
      let lineIndent = 0;
      const lineStart = this.bMarks[line];
      let first = lineStart;
      let last;

      if (line + 1 < end || keepLastLF) {
        // 不需要边界检查，因为我们在尾部有假条目。
        last = this.eMarks[line] + 1;
      } else {
        last = this.eMarks[line];
      }

      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);

        if (isSpace(ch)) {
          if (ch === 0x09) {
            lineIndent += 4 - ((lineIndent + this.bsCount[line]) % 4);
          } else {
            lineIndent++;
          }
        } else if (first - lineStart < this.tShift[line]) {
          // 修补的 tShift 掩盖字符看起来像空格（引用块、列表标记）
          lineIndent++;
        } else {
          break;
        }

        first++;
      }

      if (lineIndent > indent) {
        // 部分展开代码块中的制表符，例如 '\t\tfoobar'
        // 缩进=2 变成 '  \tfoobar'
        queue[i] =
          new Array(lineIndent - indent + 1).join(" ") +
          this.src.slice(first, last);
      } else {
        queue[i] = this.src.slice(first, last);
      }
    }

    return queue.join("");
  }

  // 重新导出 Token 类以在块规则中使用
  static Token = Token;
}
