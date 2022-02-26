// ? 给 obj 定一个数据响应式属性
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log("get->>", key, val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set->>", key), val;
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

// todo  测试
// ? 收集响应式
const obj = { a: "1", b: "2", c: "3" };
// ? 测试
observe(obj);
obj.a;
obj.b;
obj.c;
obj.a = "修改a";
console.log("结果", obj.a);
