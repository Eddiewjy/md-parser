import { getParserInstance } from "./index.js";

const md = getParserInstance({
  features: {
    basic: {
      headings: true,
      textFormatting: {
        emphasis: true,
        strikethrough: true,
      },
      lists: true,
      media: {
        link: true,
        image: true,
      },
      blockquote: true,
      hr: true,
      tables: true,
    },
  },
});

const result = md.render(`
# 这是一个标题

## 这是一个二级标题

这是一个**加粗文本**和*斜体文本*。

这是一个~~删除线文本~~。

[链接](https://example.com)

![图片](https://via.placeholder.com/150)

---

> 这是一个引用

| 表头1 | 表头2 |
|-------|-------|
| 内容1 | 内容2 |

- 列表1.1
- 列表1.2
- 列表1.3

1. 列表2.1
2. 列表2.2
3. 列表2.3

`);

console.log(result);
