import IMarkdown from "./imd";

// 解析器选项接口
export interface ParserOptions {
  features?: {
    basic?: {
      headings?: boolean; // 标题
      textFormatting?: {
        emphasis?: boolean; // 加粗和斜体
        strikethrough?: boolean; // 删除线
      };
      lists?: boolean; // 列表
      media?: {
        link?: boolean; // 链接
        image?: boolean; // 图片
      };
      blockquote?: boolean; // 引用
      hr?: boolean; // 水平线
      tables?: boolean; // 表格
    };
    extensions?: {
      math?: boolean; // 数学公式
      mermaid?: boolean; // mermaid图表
      footnotes?: boolean; // 脚注
      taskLists?: boolean; // 任务列表
    };
  };
  codeBlock?: {
    languages?: string[] | "all"; // 代码块语言
    languageAliases?: Record<string, string>; // 语言别名
  };
  security?: {
    allowHtml?: boolean; // 允许HTML
    sanitize?: boolean; // 清理
  };
  performance?: {
    incrementalUpdates?: boolean; // 增量更新
    lazyRendering?: boolean; // 懒渲染
  };
}

// 规则映射对象
const ruleMap: { [key: string]: string[] } = {
  headings: ["heading"],
  emphasis: ["emphasis"],
  strikethrough: ["strikethrough"],
  lists: ["list"],
  link: ["link"],
  image: ["image"],
  blockquote: ["blockquote"],
  hr: ["hr"],
  tables: ["table"],
  math: ["math"],
  mermaid: ["mermaid"],
  footnotes: ["footnote"],
  taskLists: ["taskList"],
};

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

  const enableList: string[] = [];
  const disableList: string[] = [];

  // 遍历 features 并根据值推入 enableList 或 disableList
  Object.keys(parserOptions.features).forEach((featureCategory) => {
    const featureOptions = parserOptions.features![featureCategory];
    if (typeof featureOptions === "object") {
      Object.keys(featureOptions).forEach((feature) => {
        const isEnabled = featureOptions[feature];
        const rules = ruleMap[feature];
        if (rules) {
          if (isEnabled) {
            enableList.push(...rules);
          } else {
            disableList.push(...rules);
          }
        }
      });
    }
  });

  // 启用和禁用规则
  if (enableList.length > 0) {
    md.enable(enableList);
  }
  if (disableList.length > 0) {
    md.disable(disableList);
  }

  // 返回解析器实例
  return md;
}
