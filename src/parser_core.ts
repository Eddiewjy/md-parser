/** internal
 * class Core
 *
 * 顶层规则执行器。连接块解析器和行内解析器，并执行中间转换。
 **/

import Ruler from './ruler'
import StateCore from './fsm/state_core'

import r_normalize from './rules/core/normalize'
import r_block from './rules/core/block'
import r_inline from './rules/core/inline'

// 定义规则类型
type Rule = [string, (state: StateCore) => void];

const _rules: Rule[] = [
  ['normalize', r_normalize],
  ['block', r_block],
  ['inline', r_inline]
]

/**
 * new Core()
 **/
export default class Core {
  ruler: Ruler;

  constructor() {
    // 创建规则管理器
    this.ruler = new Ruler()

    // 添加核心规则
    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1])
    }
  }

  // 启用规则链
  process(state: StateCore): void {
    const rules = this.ruler.getRules('')

    for (let i = 0, l = rules.length; i < l; i++) {
      rules[i](state)
    }
  }

  // 将 StateCore 类型暴露出来
  State = StateCore;
}


