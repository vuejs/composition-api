/**
 * @jest-environment node
 */

import Vue from '../vue'
import { isReactive, reactive, ref } from '../../src'
import { createRenderer } from 'vue-server-renderer'
import { isRaw, shallowRef } from '../../src/reactivity'

describe('SSR Reactive', () => {
  beforeEach(() => {
    process.env.VUE_ENV = 'server'
  })

  it('should in SSR context', async () => {
    expect(typeof window).toBe('undefined')
    // expect((Vue as any).$isServer).toBe(true)
    expect((Vue.observable({}) as any).__ob__).toBeUndefined()
  })

  it('should render', async () => {
    const app = new Vue({
      setup() {
        return {
          count: ref(42),
        }
      },
      render(this: any, h) {
        return h('div', this.count)
      },
    })

    const serverRenderer = createRenderer()
    const html = await serverRenderer.renderToString(app)
    expect(html).toBe('<div data-server-rendered="true">42</div>')
  })

  it('reactive + isReactive', async () => {
    const state = reactive({})
    expect(isReactive(state)).toBe(true)
    expect(isRaw(state)).toBe(false)
  })

  it('shallowRef + isReactive', async () => {
    const state = shallowRef({})
    expect(isReactive(state)).toBe(true)
    expect(isRaw(state)).toBe(false)
  })
})
