import Token from "./token.js";
export default class Renderer {
    rules: {
        [key: string]: Function;
    };
    constructor();
    renderAttrs(token: Token): string;
    renderToken(tokens: Token[], idx: number, options?: any): string;
    renderInline(tokens: Token[], options?: any, env?: any): string;
    render(tokens: Token[], options?: any, env?: any): string;
}
//# sourceMappingURL=renderer.d.ts.map