import Vue from 'vue';

const toString = (x: any) => Object.prototype.toString.call(x);

export const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const noopFn: any = (_: any) => _;

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noopFn,
  set: noopFn,
};

export function proxy(target: any, key: string, { get, set }: { get?: Function; set?: Function }) {
  sharedPropertyDefinition.get = get || noopFn;
  sharedPropertyDefinition.set = set || noopFn;
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: Object | any[], key: string): boolean {
  return hasOwnProperty.call(obj, key);
}

export function assert(condition: any, msg: string) {
  if (!condition) throw new Error(`[vue-composition-api] ${msg}`);
}

export function isArray<T>(x: unknown): x is T[] {
  return Array.isArray(x);
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isPlainObject(x: unknown): x is Record<any, any> {
  return toString(x) === '[object Object]';
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function';
}

export function warn(msg: string, vm?: Vue) {
  Vue.util.warn(msg, vm);
}

export function logError(err: Error, vm: Vue, info: string) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm);
  }
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err;
  }
}
