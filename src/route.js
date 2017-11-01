/* global wx */
/**
 * wx.navigateTo 和 wx.redirectTo 不允许跳转到 tabbar 页面，只能用 wx.switchTab 跳转到 tabbar 页面,
 * 因为小程序自身的约束，这个在page-stack中并没用限制
 */
import {
  urlParse,
  resolvePath,
  inBrowser,
  noop
} from './utils'

export function initRoute (pageStack, pathMap) {
  // 保留当前页面，跳转到应用内的某个页面
  const navigateTo = options => {
    routeHandler(options, 'navigateTo')
  }

  // 关闭当前页面，跳转到应用内的某个页面
  const redirectTo = options => {
    routeHandler(options, 'redirectTo')
  }

  // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
  const switchTab = options => {
    routeHandler(options, 'switchTab')
  }

  // 关闭当前页面，返回上一页面或多级页面
  const navigateBack = options => {
    pageStack.navigateBack(options || {})
  }

  // 关闭当前页面，返回上一页面或多级页面
  const reLaunch = options => {
    routeHandler(options, 'reLaunch')
  }

  function routeHandler (options, method) {
    const { url, success = noop, fail = noop, complete = noop } = options
    const res = urlParse(url)
    if (res === false) {
      return console.error('url字段为空')
    }

    const { pathname, params } = res
    const router = pageStack.router
    const basePath = router.path[0] === '/' ? router.path : '/' + router.path
    const realPath = resolvePath(pathname, basePath)
    const path = realPath[0] === '/' ? realPath.substr(1) : realPath
    const page = pathMap[path]

    if (!page) {
      console.error('页面切换失败，' + realPath + '路径不存在')
      return
    }
    const name = page.name
    if (name === router.name) {
      return console.log('同一个页面不需要切换')
    }

    pageStack[method]({
      path,
      name,
      params,
      success,
      fail,
      complete
    })

    // 添加history
    if (inBrowser) {
      if (method === 'navigateTo') {
        history.pushState({ path }, '', realPath)
      } else {
        history.replaceState({ path }, '', realPath)
      }
    }
  }

  // 挂载到window.wx上
  if (inBrowser && window.wx) {
    wx.navigateTo = navigateTo
    wx.redirectTo = redirectTo
    wx.switchTab = switchTab
    wx.navigateBack = navigateBack
    wx.reLaunch = reLaunch

    window.addEventListener('popstate', e => {
      navigateBack()
    })
  }
}
