import type { VueConstructor } from 'vue'
import { AnyObject } from './types/basic'
import { hasSymbol, hasOwn, isPlainObject, assert } from './utils'
import { isRef } from './reactivity'
import {
  setVueConstructor,
  isVueRegistered,
  isPluginInstalled,
} from './runtimeContext'
import { mixin } from './mixin'
import { createElement } from './apis/createElement'

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(from: AnyObject, to: AnyObject): Object {
  if (!from) return to
  if (!to) return from

  let key: any
  let toVal: any
  let fromVal: any

  const keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      to[key] = fromVal
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      !isRef(toVal) &&
      isPlainObject(fromVal) &&
      !isRef(fromVal)
    ) {
      mergeData(fromVal, toVal)
    }
  }
  return to
}
interface PluginOptions {
  jsx?: { enable?: boolean }
}
export function install(Vue: VueConstructor, options?: PluginOptions) {
  if (isPluginInstalled() || isVueRegistered(Vue)) {
    if (__DEV__) {
      assert(
        false,
        'already installed. Vue.use(VueCompositionAPI) should be called only once.'
      )
    }
    return
  }

  if (__DEV__) {
    if (Vue.version[0] !== '2' || Vue.version[1] !== '.') {
      assert(false, `only works with Vue 2, v${Vue.version} found.`)
    }
  }

  Vue.config.optionMergeStrategies.setup = function (
    parent: Function,
    child: Function
  ) {
    return function mergedSetupFn(props: any, context: any) {
      let extraContext = {}
      if (options?.jsx?.enable === true) {
        Reflect.set(extraContext, '$createElement', createElement)
      }
      let isEmpty = Reflect.ownKeys(extraContext).length === 0
      return mergeData(
        typeof parent === 'function'
          ? parent.call(isEmpty ? undefined : extraContext, props, context) ||
              {}
          : undefined,
        typeof child === 'function'
          ? child.call(isEmpty ? undefined : extraContext, props, context) || {}
          : undefined
      )
    }
  }

  setVueConstructor(Vue)
  mixin(Vue)
}

export const Plugin = {
  install: (Vue: VueConstructor, options?: PluginOptions) =>
    install(Vue, options),
}
