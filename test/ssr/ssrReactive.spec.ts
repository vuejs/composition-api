/**
 * @jest-environment node
 */

import Vue from '../vue'
import {
  isReactive,
  reactive,
  ref,
  isRaw,
  isRef,
  set,
  shallowRef,
} from '../../src'
import { createRenderer } from 'vue-server-renderer'

describe('SSR Reactive', () => {
  beforeEach(() => {
    process.env.VUE_ENV = 'server'
  })

  it('should in SSR context', async () => {
    expect(typeof window).toBe('undefined')
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

  it('shallowRef + isRef', async () => {
    const state = shallowRef({})
    expect(isRef(state)).toBe(true)
    expect(isRaw(state)).toBe(false)
  })

  // #550
  it('props should work with set', async (done) => {
    let props: any

    const app = new Vue({
      render(this: any, h) {
        return h('child', { attrs: { msg: this.msg } })
      },
      setup() {
        return { msg: ref('hello') }
      },
      components: {
        child: {
          render(this: any, h: any) {
            return h('span', this.data.msg)
          },
          props: ['msg'],
          setup(_props) {
            props = _props

            return { data: _props }
          },
        },
      },
    })

    const serverRenderer = createRenderer()
    const html = await serverRenderer.renderToString(app)

    expect(html).toBe('<span data-server-rendered="true">hello</span>')

    expect(props.bar).toBeUndefined()
    set(props, 'bar', 'bar')
    expect(props.bar).toBe('bar')

    done()
  })

  // #721
  it('should behave correctly', () => {
    const state = ref({ old: ref(false) })
    set(state.value, 'new', ref(true))
    // console.log(process.server, 'state.value', JSON.stringify(state.value))

    expect(state.value).toMatchObject({
      old: false,
      new: true,
    })
  })

  // #721
  it('should behave correctly for the nested ref in the object', () => {
    const state = { old: ref(false) }
    set(state, 'new', ref(true))
    expect(JSON.stringify(state)).toBe(
      '{"old":{"value":false},"new":{"value":true}}'
    )
  })

  // #721
  it('should behave correctly for ref of object', () => {
    const state = ref({ old: ref(false) })
    set(state.value, 'new', ref(true))
    expect(JSON.stringify(state.value)).toBe('{"old":false,"new":true}')
  })
})
