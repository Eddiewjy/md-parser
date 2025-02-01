// 该对象用于管理解析器的状态，以及解析器的输入和输出

import Token from '../token';

export default class StateCore {
  src: string;
  env: any;
  tokens: Token[];
  inlineMode: boolean;
  md: any;

  constructor(src: string, md: any, env: any) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md; // 解析器实例的链接
  }

  // 重新导出 Token 类以在核心规则中使用
  static Token = Token;
}


