import Vue, { ComponentOptions, VueConstructor } from 'vue';
import { ComponentInstance } from './component';
import { currentVue, getCurrentVM } from './runtimeContext';
import { assert } from './utils';

export function ensureCurrentVMInFn(hook: string): ComponentInstance {
  const vm = getCurrentVM();
  if (process.env.NODE_ENV !== 'production') {
    assert(vm, `"${hook}" get called outside of "setup()"`);
  }
  return vm!;
}

export function createComponentInstance<V extends Vue = Vue>(
  Ctor: VueConstructor<V>,
  options: ComponentOptions<V> = {}
) {
  const silent = Ctor.config.silent;
  Ctor.config.silent = true;
  const vm = new Ctor(options);
  Ctor.config.silent = silent;
  return vm;
}

export function isComponentInstance(obj: any) {
  return currentVue && obj instanceof currentVue;
}
