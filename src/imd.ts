// 主解析器类

import Renderer from "./renderer";
import ParserCore from "./parser_core";
import ParserBlock from "./parser_block";
import ParserInline from "./parser_inline";

export default class IMarkdown {
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
      throw new Error("Input data should be a String");
    }

    const state = new this.core.State(src, this, env);

    this.core.process(state);

    return state.tokens;
  }

  enable(list: string[]): this {
    // 启用规则
    list.forEach((rule) => {
      this.core.ruler.enable(rule);
    });
    return this;
  }

  disable(list: string[]): this {
    // 禁用规则
    list.forEach((rule) => {
      this.core.ruler.disable(rule);
    });
    return this;
  }

  use(plugin: (instance: IMarkdown, params?: any) => void, params?: any): this {
    plugin(this, params);
    return this;
  }

  render(src: string, env?: any): string {
    env = env || {};

    return this.renderer.render(this.parse(src, env), this.options, env);
  }
}
