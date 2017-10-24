import { pageStack } from './page-stack'

const wxAppLifecycleHooks = [
  'onInit',
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom'
]

const noop = () => {}

/*
 pages和option的格式

 name是页面组件的名字，path是对应的小程序页面地址，tabBar是在小程序tabBar列表中的页面
 pages: [
  {name: 'PagesIndexIndex', path: 'pages/index/index', tabBar: true},
  {name: 'PagesLogsLogs', path: 'pages/logs/logs'}
 ],

 key是对应的小程序页面地址，value是小程序Page的options
 models: {
  'pages/index/index': indexOptions,
  'pages/logs/logs': logsOptions
 }
 */
export default function (Vue, options) {
  const pages = options.pages
  const models = options.models
  for (let key in models) {
    const model = models[key]
    wxAppLifecycleHooks.forEach(hook => {
      if (!model[hook]) {
        model[hook] = noop
      }
    })
  }
  Vue.component('page-stack', pageStack(Vue, pages, models))
}
