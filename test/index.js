import Vue from 'vue'
import './helpers'

const wx = window.wx = {}

const getModel = window.wxTransformGetPage

describe('Component page-stack', () => {
  let vnode, vm

  beforeEach(() => {
    vm = new Vue({
      render (h) {
        if (vnode) return vnode
        vnode = h('page-stack')
        return vnode
      }
    }).$mount()
  })

  it('init', () => {
    expect(!!Vue.component('page-stack')).toBe(true)
    expect(wx).toHaveProperty('navigateTo')
    expect(wx).toHaveProperty('redirectTo')
    expect(wx).toHaveProperty('switchTab')
    expect(wx).toHaveProperty('navigateBack')
    expect(wx).toHaveProperty('reLaunch')
  })

  // 初始化小程序，首页A入栈, stack=[A]
  it('App init', () => {
    const model = getModel('page/a')
    expect(model._active).toBe(true)
    expect(model._ready).toBe(true)
  })

  // switchTab -> B, stack=[A,B]
  it('switchTab', done => {
    const modelA = getModel('page/a')
    const modelB = getModel('page/b')
    const onReady = modelB.onReady
    modelB.onReady = () => {
      onReady.call(modelB)
      expect(modelA._active).toBe(false)
      expect(modelA._ready).toBe(true)
      expect(modelB._active).toBe(true)
      expect(modelB._ready).toBe(true)
      done()
    }

    wx.switchTab({
      url: 'page/b'
    })
  })

  // navigateTo -> C, stack=[A,B,C]
  it('navigateTo', done => {
    const modelB = getModel('page/b')
    const modelA = getModel('page/a')
    const modelC = getModel('page/c')
    const onReady = modelC.onReady
    modelC.onReady = () => {
      onReady.call(modelC)
      expect(modelA._active).toBe(false)
      expect(modelA._ready).toBe(true)
      expect(modelB._active).toBe(false)
      expect(modelB._ready).toBe(true)
      expect(modelC._active).toBe(true)
      expect(modelC._ready).toBe(true)
      expect(modelC.params.q).toBe('1')
      expect(modelC.params.a).toBe('b')
      done()
    }

    wx.navigateTo({
      url: 'page/c?q=1&a=b'
    })
  })

  // navigateTo -> D, stack=[A,B,C,D]
  it('navigateTo', done => {
    const modelA = getModel('page/a')
    const modelB = getModel('page/b')
    const modelC = getModel('page/c')
    const modelD = getModel('page/d')
    const onReady = modelD.onReady
    modelD.onReady = () => {
      onReady.call(modelD)
      expect(modelA._active).toBe(false)
      expect(modelA._ready).toBe(true)
      expect(modelB._active).toBe(false)
      expect(modelB._ready).toBe(true)
      expect(modelC._active).toBe(false)
      expect(modelC._ready).toBe(true)
      expect(modelD._active).toBe(true)
      expect(modelD._ready).toBe(true)
      done()
    }

    wx.navigateTo({
      url: 'page/d'
    })
  })

  // navigateBack -> 2, stack=[A,B]
  it('navigateBack', done => {
    const modelA = getModel('page/a')
    const modelB = getModel('page/b')
    const modelC = getModel('page/c')
    const modelD = getModel('page/d')
    const onShow = modelB.onShow
    modelB.onShow = () => {
      onShow.call(modelB)
      expect(modelA._active).toBe(false)
      expect(modelA._ready).toBe(true)
      expect(modelB._active).toBe(true)
      expect(modelB._ready).toBe(true)
      expect(modelC._active).toBe(false)
      expect(modelC._ready).toBe(false)
      expect(modelC._unload).toBe(true)
      expect(modelD._active).toBe(false)
      expect(modelD._ready).toBe(false)
      expect(modelD._unload).toBe(true)
      done()
    }

    wx.navigateBack({ delta: 2 })
  })

  // redirectTo -> E, stack=[A,E]
  it('redirectTo', done => {
    const modelA = getModel('page/a')
    const modelB = getModel('page/b')
    const modelC = getModel('page/c')
    const modelD = getModel('page/d')
    const modelE = getModel('page/e')
    const onReady = modelE.onReady
    modelE.onReady = () => {
      onReady.call(modelE)
      expect(modelA._active).toBe(false)
      expect(modelA._ready).toBe(true)
      expect(modelB._unload).toBe(true)
      expect(modelE._active).toBe(true)
      expect(modelE._ready).toBe(true)
      expect(modelE.params.q).toBe('1')
      expect(modelE.params.a).toBe('b')
      done()
    }

    wx.redirectTo({
      url: 'page/e?q=1&a=b'
    })
  })

  // reLaunch -> F, stack=[F]
  it('reLaunch', done => {
    const modelA = getModel('page/a')
    const modelB = getModel('page/b')
    const modelC = getModel('page/c')
    const modelD = getModel('page/d')
    const modelE = getModel('page/e')
    const modelF = getModel('page/f')
    const onReady = modelF.onReady
    modelF.onReady = () => {
      onReady.call(modelF)
      expect(modelA._unload).toBe(true)
      expect(modelE._unload).toBe(true)
      expect(modelF._active).toBe(true)
      expect(modelF._ready).toBe(true)
      done()
    }

    wx.reLaunch({
      url: 'page/f'
    })
  })

  // navigateBack -> home, stack=[A]
  it('navigateBack', done => {
    const modelA = getModel('page/a')
    const modelF = getModel('page/f')
    const onReady = modelA.onReady
    modelA.onReady = () => {
      onReady.call(modelA)
      expect(modelA._active).toBe(true)
      expect(modelA._ready).toBe(true)
      expect(modelF._unload).toBe(true)
      done()
    }

    wx.navigateBack()
  })

  // destroyed, stack=[A]
  it('destroyed', done => {
    const modelA = getModel('page/a')
    const onUnload = modelA.onUnload
    modelA.onUnload = () => {
      onUnload.call(modelA)
      expect(modelA._unload).toBe(true)
      done()
    }

    vm.$destroy()
  })
})
