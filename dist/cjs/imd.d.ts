import * as utils from "./common/utils.js";
import * as helpers from "./helpers/index.js";
import Renderer from "./renderer.js";
import ParserCore from "./parser_core.js";
import ParserBlock from "./parser_block.js";
import ParserInline from "./parser_inline.js";
export declare class IMarkdown {
    inline: ParserInline;
    block: ParserBlock;
    core: ParserCore;
    renderer: Renderer;
    options: any;
    utils: typeof utils;
    helpers: typeof helpers;
    constructor();
    parse(src: string, env: any): any[];
    enable(list: string[]): this;
    disable(list: string[]): this;
    render(src: string, env?: any): string;
}
//# sourceMappingURL=imd.d.ts.map