(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('vue')) :
	typeof define === 'function' && define.amd ? define(['vue'], factory) :
	(factory(global.Vue));
}(this, (function (Vue) { 'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;

var lifecycleHooks = [
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload'
];

var isHook = function (hook) { return lifecycleHooks.indexOf(hook) > -1; };

var cache = {};

var noop = function () {};

var WPage = function WPage (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  this.options = options;
  for (var key in options) {
    var item = options[key];
    if (isFunction(item)) {
      if (!isHook(item)) {
        this$1[key] = item;
      } else {
        options[key] = item.bind(this$1);
      }
    } else if (isPrimitive(item)) {
      this$1[key] = item;
    } else {
      this$1[key] = JSON.parse(JSON.stringify(item));
    }
  }

  for (var i = 0; i < lifecycleHooks.length; i++) {
    var key$1 = lifecycleHooks[i];
    if (!options[key$1]) {
      options[key$1] = noop;
    }
  }
};

WPage.prototype.setData = function setData (data) {};

WPage.prototype.onLoad = function onLoad (options) {
  this.options.onLoad(options);
};

WPage.prototype.onReady = function onReady () {
  this.options.onReady();
};

WPage.prototype.onShow = function onShow () {
  this.options.onShow();
};

WPage.prototype.onHide = function onHide () {
  this.options.onHide();
};

WPage.prototype.onUnload = function onUnload () {
  this.options.onUnload();
  cache[this.router] = null;
};

function isFunction (obj) {
  return obj != null && typeof obj === 'function'
}

function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

window.wxTransformPageKey = {};

window.wxTransformGetPage = function (key) {
  if (cache[key]) {
    return cache[key]
  }
  var options = window.wxTransformPageKey[key];
  var page = new WPage(options);
  page.router = key;
  cache[key] = page;
  return page
};

// key应该解析页面时获取，这里只是方便测试
window.Page = function (key, options) {
  window.wxTransformPageKey[key] = options;
};

Vue.component('PageA', {
  template: '<div class="wx-page-container"><div class="page-a">PageA</div></div>'
});

Vue.component('PageB', {
  template: '<div class="wx-page-container"><div class="page-b">PageB</div></div>'
});

Vue.component('PageC', {
  template: '<div class="wx-page-container"><div class="page-c">PageC</div></div>'
});

Vue.component('PageD', {
  template: '<div class="wx-page-container"><div class="page-d">PageD</div></div>'
});

Vue.component('PageE', {
  template: '<div class="wx-page-container"><div class="page-e">PageE</div></div>'
});

Vue.component('PageF', {
  template: '<div class="wx-page-container"><div class="page-f">PageF</div></div>'
});

var PageA = {
  data: {
    text: 'PageA'
  },
  onLoad: function onLoad (options) {
    this._unload = false;
    this.params = options;
  },
  onReady: function onReady () {
    this._ready = true;
  },
  onShow: function onShow () {
    this._active = true;
  },
  onHide: function onHide () {
    this._active = false;
  },
  onUnload: function onUnload () {
    this._ready = false;
    this._active = false;
    this._unload = true;
  }
};

var PageB = Object.assign({}, PageA, {
  data: {
    text: 'PageB'
  }
});

var PageC = Object.assign({}, PageA, {
  data: {
    text: 'PageC'
  }
});

var PageD = Object.assign({}, PageA, {
  data: {
    text: 'PageD'
  }
});

var PageE = Object.assign({}, PageA, {
  data: {
    text: 'PageE'
  }
});

var PageF = Object.assign({}, PageA, {
  data: {
    text: 'PageF'
  }
});

Page('page/a', PageA);
Page('page/b', PageB);
Page('page/c', PageC);
Page('page/d', PageD);
Page('page/e', PageE);
Page('page/f', PageF);

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

var getPage = window.wxTransformGetPage;
var pageStack$1 = function (Vue$$1, pages) {
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

      var PageComponent = Vue$$1.component(name);
      var PageExtendComponent = PageComponent.extend(addPageHook(vm, path));
      Vue$$1.component(name, PageExtendComponent);
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
      // 页面进入离开的类型，1：普通进入，2：返回，3：tab切换
      this.gotoType = 1;
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

var pageStack = function (Vue$$1, options) {
  var pages = options.pages;
  Vue$$1.component('page-stack', pageStack$1(Vue$$1, pages));
};

Vue.use(pageStack, {
  pages: [
    {
      name: 'PageA',
      path: 'page/a',
      tabBar: true
    },
    {
      name: 'PageB',
      path: 'page/b',
      tabBar: true
    },
    {
      name: 'PageC',
      path: 'page/c'
    },
    {
      name: 'PageD',
      path: 'page/d'
    },
    {
      name: 'PageE',
      path: 'page/e'
    },
    {
      name: 'PageF',
      path: 'page/f',
      tabBar: true
    }
  ]
});

})));
//# sourceMappingURL=index.js.map
