import { RefKey } from '../utils/symbols'
import { proxy, isPlainObject, warn, def } from '../utils'
import { reactive, isReactive, shallowReactive } from './reactive'
import { readonlySet } from '../utils/sets'
import { set } from './set'
import { setForceTrigger } from './force'

declare const _refBrand: unique symbol
export interface Ref<T = any> {
  readonly [_refBrand]: true
  value: T
}

export interface WritableComputedRef<T> extends Ref<T> {
  /**
   * `effect` is added to be able to differentiate refs from computed properties.
   * **Differently from Vue 3, it's just `true`**. This is because there is no equivalent
   * of `ReactiveEffect<T>` in `@vue/composition-api`.
   */
  effect: true
}

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
}

export type ToRefs<T = any> = { [K in keyof T]: Ref<T[K]> }

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>

// corner case when use narrows type
// Ex. type RelativePath = string & { __brand: unknown }
// RelativePath extends object -> true
type BaseTypes = string | number | boolean | Node | Window

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K]
}

export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  ? T
  : T extends Array<any>
  ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
  : T extends object
  ? {
      [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
    }
  : T

interface RefOption<T> {
  get(): T
  set?(x: T): void
}
export class RefImpl<T> implements Ref<T> {
  readonly [_refBrand]!: true
  public value!: T
  constructor({ get, set }: RefOption<T>) {
    proxy(this, 'value', {
      get,
      set,
    })
  }
}

export function createRef<T>(
  options: RefOption<T>,
  isReadonly = false,
  isComputed = false
): RefImpl<T> {
  const r = new RefImpl<T>(options)

  // add effect to differentiate refs from computed
  if (isComputed) (r as ComputedRef<T>).effect = true

  // seal the ref, this could prevent ref from being observed
  // It's safe to seal the ref, since we really shouldn't extend it.
  // related issues: #79
  const sealed = Object.seal(r)

  if (isReadonly) readonlySet.set(sealed, true)

  return sealed
}

export function ref<T extends object>(
  raw: T
): T extends Ref ? T : Ref<UnwrapRef<T>>
export function ref<T>(raw: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
export function ref(raw?: unknown) {
  if (isRef(raw)) {
    return raw
  }

  const value = reactive({ [RefKey]: raw })
  return createRef({
    get: () => value[RefKey] as any,
    set: (v) => ((value[RefKey] as any) = v),
  })
}

export function isRef<T>(value: any): value is Ref<T> {
  return value instanceof RefImpl
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? (ref.value as any) : ref
}

export function toRefs<T extends object>(obj: T): ToRefs<T> {
  if (__DEV__ && !isReactive(obj)) {
    warn(`toRefs() expects a reactive object but received a plain one.`)
  }
  if (!isPlainObject(obj)) return obj

  const ret: any = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }

  return ret
}

export type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}

export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  const version = ref(0)
  return createRef(
    factory(
      () => void version.value,
      () => {
        ++version.value
      }
    )
  )
}

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): Ref<T[K]> {
  if (!(key in object)) set(object, key, undefined)
  const v = object[key]
  if (isRef<T[K]>(v)) return v

  return createRef({
    get: () => object[key],
    set: (v) => (object[key] = v),
  })
}

export function shallowRef<T extends object>(
  value: T
): T extends Ref ? T : Ref<T>
export function shallowRef<T>(value: T): Ref<T>
export function shallowRef<T = any>(): Ref<T | undefined>
export function shallowRef(raw?: unknown) {
  if (isRef(raw)) {
    return raw
  }
  const value = shallowReactive({ [RefKey]: raw })
  return createRef({
    get: () => value[RefKey] as any,
    set: (v) => ((value[RefKey] as any) = v),
  })
}

export function triggerRef(value: any) {
  if (!isRef(value)) return

  setForceTrigger(true)
  value.value = value.value
  setForceTrigger(false)
}

export function proxyRefs<T extends object>(
  objectWithRefs: T
): ShallowUnwrapRef<T> {
  if (isReactive(objectWithRefs)) {
    return objectWithRefs as ShallowUnwrapRef<T>
  }
  const value: Record<string, any> = reactive({ [RefKey]: objectWithRefs })

  def(value, RefKey, value[RefKey], false)

  for (const key of Object.keys(objectWithRefs)) {
    proxy(value, key, {
      get() {
        if (isRef(value[RefKey][key])) {
          return value[RefKey][key].value
        }
        return value[RefKey][key]
      },
      set(v: unknown) {
        if (isRef(value[RefKey][key])) {
          return (value[RefKey][key].value = unref(v))
        }
        value[RefKey][key] = unref(v)
      },
    })
  }

  return value as ShallowUnwrapRef<T>
}
