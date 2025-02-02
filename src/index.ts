import IMarkdown from "./imd";

// 解析器选项接口
export interface ParserOptions {
  features?: {
    basic?: {
      // 基础功能
      headings?: boolean; //标题
      textFormatting?: {
        emphasis?: boolean; //加粗和斜体
        strikethrough?: boolean; //删除线
      };
      lists?: boolean; //列表
      media?: {
        link?: boolean;
        image?: boolean;
      };
      blockquotes?: boolean; //引用>
      horizontalRule?: boolean; //水平线
      tables?: boolean; //表格
    };
    extensions?: {
      // 扩展功能
      math?: boolean; //数学公式
      mermaid?: boolean; //mermaid图表
      footnotes?: boolean; //脚注
      taskLists?: boolean; //任务列表
    };
  };
  codeBlock?: {
    //代码块
    languages?: string[] | "all";
    languageAliases?: Record<string, string>;
  };
  security?: {
    //安全
    allowHtml?: boolean;
    sanitize?: boolean;
  };
  performance?: {
    //性能优化
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
  const md = new IMarkdown();
  // 启用基础功能
  if (parserOptions.features.basic) {
    const {
      headings,
      textFormatting,
      lists,
      media,
      blockquotes,
      horizontalRule,
      tables,
    } = parserOptions.features.basic;
    if (headings) {
      md.enable(["heading"]);
    }
    if (textFormatting) {
      const { emphasis, strikethrough } = textFormatting;
      if (emphasis) {
        md.enable(["emphasis"]);
      }
      if (strikethrough) {
        md.enable(["strikethrough"]);
      }
    }
    if (lists) {
      md.enable(["list"]);
    }
    if (media) {
      const { link, image } = media;
      if (link) {
        md.enable(["link"]);
      }
      if (image) {
        md.enable(["image"]);
      }
    }
    if (blockquotes) {
      md.enable(["blockquote"]);
    }
    if (horizontalRule) {
      md.enable(["hr"]);
    }
    if (tables) {
      md.enable(["table"]);
    }
  }
  // 启用扩展功能
  if (parserOptions.features.extensions) {
    const { math, mermaid, footnotes, taskLists } =
      parserOptions.features.extensions;
    if (math) {
      md.enable(["math"]);
    }
    if (mermaid) {
      md.enable(["mermaid"]);
    }
    if (footnotes) {
      md.enable(["footnote"]);
    }
    if (taskLists) {
      md.enable(["taskList"]);
    }
  }

  // 返回解析器实例
  return md;
}
