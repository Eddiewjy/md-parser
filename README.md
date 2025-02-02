# md-parser

基于 markdown-it 的 Markdown 解析器

## 目录结构

- **src/**
  - **common/**：工具函数；HTML 标识
  - **fsm/**：状态机，分为 `core`、`block`、`inline`
  - **rules/**：解析规则，指定 Markdown 转 HTML 的规则
  - **imd**：创建解析器实例
  - **parser\_\*\***：三个级别的解析器
  - **ruler**：规则管理器，内部利用缓存机制提高性能。
  - **token**：规定 token 格式
  - **index**：入口，对接编辑器接口

解析过程：根据解析选项创建规则管理器 ruler，启用/禁用规则，形成规则链，然后调用 core.process 方法，构建状态机，运用规则链解析文本，生成 tokens，最后调用 renderer.render 方法，将 tokens 渲染成 html 字符串。

每个规则函数的处理对象是状态机，具体一点是每个 parser 对应的 fsm/state，如此一来可以保证 token 和解析器实例以及一些外部注入的变量跟随状态机连续传递。
