import StateCore from "../../fsm/state_core";
export default function inline(state: StateCore): void {
  const tokens = state.tokens;
  // 解析内联元素
  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];
    if (token.type === "inline") {
      state.md.inline.parse(token.content, state.md, state.env, token.children);
    }
  }
}
