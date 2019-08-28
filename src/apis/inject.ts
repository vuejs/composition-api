import { ComponentInstance } from '../component';
import { ensureCurrentVMInFn } from '../helper';
import { hasOwn, warn } from '../utils';

const NOT_FOUND = {};
export interface InjectionKey<T> extends Symbol {}

function resolveInject(provideKey: InjectionKey<any>, vm: ComponentInstance): any {
  let source = vm;
  while (source) {
    // @ts-ignore
    if (source._provided && hasOwn(source._provided, provideKey)) {
      //@ts-ignore
      return source._provided[provideKey];
    }
    source = source.$parent;
  }

  return NOT_FOUND;
}

export function provide<T>(key: InjectionKey<T> | string, value: T): void {
  const vm: any = ensureCurrentVMInFn('provide');
  if (!vm._provided) {
    const provideCache = {};
    Object.defineProperty(vm, '_provided', {
      get: () => provideCache,
      set: v => Object.assign(provideCache, v),
    });
  }

  vm._provided[key as string] = value;
}

export function inject<T>(key: InjectionKey<T> | string): T | void;
export function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T;
export function inject<T>(key: InjectionKey<T> | string, defaultValue?: T): T | void {
  if (!key) {
    return defaultValue;
  }

  const vm = ensureCurrentVMInFn('inject');
  const val = resolveInject(key as InjectionKey<T>, vm);
  if (val !== NOT_FOUND) {
    return val;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else if (process.env.NODE_ENV !== 'production') {
    warn(`Injection "${String(key)}" not found`, vm);
  }
}
