import { VueConstructor } from 'vue';
import { ComponentInstance, SetupContext, SetupFunction, Data } from './component';
import { Ref, isRef } from './reactivity';
import { getCurrentVM, setCurrentVM } from './runtimeContext';
import { hasOwn, isPlainObject, assert, proxy, warn, logError, isFunction } from './utils';
import { ref } from './apis/state';

function asVmProperty(vm: ComponentInstance, propName: string, ref: Ref<unknown>) {
  const props = vm.$options.props;
  if (!(propName in vm) && !(props && hasOwn(props, propName))) {
    proxy(vm, propName, {
      get: () => ref.value,
      set: (val: unknown) => {
        ref.value = val;
      },
    });
    if (process.env.NODE_ENV !== 'production') {
      // expose binding to Vue Devtool as a data property
      // delay this until state has been resolved to prevent repeated works
      vm.$nextTick(() => {
        proxy(vm._data, name, {
          get: () => ref.value,
          set: (val: unknown) => {
            ref.value = val;
          },
        });
      });
    }
  } else if (process.env.NODE_ENV !== 'production') {
    if (props && hasOwn(props, propName)) {
      warn(`The setup binding property "${propName}" is already declared as a prop.`, vm);
    } else {
      warn(`The setup binding property "${propName}" is already declared.`, vm);
    }
  }
}

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
    let binding: ReturnType<SetupFunction<Data, Data>> | undefined | null;
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
      vm.$options.render = () => (binding as any)(vm.$props, ctx);
      return;
    }

    if (isPlainObject(binding)) {
      Object.keys(binding).forEach(name => {
        let bindingValue = (binding as any)[name];
        // make plain value reactive
        if (!isRef(bindingValue)) {
          bindingValue = ref(bindingValue);
        }
        asVmProperty(vm, name, bindingValue);
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
