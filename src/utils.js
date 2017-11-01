import { decode } from './decode'
export const noop = () => {}

export const inBrowser = typeof window !== 'undefined'

export const remove = (arr, key) => {
  if (arr == null || arr.length === 0) return
  const index = arr.indexOf(key)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export const resolvePath = (path, basePath) => {
  if (path[0] === '/') return path
  const a = path.split('/')
  const l = basePath.split('/')
  l.pop()
  for (let i = 0; i < a.length; i++) {
    const p = a[i]
    if (p === '.') continue
    if (p === '..') {
      l.pop()
    } else {
      l.push(p)
    }
  }
  return l.join('/')
}

export const urlParse = url => {
  if (!url) return false
  const urls = url.split('?')
  const pathname = urls[0]
  const params = decode(urls[1])
  return {
    pathname,
    params
  }
}
