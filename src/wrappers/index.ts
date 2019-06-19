import AbstractWrapper from './AbstractWrapper';
import ValueWrapper from './ValueWrapper';
import ComputedWrapper from './ComputedWrapper';

export interface Wrapper<V> {
  value: V;
}
export { ValueWrapper, ComputedWrapper, AbstractWrapper };
