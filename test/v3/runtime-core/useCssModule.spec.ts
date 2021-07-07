import { useCssModule, createApp } from '../../../src'
import { mockWarn } from '../../helpers'
import { proxy } from '../../../src/utils'

function injectStyles(this: any, style: object) {
  proxy(this, '$style', {
    get: function () {
      return style
    },
  })
}

describe('api: useCssModule', () => {
  mockWarn(true)

  function mountWithModule(modules: object) {
    let res
    const Comp = {
      beforeCreate() {
        injectStyles.call(this, modules)
      },
      setup() {
        res = useCssModule()
      },
    }
    const root = document.createElement('div')
    createApp(Comp).mount(root)
    return res
  }

  it('basic usage', () => {
    const modules = {
      $style: {
        red: 'red',
      },
    }
    expect(mountWithModule(modules.$style)).toMatchObject(modules.$style)
  })

  it('warn out of setup usage', () => {
    useCssModule()
    expect(
      '[Vue warn]: useCssModule must be called inside setup()'
    ).toHaveBeenWarned()
  })
})
