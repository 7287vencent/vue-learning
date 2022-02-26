// ! 数组原型重写
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

// ? 拦截变化的方法，并提交变更事件
methodsToPatch.forEach(function (method) {
  // ? 缓存原始的方法
  const original = arrayProto[method];
  // ? 响应式
  def(arrayMethods, method, function mutator(...args) {
    console.log("测试", args);
    const result = original.call(this, args);
    // ? 响应式的依赖
    const ob = this.__ob__;
    // console.log("this->>>", this);
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
    // ? 如果有数据变化，对新的数据进行数据响应式
    if (inserted) ob.observeArray(inserted);
    // ? 通知响应式更新
    console.log("通知更新-->>>>>");
    return result;
  });
});

// ? 给 obj 定一个数据响应式属性
function defineReactive(obj, key, val) {
  // ? 递归收集，obj[key] 是对象的情况
  observe(obj[key]);
  Object.defineProperty(obj, key, {
    get() {
      console.log("get->>", key, val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set->>", key, newVal);
        // ? 处理 newVal 是对象的问题
        observe(newVal);
        val = newVal;
      }
    },
  });
}

function observe(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  new Observer(obj);
}

function protoAugment(target, src) {
  // ? 重写原型对象
  target.__proto__ = src;
}

class Observer {
  constructor(value) {
    // ? 给 value 绑定上 __ob__, 表示 this
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      // ? 处理数组主要是把数组的原型里面的方法重写了。
      protoAugment(value, arrayMethods);
      this.observeArray(value);
      // todo
    } else {
      this.walk(value);
    }
  }
  walk(obj) {
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
  }
  observeArray(array) {
    for (let i = 0; i < array.length; i++) {
      // ? 对数组的每个数据进行响应式
      observe(array[i]);
    }
  }
}

// ? 新增属性增加监听
function Set(obj, key, val) {
  defineReactive(obj, key, val);
}

// todo  测试
// ? 收集响应式
// const obj = { a: "1", b: "2", c: { d: "3" } };
// ? 测试
// observe(obj);
// obj.a;
// obj.b;
// obj.c.d = 10;
// console.log("结果", obj.c.d);

// obj.c = {
//   e: "1",
// };
// obj.c.e = "20";

// console.log("结果", obj.c.e);

// obj.a = "修改a";
// console.log("结果", obj.a);

// ? 测试 新增属性
// Set(obj, "e", "1");
// obj.e;
// obj.e = 2;
// console.log("结果", obj.e);

// ? 测试基础的
let array = [1, 2, 3, 4, 5];
// ? 响应式
observe(array);
// ? push
array.push(6);
