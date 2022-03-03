// todo 目标
// ! 1. 实现 new Vue
// ! 2. 实现数据响应式
// ! 3. 实现 methods 和 data
// ! 4. 实现 v-html 和 v-model 指令
// ? 1. new Vue 是一个方法
class KVue {
  constructor(options) {
    // ? 1. 使用私有属性保存选项
    this.$options = options;
    this.$data = options.data;

    // ? 2. 对 data 进行响应式处理
    observe(options.data);

    // ? 3. 代理
    proxy(this);

    // ? 4. 编译
    new Compile(options.el, this);
  }
}

// ? 能够将传入对象的所有key代理到执行的对象上, 就是实现 this.key 直接访问 data 里面的 Key 值
function proxy(vm) {
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(v) {
        // ? this.key = 1
        // ? 然后就会触发响应式
        return (vm.$data[key] = v);
      },
    });
  });
}

class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      // ? 编译模板
      this.compile(this.$el);
    }
  }
  // ? 遍历节点，判断节点类型，做不同处理
  compile(node) {
    const childrenNodes = node.childNodes;
    Array.from(childrenNodes).forEach((n) => {
      // ! 判断类型
      // ? 元素类型 编译 递归子节点
      if (this.isElement(n)) {
        // ? 编译
        this.compileElement(n);

        // ? 子节点存在 递归
        if (n.childNodes.length > 0) {
          this.compile(n);
        }
      } else if (this.isInter(n)) {
        // ? 动态插值表达式
        this.compileText(n);
      }
    });
  }
  isElement(n) {
    return n.nodeType === 1;
  }
  // 形如{{ooxx}}
  isInter(n) {
    return n.nodeType === 3 && /\{\{(.*)\}\}/.test(n.textContent);
  }
  // 编译插值文本 {{ooxx}}
  compileText(n) {
    // 获取表达式
    // n.textContent = this.$vm[RegExp.$1];
    this.update(n, RegExp.$1, "text");
  }

  // ? 编译元素：遍历它的属性，看是否存在K-开头的指令，或@事件
  compileElement(n) {
    // ? 1. 获取属性
    const attrs = n.attributes;

    Array.from(attrs).forEach((attr) => {
      // ? 判断是否存在指令或事件
      // ? v-text = "xxx" ->>> n = v-text value = xxx
      const attrName = attr.name;
      const exp = attr.value;
      // ? 是否是指令
      if (this.isDir(attrName)) {
        // ? 执行特定指令处理函数
        const dir = attrName.substring(2);
        this[dir] && this[dir](n, exp);
      }
    });
  }

  update(node, exp, dir) {
    // ? 1. init
    const fn = this[dir + "Updater"];
    // ? 节点 和 数据 this.key
    fn && fn(node, this.$vm[exp]);

    // ? update
    // ? 监听表达式的更新
    new Watcher(this.$vm, exp, (val) => {
      fn && fn(node, val);
    });
  }

  // k-text
  text(node, exp) {
    this.update(node, exp, "text");
  }
  // ? 类似 dom 操作，直接修改元素
  textUpdater(node, val) {
    node.textContent = val;
  }

  // v-html
  html(node, exp) {
    this.update(node, exp, "html");
  }
  htmlUpdater(node, val) {
    node.innerHTML = val;
  }

  // v-model
  model(node, exp) {
    // ? 这个的话，节点得监听 update 事件

    // ? 看 node 的 类型，具体绑定什么事件
    // ? input 是监听 input 事件

    node.addEventListener("input", (e) => {
      // console.log("e->>>", e.target.value)
      this.$vm[exp] = e.target.value;
    });

    this.update(node, exp, "model");
  }

  modelUpdater(node, value) {
    node.value = value;
  }

  isDir(attrName) {
    return attrName.startsWith("k-");
  }
}

// todo 下面是响应式模块的数据

// ? 定义数据响应式
// ? 支持数组
// ? 支持对象

class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm;
    this.key = key;
    this.updater = updater;

    // ? 触发一下 get
    Dep.target = this;
    // ? get
    this.vm[this.key];
    Dep.target = null;
  }

  // ? 将来会被 Dep 调用
  update() {
    this.updater.call(this.vm, this.vm[this.key]);
  }
}

// ? 保存 watcher 实例的依赖类
class Dep {
  constructor() {
    this.deps = [];
  }
  addDep(dep) {
    // ? 创建依赖关系时调用
    this.deps.push(dep);
  }
  // ? 通知更新
  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
const methods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methods.forEach((method) => {
  // ? 取出原本的方法
  const origin = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    // ? 先执行原来的方法得出结果
    const results = origin.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      // ? 对新的数据执行响应式
      ob.observeArray(inserted);
    }
    // ? 通知更新
    // console.log("数组通知更新")

    return results;
  });
});

function defineReactive(obj, key, val) {
  // ? 递归 obj[key] 为 对象活数组的情况
  observe(obj[key]);

  // ? 创建 Dep 实例 收集响应式
  const dep = new Dep();

  // ? 开始监听
  Object.defineProperty(obj, key, {
    get() {
      // console.log("get->>>", key, val)
      // ? 依赖关系收集
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        // console.log("set->>>", newVal)
        // ? 递归监听 newVal 可能是数组或对象的情况
        observe(newVal);
        val = newVal;
        // ? 通知更新
        dep.notify();
      }
    },
  });
}

function observe(obj) {
  if (typeof obj !== "object" || typeof obj === null) {
    return obj;
  }
  // ? 开启
  new Observer(obj);
}

class Observer {
  constructor(val) {
    def(val, "__ob__", this);
    if (Array.isArray(val)) {
      // ? 这里是处理数组的情况
      // ? 数组这一块的情况比较特殊，主要是重写了数组的原型链，然后原型链上面的几个方法被重写了
      // ? 重写 val 的原型链
      val.__proto__ = arrayMethods;
      this.observeArray(val);
    } else {
      // ? 这里是处理对象的情况
      this.work(val);
    }
  }
  work(obj) {
    Object.keys(obj).forEach((v) => defineReactive(obj, v, obj[v]));
  }
  /**
   * observe 数组的每一项
   * */
  observeArray(array) {
    for (let val of array) {
      observe(val);
    }
  }
}
