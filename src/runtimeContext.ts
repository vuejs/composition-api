import { VueConstructor } from 'vue';
import { ComponentInstance } from './component';
import { assert } from './utils';

let currentVue: VueConstructor | null = null;
let currentVM: ComponentInstance | null = null;

export function getCurrentVue(): VueConstructor {
  if (process.env.NODE_ENV !== 'production') {
    assert(currentVue, `must call Vue.use(plugin) before using any function.`);
  }

  return currentVue!;
}

export function setCurrentVue(vue: VueConstructor) {
  currentVue = vue;
}

export function getCurrentVM(): ComponentInstance | null {
  return currentVM;
}

export function setCurrentVM(vm: ComponentInstance | null) {
  currentVM = vm;
}

export { currentVue, currentVM };
