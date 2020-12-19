import { getVueConstructor, getCurrentInstance } from '../runtimeContext'
import { createRef, Ref } from '../reactivity'
import {
  warn,
  noopFn,
  defineComponentInstance,
  getVueInternalClasses,
} from '../utils'

interface Option<T> {
  get: () => T
  set: (value: T) => void
}

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
}

export interface WritableComputedRef<T> extends Ref<T> {}

// read-only
export function computed<T>(getter: Option<T>['get']): ComputedRef<T>
// writable
export function computed<T>(options: Option<T>): WritableComputedRef<T>
// implement
export function computed<T>(
  options: Option<T>['get'] | Option<T>
): ComputedRef<T> | WritableComputedRef<T> {
  const vm = getCurrentInstance()?.proxy
  let get: Option<T>['get'], set: Option<T>['set'] | undefined
  if (typeof options === 'function') {
    get = options
  } else {
    get = options.get
    set = options.set
  }

  let computedSetter
  let computedGetter

  if (vm && !vm.$isServer) {
    const { Watcher, Dep } = getVueInternalClasses()
    let watcher: any
    computedGetter = () => {
      if (!watcher) {
        watcher = new Watcher(vm, get, noopFn, { lazy: true })
      }
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }

    computedSetter = (v: T) => {
      if (__DEV__ && !set) {
        warn('Write operation failed: computed value is readonly.', vm!)
        return
      }

      if (set) {
        set(v)
      }
    }
  } else {
    // fallback
    const computedHost = defineComponentInstance(getVueConstructor(), {
      computed: {
        $$state: {
          get,
          set,
        },
      },
    })

    vm && vm.$on('hook:destroyed', () => computedHost.$destroy())

    computedGetter = () => (computedHost as any).$$state
    computedSetter = (v: T) => {
      if (__DEV__ && !set) {
        warn('Write operation failed: computed value is readonly.', vm!)
        return
      }

      ;(computedHost as any).$$state = v
    }
  }

  return createRef<T>(
    {
      get: computedGetter,
      set: computedSetter,
    },
    !set
  )
}
