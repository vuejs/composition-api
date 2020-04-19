import { Data } from '../component';
import { RefKey } from '../symbols';
import { proxy, isPlainObject, warn } from '../utils';
import { HasDefined } from '../types/basic';
import { reactive, isReactive } from './reactive';

export interface Ref<T = any> {
  value: T;
}

export type CollectionTypes = IterableCollections | WeakCollections;

type IterableCollections = Map<any, any> | Set<any>;
type WeakCollections = WeakMap<any, any> | WeakSet<any>;

// TODO REMOVE me and get from ComputedRef typed
interface ComputedRef<T> extends Ref<T> {
  readonly value: T;
}

// corner case when use narrows type
// Ex. type RelativePath = string & { __brand: unknown }
// RelativePath extends object -> true
type BaseTypes = string | number | boolean | Node | Window;

export type UnwrapRef<T> = T extends ComputedRef<infer V>
  ? UnwrapRefSimple<V>
  : T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>;

type UnwrapRefSimple<T> = T extends Function | CollectionTypes | BaseTypes | Ref
  ? T
  : T extends Array<any>
  ? T
  : T extends object
  ? UnwrappedObject<T>
  : T;

// Extract all known symbols from an object
// when unwrapping Object the symbols are not `in keyof`, this should cover all the
// known symbols
type SymbolExtract<T> = (T extends { [Symbol.asyncIterator]: infer V }
  ? { [Symbol.asyncIterator]: V }
  : {}) &
  (T extends { [Symbol.hasInstance]: infer V } ? { [Symbol.hasInstance]: V } : {}) &
  (T extends { [Symbol.isConcatSpreadable]: infer V } ? { [Symbol.isConcatSpreadable]: V } : {}) &
  (T extends { [Symbol.iterator]: infer V } ? { [Symbol.iterator]: V } : {}) &
  (T extends { [Symbol.match]: infer V } ? { [Symbol.match]: V } : {}) &
  (T extends { [Symbol.replace]: infer V } ? { [Symbol.replace]: V } : {}) &
  (T extends { [Symbol.search]: infer V } ? { [Symbol.search]: V } : {}) &
  (T extends { [Symbol.species]: infer V } ? { [Symbol.species]: V } : {}) &
  (T extends { [Symbol.split]: infer V } ? { [Symbol.split]: V } : {}) &
  (T extends { [Symbol.toPrimitive]: infer V } ? { [Symbol.toPrimitive]: V } : {}) &
  (T extends { [Symbol.toStringTag]: infer V } ? { [Symbol.toStringTag]: V } : {}) &
  (T extends { [Symbol.unscopables]: infer V } ? { [Symbol.unscopables]: V } : {});

type UnwrappedObject<T> = { [P in keyof T]: UnwrapRef<T[P]> } & SymbolExtract<T>;

interface RefOption<T> {
  get(): T;
  set?(x: T): void;
}
class RefImpl<T> implements Ref<T> {
  public value!: T;
  constructor({ get, set }: RefOption<T>) {
    proxy(this, 'value', {
      get,
      set,
    });
  }
}

export function createRef<T>(options: RefOption<T>) {
  // seal the ref, this could prevent ref from being observed
  // It's safe to seal the ref, since we really shoulnd't extend it.
  // related issues: #79
  return Object.seal(new RefImpl<T>(options));
}

type RefValue<T> = T extends Ref<infer V> ? V : UnwrapRef<T>;

// without init value, explicit typed: a = ref<{ a: number }>()
// typeof a will be Ref<{ a: number } | undefined>
export function ref<T = any>(): Ref<T | undefined>;
// with null as init value: a = ref<{ a: number }>(null);
// typeof a will be Ref<{ a: number } | null>
export function ref<T = null>(raw: null): Ref<T | null>;
// with init value: a = ref({ a: ref(0) })
// typeof a will be Ref<{ a: number }>
export function ref<S, T = unknown, R = HasDefined<S> extends true ? S : RefValue<T>>(
  raw: T
): Ref<R>;
// implementation
export function ref(raw?: any): any {
  // if (isRef(raw)) {
  //   return {} as any;
  // }
  if (isRef(raw)) {
    return raw;
  }

  const value = reactive({ [RefKey]: raw });
  return createRef({
    get: () => value[RefKey] as any,
    set: v => ((value[RefKey] as any) = v),
  });
}

export function isRef<T>(value: any): value is Ref<T> {
  return value instanceof RefImpl;
}

export function toRefs<T extends Data = Data>(obj: T): { [K in keyof T]: Ref<T[K]> } {
  if (!isPlainObject(obj)) return obj as any;

  if (__DEV__ && !isReactive(obj)) {
    warn(`toRefs() expects a reactive object but received a plain one.`);
  }

  const ret: any = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }

  return ret;
}

export function toRef<T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]> {
  const v = object[key];
  if (isRef<T[K]>(v)) return v;

  return createRef({
    get: () => object[key],
    set: v => (object[key] = v),
  });
}
