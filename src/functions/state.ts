import { Wrapper, ValueWrapper, UnwrapValue } from '../wrappers';
import { observable } from '../reactivity';

export function reactive<T>(value: T): UnwrapValue<T> {
  return observable(value);
}

export function value<T>(value: T): Wrapper<UnwrapValue<T>> {
  return (new ValueWrapper(reactive({ $$state: value })) as any) as Wrapper<UnwrapValue<T>>;
}
