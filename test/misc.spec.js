const Vue = require('vue/dist/vue.common.js')
const { ref, nextTick } = require('../src')

describe('nextTick', () => {
  it('should works', () => {
    const vm = new Vue({
      template: `<div>{{a}}</div>`,
      setup() {
        return {
          a: ref(1),
        }
      },
    }).$mount()

    expect(vm.$el.textContent).toBe('1')
    vm.a = 2
    expect(vm.$el.textContent).toBe('1')

    nextTick(() => {
      expect(vm.$el.textContent).toBe('2')
      vm.a = 3
      expect(vm.$el.textContent).toBe('2')

      nextTick(() => {
        expect(vm.$el.textContent).toBe('3')
      })
    })
  })
})
