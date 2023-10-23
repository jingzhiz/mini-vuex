import Module from "./module"
import { forEach } from "./utils"

class ModuleCollection {
  constructor(options) {
    // 递归模块进行注册
    this.register([], options)
  }

  register(path, rootModule) {
    let newModule = new Module(rootModule)
    rootModule.rawModule = newModule // 模块添加映射, 便于后续动态注册模块

    // 第一次执行时传递的模块置为根模块
    if (path.length === 0) {
      this.root = newModule
    } else {
      // 将最新添加的模块在其父模块上进行注册
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo.getChild(current)
      }, this.root)
      parent.setChild(path[path.length - 1], newModule)
    }

    // 如果存在子模块
    if (rootModule.modules) {
      forEach(rootModule.modules, (module, moduleName) => {
        this.register([...path, moduleName], module)
      })
    }
  }

  getNamespaced(path) {
    let { root } = this
    return path.reduce((namespace, key) => {
      root = root.getChild(key)
      return namespace + (root.namespaced ? key + '/' : '')
    }, '')
  }
}

export default ModuleCollection