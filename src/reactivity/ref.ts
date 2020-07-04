import { Data } from '../component'
import { RefKey } from '../utils/symbols'
import { proxy, isPlainObject, warn } from '../utils'
import { reactive, isReactive, shallowReactive } from './reactive'
import { ComputedRef } from '../apis/computed'

declare const _refBrand: unique symbol
export interface Ref<T = any> {
  readonly [_refBrand]: true
  value: T
}

export type ToRefs<T = any> = { [K in keyof T]: Ref<T[K]> }

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>

// corner case when use narrows type
// Ex. type RelativePath = string & { __brand: unknown }
// RelativePath extends object -> true
type BaseTypes = string | number | boolean | Node | Window

export type UnwrapRef<T> = T extends ComputedRef<infer V>
  ? UnwrapRefSimple<V>
  : T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

type UnwrapRefSimple<T> = T extends Function | CollectionTypes | BaseTypes | Ref
  ? T
  : T extends Array<any>
  ? T
  : T extends object
  ? UnwrappedObject<T>
  : T

// Extract all known symbols from an object
// when unwrapping Object the symbols are not `in keyof`, this should cover all the
// known symbols
type SymbolExtract<T> = (T extends { [Symbol.asyncIterator]: infer V }
  ? { [Symbol.asyncIterator]: V }
  : {}) &
  (T extends { [Symbol.hasInstance]: infer V }
    ? { [Symbol.hasInstance]: V }
    : {}) &
  (T extends { [Symbol.isConcatSpreadable]: infer V }
    ? { [Symbol.isConcatSpreadable]: V }
    : {}) &
  (T extends { [Symbol.iterator]: infer V } ? { [Symbol.iterator]: V } : {}) &
  (T extends { [Symbol.match]: infer V } ? { [Symbol.match]: V } : {}) &
  (T extends { [Symbol.replace]: infer V } ? { [Symbol.replace]: V } : {}) &
  (T extends { [Symbol.search]: infer V } ? { [Symbol.search]: V } : {}) &
  (T extends { [Symbol.species]: infer V } ? { [Symbol.species]: V } : {}) &
  (T extends { [Symbol.split]: infer V } ? { [Symbol.split]: V } : {}) &
  (T extends { [Symbol.toPrimitive]: infer V }
    ? { [Symbol.toPrimitive]: V }
    : {}) &
  (T extends { [Symbol.toStringTag]: infer V }
    ? { [Symbol.toStringTag]: V }
    : {}) &
  (T extends { [Symbol.unscopables]: infer V }
    ? { [Symbol.unscopables]: V }
    : {})

type UnwrappedObject<T> = { [P in keyof T]: UnwrapRef<T[P]> } & SymbolExtract<T>

interface RefOption<T> {
  get(): T
  set?(x: T): void
}
class RefImpl<T> implements Ref<T> {
  readonly [_refBrand]!: true
  public value!: T
  constructor({ get, set }: RefOption<T>) {
    proxy(this, 'value', {
      get,
      set,
    })
  }
}

export function createRef<T>(options: RefOption<T>) {
  // seal the ref, this could prevent ref from being observed
  // It's safe to seal the ref, since we really shouldn't extend it.
  // related issues: #79
  return Object.seal(new RefImpl<T>(options))
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

export function unref<T>(ref: T): T extends Ref<infer V> ? V : T {
  return isRef(ref) ? (ref.value as any) : ref
}

export function toRefs<T extends Data = Data>(obj: T): ToRefs<T> {
  if (!isPlainObject(obj)) return obj as any

  if (__DEV__ && !isReactive(obj)) {
    warn(`toRefs() expects a reactive object but received a plain one.`)
  }

  const ret: any = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }

  return ret
}

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): Ref<T[K]> {
  const v = object[key]
  if (isRef<T[K]>(v)) return v

  return createRef({
    get: () => object[key],
    set: (v) => (object[key] = v),
  })
}

export function shallowRef<T>(value: T): T extends Ref ? T : Ref<T>
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

  value.value = value.value
}
