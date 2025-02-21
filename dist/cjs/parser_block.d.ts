/** 内部实现
 * class ParserBlock
 *
 * 块级解析器。
 **/
import Ruler from "./ruler.js";
import StateBlock from "./fsm/state_block.js";
import { IMarkdown } from "./imd.js";
import Token from "./token.js";
/**
 * 块级解析器
 */
export default class ParserBlock {
    ruler: Ruler;
    State: typeof StateBlock;
    constructor();
    /**
     * 解析输入范围并生成 Token
     * @param state 解析状态
     * @param startLine 起始行
     * @param endLine 结束行
     */
    tokenize(state: StateBlock, startLine: number, endLine: number): void;
    /**
     * 解析输入字符串并推送块级 Tokens
     * @param src 输入字符串
     * @param md Markdown 实例
     * @param env 环境变量
     * @param outTokens core 传入的token
     */
    parse(src: string, md: IMarkdown, env: any, outTokens: Token[]): void;
}
//# sourceMappingURL=parser_block.d.ts.map