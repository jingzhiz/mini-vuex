const getItem = (key) => localStorage.getItem(key)
const setItem = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export default function(store) {
  const local = getItem('VUEX:STATE')

  if (local) {
    store.replaceState(JSON.parse(local))
  }

  store.subscribe((mutation, state) => {
    console.log('execute', mutation)
    setItem('VUEX:STATE', state)
  })
}