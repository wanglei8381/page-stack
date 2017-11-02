import { pageStack } from './page-stack'
import { toCamelCase } from './utils'

/*
 pages和option的格式

 name是页面组件的名字，path是对应的小程序页面地址，tabBar是在小程序tabBar列表中的页面
 pages: [
 {name: 'PagesIndexIndex', path: 'pages/index/index', tabBar: true},
 {name: 'PagesLogsLogs', path: 'pages/logs/logs'}
 ]
 */
export default function (Vue, options = {}) {
  let pages = options.pages
  if (!pages) {
    const config = window.__wxTranformWxConfig__
    if (!config) {
      return console.error('安装page-stack失败，请配置pages选项')
    }

    const tabBars = {}
    const appConfig = config.appConfigOrigin
    const tabBar = appConfig.tabBar
    if (tabBar && tabBar.list) {
      tabBar.list.forEach(item => {
        tabBars[item.pagePath] = true
      })
    }

    pages = appConfig.pages.map(url => ({
      path: url,
      name: toCamelCase(url),
      tabBar: tabBars[url]
    }))
  }

  Vue.component('page-stack', pageStack(Vue, pages))
}
