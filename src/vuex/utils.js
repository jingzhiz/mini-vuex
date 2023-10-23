export const forEach = (params = {}, fn) => {
  Object.keys(params).forEach((key, index) => fn(params[key], key))
}