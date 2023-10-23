const applyMixin = (Vue) => {
  // 在组件创建前初始化 vuex
  Vue.mixin({
    beforeCreate: vuexInit
  })
}

// 组件的创建过程是先父后子, 因此首先会在根实例上添加 $store
function vuexInit () {
  // 获取 vm 配置选项
  const options = this.$options

  if (options.store) {
    // 根实例上处理
    this.$store = options.store
  } else if (options.parent && options.parent.$store) {
    // 非根实例上处理
    this.$store = options.parent.$store
  }
}

export {
  applyMixin
}