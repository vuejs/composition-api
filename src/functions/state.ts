import { IWrapper } from '../types/lib';
import { isArray, isPlainObject } from '../utils';
import { observable, isWrapper } from '../helper';
import ValueWrapper from '../wrappers/ValueWrapper';

function upWrapping(obj: any) {
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
  return observable(upWrapping(value));
}

export function value<T>(value: T): IWrapper<T> {
  return new ValueWrapper(observable({ $$state: upWrapping(value) }));
}
