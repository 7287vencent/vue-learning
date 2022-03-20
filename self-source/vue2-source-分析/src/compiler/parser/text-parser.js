/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

export function parseText (
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token 
    // match[1].trim()  是 {{ foo }} 中间的内容 foo
    // 这里也是 filters 的源码部分，
    // parseFilters 狐妖就是处理 filter 这一部分
    const exp = parseFilters(match[1].trim())
    // 把 {{foo}} 添加一个 标记 _s(foo)
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp }) // 添加 表达式，我认为是表示这个属性是一个监听的属性,是从data里面获取的属性值
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  // 最后返回的 {expression: _s(foo), tokens: [{'@binding': foo}]}
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
