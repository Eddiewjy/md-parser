// 正规化输入字符串

// https://spec.commonmark.org/0.29/#line-ending
const NEWLINES_RE  = /\r\n?|\n/g; // 匹配换行符
const NULL_RE      = /\0/g; // 匹配 NULL 字符

export default function normalize (state) {
  let str;

  // 正规化换行符
  str = state.src.replace(NEWLINES_RE, '\n');

  // 替换 NULL 字符
  str = str.replace(NULL_RE, '\uFFFD');

  state.src = str; // 更新 state.src
}
