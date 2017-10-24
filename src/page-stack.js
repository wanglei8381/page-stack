import basePage from './base-page'
import { initRoute } from './route'
import { remove } from './utils'
export const pageStack = (Vue, pages, models) => {
  // 当前组件的实例
  let pageStack

  const pathMap = Object.create(null)
  const nameMap = Object.create(null)
  pages.forEach((page) => {
    pathMap[page.path] = page
    nameMap[page.name] = page
  })

  // 对已经定义的页面组件进行扩展，添加生命周期钩子函数
  const expandPageComponent = (vm) => {
    pages.forEach(({ name, path }) => {
      const PageComponent = Vue.component(name)
      const PageExtendComponent = PageComponent.extend(basePage(vm, models[path]))
      Vue.component(name, PageExtendComponent)
    })
  }

  function destroyPageComponent (cache, stack, name) {
    const vnode = cache[name]
    if (vnode) {
      vnode.componentInstance.$destroy()
    }
    cache[name] = null
    remove(stack, name)
  }

  return {
    name: 'page-stack',

    abstract: true,

    beforeCreate () {
      if (pageStack) {
        console.error('page-stack组件只能使用一次，多个挂载点将导致路由混乱')
      }
      pageStack = this
      initRoute(this, pathMap)
      expandPageComponent(this)
    },

    created () {
      this.cache = Object.create(null)
      const page = pages[0]
      this.router = {
        path: page.path,
        params: {},
        name: page.name
      }
      this.stack = []
    },

    destroyed () {
      this.batchDestroyed(this.stack)
    },

    methods: {
      update () {
        this.$forceUpdate()
        if (this.cache[this.router.name]) {
          this.$nextTick(() => {
            models[this.router.path].onShow()
          })
        }
      },

      batchDestroyed (stack) {
        for (let i = stack.length - 1; i >= 0; i--) {
          const name = stack[i]
          models[nameMap[name].path].onHide()
          destroyPageComponent(this.cache, this.stack, name)
        }
      },

      navigateTo (options) {
        models[this.router.path].onHide()
        this.router = options
        this.update()
      },

      redirectTo (options) {
        const { path, name } = this.router
        models[path].onHide()
        destroyPageComponent(this.cache, this.stack, name)
        this.router = options
        this.update()
      },

      switchTab (options) {
        const stack = this.stack.slice()
        const tabBars = []
        const pageNames = []
        this.stack = []
        for (let i = 0; i < stack.length; i++) {
          let name = stack[i]
          let page = nameMap[name]
          if (page.tabBar) {
            tabBars.push(name)
          } else {
            pageNames.push(name)
          }
        }

        this.batchDestroyed(pageNames)
        this.stack = tabBars
        this.router = options
        this.update()
      },

      navigateBack (options) {
        const delta = options.delta || 1
        const stack = this.stack
        if (delta > this.stack.length) {
          const page = pages[0]
          this.router = {
            path: page.path,
            params: {},
            name: page.name
          }
        } else {
          const length = stack.length - 1
          const min = length - delta
          const path = nameMap[stack[min]].path
          for (let i = length; i > min; i--) {
            const name = stack[i]
            models[nameMap[name].path].onHide()
            destroyPageComponent(this.cache, this.stack, name)
          }
          this.router = {
            path,
            params: {},
            name
          }
        }

        this.update()
      },

      reLaunch (options) {
        const stack = this.stack.slice()
        this.stack = []
        this.batchDestroyed(stack)
        this.router = options
        this.update()
      }
    },

    render (h) {
      const cache = this.cache
      const stack = this.stack
      const name = this.router.name
      let vnode = cache[name]
      if (!vnode) {
        vnode = cache[name] = h(name)
      } else {
        remove(stack, name)
      }
      stack.push(name)
      vnode.data.keepAlive = true
      return vnode
    }
  }
}
