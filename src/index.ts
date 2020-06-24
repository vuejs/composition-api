import Vue, { VueConstructor } from 'vue'
import { Data, SetupFunction, SetupContext } from './component'
import { install } from './install'
import { mixin } from './setup'

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    setup?: SetupFunction<Data, Data>
  }
}

const VueCompositionAPI = {
  install: (Vue: VueConstructor) => install(Vue, mixin),
}

export default VueCompositionAPI

export { nextTick } from './nextTick'
export { default as createElement } from './createElement'
export { SetupContext }
export {
  createComponent,
  defineComponent,
  ComponentRenderProxy,
  PropType,
  PropOptions,
} from './component'
// For getting a hold of the interal instance in setup() - useful for advanced
// plugins
export { getCurrentVM as getCurrentInstance } from './runtimeContext'

export * from './apis/state'
export * from './apis/lifecycle'
export * from './apis/watch'
export * from './apis/computed'
export * from './apis/inject'

// auto install when using CDN
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueCompositionAPI)
}
