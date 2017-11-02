(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PageStack = factory());
}(this, (function () { 'use strict';

var getPage$1 = window.wxTransformGetPage;
function addPageHook (pageStack, path) {
  var callPageHook = function (hook, options) {
    var page = getPage$1(path);
    if (page && page['on' + hook]) {
      page['on' + hook](options);
    }
  };
  return {
    created: function created () {
      callPageHook('Load', pageStack.router.params);
    },
    beforeMount: function beforeMount () {
      callPageHook('Show');
    },
    mounted: function mounted () {
      callPageHook('Ready');
    },
    destroyed: function destroyed () {
      callPageHook('Unload');
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

var noop = function () {};

var inBrowser = typeof window !== 'undefined';

var remove = function (arr, key) {
  if (arr == null || arr.length === 0) { return }
  var index = arr.indexOf(key);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

var resolvePath = function (path, basePath) {
  if (path[0] === '/') { return path }
  var a = path.split('/');
  var l = basePath.split('/');
  l.pop();
  for (var i = 0; i < a.length; i++) {
    var p = a[i];
    if (p === '.') { continue }
    if (p === '..') {
      l.pop();
    } else {
      l.push(p);
    }
  }
  return l.join('/')
};

var urlParse = function (url) {
  if (!url) { return false }
  var urls = url.split('?');
  var pathname = urls[0];
  var params = decode(urls[1]);
  return {
    pathname: pathname,
    params: params
  }
};

var toCamelCase = function (name) {
  return name.split('/').map(function (segment) {
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }).join('')
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
    var success = options.success; if ( success === void 0 ) success = noop;
    var fail = options.fail; if ( fail === void 0 ) fail = noop;
    var complete = options.complete; if ( complete === void 0 ) complete = noop;
    var res = urlParse(url);
    if (res === false) {
      return console.error('url字段为空')
    }

    var pathname = res.pathname;
    var params = res.params;
    var router = pageStack.router;
    var basePath = router.path[0] === '/' ? router.path : '/' + router.path;
    var realPath = resolvePath(pathname, basePath);
    var path = realPath[0] === '/' ? realPath.substr(1) : realPath;
    var page = pathMap[path];

    if (!page) {
      console.error('页面切换失败，' + realPath + '路径不存在');
      return
    }
    var name = page.name;
    if (name === router.name) {
      return console.log('同一个页面不需要切换')
    }

    pageStack[method]({
      path: path,
      name: name,
      params: params,
      success: success,
      fail: fail,
      complete: complete
    });

    // 添加history
    if (inBrowser) {
      if (method === 'navigateTo') {
        history.pushState({ path: path }, '', realPath);
      } else {
        history.replaceState({ path: path }, '', realPath);
      }
    }
  }

  // 挂载到window.wx上
  if (inBrowser && window.wx) {
    wx.navigateTo = navigateTo;
    wx.redirectTo = redirectTo;
    wx.switchTab = switchTab;
    wx.navigateBack = navigateBack;
    wx.reLaunch = reLaunch;

    window.addEventListener('popstate', function (e) {
      navigateBack();
    });
  }
}

var getPage = window.wxTransformGetPage;
var pageStack = function (Vue, pages) {
  // 当前组件的实例
  var pageStack;

  // 进入离开动画的名字
  var getTransitionName = {
    1: 'wx-page-open',
    2: 'wx-page-close'
  };
  var transitionData = {
    name: 'wx-page-open',
    type: 'transition'
  };
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
      var PageExtendComponent = PageComponent.extend(addPageHook(vm, path));
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

    props: {
      initPath: String
    },

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
      var ref = urlParse(this.initPath);
      var path = ref.pathname;
      var params = ref.params;
      var page = {};
      if (path && pathMap[path]) {
        page.path = path;
        page.params = params;
        page.tabBar = pathMap[path].tabBar;
        page.name = pathMap[path].name;
      } else {
        page = pages[0];
      }
      this.router = page;
      this.stack = [];
      // 页面进入离开的类型，1：普通进入，2：返回，3：tab切换
      this.gotoType = 1;
      // 初始化页面
      getPage(this.router.path);
    },

    destroyed: function destroyed () {
      this.batchDestroyed(this.stack);
    },

    methods: {
      update: function update () {
        var this$1 = this;

        // 初始化页面
        getPage(this.router.path);
        this.$emit('pageChange', this.router.path);
        this.$forceUpdate();
        if (this.cache[this.router.name]) {
          this.$nextTick(function () {
            this$1.callPageHook('Show');
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

      callPageHook: function callPageHook (hook) {
        if ( hook === void 0 ) hook = 'Hide';

        var page = getPage(this.router.path);
        if (page && page['on' + hook]) {
          page['on' + hook]();
        }
      },

      navigateTo: function navigateTo (options) {
        this.callPageHook();
        this.router = options;
        this.gotoType = 1;
        this.update();
      },

      redirectTo: function redirectTo (options) {
        destroyPageComponent(this.cache, this.stack, this.router.name);
        this.router = options;
        this.gotoType = 1;
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
          this.callPageHook();
        }
        this.gotoType = 3;
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

        this.gotoType = 2;
        this.update();
      },

      reLaunch: function reLaunch (options) {
        var stack = this.stack.slice();
        this.stack = [];
        this.batchDestroyed(stack);
        this.router = options;
        this.gotoType = 1;
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
        vnode.key = "__transition-" + (this._uid) + "-" + name;
        vnode.data.transition = transitionData;
      } else {
        remove(stack, name);
      }
      vnode.data.transition.name = getTransitionName[this.gotoType];
      stack.push(name);
      vnode.data.keepAlive = true;
      return vnode
    }
  }
};

var index = function (Vue, options) {
  if ( options === void 0 ) options = {};

  var pages = options.pages;
  if (!pages) {
    var config = window.__wxTranformWxConfig__;
    if (!config) {
      return console.error('安装page-stack失败，请配置pages选项')
    }

    var tabBars = {};
    var appConfig = config.appConfigOrigin;
    var tabBar = appConfig.tabBar;
    if (tabBar && tabBar.list) {
      tabBar.list.forEach(function (item) {
        tabBars[item.pagePath] = true;
      });
    }

    pages = appConfig.pages.map(function (url) { return ({
      path: url,
      name: toCamelCase(url),
      tabBar: tabBars[url]
    }); });
  }

  Vue.component('page-stack', pageStack(Vue, pages));
};

return index;

})));
//# sourceMappingURL=index.js.map
