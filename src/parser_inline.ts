import Ruler from "./ruler.js";
import StateInline from "./fsm/state_inline.js";
import { IMarkdown } from "./imd.js";
import Token from "./token.js";

// 基础语法规则
import r_text from "./rules/inline/text.js";
import r_strikethrough from "./rules/inline/strikethrough.js";
import r_emphasis from "./rules/inline/emphasis.js";
import r_link from "./rules/inline/link.js";
import r_image from "./rules/inline/image.js";
import r_balance_pairs from "./rules/inline/balance_pairs.js";

// 主解析规则
const _rules: [string, Function][] = [
  ["text", r_text], // 跳过普通文本
  ["strikethrough", r_strikethrough.tokenize], // 删除线
  ["emphasis", r_emphasis.tokenize], // 粗体斜体
  ["link", r_link], // 链接
  ["image", r_image], // 图片
];

//解析成对标签,针对强调和删除线
const _rules2: [string, Function, string[]?][] = [
  ["balance_pairs", r_balance_pairs],
  ["strikethrough", r_strikethrough.postProcess],
  ["emphasis", r_emphasis.postProcess],
];

export default class ParserInline {
  ruler: Ruler;
  ruler2: Ruler;
  State: typeof StateInline;

  constructor() {
    this.ruler = new Ruler();
    this.ruler2 = new Ruler();
    for (const [name, rule] of _rules) {
      this.ruler.push(name, rule);
    }
    for (const [name, rule] of _rules2) {
      this.ruler2.push(name, rule);
    }

    this.State = StateInline;
  }

  // 跳过单个token，通过验证模式运行所有规则；
  // 如果任何规则成功，返回`true`
  skipToken(state: StateInline): void {
    const pos = state.pos;
    const rules = this.ruler.getRules("");
    const cache = state.cache;

    if (typeof cache[pos] !== "undefined") {
      state.pos = cache[pos];
      return;
    }

    let ok = false;

    for (const rule of rules) {
      state.level++;
      ok = rule(state, true);
      state.level--;

      if (ok) {
        if (pos >= state.pos) {
          throw new Error("inline rule didn't increment state.pos");
        }
        break;
      }
    }

    if (!ok) {
      state.pos++;
    }
    cache[pos] = state.pos;
  }

  tokenize(state: StateInline): void {
    const rules = this.ruler.getRules("");
    const end = state.posMax;
    while (state.pos < end) {
      const prevPos = state.pos;
      let ok = false;
      for (const rule of rules) {
        ok = rule(state, false);
        if (ok) {
          if (prevPos >= state.pos) {
            throw new Error("inline rule didn't increment state.pos");
          }
          break;
        }
      }

      if (ok) {
        if (state.pos >= end) {
          break;
        }
        continue;
      }

      state.pending += state.src[state.pos++];
    }

    if (state.pending) {
      state.pushPending();
    }
  }

  /**
   * ParserInline.parse(str, md, env, outTokens)
   *
   * 处理输入字符串并将内联tokens推送到`outTokens`
   **/
  parse(str: string, md: IMarkdown, env: any, outTokens: Token[]): void {
    const state = new this.State(str, md, env, outTokens);

    this.tokenize(state);
    const rules = this.ruler2.getRules("");
    for (const rule of rules) {
      rule(state);
    }
  }
}
