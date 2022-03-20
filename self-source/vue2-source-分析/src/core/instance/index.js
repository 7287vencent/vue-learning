import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
// todo vue 构造函数
// notes vue 构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // ?_init 函数在 initMixin(vue) 中
  this._init(options)
}


initMixin(Vue) // ? 初始化 vue 的 属性 和 beforecreate create 生命周期，$attrs $listeners  props methos data computed watch 并执行 $mount
stateMixin(Vue) // ? 混入 $data $props $set $delete $watch
eventsMixin(Vue) // ? 混入 $on $once $off $emit 事件
lifecycleMixin(Vue) // ? 混入 _update   $forceUpdate   $destroy
renderMixin(Vue) // ? 混入 $nextTick    _render

export default Vue
