// 该对象用于管理解析器的状态，以及解析器的输入和输出
import Token from "../token.js";
class StateCore {
    constructor(src, md, env) {
        this.src = src;
        this.env = env;
        this.tokens = [];
        this.inlineMode = false;
        this.md = md; // 解析器实例的链接
    }
}
// 将 Token 静态类型暴露出来
StateCore.Token = Token;
export default StateCore;
