import { VueConstructor } from 'vue';
const Vue: VueConstructor = require('vue/dist/vue.common.js');
import { ref } from '../src';

describe('setup', () => {
  it('should works', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        };
      },
    }).$mount();

    expect(vm.a).toBe(1);
  });

  it('should receive props as first params', () => {
    let props: any | undefined;
    new Vue({
      props: ['a'],
      setup(_props) {
        props = _props;
        _props.a;
        return {};
      },
      propsData: {
        a: 1,
      },
    }).$mount();
    expect(props.a).toBe(1);
  });

  it('should receive typed props as first params', () => {
    let props: any | undefined;
    new Vue({
      props: {
        a: String,
      },
      setup(_props) {
        props = _props;
        const aStr: string = _props.a;
        return {
          aStr,
        };
      },
      propsData: {
        a: '1',
      },
    }).$mount();
    expect(props.a).toBe('1');
  });

  it('should have access to props', () => {
    const Test = Vue.extend({
      props: ['a'],
      setup(props) {
        return {
          b: props.a,
        };
      },
    });
    const vm = new Vue({
      template: `<test ref="test" :a="1"></test>`,
      components: { Test },
    }).$mount();
    expect((vm.$refs.test as any).b).toBe(1);
  });

  it('this should be undefined', () => {
    const vm = new Vue({
      template: '<div></div>',
      setup() {
        expect(this).toBe(global);
      },
    }).$mount();
    expect(vm).toBeDefined();
  });
});
