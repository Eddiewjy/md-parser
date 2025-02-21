import Token from "../token.js";
import { IMarkdown } from "../imd.js";
export default class StateBlock {
    src: string;
    md: IMarkdown;
    env: any;
    tokens: Token[];
    bMarks: number[];
    eMarks: number[];
    tShift: number[];
    sCount: number[];
    bsCount: number[];
    blkIndent: number;
    line: number;
    lineMax: number;
    tight: boolean;
    ddIndent: number;
    listIndent: number;
    parentType: string;
    level: number;
    constructor(src: string, md: IMarkdown, env: any, tokens: Token[]);
    push(type: string, tag: string, nesting: number): Token;
    isEmpty(line: number): boolean;
    skipEmptyLines(from: number): number;
    skipSpaces(pos: number): number;
    skipSpacesBack(pos: number, min: number): number;
    skipChars(pos: number, code: number): number;
    skipCharsBack(pos: number, code: number, min: number): number;
    getLines(begin: number, end: number, indent: number, keepLastLF: boolean): string;
    static Token: typeof Token;
}
//# sourceMappingURL=state_block.d.ts.map