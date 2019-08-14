const Vue = require('vue/dist/vue.common');
const { plugin } = require('../src');

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.use(plugin);
