import { ParserOptions, ContentChange, ParseResult, IMarkdownParser } from './api';
import { MarkdownFSM } from './fsm';
import { ASTNode } from './ast';
import { Token } from './token';

export class MarkdownParser implements IMarkdownParser {
  private config: any;
  private fsm: MarkdownFSM;

  constructor(config: any) {
    this.config = config;
    this.fsm = new MarkdownFSM();
  }

  // 解析 Markdown 内容
  public parse(content: string, options?: ParserOptions): ParseResult {
    const tokens = this.tokenize(content);
    const ast = this.parseToAST(tokens);
    const html = this.generateHTML(ast);
    return { html, ast };
  }

  // 增量解析 Markdown 内容
  public parseIncremental(
    content: string,
    changes: ContentChange[],
    options?: ParserOptions
  ): ParseResult {
    let modifiedContent = content;
    changes.forEach(change => {
      modifiedContent = modifiedContent.slice(0, change.start) + change.newContent + modifiedContent.slice(change.end);
    });

    const tokens = this.tokenize(modifiedContent);
    const ast = this.parseToAST(tokens);
    const html = this.generateHTML(ast);

    return { html, ast };
  }

  // 词法分析，将 Markdown 内容分解为 Token
  private tokenize(content: string): Token[] {
    const tokens: Token[] = [];
    let currentText = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const currentState = this.fsm.transition(char);

      if (currentState === 'text') {
        currentText += char;
      } else {
        if (currentText) {
          tokens.push(new Token('text', currentText));
          currentText = '';
        }
        tokens.push(new Token(currentState, char));
      }
    }

    if (currentText) {
      tokens.push(new Token('text', currentText));
    }

    return tokens;
  }

  // 解析 Token 并生成 AST
  private parseToAST(tokens: Token[]): ASTNode {
    const root = new ASTNode('root', []);
    let currentNode: ASTNode | null = root;

    tokens.forEach(token => {
      switch (token.type) {
        case 'heading':
          if (this.config.enableHeading) {
            currentNode = new ASTNode('heading', token.value);
            root.children!.push(currentNode);
          }
          break;
        case 'list':
          if (this.config.enableList) {
            currentNode = new ASTNode('list', token.value);
            root.children!.push(currentNode);
          }
          break;
        case 'code':
          if (this.config.enableCodeBlock) {
            currentNode = new ASTNode('code', token.value);
            root.children!.push(currentNode);
          }
          break;
        case 'text':
          if (this.config.enableHeading || this.config.enableList || this.config.enableCodeBlock) {
            if (currentNode && currentNode.type === 'text') {
              currentNode.value += token.value;
            } else {
              currentNode = new ASTNode('text', token.value);
              root.children!.push(currentNode);
            }
          }
          break;
      }
    });

    return root;
  }

  // 生成 HTML 输出
  private generateHTML(ast: ASTNode): string {
    switch (ast.type) {
      case 'heading':
        return `<h1>${ast.value}</h1>`;
      case 'list':
        return `<ul><li>${ast.value}</li></ul>`;
      case 'code':
        return `<pre><code>${ast.value}</code></pre>`;
      case 'text':
        return `<p>${ast.value}</p>`;
      case 'root':
        return ast.children!.map(child => this.generateHTML(child)).join('');
      default:
        return '';
    }
  }
}
