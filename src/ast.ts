// ASTNode 类表示抽象语法树中的一个节点
export class ASTNode {
  type: string;
  value: string | ASTNode[];
  children?: ASTNode[];

  constructor(type: string, value: string | ASTNode[]) {
    this.type = type;
    this.value = value;
    if (Array.isArray(value)) {
      this.children = value;
    }
  }
}
