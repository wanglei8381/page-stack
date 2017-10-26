const lifecycleHooks = [
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload'
]

const isHook = hook => lifecycleHooks.indexOf(hook) > -1

const cache = {}

const noop = () => {}

class WPage {
  constructor (options = {}) {
    this.options = options
    for (let key in options) {
      const item = options[key]
      if (isFunction(item)) {
        if (!isHook(item)) {
          this[key] = item
        } else {
          options[key] = item.bind(this)
        }
      } else if (isPrimitive(item)) {
        this[key] = item
      } else {
        this[key] = JSON.parse(JSON.stringify(item))
      }
    }

    for (let i = 0; i < lifecycleHooks.length; i++) {
      let key = lifecycleHooks[i]
      if (!options[key]) {
        options[key] = noop
      }
    }
  }

  setData (data) {}

  onLoad (options) {
    this.options.onLoad(options)
  }

  onReady () {
    this.options.onReady()
  }

  onShow () {
    this.options.onShow()
  }

  onHide () {
    this.options.onHide()
  }

  onUnload () {
    this.options.onUnload()
    cache[this.router] = null
  }
}

function isFunction (obj) {
  return obj != null && typeof obj === 'function'
}

function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

window.wxTransformPageKey = {}

window.wxTransformGetPage = key => {
  if (cache[key]) {
    return cache[key]
  }
  const options = window.wxTransformPageKey[key]
  const page = new WPage(options)
  page.router = key
  cache[key] = page
  return page
}

// key应该解析页面时获取，这里只是方便测试
window.Page = (key, options) => {
  window.wxTransformPageKey[key] = options
}
