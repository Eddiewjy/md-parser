import IMarkdown from './index';

// 解析器选项接口
export interface ParserOptions {
  features?: {
    basic?: {// 基础功能
      headings?: boolean;
      textFormatting?: {
        bold?: boolean;
        italic?: boolean;
        strikethrough?: boolean;
      };
      lists?: {
        unordered?: boolean;
        ordered?: boolean;
      };
      media?: {
        links?: boolean;
        images?: boolean;
      };
      blockquotes?: boolean;
      horizontalRule?: boolean;
      tables?: boolean;
    };
    extensions?: {// 扩展功能
      math?: boolean;
      mermaid?: boolean;
      footnotes?: boolean;
      taskLists?: boolean;
    };
  };
  codeBlock?: {//代码块
    languages?: string[] | 'all';
    languageAliases?: Record<string, string>;
  };
  security?: {//安全
    allowHtml?: boolean;
    sanitize?: boolean;
  };
  performance?: {//性能优化
    incrementalUpdates?: boolean;
    lazyRendering?: boolean;
  };
}

// getParserInstance 接口
export default function getParserInstance(options: ParserOptions): IMarkdown {
  const { features, codeBlock, security, performance } = options;

  // 根据选项动态配置解析器的行为
  const parserOptions: ParserOptions = {
    features: features || {},
    codeBlock: codeBlock || {},
    security: security || {},
    performance: performance || {},
  };

  // 返回新的解析器实例
  return new IMarkdown(parserOptions);
}


