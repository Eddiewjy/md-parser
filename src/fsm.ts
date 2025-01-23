// MarkdownFSM 类表示 Markdown 解析器的有限状态机
export class MarkdownFSM {
  currentState: State;

  constructor() {
    this.currentState = new TextState(this);
  }

  // 根据输入字符转换状态
  transition(char: string): string {
    this.currentState.handle(char);
    return this.currentState.name;
  }
}

interface State {
  name: string;
  handle(char: string): void;
}

class TextState implements State {
  name = 'text';
  fsm: MarkdownFSM;

  constructor(fsm: MarkdownFSM) {
    this.fsm = fsm;
  }

  handle(char: string): void {
    if (char === '#') {
      this.fsm.currentState = new HeadingState(this.fsm);
    } else if (char === '*') {
      this.fsm.currentState = new ListState(this.fsm);
    } else if (char === '`') {
      this.fsm.currentState = new CodeState(this.fsm);
    }
  }
}

class HeadingState implements State {
  name = 'heading';
  fsm: MarkdownFSM;

  constructor(fsm: MarkdownFSM) {
    this.fsm = fsm;
  }

  handle(char: string): void {
    if (char === '\n') {
      this.fsm.currentState = new TextState(this.fsm);
    }
  }
}

class ListState implements State {
  name = 'list';
  fsm: MarkdownFSM;

  constructor(fsm: MarkdownFSM) {
    this.fsm = fsm;
  }

  handle(char: string): void {
    if (char === '\n') {
      this.fsm.currentState = new TextState(this.fsm);
    } else if (char === '*') {
      this.fsm.currentState = new ListItemState(this.fsm);
    }
  }
}

class ListItemState implements State {
  name = 'list-item';
  fsm: MarkdownFSM;

  constructor(fsm: MarkdownFSM) {
    this.fsm = fsm;
  }

  handle(char: string): void {
    if (char === '\n') {
      this.fsm.currentState = new ListState(this.fsm);
    }
  }
}

class CodeState implements State {
  name = 'code';
  fsm: MarkdownFSM;

  constructor(fsm: MarkdownFSM) {
    this.fsm = fsm;
  }

  handle(char: string): void {
    if (char === '`') {
      this.fsm.currentState = new TextState(this.fsm);
    }
  }
}
