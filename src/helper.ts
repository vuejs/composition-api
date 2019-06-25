import { VueConstructor } from 'vue';
import { getCurrentVue, getCurrentVM } from './runtimeContext';
import { assert } from './utils';
import { AbstractWrapper } from './wrappers';

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
