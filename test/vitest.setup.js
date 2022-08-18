import Vue from 'vue/dist/vue.common'
import FullVue from 'vue/dist/vue.runtime.common'
import plugin from '../src'
import { waitForUpdate } from './helpers/wait-for-update'

FullVue.config.productionTip = false
FullVue.config.devtools = false
Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(plugin)

if (!global.waitForUpdate) {
  global.waitForUpdate = waitForUpdate
}
