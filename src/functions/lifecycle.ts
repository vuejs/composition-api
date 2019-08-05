import { VueConstructor } from 'vue';
import { VueInstance } from '../types/vue';
import { getCurrentVue } from '../runtimeContext';
import { ensureCurrentVMInFn } from '../helper';

const genName = (name: string) => `on${name[0].toUpperCase() + name.slice(1)}`;
function createLifeCycle(lifeCyclehook: string) {
  return (callback: Function) => {
    const vm = ensureCurrentVMInFn(genName(lifeCyclehook));
    injectHookOption(getCurrentVue(), vm, lifeCyclehook, callback);
  };
}

function createLifeCycles(lifeCyclehooks: string[], name: string) {
  return (callback: Function) => {
    const currentVue = getCurrentVue();
    const vm = ensureCurrentVMInFn(name);
    lifeCyclehooks.forEach(lifeCyclehook =>
      injectHookOption(currentVue, vm, lifeCyclehook, callback)
    );
  };
}

function injectHookOption(Vue: VueConstructor, vm: VueInstance, hook: string, val: Function) {
  const options = vm.$options as any;
  const mergeFn = Vue.config.optionMergeStrategies[hook];
  options[hook] = mergeFn(options[hook], val);
}

export const onCreated = createLifeCycle('created');
export const onBeforeMount = createLifeCycle('beforeMount');
export const onMounted = createLifeCycle('mounted');
export const onBeforeUpdate = createLifeCycle('beforeUpdate');
export const onUpdated = createLifeCycle('updated');
export const onActivated = createLifeCycle('activated');
export const onDeactivated = createLifeCycle('deactivated');
export const onBeforeDestroy = createLifeCycle('beforeDestroy');
export const onDestroyed = createLifeCycle('destroyed');
export const onErrorCaptured = createLifeCycle('errorCaptured');

// only one event will be fired between destroyed and deactivated when an unmount occurs
export const onUnmounted = createLifeCycles(['destroyed', 'deactivated'], genName('unmounted'));
