import Token from "../token.js";
import { IMarkdown } from "../imd.js";
export default class StateCore {
    src: string;
    env: any;
    tokens: Token[];
    inlineMode: boolean;
    md: IMarkdown;
    constructor(src: string, md: any, env: any);
    static Token: typeof Token;
}
//# sourceMappingURL=state_core.d.ts.map