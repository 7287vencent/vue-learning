/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'
// ?vue 的构造函数
import Vue from './runtime/index'
import { query } from './util/index'
// ?编译器
import { compileToFunctions } from './compiler/index'
// ?Decode 解码
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

// todo 通过 id 找到 真实的 el 元素， 返回 innerHTML
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})
// ?原始代码的位置在  /runtime/index.js 里面
const mount = Vue.prototype.$mount
// todo vue $mount 源码  的扩展
// todo 这里可以 找到  render  template  el 三者的优先级
// todo 这是手动挂载
// notes $mount
Vue.prototype.$mount = function (
  el?: string | Element, // ? 传入的 el 可以是一个字符串 或者是 element 元素
  hydrating?: boolean
): Component {
  // ? 找到需要挂载的节点
  el = el && query(el)
  // ? 保证 挂载节点 一定不能是 body, html 标签
  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  // ? 取出  options
  const options = this.$options
  // resolve template/el and convert to render function
  // ? 把 template / el 转换成 render 函数
  // ? 如果不存在 render ,就会去找 template 或 el 。
  // ? render 存在的话，就直接执行 mount
  if (!options.render) {
    // ? 取出 template
    let template = options.template
    // ? 如果 template 存在
    if (template) {
      // ? 如果 template 是字符类型 例: template:"#id"
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          // ? 通过 id 找到真实的 元素
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) { // ? 如果 template 是元素，就是写在 .vue 文件上面的模板
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) { // ? render template 都不存在
      // ? 不存在 template 就使用 el
      template = getOuterHTML(el)
    }
    // todo 如果 template 存在，就使用 compile 编译 template
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      //? 使用 compile 编译器，把template 编译成一个 函数 
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters, // ? 评论
        comments: options.comments // ?注解
      }, this)
      //? render 与 createElement 一起，编译成 vnode 在 /instance/render.js 文件中使用了
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // todo 挂载 vue 到 el 上面
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}
// ?这个是 vue 的 编译器,作用是把 模板 编译成一个 with(this){return `code`} 这种模板的 函数
// ?这个编译函数 与 createElement(create-element 文件中) 最后会编译成 vdom 树
Vue.compile = compileToFunctions

export default Vue
