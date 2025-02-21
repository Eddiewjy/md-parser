import Token from "../token.js";
import { IMarkdown } from "../imd.js";
export default class StateInline {
    src: string;
    env: any;
    md: IMarkdown;
    tokens: Token[];
    tokens_meta: any[];
    pos: number;
    posMax: number;
    level: number;
    pending: string;
    pendingLevel: number;
    cache: Record<string, any>;
    delimiters: any[];
    _prev_delimiters: any[];
    backticks: Record<string, number>;
    backticksScanned: boolean;
    linkLevel: number;
    constructor(src: string, md: any, env: any, outTokens: Token[]);
    pushPending(): Token;
    push(type: string, tag: string, nesting: number): Token;
    scanDelims(start: number, canSplitWord: boolean): {
        can_open: boolean;
        can_close: boolean;
        length: number;
    };
    Token: typeof Token;
}
//# sourceMappingURL=state_inline.d.ts.map