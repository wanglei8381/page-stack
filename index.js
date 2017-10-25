'use strict';

function createBasePageOptions (pageStack, model) {
  return {
    created: function created () {
      model.onLoad(pageStack.router.params);
    },
    beforeMount: function beforeMount () {
      model.onShow();
    },
    mounted: function mounted () {
      model.onReady();
    },
    destroyed: function destroyed () {
      model.onUnload();
    }
  }
}

/* eslint-disable */
function hasOwnProperty (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function decode (qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
      idx = x.indexOf(eq),
      kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
}

var noop$1 = function () {};

var inBrowser = typeof window !== 'undefined';

var remove = function (arr, key) {
  if (arr == null || arr.length === 0) { return }
  var index = arr.indexOf(key);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

/* global wx */
/**
 * wx.navigateTo 和 wx.redirectTo 不允许跳转到 tabbar 页面，只能用 wx.switchTab 跳转到 tabbar 页面,
 * 因为小程序自身的约束，这个在page-stack中并没用限制
 */
function initRoute (pageStack, pathMap) {
  // 保留当前页面，跳转到应用内的某个页面
  var navigateTo = function (options) {
    routeHandler(options, 'navigateTo');
  };

  // 关闭当前页面，跳转到应用内的某个页面
  var redirectTo = function (options) {
    routeHandler(options, 'redirectTo');
  };

  // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
  var switchTab = function (options) {
    routeHandler(options, 'switchTab');
  };

  // 关闭当前页面，返回上一页面或多级页面
  var navigateBack = function (options) {
    pageStack.navigateBack(options || {});
  };

  // 关闭当前页面，返回上一页面或多级页面
  var reLaunch = function (options) {
    routeHandler(options, 'reLaunch');
  };

  function routeHandler (options, method) {
    var url = options.url;
    var success = options.success; if ( success === void 0 ) success = noop$1;
    var fail = options.fail; if ( fail === void 0 ) fail = noop$1;
    var complete = options.complete; if ( complete === void 0 ) complete = noop$1;
    if (url == null) {
      console.error('url字段为空');
      return
    }
    var urls = url.split('?');
    var path = urls[0];
    var page = pathMap[path];
    if (!page) {
      console.error('页面切换失败，' + path + '路径不存在');
      return
    }
    var name = page.name;
    if (name === pageStack.router.name) {
      console.log('同一个页面不需要切换');
      return
    }
    var params = decode(urls[1]);
    pageStack[method]({
      path: path,
      name: name,
      params: params,
      success: success,
      fail: fail,
      complete: complete
    });
  }

  // 挂载到window.wx上
  if (inBrowser && window.wx) {
    wx.navigateTo = navigateTo;
    wx.redirectTo = redirectTo;
    wx.switchTab = switchTab;
    wx.navigateBack = navigateBack;
    wx.reLaunch = reLaunch;
  }
}

var pageStack = function (Vue, pages, models) {
  // 当前组件的实例
  var pageStack;

  var pathMap = Object.create(null);
  var nameMap = Object.create(null);
  pages.forEach(function (page) {
    pathMap[page.path] = page;
    nameMap[page.name] = page;
  });

  // 对已经定义的页面组件进行扩展，添加生命周期钩子函数
  var expandPageComponent = function (vm) {
    pages.forEach(function (ref) {
      var name = ref.name;
      var path = ref.path;

      var PageComponent = Vue.component(name);
      var PageExtendComponent = PageComponent.extend(createBasePageOptions(vm, models[path]));
      Vue.component(name, PageExtendComponent);
    });
  };

  function destroyPageComponent (cache, stack, name) {
    var vnode = cache[name];
    if (vnode) {
      vnode.componentInstance.$destroy();
    }
    cache[name] = null;
    remove(stack, name);
  }

  return {
    name: 'page-stack',

    abstract: true,

    beforeCreate: function beforeCreate () {
      if (pageStack) {
        console.error('page-stack组件只能使用一次，多个挂载点将导致路由混乱');
      }
      pageStack = this;
      initRoute(this, pathMap);
      expandPageComponent(this);
    },

    created: function created () {
      this.cache = Object.create(null);
      var page = pages[0];
      this.router = {
        path: page.path,
        params: {},
        name: page.name,
        tabBar: true
      };
      this.stack = [];
    },

    destroyed: function destroyed () {
      this.batchDestroyed(this.stack);
    },

    methods: {
      update: function update () {
        var this$1 = this;

        this.$forceUpdate();
        if (this.cache[this.router.name]) {
          this.$nextTick(function () {
            models[this$1.router.path].onShow();
          });
        }
      },

      batchDestroyed: function batchDestroyed (stack) {
        var this$1 = this;

        for (var i = stack.length - 1; i >= 0; i--) {
          var name = stack[i];
          destroyPageComponent(this$1.cache, this$1.stack, name);
        }
      },

      navigateTo: function navigateTo (options) {
        models[this.router.path].onHide();
        this.router = options;
        this.update();
      },

      redirectTo: function redirectTo (options) {
        destroyPageComponent(this.cache, this.stack, this.router.name);
        this.router = options;
        this.update();
      },

      switchTab: function switchTab (options) {
        var stack = this.stack.slice();
        var tabBars = [];
        var pageNames = [];
        this.stack = [];
        for (var i = 0; i < stack.length; i++) {
          var name = stack[i];
          var page = nameMap[name];
          if (page.tabBar) {
            tabBars.push(name);
          } else {
            pageNames.push(name);
          }
        }

        this.batchDestroyed(pageNames);
        this.stack = tabBars;
        if (this.router.tabBar) {
          models[this.router.path].onHide();
        }
        this.router = options;
        this.update();
      },

      navigateBack: function navigateBack (options) {
        var this$1 = this;

        var delta = options.delta || 1;
        var stack = this.stack;
        if (delta >= this.stack.length) {
          destroyPageComponent(this.cache, this.stack, this.router.name);
          var page = pages[0];
          this.router = {
            path: page.path,
            params: {},
            name: page.name,
            tabBar: true
          };
        } else {
          var length = stack.length - 1;
          var min = length - delta;
          var page$1 = nameMap[stack[min]];
          for (var i = length; i > min; i--) {
            var name = stack[i];
            destroyPageComponent(this$1.cache, this$1.stack, name);
          }
          this.router = {
            path: page$1.path,
            params: {},
            name: page$1.name,
            tabBar: page$1.tabBar
          };
        }

        this.update();
      },

      reLaunch: function reLaunch (options) {
        var stack = this.stack.slice();
        this.stack = [];
        this.batchDestroyed(stack);
        this.router = options;
        this.update();
      }
    },

    render: function render (h) {
      var cache = this.cache;
      var stack = this.stack;
      var name = this.router.name;
      var vnode = cache[name];
      if (!vnode) {
        vnode = cache[name] = h(name);
      } else {
        remove(stack, name);
      }
      stack.push(name);
      vnode.data.keepAlive = true;
      return vnode
    }
  }
};

var wxAppLifecycleHooks = [
  'onInit',
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom'
];

var noop = function () {};

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
var index = function (Vue, options) {
  var pages = options.pages;
  var models = options.models;
  var loop = function ( key ) {
    var model = models[key];
    wxAppLifecycleHooks.forEach(function (hook) {
      if (!model[hook]) {
        model[hook] = noop;
      }
    });
  };

  for (var key in models) loop( key );
  Vue.component('page-stack', pageStack(Vue, pages, models));
};

module.exports = index;
//# sourceMappingURL=index.js.map
