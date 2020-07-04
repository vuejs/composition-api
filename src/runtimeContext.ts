import { VueConstructor } from 'vue'
import { ComponentInstance } from './component'
import { assert } from './utils'

let vueConstructor: VueConstructor | null = null
let currentInstance: ComponentInstance | null = null

export function isVueRegistered() {
  return !!vueConstructor
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
  vueConstructor = Vue
}

export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance
}

export function setCurrentInstance(vm: ComponentInstance | null) {
  currentInstance = vm
}
