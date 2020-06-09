import { isRef } from './ref';
import { proxy, isFunction, isObject, isArray } from '../utils';
import { isReactive } from './reactive';

export function unwrapRefProxy(value: any) {
  if (isFunction(value)) {
    return value;
  }

  if (isRef(value)) {
    return value;
  }

  if (isArray(value)) {
    return value;
  }

  if (isReactive(value)) {
    return value;
  }

  if (!isObject(value)) {
    return value;
  }

  const obj: any = {};

  // copy symbols over
  Object.getOwnPropertySymbols(value).forEach((s) => (obj[s] = (value as any)[s]));

  for (const k of Object.keys(value)) {
    const v = value[k];
    let r = unwrapRefProxy(v);
    // if is a ref, create a proxy to retrieve the value,
    if (isRef(r)) {
      const set = (v: any) => (value[k].value = v);
      const get = () => value[k].value;

      proxy(obj, k, { get, set });
    } else {
      obj[k] = r;
    }
  }

  return obj;
}
