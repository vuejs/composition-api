const Vue = require('vue/dist/vue.common.js');

import { waitForUpdate as wfu } from './wait-for-update';

export const waitForUpdate: (cb: Function) => Promise<any> = wfu;

export function nextTick(): Promise<any> {
  return Vue.nextTick();
}
