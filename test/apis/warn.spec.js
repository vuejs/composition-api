const Vue = require('vue/dist/vue.common.js')
const { warn: apiWarn } = require('../../src')

describe('api/warn', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('should work', () => {
    new Vue({
      setup() {
        apiWarn('warned')
      },
      template: `<div></div>`,
    }).$mount()

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls[0][0]).toMatch(
      /\[Vue warn\]: warned.?[\s\S]*\(found in <Root>\)/
    )
  })
})
