import { VueConstructor } from 'vue'
import {
  getVueConstructor,
  setCurrentInstance,
  getCurrentInstance,
  ComponentInternalInstance,
} from '../runtimeContext'
import { getCurrentInstanceForFn } from '../utils/helper'

const genName = (name: string) => `on${name[0].toUpperCase() + name.slice(1)}`
function createLifeCycle(lifeCyclehook: string) {
  return (callback: Function, target?: ComponentInternalInstance | null) => {
    const instance = getCurrentInstanceForFn(genName(lifeCyclehook), target)
    return (
      instance &&
      injectHookOption(getVueConstructor(), instance, lifeCyclehook, callback)
    )
  }
}

function injectHookOption(
  Vue: VueConstructor,
  instance: ComponentInternalInstance,
  hook: string,
  val: Function
) {
  const options = instance.proxy.$options as Record<string, unknown>
  const mergeFn = Vue.config.optionMergeStrategies[hook]
  const wrappedHook = wrapHookCall(instance, val)
  options[hook] = mergeFn(options[hook], wrappedHook)
  return wrappedHook
}

function wrapHookCall(
  instance: ComponentInternalInstance,
  fn: Function
): Function {
  return (...args: any) => {
    let prev = getCurrentInstance()
    setCurrentInstance(instance)
    try {
      return fn(...args)
    } finally {
      setCurrentInstance(prev)
    }
  }
}

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
