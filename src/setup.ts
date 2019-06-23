import { VueConstructor } from 'vue';
import { isWrapper } from './helper';
import { setCurrentVM } from './runtimeContext';
import { isPlainObject, assert } from './utils';

export function mixin(Vue: VueConstructor) {
  Vue.mixin({
    created: vuexInit,
  });

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */
  function vuexInit(this: any) {
    const vm = this;
    const { setup } = vm.$options;
    if (!setup) {
      return;
    }
    if (typeof setup !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        Vue.util.warn(
          'The "setup" option should be a function that returns a object in component definitions.',
          vm
        );
      }
      return;
    }

    let binding: any;
    try {
      setCurrentVM(vm);
      binding = setup.call(vm, vm.$props);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        Vue.util.warn(`there is an error occuring in "setup"`, vm);
      }
      console.log(err);
    } finally {
      setCurrentVM(null);
    }

    if (!binding) return;
    if (!isPlainObject(binding)) {
      if (process.env.NODE_ENV !== 'production') {
        assert(
          false,
          `"setup" must return a "Object", get "${Object.prototype.toString
            .call(binding)
            .slice(8, -1)}"`
        );
      }
      return;
    }

    Object.keys(binding).forEach(name => {
      const bindingValue = binding[name];
      if (isWrapper(bindingValue)) {
        bindingValue.setVmProperty(vm, name);
      } else {
        vm[name] = bindingValue;
      }
    });
  }
}
