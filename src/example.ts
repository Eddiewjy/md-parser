import fs from 'fs';
import { MarkdownParser } from './parser';
// import { ContentChange } from './parser';
// 读取配置文件
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// 创建 Markdown 解析器实例
const parser = new MarkdownParser(config);

// 解析 Markdown 内容
const markdownContent = "# Heading 1\n* List item 1\n* List item 2\n`Code block`";
const { html, ast } = parser.parse(markdownContent);

// 输出解析结果
console.log('Generated HTML:', html);
console.log('Generated AST:', JSON.stringify(ast, null, 2));

// // 增量更新示例
// const changes: ContentChange[] = [
//   { start: 0, end: 6, newContent: "## Updated Heading" }
// ];
// const { html: updatedHtml, ast: updatedAst } = parser.parseIncremental(markdownContent, changes);

// // 输出增量更新结果
// console.log('Updated HTML:', updatedHtml);
// console.log('Updated AST:', JSON.stringify(updatedAst, null, 2));
