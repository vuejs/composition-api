import { setCurrentVue, currentVue } from './runtimeContext';
import { VueConstructor } from 'vue';

export function install(Vue: VueConstructor, _install: (Vue: VueConstructor) => void) {
  if (currentVue && Vue === currentVue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[vubel] already installed. Vue.use(Vubel) should be called only once.');
    }
    return;
  }

  const strats = Vue.config.optionMergeStrategies;
  strats.setup = strats.data;

  setCurrentVue(Vue);
  _install(Vue);
}
