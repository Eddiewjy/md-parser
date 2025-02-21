export default class Token {
    type?: string;
    tag?: string;
    attrs?: string[][] | null;
    map?: [number, number] | null;
    nesting?: number;
    level?: number;
    children?: Token[] | null;
    content?: string;
    markup?: string;
    info?: string;
    meta?: any;
    block?: boolean;
    hidden?: boolean;
    constructor(type: string, tag: string, nesting: number);
    attrIndex(name: string): number;
    attrPush(attrData: [string, string]): void;
    attrSet(name: string, value: string): void;
    attrGet(name: string): string | null;
    attrJoin(name: string, value: string): void;
}
//# sourceMappingURL=token.d.ts.map