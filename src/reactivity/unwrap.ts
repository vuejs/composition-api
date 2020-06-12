import { isRef } from './ref'
import { proxy, isFunction, isPlainObject, isArray } from '../utils'
import { isReactive } from './reactive'

export function unwrapRefProxy(value: any, processed = new Set<any>()) {
  if (
    isFunction(value) ||
    isRef(value) ||
    isArray(value) ||
    isReactive(value) ||
    !isPlainObject(value) ||
    !Object.isExtensible(value) ||
    processed.has(value)
  ) {
    return value
  }
  processed.add(value)

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
      obj[k] = unwrapRefProxy(r, processed)
    }
  }

  return obj
}
