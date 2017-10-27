import { addPageHook } from './page-hooks'
import { initRoute } from './route'
import { remove } from './utils'
const getPage = window.wxTransformGetPage
export const pageStack = (Vue, pages) => {
  // 当前组件的实例
  let pageStack

  // 进入离开动画的名字
  const getTransitionName = {
    1: 'wx-page-open',
    2: 'wx-page-close'
  }
  const transitionData = {
    name: 'wx-page-open',
    type: 'transition'
  }
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
      const PageExtendComponent = PageComponent.extend(addPageHook(vm, path))
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
        name: page.name,
        tabBar: true
      }
      this.stack = []
      // 页面进入离开的类型，1：普通进入，2：返回，3：tab切换
      this.gotoType = 1
    },

    destroyed () {
      this.batchDestroyed(this.stack)
    },

    methods: {
      update () {
        this.$emit('pageChange', this.router.path)
        this.$forceUpdate()
        if (this.cache[this.router.name]) {
          this.$nextTick(() => {
            this.callPageHook('Show')
          })
        }
      },

      batchDestroyed (stack) {
        for (let i = stack.length - 1; i >= 0; i--) {
          const name = stack[i]
          destroyPageComponent(this.cache, this.stack, name)
        }
      },

      callPageHook (hook = 'Hide') {
        const page = getPage(this.router.path)
        if (page && page['on' + hook]) {
          page['on' + hook]()
        }
      },

      navigateTo (options) {
        this.callPageHook()
        this.router = options
        this.gotoType = 1
        this.update()
      },

      redirectTo (options) {
        destroyPageComponent(this.cache, this.stack, this.router.name)
        this.router = options
        this.gotoType = 1
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
        if (this.router.tabBar) {
          this.callPageHook()
        }
        this.gotoType = 3
        this.router = options
        this.update()
      },

      navigateBack (options) {
        const delta = options.delta || 1
        const stack = this.stack
        if (delta >= this.stack.length) {
          destroyPageComponent(this.cache, this.stack, this.router.name)
          const page = pages[0]
          this.router = {
            path: page.path,
            params: {},
            name: page.name,
            tabBar: true
          }
        } else {
          const length = stack.length - 1
          const min = length - delta
          const page = nameMap[stack[min]]
          for (let i = length; i > min; i--) {
            const name = stack[i]
            destroyPageComponent(this.cache, this.stack, name)
          }
          this.router = {
            path: page.path,
            params: {},
            name: page.name,
            tabBar: page.tabBar
          }
        }

        this.gotoType = 2
        this.update()
      },

      reLaunch (options) {
        const stack = this.stack.slice()
        this.stack = []
        this.batchDestroyed(stack)
        this.router = options
        this.gotoType = 1
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
        vnode.key = `__transition-${this._uid}-` + name
        vnode.data.transition = transitionData
      } else {
        remove(stack, name)
      }
      vnode.data.transition.name = getTransitionName[this.gotoType]
      stack.push(name)
      vnode.data.keepAlive = true
      return vnode
    }
  }
}
