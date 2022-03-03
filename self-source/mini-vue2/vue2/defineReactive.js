// ? 定义数据响应式
// ? 支持数组
// ? 支持对象

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
const methods = [
	"push",
	"pop",
	"shift",
	"unshift",
	"splice",
	"sort",
	"reverse"
]

methods.forEach((method) => {
	// ? 取出原本的方法
	const origin = arrayProto[method]
	def(arrayMethods, method, function mutator (...args) {
		// ? 先执行原来的方法得出结果
		const results = origin.apply(this, args)
		const ob = this.__ob__
		let inserted
		switch(method) {
			case "push":
			case "unshift":
				inserted = args
				break;
			case "splice":
				inserted = args.slice(2)
				break;
		}
		if (inserted) {
			// ? 对新的数据执行响应式
			ob.observeArray(inserted)
		}
		// ? 通知更新
		console.log("数组通知更新")

		return results
	})
})


function defineReactive(obj, key, val) {
	// ? 递归 obj[key] 为 对象活数组的情况
	observe(obj[key])

	// ? 开始监听
	Object.defineProperty(obj, key, {
		get() {
			console.log("get->>>",key, val)
			return val 
		},
		set(newVal) {
			if (newVal !== val) {
				console.log("set->>>", newVal)
				// ? 递归监听 newVal 可能是数组或对象的情况
				observe(newVal)
				val = newVal
			}
		}
	})
}


function observe (obj) {
	if (typeof obj !== 'object' || typeof obj === null) {
		return obj
	}
	// ? 开启
	new Observer(obj)
}

class Observer {
	constructor (val) {
		def(val, '__ob__', this)
		if (Array.isArray(val)) {
			// ? 这里是处理数组的情况
			// ? 数组这一块的情况比较特殊，主要是重写了数组的原型链，然后原型链上面的几个方法被重写了
			// ? 重写 val 的原型链
			val.__proto__ = arrayMethods
			this.observeArray(val)
		} else {
			// ? 这里是处理对象的情况
			this.work(val)
		}
	}
	work (obj) {
		Object.keys(obj).forEach((v) => defineReactive(obj, v, obj[v]))
	}
	/**
	 * observe 数组的每一项
	 * */
	observeArray (array) {
		for (let val of array) {
			observe(val)
		}
	}
}


// ? 测试
// let obj = {a: 1, b: {c: 2}, d: 3}
// // ? 启动响应式
// observe(obj)
// obj.a;
// obj.b;
// obj.b.c;
// obj.d;
// obj.d = {e: 4};

// console.log("结果",obj.d)

const arr = [1,{a: 2},3,4,5,6]
observe(arr)
arr[1].a
arr.push({r: 7})
console.log(arr)
