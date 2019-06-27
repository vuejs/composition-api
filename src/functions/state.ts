import { Wrapper, ValueWrapper } from '../wrappers';
import { isArray, isPlainObject } from '../utils';
import { observable, upWrapping } from '../helper';

export function state<T>(value: T): T {
  return observable(isArray(value) || isPlainObject(value) ? upWrapping(value) : value);
}

export function value<T>(value: T): Wrapper<T> {
  return new ValueWrapper(
    observable({ $$state: isArray(value) || isPlainObject(value) ? upWrapping(value) : value })
  );
}
