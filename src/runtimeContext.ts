import Vue, { VueConstructor } from 'vue';

let currentVue!: VueConstructor;
let currentVM: Vue | null = null;

export function setCurrentVue(vue: VueConstructor) {
  currentVue = vue;
}

export function setCurrentVM(vue: Vue | null) {
  currentVM = vue;
}

export { currentVue, currentVM };
