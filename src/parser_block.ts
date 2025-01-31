/** 内部实现
 * class ParserBlock
 *
 * 块级解析器。
 **/

import Ruler, { RulerType } from './ruler';
import StateBlock from './fsm/state_block';

import r_paragraph from './rules/block/paragraph';
import r_heading from './rules/block/heading';
import r_list from './rules/block/list';

/**
 * 规则类型定义
 */
type RuleFunction = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;

interface RuleConfig {
  name: string;
  rule: RuleFunction;
  alt?: string[];
}

// 定义核心解析规则
const _rules: RuleConfig[] = [
  { name: 'paragraph', rule: r_paragraph },
  { name: 'heading', rule: r_heading, alt: ['paragraph'] },
  { name: 'list', rule: r_list, alt: ['paragraph', 'heading'] },
];

/**
 * 块级解析器
 */

export default class ParserBlock {
  ruler: RulerType;
  State: typeof StateBlock;

  constructor() {
    this.ruler = new Ruler();

    for (const { name, rule, alt } of _rules) {
      this.ruler.push(name, rule, { alt: alt?.slice() || [] });
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
    const rules = this.ruler.getRules('');
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
            throw new Error("块规则未正确递增 state.line");
          }
          break;
        }
      }

      if (!matched) throw new Error('没有匹配的块规则');

      line = state.line;
    }
  }

  /**
   * 解析输入字符串并推送块级 Tokens
   * @param src 输入字符串
   * @param md Markdown 实例
   * @param env 环境变量
   * @param outTokens 输出 Token 数组
   */
  parse(src: string, md: any, env: any, outTokens: any[]): void {
    if (!src) return;

    const state = new this.State(src, md, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  }
}

