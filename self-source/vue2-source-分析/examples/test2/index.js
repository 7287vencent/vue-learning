function Vue (options) {
  this.name = options.name
}

Vue.use = function () {
  console.log("use", this)
}

let v = new Vue({
  name: 'vue1'
})

v.constructor.use()