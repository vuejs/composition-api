import { h, createApp, ref, getCurrentInstance } from '../../../src'
import { mockWarn, sleep } from '../../helpers'

describe('renderer: h', () => {
  mockWarn(true)
  it('should warn with called outside of render function', () => {
    h('p', {})
    expect(
      '[Vue warn]: `createElement()` has been called outside of render function.'
    ).toHaveBeenWarned()
  })

  it('should not warn with called outside of render function', async () => {
    const spy = vi.fn()
    const Comp = {
      setup() {
        const instance = getCurrentInstance()
        const createElement = h.bind(instance)
        const renderVnode = () => createElement('p', {})
        setTimeout(renderVnode, 10)
      },
    }
    const root = document.createElement('div')
    createApp(Comp).mount(root)
    await sleep(50)

    expect(spy).toHaveBeenCalledTimes(0)
  })

  it(`Should support h's responsive rendering`, async () => {
    const Comp = {
      setup() {
        const showNode1 = ref(true)
        setTimeout(() => {
          showNode1.value = false
        }, 10)
        return () =>
          showNode1.value
            ? h('div', void 0, [h('br'), 'hello world', h('br')])
            : h('div', void 0, [h('div'), 'nextTick render', h('div')])
      },
    }
    const root = document.createElement('div')
    const vm = createApp(Comp).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div><br>hello world<br></div>`)
    await sleep(50)
    expect(vm.$el.outerHTML).toBe(
      `<div><div></div>nextTick render<div></div></div>`
    )
  })

  it('should work with called outside of render function', () => {
    const msg = 'hello world'
    const vnode = h('hello-world', {
      props: {
        msg,
      },
    })
    expect(
      '[Vue warn]: `createElement()` has been called outside of render function.'
    ).toHaveBeenWarned()
    expect(vnode.tag).toEqual('hello-world')
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.data?.props).toEqual({ msg })
  })

  it('render vnode with createElement with children', () => {
    const Comp = {
      setup() {
        return () => h('div', void 0, [h('br'), 'hello world', h('br')])
      },
    }
    const root = document.createElement('div')
    const vm = createApp(Comp).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div><br>hello world<br></div>`)
  })
})
