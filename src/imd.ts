// 主解析器类

import Renderer from "./renderer.js";
import ParserCore from "./parser_core.js";
import ParserBlock from "./parser_block.js";
import ParserInline from "./parser_inline.js";

export class IMarkdown {
  inline: ParserInline;
  block: ParserBlock;
  core: ParserCore;
  renderer: Renderer;
  options: any;

  constructor() {
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new ParserCore();
    this.renderer = new Renderer();
    this.options = {};
  }

  parse(src: string, env: any): any[] {
    if (typeof src !== "string") {
      throw new Error("Input source should be a string");
    }

    const state = new this.core.State(src, this, env);

    this.core.process(state);

    return state.tokens;
  }

  enable(list: string[]): this {
    // 启用规则
    let result: string[] = [];
    ["core", "block", "inline"].forEach((chain) => {
      result = result.concat(this[chain].ruler.enable(list, true));
    });

    result = result.concat(this.inline.ruler2.enable(list, true));

    const missed = list.filter((name) => {
      return result.indexOf(name) < 0;
    });

    if (missed.length) {
      throw new Error("Failed to enable unknown rule(s): " + missed);
    }

    return this;
  }

  disable(list: string[]): this {
    // 禁用规则
    let result: string[] = [];
    ["core", "block", "inline"].forEach((chain) => {
      result = result.concat(this[chain].ruler.disable(list, true));
    });

    result = result.concat(this.inline.ruler2.disable(list, true));

    const missed = list.filter((name) => {
      return result.indexOf(name) < 0;
    });

    if (missed.length) {
      throw new Error("Failed to disable unknown rule(s): " + missed);
    }

    return this;
  }

  render(src: string, env?: any): string {
    env = env || {};

    return this.renderer.render(this.parse(src, env), this.options, env);
  }
}
