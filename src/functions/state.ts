import { Wrapper, ValueWrapper } from '../wrappers';
import { observable } from '../reactivity';

export function state<T>(value: T): T {
  return observable(value);
}

export function value<T>(value: T): Wrapper<T> {
  return new ValueWrapper(state({ $$state: value }));
}
