/* global wx */
/**
 * wx.navigateTo 和 wx.redirectTo 不允许跳转到 tabbar 页面，只能用 wx.switchTab 跳转到 tabbar 页面,
 * 因为小程序自身的约束，这个在page-stack中并没用限制
 */
import { decode } from './decode'
import {
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
    if (url == null) {
      console.error('url字段为空')
      return
    }
    const urls = url.split('?')
    const path = urls[0]
    const page = pathMap[path]
    if (!page) {
      console.error('页面切换失败，' + path + '路径不存在')
      return
    }
    const name = page.name
    if (name === pageStack.router.name) {
      console.log('同一个页面不需要切换')
      return
    }
    const params = decode(urls[1])
    pageStack[method]({
      path,
      name,
      params,
      success,
      fail,
      complete
    })
  }

  // 挂载到window.wx上
  if (inBrowser && window.wx) {
    wx.navigateTo = navigateTo
    wx.redirectTo = redirectTo
    wx.switchTab = switchTab
    wx.navigateBack = navigateBack
    wx.reLaunch = reLaunch
  }
}
