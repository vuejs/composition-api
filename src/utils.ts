const toString = (x: any) => Object.prototype.toString.call(x);

export const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const noopFn: any = (_: any) => _;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: Object | any[], key: string): boolean {
  return hasOwnProperty.call(obj, key);
}

export function assert(condition: any, msg: string) {
  if (!condition) throw new Error(`[vue-function-api] ${msg}`);
}

export function isArray<T>(x: unknown): x is T[] {
  return toString(x) === '[object Array]';
}

export function isPlainObject<T extends Object = {}>(x: unknown): x is T {
  return toString(x) === '[object Object]';
}
