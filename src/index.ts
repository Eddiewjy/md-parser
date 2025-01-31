// 主解析器类

import * as utils from './common/utils'
import Renderer from './renderer'
import ParserCore from './parser_core'
import ParserBlock from './parser_block'
import ParserInline from './parser_inline'
import { ParserOptions } from './api'

export default function IMarkdown (options:ParserOptions) {
  if (!(this instanceof IMarkdown)) {
    return new IMarkdown(options)
  }

  this.inline = new ParserInline()
  this.block = new ParserBlock()
  this.core = new ParserCore()
  this.renderer = new Renderer()

  this.options = {}
  if (options) { this.set(options) }
}


IMarkdown.prototype.set = function (options) {
  utils.assign(this.options, options)
  return this
}


IMarkdown.prototype.enable = function (list) {
  // 启用规则
  list.forEach(function (rule) {
    this.core.enable(rule)
  }, this)
  return this
}

IMarkdown.prototype.disable = function (list) {
  // 禁用规则
  list.forEach(function (rule) {
    this.core.disable(rule)
  }, this)
  return this
}

IMarkdown.prototype.use = function (plugin, params) {
  plugin(this, params)
  return this
}



