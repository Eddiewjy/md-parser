declare function isString(obj: any): obj is string;
declare function has(object: Record<string, any>, key: string): boolean;
declare function assign(obj: any, ...sources: any[]): any;
declare function arrayReplaceAt<T>(src: T[], pos: number, newElements: T[]): T[];
declare function isValidEntityCode(c: number): boolean;
declare function fromCodePoint(c: number): string;
declare function unescapeMd(str: string): string;
declare function unescapeAll(str: string): string;
declare function escapeHtml(str: string): string;
declare function escapeRE(str: string): string;
declare function isSpace(code: number): boolean;
declare function isWhiteSpace(code: number): boolean;
declare function isPunctChar(ch: string): boolean;
declare function isMdAsciiPunct(ch: number): boolean;
declare function normalizeReference(str: string): string;
declare const lib: {
    mdurl: any;
    ucmicro: any;
};
export { lib, assign, isString, has, unescapeMd, unescapeAll, isValidEntityCode, fromCodePoint, escapeHtml, arrayReplaceAt, isSpace, isWhiteSpace, isMdAsciiPunct, isPunctChar, escapeRE, normalizeReference, };
//# sourceMappingURL=utils.d.ts.map