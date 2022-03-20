class RefImpl {
  constructor(_rawValue, _shallow = false) {
      this._rawValue = _rawValue;
      this._shallow = _shallow;
      this.__v_isRef = true; // ? 自读属性，用来标记，是一个响应式数据
      // ? _shallow为true时，只会对value的更改做出响应，当value改变后，不会对新的值做响应式
      this._value = _shallow ? _rawValue : _rawValue;
  }
  // todo 获取值的时候，
  get value() {
      console.log("111111");
      // track(toRaw(this), "get" /* GET */, 'value');
      return this._value;
  }
  set value(newVal) {
      // ? 如果数据有更新
      // if (hasChanged(toRaw(newVal), this._rawValue)) {
      //     this._rawValue = newVal;
      //     this._value = this._shallow ? newVal : convert(newVal);
      //     trigger(toRaw(this), "set" /* SET */, 'value', newVal);
      // }
  }
}
// let a = new RefImpl(1)

let se = new Set()
se.add(1)
se.add(2)
se.add(3)
se.add(4)
se.add(5)
se.forEach((item) => {
  console.log(item)
})