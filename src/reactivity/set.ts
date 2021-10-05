import { AnyObject } from '../types/basic'
import { getVueConstructor } from '../runtimeContext'
import {
  isArray,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isObject,
  hasOwn,
} from '../utils'
import { defineAccessControl, mockReactivityDeep } from './reactive'

/**
 * Set a property on an object. Adds the new property, triggers change
 * notification and intercept it's subsequent access if the property doesn't
 * already exist.
 */
export function set<T>(target: AnyObject, key: any, val: T): T {
  const Vue = getVueConstructor()
  // @ts-expect-error https://github.com/vuejs/vue/pull/12132
  const { warn, defineReactive } = Vue.util
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${target}`
    )
  }

  const ob = target.__ob__

  function ssrMockReactivity() {
    // in SSR, there is no __ob__. Mock for reactivity check
    if (ob && isObject(val) && !hasOwn(val, '__ob__')) {
      mockReactivityDeep(val)
    }
  }

  if (isArray(target)) {
    if (isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key)
      target.splice(key, 1, val)
      ssrMockReactivity()
      return val
    } else if (key === 'length' && (val as any) !== target.length) {
      target.length = val as any
      ob?.dep.notify()
      return val
    }
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    ssrMockReactivity()
    return val
  }
  if (target._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
          'at runtime - declare it upfront in the data option.'
      )
    return val
  }

  if (!ob) {
    target[key] = val
    return val
  }

  defineReactive(ob.value, key, val)
  // IMPORTANT: define access control before trigger watcher
  defineAccessControl(target, key, val)
  ssrMockReactivity()

  ob.dep.notify()
  return val
}
