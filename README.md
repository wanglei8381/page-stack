# page-stack
微信小程序转Vue组件，使用page-stack组件管理页面的切换和生命周期，提供wx路由方法

> 使用

 ```javascript
import pageStack from 'page-stack'
Vue.use(pageStack, {
    pages: [
        {name: 'PagesIndexIndex', path: 'pages/index/index', tabBar: true},
        {name: 'PagesLogsLogs', path: 'pages/logs/logs'}
    ],
    models: {
      'pages/index/index': indexOptions,
      'pages/logs/logs': logsOptions
    }
})
```
pages: 页面组件的组件名和路径
models：页面逻辑层代码

在模板中使用

\<page-stack />

> wx添加路由方法,用法同小程序

* wx.navigateTo
* wx.redirectTo
* wx.switchTab
* wx.navigateBack
* wx.reLaunch
