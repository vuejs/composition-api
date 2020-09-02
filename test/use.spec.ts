import CompositionApi from '../src'
import { createLocalVue } from './helpers/create-local-vue'
import { mockWarn } from './helpers'

describe('use', () => {
  mockWarn(true)

  it('should allow install in multiple vue', () => {
    const localVueOne = createLocalVue()
    localVueOne.use(CompositionApi)

    const localVueTwo = createLocalVue()
    localVueTwo.use(CompositionApi)

    expect('Another instance of vue installed').toHaveBeenWarned()
  })

  it('should warn installing multiple times', () => {
    const localVueOne = createLocalVue()
    localVueOne.use(CompositionApi)

    expect(() => {
      // vue prevents the same plugin of being installed, this will create a new plugin instance
      localVueOne.use({
        install(v) {
          CompositionApi.install(v)
        },
      })
    }).toThrowError(
      'already installed. Vue.use(VueCompositionAPI) should be called only once.'
    )

    expect('Another instance of vue installed').toHaveBeenWarned()
  })
})
