/* @flow */

import Vue from 'core/index' // 这个是真正的vue 的构造函数
import config from 'core/config' // 
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle' // 挂载组件函数
import { devtools, inBrowser } from 'core/util/index' // 判断运行环境

import {
  query, // 通过 id 找到真实的 元素，如果传入的是元素，就直接返回
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch' // patch 源码
import platformDirectives from './directives/index' // 平台 指令
import platformComponents from './components/index' // 平台 组件

// install platform specific utils
// 安装 平台 特殊 utils
Vue.config.mustUseProp = mustUseProp //
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
// ? 扩展 vue directives 和 components 指令
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
// 安装平台 patch 方法
// 这个方法 非常的重要，是diff 函数
// todo 如果是 浏览器 环境，就使用 patch,否则就使用 noop 空函数
// notes patch 初始化位置
Vue.prototype.__patch__ = inBrowser ? patch : noop

// todo 这个是 $mount 的原始 代码
// notes $nount 的 初始代码
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // ?如果 el 存在，并且当前环境是浏览器环境，就找到 el 对应的 元素，否则就 undefined
  el = el && inBrowser ? query(el) : undefined
  // ? 挂载 实例到 el 元素上面 在core/instalce/lifecycle.js中
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}

export default Vue
