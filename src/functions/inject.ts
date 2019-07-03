import Vue from 'vue';
import { getCurrentVue } from '../runtimeContext';
import { state } from '../functions/state';
import { isWrapper, Wrapper, ComputedWrapper } from '../wrappers';
import { ensureCurrentVMInFn } from '../helper';
import { hasOwn } from '../utils';

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

export function provide<T>(key: Key<T>, value: T | Wrapper<T>) {
  const vm: any = ensureCurrentVMInFn('provide');
  if (!vm._provided) {
    vm._provided = {};
  }
  vm._provided[key as any] = value;
}

export function inject<T>(key: Key<T>): Wrapper<T> | void {
  if (!key) {
    return;
  }

  const vm = ensureCurrentVMInFn('inject');
  const val = resolveInject(key, vm);
  if (val !== UNRESOLVED_INJECT) {
    if (isWrapper<T>(val)) {
      return val;
    }
    const reactiveVal = state<T>(val);
    return new ComputedWrapper<T>({
      read: () => reactiveVal,
      write() {
        getCurrentVue().util.warn(`The injectd value can't be re-assigned`, vm);
      },
    });
  } else if (process.env.NODE_ENV !== 'production') {
    getCurrentVue().util.warn(`Injection "${String(key)}" not found`, vm);
  }
}
