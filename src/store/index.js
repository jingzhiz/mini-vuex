import Vue from 'vue'
import Vuex from '../vuex'
import logger from 'vuex/dist/logger'
import persists from '../plugins/vuexPersists'

Vue.use(Vuex)

let store = new Vuex.Store({
  strict: true, // 严格模式下只能通过 mutation 更改状态
  plugins: [persists], // vuex 插件
  state: {
    count: 1,
    number: 1
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  mutations: {
    CHANGE_STATE(state, payload) {
      // setTimeout(() => {
      //   state.count += payload
      // }, 1000)
      state.count += payload
    },
    RESET_STATE(state) {
      state.count = 1
    }
  },
  actions: {
    changeState({commit}, payload) {
      setTimeout(() => {
        commit('CHANGE_STATE', payload)
      }, 1000)
    },
    resetState({commit}) {
      commit('RESET_STATE')
    }
  },
  /* 
    1.模块默认没有作用域
    2.state 中参数名和 module 中模块名重复优先取 module
    3.模块的计算属性默认通过最外层 store 的 getters 获取
    4.增加 namespace 会将模块下的所有属性添加至 模块下
  */
  modules: {
    moduleA: {
      namespaced: true,
      state: {
        count: 100
      },
      getters: {
        doubleCount(state) {
          return state.count * 2
        }
      },
      mutations: {
        CHANGE_STATE(state, payload) {
          state.count += payload
        }
      },
      actions: {
        changeState({ commit }, payload) {
          commit('moduleA/CHANGE_STATE', payload)
        }
      },
      modules: {
        moduleC: {
          namespaced: true,
          state: {
            count: 10000
          },
          getters: {
            doubleCount(state) {
              return state.count * 2
            }
          },
          mutations: {
            CHANGE_STATE(state, payload) {
              state.count += payload
            }
          },
          actions: {
            changeState({ commit }, payload) {
              commit('moduleC/CHANGE_STATE', payload)
            }
          }
        }
      }
    },
    moduleB: {
      namespaced: true,
      state: {
        count: 1000
      },
      getters: {
        doubleCount(state) {
          return state.count * 2
        }
      },
      mutations: {
        CHANGE_STATE(state, payload) {
          state.count += payload
        }
      },
      actions: {
        changeState({ commit }, payload) {
          commit('moduleB/CHANGE_STATE', payload)
        }
      }
    }
  }
})

store.registerModule(['moduleB', 'moduleD'],{
  namespaced: true,
  state: {
    count: 100
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  mutations: {
    CHANGE_STATE(state, payload) {
      state.count += payload
    }
  },
  actions: {
    changeState({ commit }, payload) {
      commit('moduleD/CHANGE_STATE', payload)
    }
  }
})

export default store
