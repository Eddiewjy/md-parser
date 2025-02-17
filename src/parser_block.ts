/** 内部实现
 * class ParserBlock
 *
 * 块级解析器。
 **/
//这里rule的参数要包括起始行和结束行，因为块级解析器是一块一块解析的
import Ruler from "./ruler.js";
import StateBlock from "./fsm/state_block.js";
import { IMarkdown } from "./imd.js";
import Token from "./token.js";

import r_paragraph from "./rules/block/paragraph.js";
import r_heading from "./rules/block/heading.js";
import r_list from "./rules/block/list.js";
import r_table from "./rules/block/table.js";
import r_blockquote from "./rules/block/blockquote.js";
import r_hr from "./rules/block/hr.js";
import r_code from "./rules/block/code.js";
import r_fence from "./rules/block/fence.js";
import r_reference from "./rules/block/reference.js";
import r_html_block from "./rules/block/html_block.js";
import r_lheading from "./rules/block/lheading.js";
// 定义核心解析规则
const _rules: [string, Function, string[]?][] = [
  ["table", r_table, ["paragraph", "reference"]],
  ["code", r_code],
  ["fence", r_fence, ["paragraph", "reference", "blockquote", "list"]],
  [
    "blockquote",
    r_blockquote,
    ["paragraph", "reference", "blockquote", "list"],
  ],
  ["hr", r_hr, ["paragraph", "reference", "blockquote", "list"]],
  ["list", r_list, ["paragraph", "reference", "blockquote"]],
  ["reference", r_reference],
  ["html_block", r_html_block, ["paragraph", "reference", "blockquote"]],
  ["heading", r_heading, ["paragraph", "reference", "blockquote"]],
  ["lheading", r_lheading],
  ["paragraph", r_paragraph],
];

/**
 * 块级解析器
 */

export default class ParserBlock {
  ruler: Ruler;
  State: typeof StateBlock;

  constructor() {
    this.ruler = new Ruler();

    for (const [name, rule, alt] of _rules) {
      this.ruler.push(name, rule, {
        alt: alt ? [...alt] : [],
      });
    }

    this.State = StateBlock;
  }

  /**
   * 解析输入范围并生成 Token
   * @param state 解析状态
   * @param startLine 起始行
   * @param endLine 结束行
   */
  tokenize(state: StateBlock, startLine: number, endLine: number): void {
    const rules = this.ruler.getRules("");
    let line = startLine;

    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) break;

      const prevLine = state.line;
      let matched = false;

      for (const rule of rules) {
        matched = rule(state, line, endLine, false);
        if (matched) {
          if (prevLine >= state.line) {
            throw new Error("块规则未正确递增state.line");
          }
          break;
        }
      }

      if (!matched) throw new Error("没有匹配的块规则");

      line = state.line;
    }
  }

  /**
   * 解析输入字符串并推送块级 Tokens
   * @param src 输入字符串
   * @param md Markdown 实例
   * @param env 环境变量
   * @param outTokens core 传入的token
   */
  parse(src: string, md: IMarkdown, env: any, outTokens: Token[]): void {
    if (!src) return;

    const state = new this.State(src, md, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  }
}
