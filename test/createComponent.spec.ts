const Vue = require('vue/dist/vue.common.js');
import { plugin, createComponent, value, PropType } from '../src';

Vue.use(plugin);

it('should work', () => {
  const Child = createComponent({
    template: `<span>{{ localMsg }}</span>`,
    props: (['msg'] as any) as PropType<{ msg: string }>,
    setup(props) {
      return { localMsg: props.msg };
    },
  });

  const App = createComponent({
    template: `<div><Child :msg="msg"></Child></div>`,
    setup() {
      return { msg: value('hello') };
    },
    components: {
      Child,
    },
  });
  const vm = new Vue(App).$mount();
  expect(vm.$el.querySelector('span').textContent).toBe('hello');
});
