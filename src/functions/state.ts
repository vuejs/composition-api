import { Wrapper, ValueWrapper, UnwrapValue } from '../wrappers';
import { observable } from '../reactivity';

export function state<T>(value: T): UnwrapValue<T> {
  return observable(value);
}

export function value<T>(value: T): Wrapper<UnwrapValue<T>> {
  return (new ValueWrapper(state({ $$state: value })) as any) as Wrapper<UnwrapValue<T>>;
}
