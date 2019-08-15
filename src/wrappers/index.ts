import AbstractWrapper, { Wrapper, UnwrapValue } from './AbstractWrapper';
import ValueWrapper from './ValueWrapper';
import ComputedWrapper from './ComputedWrapper';

export function isWrapper<T>(obj: any): obj is AbstractWrapper<T> {
  return obj instanceof AbstractWrapper;
}
export { Wrapper, UnwrapValue, ValueWrapper, ComputedWrapper };
