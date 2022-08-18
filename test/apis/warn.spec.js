import Vue from 'vue/dist/vue.common.js'
import { warn as apiWarn } from '../../src'

describe('api/warn', () => {
  let warn = null

  beforeEach(() => {
    warn = vi.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('can be called inside a component', () => {
    new Vue({
      setup() {
        apiWarn('warned')
      },
      template: `<div></div>`,
    }).$mount()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(
      /\[Vue warn\]: warned[\s\S]*\(found in <Root>\)/
    )
  })

  it('can be called outside a component', () => {
    apiWarn('warned')

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith('[Vue warn]: warned')
  })
})
