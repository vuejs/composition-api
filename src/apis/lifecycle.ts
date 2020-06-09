import { VueConstructor } from 'vue';
import { ComponentInstance } from '../component';
import { getCurrentVue, setCurrentVM, getCurrentVM } from '../runtimeContext';
import { currentVMInFn } from '../helper';
import { HookMethodsKey } from '../symbols';

const genName = (name: string) => `on${name[0].toUpperCase() + name.slice(1)}`;

function createLifeCycle(lifeCycleHook: string, customHook?: boolean) {
  return (callback: Function) => {
    const vm = currentVMInFn(genName(lifeCycleHook));
    if (vm) {
      injectHookOption(getCurrentVue(), vm, lifeCycleHook, callback, customHook);
    }
  };
}

function injectHookOption(
  Vue: VueConstructor,
  vm: ComponentInstance,
  hook: string,
  val: Function,
  customHook?: boolean
) {
  if (!customHook) {
    vm.$on(`hook:${hook}`, wrapHookCall(vm, val));
  } else {
    const hookMethods = (vm as any)[HookMethodsKey] || ((vm as any)[HookMethodsKey] = {});
    const mergeFn = Vue.config.optionMergeStrategies[hook];
    hookMethods[hook] = mergeFn(hookMethods[hook], wrapHookCall(vm, val));
  }
}

function wrapHookCall(vm: ComponentInstance, fn: Function) {
  return (...args: any) => {
    let preVm = getCurrentVM();
    setCurrentVM(vm);
    try {
      return fn(...args);
    } finally {
      setCurrentVM(preVm);
    }
  };
}

// export const onCreated = createLifeCycle('created');
export const onBeforeMount = createLifeCycle('beforeMount');
export const onMounted = createLifeCycle('mounted');
export const onBeforeUpdate = createLifeCycle('beforeUpdate');
export const onUpdated = createLifeCycle('updated');
export const onBeforeUnmount = createLifeCycle('beforeDestroy');
export const onUnmounted = createLifeCycle('destroyed');
export const onErrorCaptured = createLifeCycle('errorCaptured', true);
export const onActivated = createLifeCycle('activated');
export const onDeactivated = createLifeCycle('deactivated');
export const onServerPrefetch = createLifeCycle('serverPrefetch', true);
