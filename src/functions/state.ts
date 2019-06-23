import { Wrapper, ValueWrapper } from '../wrappers';
import { isArray, isPlainObject } from '../utils';
import { observable, isWrapper } from '../helper';

function upWrapping(obj: any) {
  if (!obj) {
    return obj;
  }

  const keys = Object.keys(obj);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = obj[key];
    if (isWrapper(value)) {
      obj[key] = value.value;
    } else if (isPlainObject(value) || isArray(value)) {
      obj[key] = upWrapping(value);
    }
  }

  return obj;
}

export function state<T>(value: T): T {
  return observable(isArray(value) || isPlainObject(value) ? upWrapping(value) : value);
}

export function value<T>(value: T): Wrapper<T> {
  return new ValueWrapper(
    observable({ $$state: isArray(value) || isPlainObject(value) ? upWrapping(value) : value })
  );
}
