import { getRegisteredVueOrDefault } from '../runtimeContext'

const toString = (x: any) => Object.prototype.toString.call(x)

export function isNative(Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export const hasSymbol =
  typeof Symbol !== 'undefined' &&
  isNative(Symbol) &&
  typeof Reflect !== 'undefined' &&
  isNative(Reflect.ownKeys)

export const noopFn: any = (_: any) => _

export function proxy(
  target: any,
  key: string,
  { get, set }: { get?: Function; set?: Function }
) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: get || noopFn,
    set: set || noopFn,
  })
}

export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  })
}

export function hasOwn(obj: Object, key: string): boolean {
  return Object.hasOwnProperty.call(obj, key)
}

export function assert(condition: any, msg: string) {
  if (!condition) {
    throw new Error(`[vue-composition-api] ${msg}`)
  }
}

export function isPrimitive(value: any): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export function isArray<T>(x: unknown): x is T[] {
  return Array.isArray(x)
}

export const objectToString = Object.prototype.toString

export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'

export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

const MAX_VALID_ARRAY_LENGTH = 4294967295 // Math.pow(2, 32) - 1
export function isValidArrayIndex(val: any): boolean {
  const n = parseFloat(String(val))
  return (
    n >= 0 &&
    Math.floor(n) === n &&
    isFinite(val) &&
    n <= MAX_VALID_ARRAY_LENGTH
  )
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

export function isPlainObject(x: unknown): x is Record<any, any> {
  return toString(x) === '[object Object]'
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function'
}

export function isUndef(v: any): boolean {
  return v === undefined || v === null
}

export function warn(msg: string, vm?: Vue) {
  const Vue = getRegisteredVueOrDefault()
  if (!Vue || !Vue.util) console.warn(`[vue-composition-api] ${msg}`)
  else Vue.util.warn(msg, vm)
}

export function logError(err: Error, vm: Vue, info: string) {
  if (__DEV__) {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}

/**
 * Object.is polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 * */
export function isSame(value1: any, value2: any): boolean {
  if (value1 === value2) {
    return value1 !== 0 || 1 / value1 === 1 / value2
  } else {
    return value1 !== value1 && value2 !== value2
  }
}
