// 用于解析内联元素（例如强调、链接、代码等）的状态机。

import Token from "../token.js";
import { isWhiteSpace, isPunctChar, isMdAsciiPunct } from "../common/utils.js";

export default class StateInline {
  src: string;
  env: any;
  md: any;
  tokens: Token[]; //输出的标记
  tokens_meta: any[]; //元数据
  pos: number; //当前位置
  posMax: number; //输入字符串的长度
  level: number; //当前标签的级别
  pending: string; //待处理文本
  pendingLevel: number; //待处理文本的级别
  cache: Record<string, any>; //缓存
  delimiters: any[]; //当前标签的强调类分隔符列表
  _prev_delimiters: any[]; //上一级标签的分隔符列表堆栈
  backticks: Record<string, number>; //反引号长度 => 最后看到的位置
  backticksScanned: boolean; //是否已扫描反引号
  linkLevel: number; //用于禁用内联 linkify-it 执行的计数器

  constructor(src: string, md: any, env: any, outTokens: Token[]) {
    this.src = src;
    this.env = env;
    this.md = md;
    this.tokens = outTokens;
    this.tokens_meta = Array(outTokens.length);

    this.pos = 0;
    this.posMax = this.src.length;
    this.level = 0;
    this.pending = "";
    this.pendingLevel = 0;

    // 存储 { start: end } 对。用于回溯优化对解析（强调、删除线）。
    this.cache = {};

    // 当前标签的强调类分隔符列表
    this.delimiters = [];

    // 上一级标签的分隔符列表堆栈
    this._prev_delimiters = [];

    // 反引号长度 => 最后看到的位置
    this.backticks = {};
    this.backticksScanned = false;

    // 用于禁用内联 linkify-it 执行的计数器
    // 在 <a> 和 markdown 链接内
    this.linkLevel = 0;
  }

  // 刷新待处理文本
  pushPending() {
    const token = new Token("text", "", 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = "";
    return token;
  }

  // 推送新标记到“流”中。
  // 如果存在待处理文本 - 将其作为文本标记刷新
  push(type: string, tag: string, nesting: number) {
    if (this.pending) {
      this.pushPending();
    }

    const token = new Token(type, tag, nesting);
    let token_meta = null;

    if (nesting < 0) {
      // 关闭标签
      this.level--;
      this.delimiters = this._prev_delimiters.pop() || [];
    }

    token.level = this.level;

    if (nesting > 0) {
      // 打开标签
      this.level++;
      this._prev_delimiters.push(this.delimiters);
      this.delimiters = [];
      token_meta = { delimiters: this.delimiters };
    }

    this.pendingLevel = this.level;
    this.tokens.push(token);
    this.tokens_meta.push(token_meta);
    return token;
  }

  // 扫描一系列类似强调的标记，并确定它是否可以开始或结束强调序列。
  //
  //  - start - 扫描的起始位置（应指向有效标记）；
  //  - canSplitWord - 确定这些标记是否可以在单词中找到
  scanDelims(start: number, canSplitWord: boolean) {
    const max = this.posMax;
    const marker = this.src.charCodeAt(start);

    // 将行的开头视为空白
    const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

    let pos = start;
    while (pos < max && this.src.charCodeAt(pos) === marker) {
      pos++;
    }

    const count = pos - start;

    // 将行的结尾视为空白
    const nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

    const isLastPunctChar =
      isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
    const isNextPunctChar =
      isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

    const isLastWhiteSpace = isWhiteSpace(lastChar);
    const isNextWhiteSpace = isWhiteSpace(nextChar);

    const left_flanking =
      !isNextWhiteSpace &&
      (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking =
      !isLastWhiteSpace &&
      (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);

    const can_open =
      left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
    const can_close =
      right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);

    return { can_open, can_close, length: count };
  }

  // 重新导出 Token 类以在块规则中使用
  Token = Token;
}
