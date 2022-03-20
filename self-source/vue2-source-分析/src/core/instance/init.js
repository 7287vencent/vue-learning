/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // todo 定义一个 私有函数 _init 初始化
  // notes 初始化 vue 的状态
  Vue.prototype._init = function (options?: Object) {
    // ? vm 保存的是当前创建的 vue 实例 new 出来的结果
    const vm: Component = this
    // a uid
    // ? 给每个 实例 创建一个 uid
    vm._uid = uid++
    // ? 开始标记 结束标记
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // ? 避免被观察到的标志
    vm._isVue = true
    // merge options
    // ? 合并 options 特殊处理 内部组件选项
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // 优化内部组件实例
      // since dynamic options merging is pretty slow, and none of the
      // 因为动态选项合并是相当慢的，而且没有
      // internal component options needs special treatment.
      // 内部组件选项需要特殊处理。
      // todo 这个是 初始化 组件
      // notes 组件初始化
      initInternalComponent(vm, options)
    } else {
      // ? 在 vm 下挂一个 $options 
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      // ? _renderProxy 就是 vm
      vm._renderProxy = vm
    }
    // expose real self
    // ? 暴露真实自己
    vm._self = vm          // ? _self 保存实例
    initLifecycle(vm)     // ? 初始化 一些 私有属性 $parent $root $children $refs _watch _inactive _directInactive _isMounted _isDestroyed _isBeingDestroyed
    initEvents(vm)        // ? 初始化 _events _hasHookEvent  _parentListeners
    initRender(vm)        // ? 初始化 _vnode _staticTrees $slots $scopedSlots  _c   $createElement 响应式数据 $attrs $listeners
    callHook(vm, 'beforeCreate')  // ? beforeCreate 生命周期
    initInjections(vm)  // ? 初始化 inject
    initState(vm) // ? 初始化 props methos data computed watch
    initProvide(vm) // ? resolve provide after data/props   // 初始化 provide
    callHook(vm, 'created') // ? create 生命周期

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // todo 自动挂载 当 new vue({el: '#app}) 里面有 el 元素的时候 ，就会自动挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
// 这个函数是，对 vue 内部组件的实例进行一次初始化
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // vm.constructor.options 是 在 global-api/index.js 里面的 options,这里面包含了对 keep-alive 的扩展
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 这样做是因为它比动态枚举要快。
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
// todo 2021/1/18：看代码的作用，如果当前vue 继承了某个函数，则把 父级的 options 扁平到 当前 vue的 options 上
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // 超级选择改变,
      // need to resolve new options.
      // 需要解决新的选择。
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 检查是否有任何后期修改/附加的选项(#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      // 更新基本扩展选项
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
