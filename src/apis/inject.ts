import { ComponentInstance } from '../component'
import {
  hasOwn,
  warn,
  getCurrentInstanceForFn,
  isFunction,
  proxy,
} from '../utils'
import { getCurrentInstance } from '../runtimeContext'

const NOT_FOUND = {}
export interface InjectionKey<T> extends Symbol {}

function resolveInject(
  provideKey: InjectionKey<any> | string,
  vm: ComponentInstance
): any {
  let source = vm
  while (source) {
    // @ts-ignore
    if (source._provided && hasOwn(source._provided, provideKey)) {
      //@ts-ignore
      return source._provided[provideKey]
    }
    source = source.$parent
  }

  return NOT_FOUND
}

export function provide<T>(key: InjectionKey<T> | string, value: T): void {
  const vm: any = getCurrentInstanceForFn('provide')?.proxy
  if (!vm) return

  if (!vm._provided) {
    const provideCache = {}
    proxy(vm, '_provided', {
      get: () => provideCache,
      set: (v: any) => Object.assign(provideCache, v),
    })
  }

  vm._provided[key as string] = value
}

export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T,
  treatDefaultAsFactory?: false
): T
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T | (() => T),
  treatDefaultAsFactory?: true
): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown,
  treatDefaultAsFactory = false
) {
  const vm = getCurrentInstance()?.proxy
  if (!vm) {
    __DEV__ &&
      warn(`inject() can only be used inside setup() or functional components.`)
    return
  }

  if (!key) {
    __DEV__ && warn(`injection "${String(key)}" not found.`, vm)
    return defaultValue
  }

  const val = resolveInject(key, vm)
  if (val !== NOT_FOUND) {
    return val
  }

  if (defaultValue === undefined && __DEV__) {
    warn(`Injection "${String(key)}" not found`, vm)
  }

  return treatDefaultAsFactory && isFunction(defaultValue)
    ? defaultValue()
    : defaultValue
}
