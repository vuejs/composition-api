import { VueConstructor } from 'vue';
import { currentVue as Vue, currentVM } from './runtimeContext';
import Wrapper from './wrappers/Wrapper';

export function isWrapper<T>(obj: any): obj is Wrapper<T> {
  return obj instanceof Wrapper;
}

export function getCurrentVM(hook: string): InstanceType<VueConstructor> {
  if (currentVM === null) {
    throw new Error(`[vubel] "${hook}" get called outside of "setup()"`);
  }

  return currentVM;
}

export function observable<T = any>(obj: T): T {
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

  return (vm as any)._data.$$state;
}

export function compoundComputed(computed: {
  [key: string]:
    | (() => any)
    | {
        get?: () => any;
        set?: (v: any) => void;
      };
}) {
  const silent = Vue.config.silent;
  Vue.config.silent = true;
  const reactive = new Vue({
    computed,
  });
  Vue.config.silent = silent;
  return reactive;
}
