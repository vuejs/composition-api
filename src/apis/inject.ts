import { ComponentInstance } from '../component'
import { hasOwn, warn, currentVMInFn } from '../utils'
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
  const vm: any = currentVMInFn('provide')
  if (!vm) return

  if (!vm._provided) {
    const provideCache = {}
    Object.defineProperty(vm, '_provided', {
      get: () => provideCache,
      set: (v) => Object.assign(provideCache, v),
    })
  }

  vm._provided[key as string] = value
}

export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown
) {
  if (!key) {
    return defaultValue
  }

  const vm = getCurrentInstance()
  if (vm) {
    const val = resolveInject(key, vm)
    if (val !== NOT_FOUND) {
      return val
    } else {
      if (defaultValue === undefined && process.env.NODE_ENV !== 'production') {
        warn(`Injection "${String(key)}" not found`, vm)
      }
      return defaultValue
    }
  } else {
    warn(`inject() can only be used inside setup() or functional components.`)
  }
}
