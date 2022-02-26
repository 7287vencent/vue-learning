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

// todo  测试
// ? 收集响应式
const obj = {};
defineReactive(obj, "a", "1");
// ? 测试 get
obj.a;

// ? 测试 set
obj.a = 2;
console.log("结果", obj.a);
