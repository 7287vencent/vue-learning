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
  Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
}

// ? 新增属性增加监听
function Set(obj, key, val) {
  defineReactive(obj, key, val);
}

// todo  测试
// ? 收集响应式
const obj = { a: "1", b: "2", c: { d: "3" } };
// ? 测试
observe(obj);
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
Set(obj, "e", "1");
obj.e;
obj.e = 2;
console.log("结果", obj.e);
