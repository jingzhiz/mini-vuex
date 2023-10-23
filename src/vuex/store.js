import ModuleCollection from './moduleCollection.js'
import { applyMixin } from './mixin'
import { forEach } from './utils'

let Vue

class Store {
  constructor(options) {
    // 收集模块, 进行格式化
    this._modules = new ModuleCollection(options)

    const state = this._modules.root.state // 根状态
    this._actions = {} // 存放所有的 actions
    this._mutations = {} // 存放所有的 mutations
    this._wrappedGetters = {} // 存放所有的 getters
    this._subscribes = [] // 插件订阅记录
    this._strict = options.strict // 是否是严格模式

    // 同步 watcher
    this._committing = false

    // 安装模块, 将模块的属性定义至 store 中
    installModule(this, state, [], this._modules.root)

    // 将状态放置在 vm 中
    resetStoreVm(this, state)

    // 处理插件
    options.plugins.forEach((plugin) => plugin(this))
  }

  get state() {
    return this._vm._data.$$state
  }

  // 更改 state 只能通过 _withCommitting 更改
  _withCommitting(fn) {
    const _committing = this._committing
    this._committing = true
    fn()
    this._committing = _committing
  }

  commit = (type, payload) => {
    if (!this._mutations[type]) {
      console.error(`[vuex] unknown mutation type: ${type}`)
      return
    }
    this._mutations[type].forEach((fn) => fn(payload))
  }

  dispatch = (type, payload) => {
    if (!this._actions[type]) {
      console.error(`[vuex] unknown action type: ${type}`)
      return
    }
    this._actions[type].forEach((fn) => fn(payload))
  }

  registerModule(path, rawModule) {
    if (typeof path === 'string') path = [path]

    console.assert(
      Array.isArray(path),
      `module path must be a string or an Array.`
    )

    // 注册模块
    this._modules.register(path, rawModule)
    // 安装模块
    installModule(this, this.state, path, rawModule.rawModule)
    // 安装后将新添加的 getters 添加到 computed
    resetStoreVm(this, this.state)
  }

  subscribe(fn) {
    this._subscribes.push(fn)
  }

  replaceState(newState) {
    this._withCommitting(() => {
      this._vm._data.$$state = newState
    })
  }
}

function installModule(store, rootState, path, module) {
  // 如果存在命名空间, 则需要将事件注册到模块名下
  const namespace = store._modules.getNamespaced(path)

  if (path.length) {
    // 如果是子模块, 将子模块的 state 定义至根上
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current]
    }, rootState)
    store._withCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state)
    })
  }

  module.forEachGetters((getter, key) => {
    // getters 重名会被覆盖, 所有的 getters 都会定义至根模块
    store._wrappedGetters[namespace + key] = function () {
      return getter(getState(store, path))
    }
  })

  // 重名的 actions/mutations 会放置在一个数组中, 调用某个名字时, 遍历数组元素执行所有存放的函数
  module.forEachActions((action, type) => {
    store._actions[namespace + type] = store._actions[namespace + type] || []
    store._actions[namespace + type].push((payload) => {
      action.call(store, store, payload)
    })
  })

  module.forEachMutations((mutation, type) => {
    store._mutations[namespace + type] =
      store._mutations[namespace + type] || []
    store._mutations[namespace + type].push((payload) => {
      store._withCommitting(() => {
        mutation.call(store, getState(store, path), payload)
      })
      // 调用插件订阅的事件
      store._subscribes.forEach((sub) => sub({ mutation, type }, store.state))
    })
  })

  module.forEachChildren((child, name) => {
    installModule(store, rootState, path.concat(name), child)
  })
}

// 保证每次 getters/mutations 执行获取的都是最新的 state
function getState(store, path) {
  return path.reduce((newState, current) => {
    return newState[current]
  }, store.state)
}

function resetStoreVm(store, state) {
  let oldVm = store._vm

  store.getters = {}
  const computed = {}
  const wrappedGetters = store._wrappedGetters
  forEach(wrappedGetters, (fn, key) => {
    // 通过计算属性实现 getters 的缓存
    computed[key] = function () {
      return fn()
    }

    // 方法调用还是通过 store, 所以添加一层代理
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    })
  })

  store._vm = new Vue({
    data() {
      return {
        // $ 开头的变量不会定义到实例上
        $$state: state
      }
    },
    computed
  })

  if (store._strict) {
    // 严格模式下, 状态改变立马同步执行
    store._vm.$watch(
      () => store._vm._data.$$state,
      () => {
        console.assert(
          store._committing,
          'Do not mutate vuex store state outside mutation handlers'
        )
      },
      {
        deep: true,
        sync: true
      }
    )
  }

  // 如果之前存在 vm 则进行销毁旧的 vm
  if (oldVm) {
    Vue.nextTick(() => {
      oldVm.$destroy()
    })
  }
}

const install = (_Vue) => {
  if (install.installed && Vue === _Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  install.installed = true
  Vue = _Vue

  // install 的时候给每个组件添加 $store
  applyMixin(Vue)
}

export { Store, install }
