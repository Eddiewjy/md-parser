/**
 * class Ruler 规则管理器
 *
 * 帮助类，用于管理规则序列（函数）：
 *
 * - 保持规则的顺序
 * - 给每个规则分配名字
 * - 启用/禁用规则
 * - 缓存启用规则的列表，以便快速查找
 **/
export default class Ruler {
    private __rules__;
    private __cache__;
    constructor();
    private __find__;
    private __compile__;
    push(ruleName: string, fn: Function, options?: {
        alt?: string[];
    }): void;
    enable(list: string | string[], ignoreInvalid?: boolean): string[];
    disable(list: string | string[], ignoreInvalid?: boolean): string[];
    getRules(chainName: string): Function[];
}
//# sourceMappingURL=ruler.d.ts.map