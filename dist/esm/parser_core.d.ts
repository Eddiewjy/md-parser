/** internal
 * class Core
 *
 * 顶层规则执行器。连接块解析器和行内解析器，并执行中间转换。
 **/
import Ruler from "./ruler.js";
import StateCore from "./fsm/state_core.js";
/**
 * new Core()
 **/
export default class Core {
    ruler: Ruler;
    constructor();
    process(state: StateCore): void;
    State: typeof StateCore;
}
//# sourceMappingURL=parser_core.d.ts.map