import { Data } from '../component';
import { proxy, isPlainObject } from '../utils';
import { reactive, isReactive } from './reactive';

type BailTypes = Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>;

export interface Ref<T> {
  value: T;
}

// prettier-ignore
// Recursively unwraps nested value bindings.
// Unfortunately TS cannot do recursive types, but this should be enough for
// practical use cases...
export type UnwrapValue<T> = T extends Ref<infer V>
  ? UnwrapValue2<V>
  : T extends BailTypes
      ? T // bail out on types that shouldn't be unwrapped
      : T extends object ? { [K in keyof T]: UnwrapValue2<T[K]> } : T

// prettier-ignore
type UnwrapValue2<T> = T extends Ref<infer V>
  ? UnwrapValue3<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue3<T[K]> } : T

// prettier-ignore
type UnwrapValue3<T> = T extends Ref<infer V>
  ? UnwrapValue4<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue4<T[K]> } : T

// prettier-ignore
type UnwrapValue4<T> = T extends Ref<infer V>
  ? UnwrapValue5<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue5<T[K]> } : T

// prettier-ignore
type UnwrapValue5<T> = T extends Ref<infer V>
  ? UnwrapValue6<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue6<T[K]> } : T

// prettier-ignore
type UnwrapValue6<T> = T extends Ref<infer V>
  ? UnwrapValue7<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue7<T[K]> } : T

// prettier-ignore
type UnwrapValue7<T> = T extends Ref<infer V>
  ? UnwrapValue8<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue8<T[K]> } : T

// prettier-ignore
type UnwrapValue8<T> = T extends Ref<infer V>
  ? UnwrapValue9<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue9<T[K]> } : T

// prettier-ignore
type UnwrapValue9<T> = T extends Ref<infer V>
  ? UnwrapValue10<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue10<T[K]> } : T

// prettier-ignore
type UnwrapValue10<T> = T extends Ref<infer V>
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
  return new RefImpl<T>(options);
}

export function ref<T>(raw: T): Ref<T> {
  const value = reactive({ $$state: raw });
  return createRef<T>({
    get: () => value.$$state as any,
    set: (v: T) => ((value.$$state as any) = v),
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
  if (!isPlainObject(obj) || !isReactive(obj)) return obj as any;

  const res: Refs<T> = {} as any;
  Object.keys(obj).forEach(key => {
    let val = obj[key];
    // make plain value reactive
    if (!isRef(val)) {
      val = createRef({
        get: () => obj[key],
        set: v => (obj[key as keyof T] = v as any),
      });
    }
    res[key as keyof T] = val as any;
  });

  return res;
}
