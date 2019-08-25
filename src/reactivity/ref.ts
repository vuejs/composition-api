import { Data } from '../component';
import { RefKey } from '../symbols';
import { proxy, isPlainObject } from '../utils';
import { reactive } from './reactive';

type BailTypes = Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>;

export interface Ref<T> {
  value: T;
}

// prettier-ignore
// Recursively unwraps nested value bindings.
// Unfortunately TS cannot do recursive types, but this should be enough for
// practical use cases...
export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRef2<V>
  : T extends BailTypes
      ? T // bail out on types that shouldn't be unwrapped
      : T extends object ? { [K in keyof T]: UnwrapRef2<T[K]> } : T

// prettier-ignore
type UnwrapRef2<T> = T extends Ref<infer V>
  ? UnwrapRef3<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef3<T[K]> } : T

// prettier-ignore
type UnwrapRef3<T> = T extends Ref<infer V>
  ? UnwrapRef4<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef4<T[K]> } : T

// prettier-ignore
type UnwrapRef4<T> = T extends Ref<infer V>
  ? UnwrapRef5<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef5<T[K]> } : T

// prettier-ignore
type UnwrapRef5<T> = T extends Ref<infer V>
  ? UnwrapRef6<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef6<T[K]> } : T

// prettier-ignore
type UnwrapRef6<T> = T extends Ref<infer V>
  ? UnwrapRef7<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef7<T[K]> } : T

// prettier-ignore
type UnwrapRef7<T> = T extends Ref<infer V>
  ? UnwrapRef8<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef8<T[K]> } : T

// prettier-ignore
type UnwrapRef8<T> = T extends Ref<infer V>
  ? UnwrapRef9<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef9<T[K]> } : T

// prettier-ignore
type UnwrapRef9<T> = T extends Ref<infer V>
  ? UnwrapRef10<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapRef10<T[K]> } : T

// prettier-ignore
type UnwrapRef10<T> = T extends Ref<infer V>
  ? V // stop recursion
  : T

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
export function ref<T = undefined>(): Ref<T | undefined>;
// with init value: a = ref({ a: ref(0) })
// typeof a will be Ref<{ a: number }>
export function ref<T, R = RefValue<T>>(raw: T): Ref<R>;
// with null as init value: a = ref<{ a: number }>(null);
// typeof a will be Ref<{ a: number } | null>
export function ref<T, R = RefValue<T>>(raw: T | null): Ref<R | null>;
// implementation
export function ref(raw?: any): any {
  // if (isRef(raw)) {
  //   return {} as any;
  // }

  const value = reactive({ [RefKey]: raw });
  return createRef({
    get: () => value[RefKey] as any,
    set: v => ((value[RefKey] as any) = v),
  });
}

export function isRef<T>(value: any): value is Ref<T> {
  return value instanceof RefImpl;
}

// prettier-ignore
type Refs<Data> = {
  [K in keyof Data]: Data[K] extends Ref<infer V> 
    ? Ref<V>
    : Ref<Data[K]>
}

export function toRefs<T extends Data = Data>(obj: T): Refs<T> {
  if (!isPlainObject(obj)) return obj as any;

  const res: Refs<T> = {} as any;
  Object.keys(obj).forEach(key => {
    let val: any = obj[key];
    // use ref to proxy the property
    if (!isRef(val)) {
      val = createRef<any>({
        get: () => obj[key],
        set: v => (obj[key as keyof T] = v),
      });
    }
    // todo
    res[key as keyof T] = val;
  });

  return res;
}
