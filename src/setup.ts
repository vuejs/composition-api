import { VueConstructor } from 'vue';
import { ComponentInstance, SetupContext } from './ts-api';
import { isWrapper } from './wrappers';
import { getCurrentVM, setCurrentVM } from './runtimeContext';
import { isPlainObject, assert, proxy, warn, logError, isFunction } from './utils';
import { value } from './functions/state';

export function mixin(Vue: VueConstructor) {
  Vue.mixin({
    beforeCreate: functionApiInit,
  });

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */
  function functionApiInit(this: ComponentInstance) {
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

  function initSetup(vm: ComponentInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!;
    const ctx = createSetupContext(vm);
    let binding: any;
    let preVm = getCurrentVM();
    setCurrentVM(vm);
    try {
      binding = setup(props, ctx);
    } catch (err) {
      logError(err, vm, 'setup()');
    } finally {
      setCurrentVM(preVm);
    }

    if (!binding) return;

    if (isFunction(binding)) {
      vm.$options.render = () => binding(vm.$props, ctx);
      return;
    }

    if (isPlainObject(binding)) {
      Object.keys(binding).forEach(name => {
        let bindingValue = binding[name];
        // make plain value reactive
        if (!isWrapper(bindingValue)) {
          bindingValue = value(bindingValue);
        }
        // bind to vm
        bindingValue.setVmProperty(vm, name);
      });
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert(
        false,
        `"setup" must return a "Object" or a "Function", get "${Object.prototype.toString
          .call(binding)
          .slice(8, -1)}"`
      );
    }
  }

  function createSetupContext(vm: ComponentInstance & { [x: string]: any }): SetupContext {
    const ctx = {} as SetupContext;
    const props: Array<string | [string, string]> = [
      'root',
      'parent',
      'refs',
      ['slots', 'scopedSlots'],
      'attrs',
    ];
    const methodReturnVoid = ['emit'];
    props.forEach(key => {
      let targetKey: string;
      let srcKey: string;
      if (Array.isArray(key)) {
        [targetKey, srcKey] = key;
      } else {
        targetKey = srcKey = key;
      }
      srcKey = `$${srcKey}`;
      proxy(ctx, targetKey, {
        get: () => vm[srcKey],
        set() {
          warn(`Cannot assign to '${targetKey}' because it is a read-only property`, vm);
        },
      });
    });
    methodReturnVoid.forEach(key => {
      const srcKey = `$${key}`;
      proxy(ctx, key, {
        get() {
          return (...args: any[]) => {
            const fn: Function = vm[srcKey];
            fn.apply(vm, args);
          };
        },
      });
    });
    if (process.env.NODE_ENV === 'test') {
      (ctx as any)._vm = vm;
    }
    return ctx;
  }
}
