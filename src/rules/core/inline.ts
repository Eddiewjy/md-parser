import StateCore from "../../fsm/state_core.js";

export default function inline(state: StateCore): void {
  const tokens = state.tokens;
  // 解析内联元素
  for (let i = 0, l = tokens.length; i < l; i++) {
    const tok = tokens[i];
    if (tok.type === "inline") {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
}
