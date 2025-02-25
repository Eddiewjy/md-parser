// 用于匹配 HTML 标签的正则表达式

// 属性名称
const attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*'

// 属性值（未加引号、单引号、双引号）
const unquoted      = '[^"\'=<>`\\x00-\\x20]+'
const single_quoted = "'[^']*'"
const double_quoted = '"[^"]*"'

// 属性值
const attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')'

// 属性
const attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)'

// 开标签
const open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>'

// 闭标签
const close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>'

// 注释
const comment     = '<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->'

// 处理指令
const processing  = '<[?][\\s\\S]*?[?]>'

// 声明
const declaration = '<![A-Za-z][^>]*>'

// CDATA
const cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'

// 匹配所有 HTML 标签
const HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment + '|' + processing + '|' + declaration + '|' + cdata + ')')

// 匹配开标签和闭标签
const HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')')

export { HTML_TAG_RE, HTML_OPEN_CLOSE_TAG_RE }
