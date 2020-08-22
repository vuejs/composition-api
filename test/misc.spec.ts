import Vue from './vue'
import { ref, nextTick } from '../src'

describe('nextTick', () => {
  it('should works with callbacks', () => {
    const vm = new Vue<{ a: number }>({
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

  it('should works with await', async () => {
    const vm = new Vue<{ a: number }>({
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

    await nextTick()
    expect(vm.$el.textContent).toBe('2')
    vm.a = 3
    expect(vm.$el.textContent).toBe('2')

    await nextTick()
    expect(vm.$el.textContent).toBe('3')
  })
})
