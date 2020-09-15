import { AnyObject } from '../types/basic'
import { getVueConstructor } from '../runtimeContext'
import { isPlainObject, def, warn, isFunction, isObject } from '../utils'
import { isComponentInstance, defineComponentInstance } from '../utils/helper'
import { RefKey } from '../utils/symbols'
import { isRef, UnwrapRef } from './ref'
import { rawSet, readonlySet, reactiveSet } from '../utils/sets'

// vue3 utils
const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

function getTargetType(value: object) {
  return rawSet.has(value) || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value))
}

export const toRawType = (value: unknown): string => {
  return toTypeString(value).slice(8, -1)
}

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export function isRaw(obj: any): boolean {
  return rawSet.has(obj)
}

export function isReadonly(obj: any): boolean {
  return readonlySet.has(obj)
}

export function isReactive(obj: any): boolean {
  return reactiveSet.has(obj)
}

/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */
function setupAccessControl(target: AnyObject): void {
  const targetType = getTargetType(target)

  if (
    targetType === TargetType.INVALID ||
    isRaw(target) ||
    isRef(target) ||
    isComponentInstance(target)
  )
    return

  if (targetType === TargetType.COMMON) {
    const keys = Object.keys(target)
    for (let i = 0; i < keys.length; i++) {
      defineAccessControl(target, keys[i])
    }
  } else {
    accessControlCollection(target as any)
  }
}

/**
 * Auto unwrapping when access property
 */
export function defineAccessControl(target: AnyObject, key: any, val?: any) {
  if (key === '__ob__') return

  let getter: (() => any) | undefined
  let setter: ((x: any) => void) | undefined
  const property = Object.getOwnPropertyDescriptor(target, key)
  if (property) {
    if (property.configurable === false) {
      return
    }
    getter = property.get
    setter = property.set
    if (
      (!getter || setter) /* not only have getter */ &&
      arguments.length === 2
    ) {
      val = target[key]
    }
  }

  setupAccessControl(val)
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      const value = getter ? getter.call(target) : val
      // if the key is equal to RefKey, skip the unwrap logic
      if (key !== RefKey && isRef(value)) {
        return value.value
      } else {
        return value
      }
    },
    set: function setterHandler(newVal) {
      if (getter && !setter) return

      const value = getter ? getter.call(target) : val
      // If the key is equal to RefKey, skip the unwrap logic
      // If and only if "value" is ref and "newVal" is not a ref,
      // the assignment should be proxied to "value" ref.
      if (key !== RefKey && isRef(value) && !isRef(newVal)) {
        value.value = newVal
      } else if (setter) {
        setter.call(target, newVal)
      } else {
        val = newVal
      }
      setupAccessControl(newVal)
    },
  })
}

function observe<T>(obj: T): T {
  const Vue = getVueConstructor()
  let observed: T
  if (Vue.observable) {
    observed = Vue.observable(obj)
  } else {
    const vm = defineComponentInstance(Vue, {
      data: {
        $$state: obj,
      },
    })
    observed = vm._data.$$state
  }

  return observed
}

export function shallowReactive<T extends object = any>(obj: T): T {
  if (__DEV__ && !obj) {
    warn('"shallowReactive()" is called without provide an "object".')
    // @ts-ignore
    return
  }

  if (
    !isPlainObject(obj) ||
    isReactive(obj) ||
    isRaw(obj) ||
    !Object.isExtensible(obj)
  ) {
    return obj as any
  }

  const observed = observe({})
  markReactive(observed, true)
  setupAccessControl(observed)

  const ob = (observed as any).__ob__

  for (const key of Object.keys(obj)) {
    let val = obj[key]
    let getter: (() => any) | undefined
    let setter: ((x: any) => void) | undefined
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property) {
      if (property.configurable === false) {
        continue
      }
      getter = property.get
      setter = property.set
      if (
        (!getter || setter) /* not only have getter */ &&
        arguments.length === 2
      ) {
        val = obj[key]
      }
    }

    // setupAccessControl(val);
    Object.defineProperty(observed, key, {
      enumerable: true,
      configurable: true,
      get: function getterHandler() {
        const value = getter ? getter.call(obj) : val
        ob.dep.depend()
        return value
      },
      set: function setterHandler(newVal) {
        if (getter && !setter) return
        if (setter) {
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
        ob.dep.notify()
      },
    })
  }
  return (observed as unknown) as T
}

export function markReactive(target: any, shallow = false) {
  const targetType = getTargetType(target)
  if (
    targetType === TargetType.INVALID ||
    // !isPlainObject(target) ||
    isRaw(target) ||
    // Array.isArray(target) ||
    isRef(target) ||
    isComponentInstance(target)
  ) {
    return
  }

  if (isReactive(target) || !Object.isExtensible(target)) {
    return
  }

  reactiveSet.add(target)

  if (shallow) {
    return
  }

  if (Array.isArray(target)) {
    // TODO way to track new array items
    target.forEach((x) => markReactive(x))
    return
  }

  const keys = Object.keys(target)
  for (let i = 0; i < keys.length; i++) {
    markReactive(target[keys[i]])
  }
}

/**
 * Make obj reactivity
 */
export function reactive<T extends object>(obj: T): UnwrapRef<T> {
  if (__DEV__ && !obj) {
    warn('"reactive()" is called without provide an "object".')
    // @ts-ignore
    return
  }

  if (isReactive(obj) || isRaw(obj) || !Object.isExtensible(obj)) {
    return obj as any
  }
  // only a whitelist of value types can be observed.
  const targetType = getTargetType(obj)
  if (targetType === TargetType.INVALID) {
    return obj as any
  }

  const observed = observe(obj)
  markReactive(obj)
  setupAccessControl(observed)
  return observed as UnwrapRef<T>
}

export function shallowReadonly<T extends object>(obj: T): Readonly<T> {
  if (!isPlainObject(obj) || !Object.isExtensible(obj)) {
    //@ts-ignore
    return obj // just typing
  }

  const readonlyObj = {}

  const source = reactive({})
  const ob = (source as any).__ob__

  for (const key of Object.keys(obj)) {
    let val = obj[key]
    let getter: (() => any) | undefined
    let setter: ((x: any) => void) | undefined
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property) {
      if (property.configurable === false) {
        continue
      }
      getter = property.get
      setter = property.set
      if (
        (!getter || setter) /* not only have getter */ &&
        arguments.length === 2
      ) {
        val = obj[key]
      }
    }

    Object.defineProperty(readonlyObj, key, {
      enumerable: true,
      configurable: true,
      get: function getterHandler() {
        const value = getter ? getter.call(obj) : val
        ob.dep.depend()
        return value
      },
      set(v) {
        if (__DEV__) {
          warn(`Set operation on key "${key}" failed: target is readonly.`)
        }
      },
    })
  }

  readonlySet.add(readonlyObj)

  return readonlyObj as any
}

/**
 * Make sure obj can't be a reactive
 */
export function markRaw<T extends object>(obj: T): T {
  if (!isPlainObject(obj) || !Object.isExtensible(obj)) {
    return obj
  }

  // set the vue observable flag at obj
  def(obj, '__ob__', (observe({}) as any).__ob__)
  // mark as Raw
  rawSet.add(obj)

  return obj
}

export function toRaw<T>(observed: T): T {
  if (isRaw(observed) || !Object.isExtensible(observed)) {
    return observed
  }

  return (
    ((observed as any).__ob__ && (observed as any).__ob__.value) || observed
  )
}

function accessControlCollection(collection: CollectionTypes) {
  if (!collectionTrackers.has(collection)) {
    collectionTrackers.set(collection, observe({}) as any)
  }

  Object.keys(mutableInstrumentationsCollection).forEach((k: any) => {
    // @ts-ignore
    k in collection && (collection[k] = mutableInstrumentationsCollection[k])
  })

  // if(targetType.endsWith("Map")){
  //   collection.has =
  // }
  // return collection
}

const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value

// const toReadonly = <T extends unknown>(value: T): T =>
//   isObject(value) ? readonly(value) : value

// const toShallow = <T extends unknown>(value: T): T => value

export type CollectionTypes = IterableCollections | WeakCollections
type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>
type MapTypes = Map<any, any> | WeakMap<any, any>
type SetTypes = Set<any> | WeakSet<any>

type VueObserver<T = any> = {
  value: T
  dep: {
    id: number
    depend(): void
    notify(): void
  }
  vmCount: number
}

const collectionTrackers = new WeakMap<
  CollectionTypes,
  Record<string, { __ob__: VueObserver }> & { __ob__: VueObserver }
>()

const getProto = <T extends CollectionTypes>(v: T): any =>
  Reflect.getPrototypeOf(v)

// class MutableInstrumentationCollection {
//   private _get: Function

//   constructor(private __this : MapTypes){
//     this._get = __this.get
//   }

//   get(key: unknown){
//     const raw = toRaw(this.__this);
//     const v = this._get(key);

//   }
// }

const mutableInstrumentationsCollection = {
  get(this: MapTypes, key: unknown) {
    const rawTarget = toRaw(this)
    const { get } = getProto(rawTarget)
    const wrap = toReactive

    // collectionTrackers.get(this)?.dep.depend()
    return wrap(get.call(rawTarget, key))

    // if (get.call(rawTarget, key)) {
    //   return wrap(rawTarget.get(key))
    // } else if (get.call(rawTarget, key)) {
    //   return wrap(rawTarget.get(key))
    // }
  },
  set(this: MapTypes, key: string, value: unknown) {
    const Vue = getVueConstructor()
    value = toRaw(value)
    const target = toRaw(this)
    const { has, get, set } = getProto(target)

    let hadKey = has.call(target, key)
    if (!hadKey) {
      key = toRaw(key)
      hadKey = has.call(target, key)
    }

    const oldValue = get.call(target, key)
    const result = set.call(target, key, value)
    if (oldValue && result) {
      debugger
    }

    const o = collectionTrackers.get(this)
    if (o) {
      if (o[key]) {
        o[key]?.__ob__.dep.notify()
      } else {
        Vue.set(o, key, reactive(value as any))
      }
    }
    // const xx = collectionTrackers.get(this)?[key]
    // xx.
    // o[key]
    // ?[key]?.__ob__.dep.notify()

    // if (!hadKey) {
    //   // trigger(target, TriggerOpTypes.ADD, key, value)
    // } else if (hasChanged(value, oldValue)) {
    //   trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    // }
    return result
  },
  add(this: SetTypes, value: unknown) {
    const Vue = getVueConstructor()
    value = toRaw(value)
    const target = toRaw(this)
    const proto = getProto(target)
    const hadKey = proto.has.call(target, value)
    const result = proto.add.call(target, value)
    const o = collectionTrackers.get(this)

    if (!hadKey && o) {
      const key = value as any
      if (o[key]) {
        o[key]?.__ob__.dep.notify()
      } else {
        Vue.set(o, key, reactive(value as any))
      }
    }
    return result
  },

  has(this: CollectionTypes, key: string, isReadonly = false): boolean {
    const target = toRaw(this)
    const rawKey = toRaw(key) as string
    const { has } = getProto(target)

    let hasKey = has.call(this, key)

    const o = collectionTrackers.get(this)
    if (!isReadonly && o) {
      if (hasKey && o[key].__ob__) {
        o[key].__ob__.dep.depend()
      } else {
        // if doesn't have key depend on the object itself
        o.__ob__.dep.depend()
      }

      if (key !== rawKey) {
        const hasRawKey = has(rawKey)
        if (hasRawKey && o[rawKey].__ob__) {
          hasKey = true
          o[rawKey].__ob__.dep.depend()
        } else {
          // if doesn't have key depend on the object itself
          o.__ob__.dep.depend()
        }
      }
    }

    return hasKey

    // if (key !== rawKey) {
    //   !isReadonly && track(rawTarget, TrackOpTypes.HAS, key)
    // }
    // !isReadonly && track(rawTarget, TrackOpTypes.HAS, rawKey)
    // return key === rawKey
    //   ? target.has(key)
    //   : target.has(key) || target.has(rawKey)
  },

  delete(this: CollectionTypes, key: string) {
    const Vue = getVueConstructor()

    const target = toRaw(this)
    const rawKey = toRaw(key)
    const { has, delete: del } = getProto(target)

    let hadKey = has.call(target, key)
    if (!hadKey && rawKey !== key) {
      key = rawKey
      hadKey = has.call(target, rawKey)
    }
    // // forward the operation before queueing reactions
    const result = del.call(target, key)

    const o = collectionTrackers.get(this)
    if (hadKey && o) {
      Vue.delete(o, key)
    }
    return result
  },

  // get size() {
  //   return size((this as unknown) as IterableCollections)
  // },
  // has,
  // add,
  // set,
  // delete: deleteEntry,
  // clear,
  // forEach: createForEach(false, false)
}
