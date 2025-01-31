import Ruler from './ruler'
import StateInline from './fsm/state_inline'

// 基础语法规则
import r_text from './rules/inline/text'
import r_linkify from './rules/inline/linkify'
import r_escape from './rules/inline/escape'
import r_backticks from './rules/inline/backticks'
import r_strikethrough from './rules/inline/strikethrough'
import r_emphasis from './rules/inline/emphasis'
import r_link from './rules/inline/link'
import r_image from './rules/inline/image'
import r_entity from './rules/inline/entity'

// 解析规则
const _rules = [
  ['text',            r_text],          // 普通文本
  ['linkify',         r_linkify],       // 链接识别
  ['escape',          r_escape],        // 转义字符
  ['backticks',       r_backticks],     // 反引号
  ['strikethrough',   r_strikethrough.tokenize], // 删除线
  ['emphasis',        r_emphasis.tokenize],     // 斜体
  ['link',            r_link],          // 链接
  ['image',           r_image],         // 图片
  ['entity',          r_entity]         // HTML实体
]

/**
 * 新建ParserInline实例
 **/
export default function ParserInline () {
  this.ruler = new Ruler()

  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1])
  }
}

// 跳过单个token，通过验证模式运行所有规则；
// 如果任何规则成功，返回`true`
ParserInline.prototype.skipToken = function (state) {
  const pos = state.pos
  const rules = this.ruler.getRules('')
  const len = rules.length
  const maxNesting = state.md.options.maxNesting
  const cache = state.cache

  if (typeof cache[pos] !== 'undefined') {
    state.pos = cache[pos]
    return
  }

  let ok = false

  if (state.level < maxNesting) {
    for (let i = 0; i < len; i++) {
      state.level++
      ok = rules[i](state, true)
      state.level--

      if (ok) {
        if (pos >= state.pos) { throw new Error("inline rule didn't increment state.pos") }
        break
      }
    }
  } else {
    // 嵌套过多，直接跳到段落结束
    state.pos = state.posMax
  }

  if (!ok) { state.pos++ }
  cache[pos] = state.pos
}

// 生成指定范围内的tokens
ParserInline.prototype.tokenize = function (state) {
  const rules = this.ruler.getRules('')
  const len = rules.length
  const end = state.posMax
  const maxNesting = state.md.options.maxNesting

  while (state.pos < end) {
    const prevPos = state.pos
    let ok = false

    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        ok = rules[i](state, false)
        if (ok) {
          if (prevPos >= state.pos) { throw new Error("inline rule didn't increment state.pos") }
          break
        }
      }
    }

    if (ok) {
      if (state.pos >= end) { break }
      continue
    }

    state.pending += state.src[state.pos++]
  }

  if (state.pending) {
    state.pushPending()
  }
}

/**
 * ParserInline.parse(str, md, env, outTokens)
 *
 * 处理输入字符串并将内联tokens推送到`outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  const state = new this.State(str, md, env, outTokens)

  this.tokenize(state)
}

ParserInline.prototype.State = StateInline


