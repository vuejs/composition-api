import AbstractWrapper from './AbstractWrapper';
import ValueWrapper from './ValueWrapper';
import ComputedWrapper from './ComputedWrapper';

export interface Wrapper<V> {
  value: V;
}
export function isWrapper<T>(obj: any): obj is AbstractWrapper<T> {
  return obj instanceof AbstractWrapper;
}
export { ValueWrapper, ComputedWrapper, AbstractWrapper };

type Value<T> = Wrapper<T>;

type BailTypes = Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>;

// prettier-ignore
// Recursively unwraps nested value bindings.
// Unfortunately TS cannot do recursive types, but this should be enough for
// practical use cases...
export type UnwrapValue<T> = T extends Value<infer V>
  ? UnwrapValue2<V>
  : T extends BailTypes
      ? T // bail out on types that shouldn't be unwrapped
      : T extends object ? { [K in keyof T]: UnwrapValue2<T[K]> } : T

// prettier-ignore
type UnwrapValue2<T> = T extends Value<infer V>
  ? UnwrapValue3<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue3<T[K]> } : T

// prettier-ignore
type UnwrapValue3<T> = T extends Value<infer V>
  ? UnwrapValue4<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue4<T[K]> } : T

// prettier-ignore
type UnwrapValue4<T> = T extends Value<infer V>
  ? UnwrapValue5<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue5<T[K]> } : T

// prettier-ignore
type UnwrapValue5<T> = T extends Value<infer V>
  ? UnwrapValue6<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue6<T[K]> } : T

// prettier-ignore
type UnwrapValue6<T> = T extends Value<infer V>
  ? UnwrapValue7<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue7<T[K]> } : T

// prettier-ignore
type UnwrapValue7<T> = T extends Value<infer V>
  ? UnwrapValue8<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue8<T[K]> } : T

// prettier-ignore
type UnwrapValue8<T> = T extends Value<infer V>
  ? UnwrapValue9<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue9<T[K]> } : T

// prettier-ignore
type UnwrapValue9<T> = T extends Value<infer V>
  ? UnwrapValue10<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue10<T[K]> } : T

// prettier-ignore
type UnwrapValue10<T> = T extends Value<infer V>
  ? V // stop recursion
  : T
