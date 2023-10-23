const mapState = (arrayList) => {
  let states = {}
  for (let i = 0; i < arrayList.length; i++) {
    let stateName = arrayList[i]
    states[stateName] = function() {
      return this.$store.state[stateName]
    }
  }
  return states
}

const mapGetters = (arrayList) => {
  let getters = {}
  for (let i = 0; i < arrayList.length; i++) {
    let getterName = arrayList[i]
    getters[getterName] = function() {
      return this.$store.getters[getterName]
    }
  }
  return getters
}

const mapMutations = (arrayList) => {
  let mutations = {}
  for (let i = 0; i < arrayList.length; i++) {
    let mutationName = arrayList[i]
    mutations[mutationName] = function(payload) {
      this.$store.commit(mutationName, payload)
    }
  }
  return mutations
}

const mapActions = (arrayList) => {
  let actions = {}
  for (let i = 0; i < arrayList.length; i++) {
    let actionName = arrayList[i]
    actions[actionName] = function(payload) {
      this.$store.dispatch(actionName, payload)
    }
  }
  return actions
}

export {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
}