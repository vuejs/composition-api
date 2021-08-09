import { VueConstructor } from 'vue'
import { ComponentInstance } from '../component'
import {
  getVueConstructor,
  setCurrentInstance,
  getCurrentInstance,
  ComponentInternalInstance,
  setCurrentVue2Instance,
} from '../runtimeContext'
import { currentVMInFn } from '../utils/helper'

const genName = (name: string) => `on${name[0].toUpperCase() + name.slice(1)}`
function createLifeCycle(lifeCyclehook: string) {
  return (callback: Function, target?: ComponentInternalInstance | null) => {
    const vm = currentVMInFn(genName(lifeCyclehook), target)
    return (
      vm && injectHookOption(getVueConstructor(), vm, lifeCyclehook, callback)
    )
  }
}

function injectHookOption(
  Vue: VueConstructor,
  vm: ComponentInstance,
  hook: string,
  val: Function
) {
  const options = vm.$options as Record<string, unknown>
  const mergeFn = Vue.config.optionMergeStrategies[hook]
  const wrappedHook = wrapHookCall(vm, val)
  options[hook] = mergeFn(options[hook], wrappedHook)
  return wrappedHook
}

function wrapHookCall(vm: ComponentInstance, fn: Function): Function {
  return (...args: any) => {
    let preVm = getCurrentInstance()
    setCurrentVue2Instance(vm)
    try {
      return fn(...args)
    } finally {
      setCurrentInstance(preVm)
    }
  }
}

// export const onCreated = createLifeCycle('created');
export const onBeforeMount = createLifeCycle('beforeMount')
export const onMounted = createLifeCycle('mounted')
export const onBeforeUpdate = createLifeCycle('beforeUpdate')
export const onUpdated = createLifeCycle('updated')
export const onBeforeUnmount = createLifeCycle('beforeDestroy')
export const onUnmounted = createLifeCycle('destroyed')
export const onErrorCaptured = createLifeCycle('errorCaptured')
export const onActivated = createLifeCycle('activated')
export const onDeactivated = createLifeCycle('deactivated')
export const onServerPrefetch = createLifeCycle('serverPrefetch')
