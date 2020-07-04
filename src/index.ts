import type Vue from 'vue'
import { Data, SetupFunction } from './component'
import { Plugin } from './install'

export * from './apis'
export { getCurrentInstance } from './runtimeContext'
export {
  defineComponent,
  ComponentRenderProxy,
  PropType,
  PropOptions,
  SetupContext,
} from './component'
export default Plugin

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    setup?: SetupFunction<Data, Data>
  }
}

// auto install when using CDN
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Plugin)
}
