import type { VueConstructor } from 'vue'
import { ComponentInstance } from './component'
import { assert, hasOwn, warn } from './utils'

let vueConstructor: VueConstructor | null = null
let currentInstance: ComponentInstance | null = null

const PluginInstalledFlag = '__composition_api_installed__'

export function isPluginInstalled() {
  return !!vueConstructor
}

export function isVueRegistered(Vue: VueConstructor) {
  return hasOwn(Vue, PluginInstalledFlag)
}

export function getVueConstructor(): VueConstructor {
  if (__DEV__) {
    assert(
      vueConstructor,
      `must call Vue.use(VueCompositionAPI) before using any function.`
    )
  }

  return vueConstructor!
}

export function setVueConstructor(Vue: VueConstructor) {
  if (__DEV__ && vueConstructor) {
    warn('Another instance of vue installed')
  }
  vueConstructor = Vue
  Object.defineProperty(Vue, PluginInstalledFlag, {
    configurable: true,
    writable: true,
    value: true,
  })
}

export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance
}

export function setCurrentInstance(vm: ComponentInstance | null) {
  currentInstance = vm
}
