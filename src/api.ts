import { ASTNode } from './ast';

// 解析器选项接口
export interface ParserOptions {
  [key: string]: any;
}

// 内容变更接口
export interface ContentChange {
  start: number;
  end: number;
  newContent: string;
}

// 解析结果接口
export interface ParseResult {
  html: string;
  ast: ASTNode;
}

// IMarkdownParser 接口
export interface IMarkdownParser {
  /**
   * 解析 Markdown 文本为 HTML，并返回解析结果
   * @param content Markdown 文本内容
   * @param options 解析配置选项
   */
  parse(content: string, options?: ParserOptions): ParseResult;

  /**
   * 增量解析 Markdown 文本为 HTML，并返回解析结果
   * @param content Markdown 文本内容
   * @param changes 内容变更
   * @param options 解析配置选项
   */
  parseIncremental(content: string, changes: ContentChange[], options?: ParserOptions): ParseResult;
}
