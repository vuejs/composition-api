import { VueConstructor } from 'vue';
import { currentVue } from './runtimeContext';
import { install } from './install';
import { mixin } from './setup';

const _install = (Vue: VueConstructor) => install(Vue, mixin);
const plugin = {
  install: _install,
};
// Auto install if it is not done yet and `window` has `Vue`.
// To allow users to avoid auto-installation in some cases,
if (!currentVue && typeof window !== 'undefined' && window.Vue) {
  _install(window.Vue);
}

export { plugin };
export * from './hooks/state';
export * from './hooks/lifecycle';
export * from './hooks/reactive';
export * from './hooks/inject';
