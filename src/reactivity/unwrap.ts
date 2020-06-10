import { isRef } from './ref'
import { proxy, isFunction, isObject, isArray } from '../utils'
import { isReactive } from './reactive'

export function unwrapRefProxy(value: any) {
  if (isFunction(value)) {
    return value
  }

  if (isRef(value)) {
    return value
  }

  if (isArray(value)) {
    return value
  }

  if (isReactive(value)) {
    return value
  }

  if (!isObject(value)) {
    return value
  }

  if (!Object.isExtensible(value)) {
    return value
  }

  const obj: any = {}

  // copy symbols over
  Object.getOwnPropertySymbols(value).forEach(
    (s) => (obj[s] = (value as any)[s])
  )

  for (const k of Object.keys(value)) {
    const r = value[k]
    // if is a ref, create a proxy to retrieve the value,
    if (isRef(r)) {
      const set = (v: any) => (r.value = v)
      const get = () => r.value

      proxy(obj, k, { get, set })
    } else {
      obj[k] = unwrapRefProxy(r)
    }
  }

  return obj
}
