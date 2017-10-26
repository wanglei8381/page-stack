const getPage = window.wxTransformGetPage
export function addPageHook (pageStack, path) {
  const callPageHook = (hook, options) => {
    const page = getPage(path)
    if (page && page['on' + hook]) {
      page['on' + hook](options)
    }
  }
  return {
    created () {
      callPageHook('Load', pageStack.router.params)
    },
    beforeMount () {
      callPageHook('Show')
    },
    mounted () {
      callPageHook('Ready')
    },
    destroyed () {
      callPageHook('Unload')
    }
  }
}
