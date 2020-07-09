import { isRef } from './ref'
import { proxy, isFunction, isPlainObject, isArray, hasOwn } from '../utils'
import { isReactive, isRaw } from './reactive'

export function unwrapRefProxy(value: any, map = new WeakMap()) {
  if (map.has(value)) {
    return map.get(value)
  }

  if (
    isFunction(value) ||
    isArray(value) ||
    isReactive(value) ||
    !isPlainObject(value) ||
    !Object.isExtensible(value) ||
    isRef(value) ||
    isRaw(value)
  ) {
    return value
  }

  const obj: any = {}
  map.set(value, obj)

  // copy symbols over
  Object.getOwnPropertySymbols(value).forEach(
    (s) => (obj[s] = (value as any)[s])
  )

  // copy __ob__
  if (hasOwn(value, '__ob__')) {
    Object.defineProperty(obj, '__ob__', {
      enumerable: false,
      value: value.__ob__,
    })
  }

  for (const k of Object.keys(value)) {
    const r = value[k]
    // don't process on falsy or raw
    if (!r || isRaw(r)) {
      obj[k] = r
    }
    // if is a ref, create a proxy to retrieve the value,
    else if (isRef(r)) {
      const set = (v: any) => (r.value = v)
      const get = () => r.value

      proxy(obj, k, { get, set })
    } else {
      obj[k] = unwrapRefProxy(r, map)
    }
  }

  return obj
}
