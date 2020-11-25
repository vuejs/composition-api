import { ComponentInstance, Data } from '../component'
import { hasOwn, warn, currentVMInFn, isFunction } from '../utils'
import { getCurrentInstance } from '../runtimeContext'
import { reactive, set, toRef, UnwrapRef, ToRefs } from '../reactivity'

const NOT_FOUND = {}
export interface InjectionKey<T> extends Symbol {}
export type InjectKey = symbol | string
export type ProvideRecord = Record<InjectKey, any>
export type InjectRecord = Record<InjectKey, InjectKey> | Array<InjectKey>

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
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T,
  treatDefaultAsFactory?: boolean
): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown,
  treatDefaultAsFactory = false
) {
  if (!key) {
    return defaultValue
  }

  const vm = getCurrentInstance()
  if (!vm) {
    warn(`inject() can only be used inside setup() or functional components.`)
    return
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

export function supply<T extends Data = Data>(
  ...items: ProvideRecord[]
): ToRefs<T> {
  const data = <ToRefs<T>>{}

  const setValue = (item: any, key: any) => {
    const raw = item[key]
    const value = isFunction(raw) ? raw : toRef(item, key)
    provide(key, value)
    set(data, key, inject(key))
  }

  items.forEach((item: ProvideRecord) => {
    Object.getOwnPropertySymbols(item).forEach((key) => setValue(item, key))
    Object.keys(item).forEach((key) => setValue(item, key))
  })

  return data
}

export function infuse(...items: InjectRecord[]): UnwrapRef<ProvideRecord> {
  const data = reactive<ProvideRecord>({})

  const setValue = (key: any) => set(data, key, inject(key))

  items.forEach((item: InjectRecord) => {
    if (Array.isArray(item)) {
      item.forEach(setValue)
    } else {
      Object.getOwnPropertySymbols(item).forEach(setValue)
      Object.keys(item).forEach(setValue)
    }
  })

  return data
}
