import { VueConstructor } from 'vue';
import { UnknownObject } from './types/basic';
import { isWrapper } from './helper';
import { setCurrentVM } from './runtimeContext';
import { isPlainObject, noopFn, assert } from './utils';

const isProd = process.env.NODE_ENV === 'production';

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
    if (setup) {
      if (!isProd && typeof setup !== 'function') {
        Vue.util.warn(
          'The "setup" option should be a function that returns a object in component definitions.',
          vm
        );
        return;
      }

      let binding: any;
      try {
        setCurrentVM(vm);
        binding = setup.call(vm, vm.$props);
      } catch (err) {
        if (!isProd) {
          Vue.util.warn(`there is an error occuring in "setup"`, vm);
        }
        console.log(err);
      } finally {
        setCurrentVM(null);
      }

      if (!binding) return;

      if (!isProd) {
        assert(
          isPlainObject(binding),
          `"setup" must return a "Object", get "${Object.prototype.toString
            .call(binding)
            .slice(8, -1)}"`
        );
      }

      Object.keys(binding).forEach(name => {
        const bindingValue = binding[name];
        if (isWrapper(bindingValue)) {
          bindingValue.setPropertyName(name);
          proxy(
            vm,
            name,
            () => bindingValue.value,
            (val: any) => {
              bindingValue.value = val;
            }
          );
        } else {
          vm[name] = bindingValue;
        }
      });
    }
  }
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noopFn,
  set: noopFn,
};

function proxy(target: UnknownObject, key: string, getter: Function, setter?: Function) {
  sharedPropertyDefinition.get = getter;
  sharedPropertyDefinition.set = setter || noopFn;
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
