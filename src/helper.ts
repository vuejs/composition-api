import { VueConstructor } from 'vue';
import { getCurrentVue, getCurrentVM } from './runtimeContext';
import { assert } from './utils';

export function ensureCurrentVMInFn(hook: string): InstanceType<VueConstructor> {
  const vm = getCurrentVM();
  if (process.env.NODE_ENV !== 'production') {
    assert(vm, `"${hook}" get called outside of "setup()"`);
  }
  return vm!;
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
