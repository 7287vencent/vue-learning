/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep() // ? 创建一个 大管家
    this.vmCount = 0
    def(value, '__ob__', this) // ? 代理 __ob__ ，指向的是自己
    if (Array.isArray(value)) { // ? 处理数组 
      if (hasProto) { // ? 是否有原型
        protoAugment(value, arrayMethods) // ? 扩展数组的原型
      } else { // ? 兼容性的写法，兼容 IE
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value) // ? 代理 数组
    } else {
      this.walk(value) // ? 代理对象
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj) // ? 先获取对象的 key值
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]) // ? 然后对每个 key 进行代理
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) { 
    for (let i = 0, l = items.length; i < l; i++) { // ? 对数组中的每个值都代理一次,本质是为了防止数组中存在 对象这种类型数据
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
// todo 重写 目标的 __proto__
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// todo 把 data 编程响应式对象
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // ? 先判断出入的 value 类型 是否是 对象，且不能为 Vnode 节点类型 
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  // ? 响应式实例
  let ob: Observer | void
  // ? 判断 传入的 value 是否是响应式对象，是就直接赋值
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve && // ? 响应式 
    !isServerRendering() && // ? 非服务器渲染
    (Array.isArray(value) || isPlainObject(value)) && // ? 数组和对象
    Object.isExtensible(value) && // ? 可扩展
    !value._isVue // ? 不是 vue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
// todo 代理数据
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep() // ? 创建小管家 

  const property = Object.getOwnPropertyDescriptor(obj, key) // ? 判断 key知否是 obj 自身的属性, 不能代理父级的属性
  if (property && property.configurable === false) { // ? 属性必须可配置
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get // ? 用户自定义的 get 
  const setter = property && property.set // ? 用户自定义的 set
  if ((!getter || setter) && arguments.length === 2) { 
    // ? 只有 set 函数，代表这个属性是 只写属性， 和普通的 属性
    // ? 只有 get 代表这个属性是，值读属性，就不需要代理
    val = obj[key] // ? 取出 obj[key] 值
  }

  let childOb = !shallow && observe(val) // ? 处理 值是 对象类型
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val //? 如果自定义了 getter,则使用自定义的 getter 
      if (Dep.target) { // ? 依赖收集
        dep.depend()
        if (childOb) {
          childOb.dep.depend() // ? 依赖收集
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val // ? 
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter() // ? 自定义 set
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return // ? 有 getter 但是没有 set, 代表这个属性是只读属性
      if (setter) { // ? 存在 自定义的 set
        setter.call(obj, newVal) // ? 执行 set
      } else {
        val = newVal // ? 否则直接赋值
      }
      childOb = !shallow && observe(newVal) // ? 新值为一个 对象，得代理
      // 更新
      dep.notify() // ? 当 代理的属性发生变化的时候，得触发更新
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
