import { pageStack } from './page-stack'

/*
 pages和option的格式

 name是页面组件的名字，path是对应的小程序页面地址，tabBar是在小程序tabBar列表中的页面
 pages: [
 {name: 'PagesIndexIndex', path: 'pages/index/index', tabBar: true},
 {name: 'PagesLogsLogs', path: 'pages/logs/logs'}
 ]
 */
export default function (Vue, options) {
  const pages = options.pages
  Vue.component('page-stack', pageStack(Vue, pages))
}
