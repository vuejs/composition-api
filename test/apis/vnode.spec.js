const { isVNode, h } = require('../../src')

describe('api/isVNode', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('should be a VNode', () => {
    const vnode = h('div')
    expect(isVNode(vnode)).toBe(true)
  })
})
