import Vue, { VueConstructor } from 'vue';
import { SetupContext } from './types/vue';
import { currentVue } from './runtimeContext';
import { Wrapper } from './wrappers';
import { install } from './install';
import { mixin } from './setup';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    setup?: (
      this: undefined,
      props: { [x: string]: any },
      context: SetupContext
    ) => object | null | undefined | void;
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

export { plugin, Wrapper };
export { set } from './reactivity';
export * from './ts-api';
export * from './functions/state';
export * from './functions/lifecycle';
export * from './functions/watch';
export * from './functions/computed';
export * from './functions/inject';
