<template>
  <div id="app">
    <h2>当前计数: {{ count }}</h2>
    <h2>当前计数: {{ $store.state.count }}</h2>
    <h2>当前double计数: {{ doubleCount }}</h2>
    <h2>当前double计数: {{ $store.getters.doubleCount }}</h2>
    <button @click="modifyState(10)">change state by method</button>
    <button @click="changeState(10)">change state by action</button>
    <button @click="CHANGE_STATE(10)">change state by mutation</button>
    <h2>当前ModuleA计数: {{ $store.state.moduleA.count }}</h2>
    <h2>当前ModuleA double计数: {{ $store.getters['moduleA/doubleCount'] }}</h2>
    <button @click="changeStateA">change state A</button>
    <h2>当前ModuleB计数: {{ $store.state.moduleB.count }}</h2>
    <h2>当前ModuleC计数: {{ $store.state.moduleA.moduleC.count }}</h2>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from './vuex'

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['doubleCount'])
  },
  methods: {
    ...mapActions(['changeState']),
    ...mapMutations(['CHANGE_STATE']),
    modifyState() {
      // this.$store.state.count++
      this.$store.commit('CHANGE_STATE', 10)
      // this.$store.dispatch('changeState', 10)
    },
    changeStateA() {
      // this.$store.commit('moduleA/CHANGE_STATE', 10)
      this.$store.dispatch('moduleA/changeState', 10)
    }
  }
}
</script>
