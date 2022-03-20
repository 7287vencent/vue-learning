<template>
<div>
  <h1>普通的h1标签</h1>
  <input type="text" v-model="foo"/>
  <div v-for="(item) in list" :key="item">
    {{item}}
  </div>
  <div @click="handleClick">按钮</div>
</div>
</template>

<script>
export default {
  data() {
    return {
      foo: 'foo',
      list: [
        'a',
        'b',
        'c'
      ]
    }
  },
  methods: {
    handleClick() {
      console.log("点击了事件")
    }
  },
}
</script>

<style>

</style>
