/**
 * class Ruler
 *
 * 帮助类，用于管理规则序列（函数）：
 *
 * - 保持规则的顺序
 * - 给每个规则分配名字
 * - 启用/禁用规则
 * - 添加/替换规则
 * - 缓存启用规则的列表
 **/
type Rule = {
  name: string;
  enabled: boolean;
  fn: Function;
  alt: string[];
};

export default function Ruler () {
  this.__rules__ = [] as Rule[];
  this.__cache__ = null as { [key: string]: Function[] } | null;
}

// 查找规则的索引
Ruler.prototype.__find__ = function (name) {
  for (let i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i
    }
  }
  return -1
}

// 构建规则查找缓存
Ruler.prototype.__compile__ = function () {
  const self = this
  const chains = ['']

  // 收集唯一的链名称
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) { return }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName)
      }
    })
  })

  self.__cache__ = {}

  chains.forEach(function (chain) {
    self.__cache__[chain] = []
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return }

      if (chain && rule.alt.indexOf(chain) < 0) { return }

      self.__cache__[chain].push(rule.fn)
    })
  })
}

/**
 * Ruler.at(name, fn [, options])
 * - name (String): 规则名称，用来替换现有规则
 * - fn (Function): 新的规则函数
 * - options (Object): 新规则的选项（可选）
 *
 * 通过名称替换规则。如果未找到名称，会抛出错误。
 */
Ruler.prototype.at = function (name, fn, options) {
  const index = this.__find__(name)
  const opt = options || {}

  if (index === -1) { throw new Error('规则未找到: ' + name) }

  this.__rules__[index].fn = fn
  this.__rules__[index].alt = opt.alt || []
  this.__cache__ = null
}

/**
 * Ruler.push(ruleName, fn [, options])
 * - ruleName (String): 规则名称
 * - fn (Function): 规则函数
 * - options (Object): 规则选项（可选）
 *
 * 将新规则添加到链的末尾
 */
Ruler.prototype.push = function (ruleName, fn, options) {
  const opt = options || {}

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  })

  this.__cache__ = null
}

/**
 * Ruler.enable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): 需要启用的规则名称列表
 * - ignoreInvalid (Boolean): 是否忽略未找到规则的错误
 *
 * 启用给定名称的规则，如果未找到规则，抛出错误
 */
Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [list] }

  const result = []

  // 查找并启用规则
  list.forEach(function (name) {
    const idx = this.__find__(name)

    if (idx < 0) {
      if (ignoreInvalid) { return }
      throw new Error('规则管理: 无效的规则名称 ' + name)
    }
    this.__rules__[idx].enabled = true
    result.push(name)
  }, this)

  this.__cache__ = null
  return result
}

/**
 * Ruler.disable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): 需要禁用的规则名称列表
 * - ignoreInvalid (Boolean): 是否忽略未找到规则的错误
 *
 * 禁用给定名称的规则，如果未找到规则，抛出错误
 */
Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [list] }

  const result = []

  // 查找并禁用规则
  list.forEach(function (name) {
    const idx = this.__find__(name)

    if (idx < 0) {
      if (ignoreInvalid) { return }
      throw new Error('规则管理: 无效的规则名称 ' + name)
    }
    this.__rules__[idx].enabled = false
    result.push(name)
  }, this)

  this.__cache__ = null
  return result
}

/**
 * Ruler.getRules(chainName) -> Array
 *
 * 返回给定链名称的启用规则函数列表
 */
Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__()
  }

  // 如果规则被禁用，链可以是空的。但仍然返回一个数组
  return this.__cache__[chainName] || []
}

export type RulerType = Ruler; 
