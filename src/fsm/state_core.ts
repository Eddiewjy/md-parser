// 该对象用于管理解析器的状态，以及解析器的输入和输出

import Token from "../token";
import IMarkdown from "../imd";
export default class StateCore {
  src: string;
  env: any;
  tokens: Token[];
  inlineMode: boolean;
  md: IMarkdown;

  constructor(src: string, md: any, env: any) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md; // 解析器实例的链接
  }

  // 将 Token 静态类型暴露出来
  static Token = Token;
}
