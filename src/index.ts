import Vue, { VueConstructor } from 'vue'
import { Data, SetupFunction } from './component'
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
export { createApp } from './createApp'
export { nextTick } from './nextTick'
export { createElement as h } from './createElement'
export { getCurrentInstance } from './runtimeContext'
export {
  defineComponent,
  ComponentRenderProxy,
  PropType,
  PropOptions,
  SetupContext,
} from './component'

export * from './apis/state'
export * from './apis/lifecycle'
export * from './apis/watch'
export * from './apis/computed'
export * from './apis/inject'

// auto install when using CDN
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueCompositionAPI)
}
