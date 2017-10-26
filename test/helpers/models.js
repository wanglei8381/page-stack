const PageA = {
  data: {
    text: 'PageA'
  },
  onLoad (options) {
    this._unload = false
    this.params = options
  },
  onReady () {
    this._ready = true
  },
  onShow () {
    this._active = true
  },
  onHide () {
    this._active = false
  },
  onUnload () {
    this._ready = false
    this._active = false
    this._unload = true
  }
}

const PageB = Object.assign({}, PageA, {
  data: {
    text: 'PageB'
  }
})

const PageC = Object.assign({}, PageA, {
  data: {
    text: 'PageC'
  }
})

const PageD = Object.assign({}, PageA, {
  data: {
    text: 'PageD'
  }
})

const PageE = Object.assign({}, PageA, {
  data: {
    text: 'PageE'
  }
})

const PageF = Object.assign({}, PageA, {
  data: {
    text: 'PageF'
  }
})

Page('page/a', PageA)
Page('page/b', PageB)
Page('page/c', PageC)
Page('page/d', PageD)
Page('page/e', PageE)
Page('page/f', PageF)
