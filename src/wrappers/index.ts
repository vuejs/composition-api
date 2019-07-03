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
