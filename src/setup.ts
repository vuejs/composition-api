import VueInstance, { VueConstructor } from 'vue';
import { SetupContext } from './types/vue';
import { isWrapper } from './wrappers';
import { SetupHookEvent } from './symbols';
import { setCurrentVM } from './runtimeContext';
import { isPlainObject, assert, proxy, noopFn } from './utils';
import { value } from './functions/state';
import { watch } from './functions/watch';

let disableSetup = false;

// `cb` should be called right after props get resolved
function waitPropsResolved(vm: VueInstance, cb: (v: VueInstance, props: Record<any, any>) => void) {
  const safeRunCb = (props: Record<any, any>) => {
    // Running `cb` under the scope of a dep.Target, otherwise the `Observable`
    // in `cb` will be unexpectedly colleced by the current dep.Target.
    const dispose = watch(
      () => {
        cb(vm, props);
      },
      noopFn,
      { lazy: false, deep: false, flush: 'sync' }
    );
    dispose();
  };

  const opts = vm.$options;
  let methods = opts.methods;

  if (!methods) {
    opts.methods = { [SetupHookEvent]: noopFn };
    // This will get invoked when assigning to `SetupHookEvent` property of vm.
    vm.$once(SetupHookEvent, () => {
      // restore `opts` object
      delete opts.methods;
      safeRunCb(vm.$props);
    });
    return;
  }

  // Find the first method will re resovled.
  // The order will be stable, since we never modify the `methods` object.
  let firstMedthodName: string | undefined;
  for (const key in methods) {
    firstMedthodName = key;
    break;
  }

  // `methods` is an empty object
  if (!firstMedthodName) {
    methods[SetupHookEvent] = noopFn;
    vm.$once(SetupHookEvent, () => {
      // restore `methods` object
      delete methods![SetupHookEvent];
      safeRunCb(vm.$props);
    });
    return;
  }

  proxy(vm, firstMedthodName, {
    set(val: any) {
      safeRunCb(vm.$props);

      // restore `firstMedthodName` to a noraml property
      Object.defineProperty(vm, firstMedthodName!, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: val,
      });
    },
  });
}

export function mixin(Vue: VueConstructor) {
  // We define the setup hook on prototype,
  // which avoids Object.defineProperty calls for each instance created.
  proxy(Vue.prototype, SetupHookEvent, {
    get() {
      return 'hook';
    },
    set(this: VueInstance) {
      this.$emit(SetupHookEvent);
    },
  });

  Vue.mixin({
    beforeCreate: functionApiInit,
  });

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */
  function functionApiInit(this: VueInstance) {
    const vm = this;
    const { setup } = vm.$options;

    if (disableSetup || !setup) {
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

    waitPropsResolved(vm, initSetup);
  }

  function initSetup(vm: VueInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!;
    const ctx = createSetupContext(vm);
    let binding: any;
    setCurrentVM(vm);
    try {
      binding = setup(props, ctx);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        Vue.util.warn(`there is an error occuring in "setup"`, vm);
      }
      throw err;
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
          Vue.util.warn(`Cannot assign to '${key}' because it is a read-only property`, vm);
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
