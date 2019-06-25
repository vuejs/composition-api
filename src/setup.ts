import { VueConstructor } from 'vue';
import { Context } from './types/vue';
import { isWrapper } from './helper';
import { setCurrentVM } from './runtimeContext';
import { isPlainObject, assert, proxy, isFunction } from './utils';
import { value, state } from './functions/state';

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
    setCurrentVM(vm);
    const ctx = createContext(vm);
    try {
      binding = setup(vm.$props || {}, ctx);
      binding = makeBindingReactive(binding)
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

  function createContext(vm: any): Context {
    const ctx = {} as Context;
    const props = [
      // 'el', // has workaround
      // 'options',
      'parent', // confirmed in rfc
      'root', // confirmed in rfc
      // 'children', // very likely
      'refs', // confirmed in rfc
      'slots', // confirmed in rfc
      // 'scopedSlots', // has workaround
      // 'isServer',
      // 'ssrContext',
      // 'vnode',
      'attrs', // confirmed in rfc
      // 'listeners', // very likely
    ];
    const methodWithoutReturn = [
      // 'on',  // very likely
      // 'once', // very likely
      // 'off', // very likely
      'emit', // confirmed in rfc
      // 'forceUpdate',
      // 'destroy'
    ];
    props.forEach(key => {
      proxy(ctx, key, () => vm[`$${key}`], function() {
        Vue.util.warn(`Cannot assign to '${key}' because it is a read-only property`, vm);
      });
    });
    methodWithoutReturn.forEach(key =>
      proxy(ctx, key, () => {
        const vmKey = `$${key}`;
        return (...args: any[]) => {
          const fn: Function = vm[vmKey];
          fn.apply(vm, args);
        };
      })
    );
    if (process.env.NODE_ENV === 'test') {
      (ctx as any)._vm = vm;
    }
    return ctx;
  }

  function makeBindingReactive(binding: any) {
    if (isWrapper(binding))
      return binding;
    const reactiveBinding: any = {};
    Object.keys(binding).forEach(key => {
      let bindingValue = binding[key];
      if (bindingValue === undefined)
        return;
      if (!isWrapper(bindingValue) && !isFunction(bindingValue) && !Object.isFrozen(bindingValue)) {
        if (isPlainObject(bindingValue))
          bindingValue = state(bindingValue);
        else
          bindingValue = value(bindingValue);
      }
      reactiveBinding[key] = bindingValue;
    });
    return reactiveBinding;
  }
}
