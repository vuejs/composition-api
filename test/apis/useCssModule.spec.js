const Vue = require('vue/dist/vue.common.js')
const { useCSSModule } = require('../../src')

const style = { whateverStyle: 'whateverStyle' }

function injectStyles() {
  Object.defineProperty(this, '$style', {
    configurable: true,
    get: function () {
      return style
    },
  })
}

describe('api/useCssModule', () => {
  it('should get the same object', (done) => {
    const vm = new Vue({
      beforeCreate() {
        injectStyles.call(this)
      },
      template: '<div>{{style}}</div>',
      setup() {
        const style = useCSSModule()
        return { style }
      },
    })
    vm.$mount()
    expect(vm.style).toBe(style)
    done()
  })
})
