import { VueConstructor } from 'vue';
import { getCurrentVue, getCurrentVM } from './runtimeContext';
import { assert, isPlainObject, isArray, proxy } from './utils';
import { AbstractWrapper } from './wrappers';

export function upWrapping(obj: any) {
  if (!obj) {
    return obj;
  }

  const result: Record<string, any> = {};
  const keys = Object.keys(obj);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = obj[key];
    if (isWrapper(value)) {
      proxy(
        result,
        key,
        () => value.value,
        (val: any) => {
          value.value = val;
        }
      );
    } else if (isPlainObject(value) || isArray(value)) {
      result[key] = upWrapping(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function isWrapper<T>(obj: any): obj is AbstractWrapper<T> {
  return obj instanceof AbstractWrapper;
}

export function ensureCurrentVMInFn(hook: string): InstanceType<VueConstructor> {
  const vm = getCurrentVM();
  if (process.env.NODE_ENV !== 'production') {
    assert(vm, `"${hook}" get called outside of "setup()"`);
  }
  return vm!;
}

export function observable<T = any>(obj: T): T {
  const Vue = getCurrentVue();
  if (Vue.observable) {
    return Vue.observable(obj);
  }

  const silent = Vue.config.silent;
  Vue.config.silent = true;
  const vm = new Vue({
    data: {
      $$state: obj,
    },
  });
  Vue.config.silent = silent;

  return vm._data.$$state;
}

export function compoundComputed(computed: {
  [key: string]:
    | (() => any)
    | {
        get?: () => any;
        set?: (v: any) => void;
      };
}) {
  const Vue = getCurrentVue();
  const silent = Vue.config.silent;
  Vue.config.silent = true;
  const reactive = new Vue({
    computed,
  });
  Vue.config.silent = silent;
  return reactive;
}
