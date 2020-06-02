const Vue = require('vue/dist/vue.common.js');

export function nextTick(): Promise<any> {
  return Vue.nextTick();
}
