import StateCore from "../../fsm/state_core.js";
import Token from "../../token.js";
export default function block(state: StateCore): void {
  let token: Token;

  if (state.inlineMode) {
    // 如果是内联模式，创建一个内联 token
    token = new StateCore.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else {
    // 否则，解析块元素
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
}
