import Vue from 'vue';
import { AnyObject } from '../types/basic';
import { state } from '../functions/state';
import { isWrapper, Wrapper, ComputedWrapper } from '../wrappers';
import { ensureCurrentVMInFn } from '../helper';
import { hasOwn, warn, isObject } from '../utils';

const UNRESOLVED_INJECT = {};
export interface Key<T> extends Symbol {}

function resolveInject(provideKey: Key<any>, vm: Vue): any {
  let source = vm;
  while (source) {
    // @ts-ignore
    if (source._provided && hasOwn(source._provided, provideKey)) {
      //@ts-ignore
      return source._provided[provideKey];
    }
    source = source.$parent;
  }

  return UNRESOLVED_INJECT;
}

export function provide(data: AnyObject): void;
export function provide<T>(key: Key<T> | string, value: T | Wrapper<T>): void;
export function provide<T>(keyOrData: Key<T> | string | AnyObject, value?: T | Wrapper<T>): void {
  const vm: any = ensureCurrentVMInFn('provide');
  if (!vm._provided) {
    vm._provided = {};
  }

  if (isObject(keyOrData)) {
    Object.assign(vm._provided, keyOrData);
  } else {
    vm._provided[keyOrData] = value;
  }
}

export function inject<T>(key: Key<T> | string): Wrapper<T> | void {
  if (!key) {
    return;
  }

  const vm = ensureCurrentVMInFn('inject');
  const val = resolveInject(key as Key<T>, vm);
  if (val !== UNRESOLVED_INJECT) {
    if (isWrapper<T>(val)) {
      return val;
    }
    const reactiveVal = state<T>(val);
    return new ComputedWrapper<T>({
      read: () => reactiveVal,
      write() {
        warn(`The injectd value can't be re-assigned`, vm);
      },
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn(`Injection "${String(key)}" not found`, vm);
  }
}
