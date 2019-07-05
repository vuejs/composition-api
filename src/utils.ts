const toString = (x: any) => Object.prototype.toString.call(x);

export const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const noopFn: any = (_: any) => _;

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noopFn,
  set: noopFn,
};

export function proxy(target: any, key: string, getter: Function, setter?: Function) {
  sharedPropertyDefinition.get = getter;
  sharedPropertyDefinition.set = setter || noopFn;
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
  if (!condition) throw new Error(`[vue-function-api] ${msg}`);
}

export function isArray<T>(x: unknown): x is T[] {
  return Array.isArray(x);
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isPlainObject<T extends Object = {}>(x: unknown): x is T {
  return toString(x) === '[object Object]';
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function';
}
