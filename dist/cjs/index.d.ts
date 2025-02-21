import { IMarkdown } from "./imd.js";
export interface ParserOptions {
    features?: {
        basic?: {
            headings?: boolean;
            textFormatting?: {
                emphasis?: boolean;
                strikethrough?: boolean;
            };
            lists?: boolean;
            media?: {
                link?: boolean;
                image?: boolean;
            };
            blockquote?: boolean;
            hr?: boolean;
            tables?: boolean;
        };
        extensions?: {
            math?: boolean;
            mermaid?: boolean;
            footnotes?: boolean;
            taskLists?: boolean;
        };
    };
    codeBlock?: {
        languages?: string[] | "all";
        languageAliases?: Record<string, string>;
    };
    security?: {
        allowHtml?: boolean;
        sanitize?: boolean;
    };
    performance?: {
        incrementalUpdates?: boolean;
        lazyRendering?: boolean;
    };
}
export declare function getParserInstance(options: ParserOptions): IMarkdown;
//# sourceMappingURL=index.d.ts.map