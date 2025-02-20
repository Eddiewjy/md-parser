// 正规化输入字符串，可以提高代码的跨平台兼容性、安全性和数据完整性。
// https://spec.commonmark.org/0.29/#line-ending
const NEWLINES_RE = /\r\n?|\n/g; // 匹配换行符，win和mac/linux的换行符不同
const NULL_RE = /\0/g; // 匹配 NULL 字符，防止解析器崩溃
export default function normalize(state) {
    let str;
    // 正规化换行符
    str = state.src.replace(NEWLINES_RE, "\n");
    // 替换 NULL 字符
    str = str.replace(NULL_RE, "\uFFFD");
    state.src = str; // 更新 state.src
}
