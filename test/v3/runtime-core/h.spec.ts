import { h, createApp } from '../../../src'
import { mockWarn } from '../../helpers'

describe('renderer: h', () => {
  mockWarn(true)
  it('should warn with called outside of render function', () => {
    h('p', {})
    expect(
      '[Vue warn]: `createElement()` has been called outside of render function.'
    ).toHaveBeenWarned()
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
