export default function createBasePageOptions (pageStack, model) {
  return {
    created () {
      model.onLoad(pageStack.router.params)
    },
    beforeMount () {
      model.onShow()
    },
    mounted () {
      model.onReady()
    },
    destroyed () {
      model.onUnload()
    }
  }
}
