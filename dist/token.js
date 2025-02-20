// Token 类表示词法分析中的一个标记
export default class Token {
    constructor(type, tag, nesting) {
        this.type = type; // 标记的类型，例如 "paragraph_open"
        this.tag = tag; // HTML 标签名，例如 "p"
        this.attrs = null; // HTML 属性，格式为 `[ [ name1, value1 ], [ name2, value2 ] ]`
        this.map = null; // 源映射信息，格式为 `[ line_begin, line_end ]`
        this.nesting = nesting; // 嵌套级别变化，-1 表示关闭标签，0 表示自闭合标签，1 表示打开标签
        this.level = 0; // 嵌套级别，与 `state.level` 相同
        this.children = null; // 子节点数组（内联和图片标记）
        this.content = ""; // 自闭合标签的内容，例如代码、HTML、围栏等
        this.markup = ""; // 标记符号，例如强调的 '*' 或 '_'
        this.info = ""; // 附加信息，例如围栏标记的 info 字符串
        this.meta = null; // 插件存储任意数据的地方
        this.block = false; // 是否为块级标记，false 表示内联标记
        this.hidden = false; // 是否在渲染时忽略此元素，用于紧凑列表隐藏段落
    }
    attrIndex(name) {
        // 搜索属性名的索引
        if (!this.attrs) {
            return -1;
        }
        const attrs = this.attrs;
        for (let i = 0, len = attrs.length; i < len; i++) {
            if (attrs[i][0] === name) {
                return i;
            }
        }
        return -1;
    }
    attrPush(attrData) {
        // 添加 `[ name, value ]` 属性到列表中，必要时初始化 attrs
        if (this.attrs) {
            this.attrs.push(attrData);
        }
        else {
            this.attrs = [attrData];
        }
    }
    attrSet(name, value) {
        // 设置 `name` 属性为 `value`，如果存在则覆盖旧值
        const idx = this.attrIndex(name);
        const attrData = [name, value];
        if (idx < 0) {
            this.attrPush(attrData);
        }
        else {
            this.attrs[idx] = attrData;
        }
    }
    attrGet(name) {
        // 获取 `name` 属性的值，如果不存在则返回 null
        const idx = this.attrIndex(name);
        let value = null;
        if (idx >= 0) {
            value = this.attrs[idx][1];
        }
        return value;
    }
    attrJoin(name, value) {
        // 通过空格连接值到现有属性，或者如果不存在则创建新属性
        const idx = this.attrIndex(name);
        if (idx < 0) {
            this.attrPush([name, value]);
        }
        else {
            this.attrs[idx][1] = this.attrs[idx][1] + " " + value;
        }
    }
}
