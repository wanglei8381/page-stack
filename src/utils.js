export const noop = () => {}

export const inBrowser = typeof window !== 'undefined'

export const remove = (arr, key) => {
  if (arr == null || arr.length === 0) return
  const index = arr.indexOf(key)
  if (index > -1) {
    arr.splice(index, 1)
  }
}
