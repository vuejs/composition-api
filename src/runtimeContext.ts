import Vue, { VueConstructor } from 'vue';
import { assert } from './utils';

let currentVue: VueConstructor | null = null;
let currentVM: Vue | null = null;

export function getCurrentVue(): VueConstructor {
  if (process.env.NODE_ENV !== 'production') {
    assert(currentVue, `must call Vue.use(plugin) before using any function.`);
  }

  return currentVue!;
}

export function setCurrentVue(vue: VueConstructor) {
  currentVue = vue;
}

export function getCurrentVM(): Vue | null {
  return currentVM;
}

export function setCurrentVM(vue: Vue | null) {
  currentVM = vue;
}

export { currentVue };
