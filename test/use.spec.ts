import CompositionApi from '../src'
import { createLocalVue } from './helpers/create-local-vue'
import { mockWarn } from './helpers'

describe('use', () => {
  mockWarn(true)

  it('should allow install in multiple vue', () => {
    let __jest = global.jest
    try {
      // @ts-ignore
      global.jest = undefined
      const localVueOne = createLocalVue()
      localVueOne.use(CompositionApi)

      const localVueTwo = createLocalVue()
      localVueTwo.use(CompositionApi)

      expect('Another instance of vue installed').toHaveBeenWarned()
    } finally {
      global.jest = __jest
    }
  })

  it('should warn installing multiple times', () => {
    const localVueOne = createLocalVue()
    localVueOne.use(CompositionApi)

    expect(() => {
      // vue prevents the same plugin of being installed, this will create a new plugin instance
      localVueOne.use({
        install() {
          //@ts-ignore
          CompositionApi.install(...arguments)
        },
      })
    }).toThrowError(
      'already installed. Vue.use(VueCompositionAPI) should be called only once.'
    )
  })
})
