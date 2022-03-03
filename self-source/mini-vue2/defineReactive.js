// todo 实现数据响应式
// ? 1. watch 监听 数据 变化, 并通知更新
// ? 2. dep 收集数据的依赖关系
// ? 3. vue 里面的 watch  和 dep 是多对多的关系

class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm;
    this.key = key;
    this.updater = updater;
  }
}
