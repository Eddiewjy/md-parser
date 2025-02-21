import Ruler from "./ruler.js";
import StateInline from "./fsm/state_inline.js";
import { IMarkdown } from "./imd.js";
import Token from "./token.js";
export default class ParserInline {
    ruler: Ruler;
    ruler2: Ruler;
    State: typeof StateInline;
    constructor();
    skipToken(state: StateInline): void;
    tokenize(state: StateInline): void;
    /**
     * ParserInline.parse(str, md, env, outTokens)
     *
     * 处理输入字符串并将内联tokens推送到`outTokens`
     **/
    parse(str: string, md: IMarkdown, env: any, outTokens: Token[]): void;
}
//# sourceMappingURL=parser_inline.d.ts.map