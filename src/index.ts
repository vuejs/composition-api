import Vue, { VueConstructor } from 'vue';
import { SetupFunction } from './ts-api';
import { currentVue } from './runtimeContext';
import { Wrapper } from './wrappers';
import { install } from './install';
import { mixin } from './setup';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    setup?: SetupFunction<{}, {}>;
  }
}

const _install = (Vue: VueConstructor) => install(Vue, mixin);
const plugin = {
  install: _install,
};
// Auto install if it is not done yet and `window` has `Vue`.
// To allow users to avoid auto-installation in some cases,
if (currentVue && typeof window !== 'undefined' && window.Vue) {
  _install(window.Vue);
}

export { default as createElement } from './createElement';
export { plugin, Wrapper };
export { set } from './reactivity';
export { createComponent, PropType } from './ts-api';
export * from './functions/state';
export * from './functions/lifecycle';
export * from './functions/watch';
export * from './functions/computed';
export * from './functions/inject';
