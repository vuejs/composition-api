import type { VueConstructor } from 'vue'
import { ComponentInstance } from './component'
import { assert, hasOwn, warn } from './utils'

let vueDependency: VueConstructor | undefined = undefined

try {
  vueDependency = require('vue')
} catch {
  // not available
}

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

// returns registered vue or `vue` dependency
export function getRegisteredVueOrDefault(): VueConstructor {
  let constructor = vueConstructor || vueDependency

  if (__DEV__) {
    assert(vueConstructor, `No vue dependency found.`)
  }

  return constructor!
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
