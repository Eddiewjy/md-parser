import { assign, unescapeAll, escapeHtml } from './common/utils'

const default_rules = {}

default_rules.code_inline = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]
  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeHtml(token.content) +
          '</code>'
}

default_rules.code_block = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]
  return  '<pre' + slf.renderAttrs(token) + '><code>' +
          escapeHtml(tokens[idx].content) +
          '</code></pre>\n'
}

default_rules.fence = function (tokens, idx, options, env, slf) {
  const token = tokens[idx]
  const info = token.info ? unescapeAll(token.info).trim() : ''
  let langName = ''
  let langAttrs = ''

  if (info) {
    const arr = info.split(/(\s+)/g)
    langName = arr[0]
    langAttrs = arr.slice(2).join('')
  }

  let highlighted
  if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
  } else {
    highlighted = escapeHtml(token.content)
  }

  if (highlighted.indexOf('<pre') === 0) {
    return highlighted + '\n'
  }

  if (info) {
    const i = token.attrIndex('class')
    const tmpAttrs = token.attrs ? token.attrs.slice() : []

    if (i < 0) {
      tmpAttrs.push(['class', options.langPrefix + langName])
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice()
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName
    }

    const tmpToken = {
      attrs: tmpAttrs
    }

    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`
  }

  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
}

default_rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content)
}

default_rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content
}
default_rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content
}

/**
 * new Renderer()
 *
 * 创建新的 [[Renderer]] 实例，并填充默认的 [[Renderer#rules]]。
 **/
export default function Renderer () {
  this.rules = assign({}, default_rules)
}

/**
 * Renderer.renderAttrs(token) -> String
 *
 * 渲染 token 的属性为字符串。
 **/
Renderer.prototype.renderAttrs = function renderAttrs (token) {
  let i, l, result

  if (!token.attrs) { return '' }

  result = ''

  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"'
  }

  return result
}

/**
 * Renderer.renderToken(tokens, idx, options) -> String
 * - tokens (Array): token 列表
 * - idx (Number): 要渲染的 token 索引
 * - options (Object): 解析器实例的参数
 *
 * 默认的 token 渲染器。可以通过 [[Renderer#rules]] 中的自定义函数覆盖。
 **/
Renderer.prototype.renderToken = function renderToken (tokens, idx, options) {
  const token = tokens[idx]
  let result = ''

  if (token.hidden) {
    return ''
  }

  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += '\n'
  }

  result += (token.nesting === -1 ? '</' : '<') + token.tag
  result += this.renderAttrs(token)

  if (token.nesting === 0 && options.xhtmlOut) {
    result += ' /'
  }

  let needLf = false
  if (token.block) {
    needLf = true

    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        const nextToken = tokens[idx + 1]
        if (nextToken.type === 'inline' || nextToken.hidden) {
          needLf = false
        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          needLf = false
        }
      }
    }
  }

  result += needLf ? '>\n' : '>'

  return result
}

/**
 * Renderer.renderInline(tokens, options, env) -> String
 * - tokens (Array): 要渲染的内联类型的 token 列表
 * - options (Object): 解析器实例的参数
 * - env (Object): 来自解析输入的附加数据（例如引用）
 *
 * 渲染内联 token，功能类似 [[Renderer.render]]。
 **/
Renderer.prototype.renderInline = function (tokens, options, env) {
  let result = ''
  const rules = this.rules

  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type

    if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this)
    } else {
      result += this.renderToken(tokens, i, options)
    }
  }

  return result
}

/**
 * Renderer.render(tokens, options, env) -> String
 * - tokens (Array): 要渲染的 token 列表
 * - options (Object): 解析器实例的参数
 * - env (Object): 来自解析输入的附加数据（例如引用）
 *
 * 渲染 token 流并生成 HTML。通常不需要直接调用此方法。
 **/
Renderer.prototype.render = function (tokens, options, env) {
  let result = ''
  const rules = this.rules

  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type

    if (type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env)
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this)
    } else {
      result += this.renderToken(tokens, i, options, env)
    }
  }

  return result
}

