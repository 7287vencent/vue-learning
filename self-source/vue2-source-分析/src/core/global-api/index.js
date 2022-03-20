/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
// todo 初始化 全局 API

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  //暴露的util方法。
  // ? 注意:这些不被认为是公共API的一部分-避免依赖
  // ? 除非你意识到其中的风险。

  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable =<T>(obj: T): T => {
    observe(obj)
    return obj
  }
  //</T>

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  //这用于标识扩展所有明文对象的“基”构造函数
  //在Weex的多实例场景中的组件。
  // ? _base 指向的是 vue 本身
  Vue.options._base = Vue
  // ? 扩展 keep-alive
  extend(Vue.options.components, builtInComponents)
  // ? 初始化 vue.use
  initUse(Vue)
  // ? 初始化 Mixin
  initMixin(Vue)
  // ? 初始化 extend
  initExtend(Vue)
  // ? 初始化  component directive filter 这三个事件
  initAssetRegisters(Vue)

}
