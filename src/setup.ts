import VueInstance, { VueConstructor } from 'vue';
import { SetupContext } from './types/vue';
import { isWrapper } from './wrappers';
import { setCurrentVM } from './runtimeContext';
import { isPlainObject, assert, proxy, warn, logError } from './utils';
import { value } from './functions/state';

export function mixin(Vue: VueConstructor) {
  Vue.mixin({
    beforeCreate: functionApiInit,
  });

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */
  function functionApiInit(this: VueInstance) {
    const vm = this;
    const $options = vm.$options;
    const { setup } = $options;

    if (!setup) {
      return;
    }
    if (typeof setup !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          'The "setup" option should be a function that returns a object in component definitions.',
          vm
        );
      }
      return;
    }

    const { data } = $options;
    // wapper the data option, so we can invoke setup before data get resolved
    $options.data = function wrappedData() {
      initSetup(vm, vm.$props);
      return typeof data === 'function' ? data.call(vm, vm) : data || {};
    };
  }

  function initSetup(vm: VueInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!;
    const ctx = createSetupContext(vm);
    let binding: any;
    setCurrentVM(vm);
    try {
      binding = setup(props, ctx);
    } catch (err) {
      logError(err, vm, 'setup()');
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
      let bindingValue = binding[name];
      // make plain value reactive
      if (!isWrapper(bindingValue)) {
        bindingValue = value(bindingValue);
      }
      // bind to vm
      bindingValue.setVmProperty(vm, name);
    });
  }

  function createSetupContext(vm: VueInstance & { [x: string]: any }): SetupContext {
    const ctx = {} as SetupContext;
    const props = ['parent', 'root', 'refs', 'slots', 'attrs'];
    const methodReturnVoid = ['emit'];
    props.forEach(key => {
      proxy(ctx, key, {
        get: () => vm[`$${key}`],
        set() {
          warn(`Cannot assign to '${key}' because it is a read-only property`, vm);
        },
      });
    });
    methodReturnVoid.forEach(key =>
      proxy(ctx, key, {
        get() {
          const vmKey = `$${key}`;
          return (...args: any[]) => {
            const fn: Function = vm[vmKey];
            fn.apply(vm, args);
          };
        },
      })
    );
    if (process.env.NODE_ENV === 'test') {
      (ctx as any)._vm = vm;
    }
    return ctx;
  }
}
