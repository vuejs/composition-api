const Vue = require('vue/dist/vue.common.js');
const { ref, computed, createElement: h } = require('../src');

describe('setup', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    warn.mockRestore();
  });

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

  it('should be overrided by data option of plain object', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        };
      },
      data: {
        a: 2,
      },
    }).$mount();
    expect(vm.a).toBe(2);
  });

  it("should access setup's value in data", () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        };
      },
      data() {
        return {
          b: this.a,
        };
      },
    }).$mount();
    expect(vm.a).toBe(1);
    expect(vm.b).toBe(1);
  });

  it('should work with `methods` and `data` options', done => {
    let calls = 0;
    const vm = new Vue({
      template: `<div>{{a}}{{b}}{{c}}</div>`,
      setup() {
        return {
          a: ref(1),
        };
      },
      beforeUpdate() {
        calls++;
      },
      created() {
        this.m();
      },
      data() {
        return {
          b: this.a,
          c: 0,
        };
      },
      methods: {
        m() {
          this.c = this.a;
        },
      },
    }).$mount();
    expect(vm.a).toBe(1);
    expect(vm.b).toBe(1);
    expect(vm.c).toBe(1);
    vm.a = 2;
    waitForUpdate(() => {
      expect(calls).toBe(1);
      expect(vm.a).toBe(2);
      expect(vm.b).toBe(1);
      expect(vm.c).toBe(1);
      vm.b = 2;
    })
      .then(() => {
        expect(calls).toBe(2);
        expect(vm.a).toBe(2);
        expect(vm.b).toBe(2);
        expect(vm.c).toBe(1);
      })
      .then(done);
  });

  it('should receive props as first params', () => {
    let props;
    new Vue({
      props: ['a'],
      setup(_props) {
        props = _props;
      },
      propsData: {
        a: 1,
      },
    }).$mount();
    expect(props.a).toBe(1);
  });

  it('should receive SetupContext second params', () => {
    let context;
    const vm = new Vue({
      setup(_, ctx) {
        context = ctx;
      },
    });
    expect(context).toBeDefined();
    expect('parent' in context).toBe(true);
    expect(context.root).toBe(vm.$root);
    expect(context.parent).toBe(vm.$parent);
    expect(context.slots).toBe(vm.$scopedSlots);
    expect(context.attrs).toBe(vm.$attrs);

    // CAUTION: this will be removed in 3.0
    expect(context.refs).toBe(vm.$refs);
    expect(typeof context.emit === 'function').toBe(true);
  });

  it('warn for existing props', () => {
    new Vue({
      props: {
        a: {},
      },
      setup() {
        const a = ref();
        return {
          a,
        };
      },
    });
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a prop.'
    );
  });

  it('warn for existing instance properties', () => {
    new Vue({
      setup(_, { _vm }) {
        _vm.a = 1;
        return {
          a: ref(),
        };
      },
    });
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared.'
    );
  });

  it('should merge result properly', () => {
    const A = Vue.extend({
      setup() {
        return { a: 1 };
      },
    });
    const Test = Vue.extend({
      extends: A,
      setup() {},
    });
    let vm = new Test({
      setup() {
        return { b: 2 };
      },
    });
    expect(vm.a).toBe(1);
    expect(vm.b).toBe(2);
    // no instance data
    vm = new Test();
    expect(vm.a).toBe(1);
    // no child-val
    const Extended = Test.extend({});
    vm = new Extended();
    expect(vm.a).toBe(1);
    // recursively merge objects
    const WithObject = Vue.extend({
      setup() {
        return {
          obj: {
            a: 1,
          },
        };
      },
    });
    vm = new WithObject({
      setup() {
        return {
          obj: {
            b: 2,
          },
        };
      },
    });
    expect(vm.obj.a).toBe(1);
    expect(vm.obj.b).toBe(2);
  });

  it('should have access to props', () => {
    const Test = {
      props: ['a'],
      render() {},
      setup(props) {
        return {
          b: props.a,
        };
      },
    };
    const vm = new Vue({
      template: `<test ref="test" :a="1"></test>`,
      components: { Test },
    }).$mount();
    expect(vm.$refs.test.b).toBe(1);
  });

  it('props should not be reactive', done => {
    let calls = 0;
    const vm = new Vue({
      template: `<child :msg="msg"></child>`,
      setup() {
        return { msg: ref('hello') };
      },
      beforeUpdate() {
        calls++;
      },
      components: {
        child: {
          template: `<span>{{ localMsg }}</span>`,
          props: ['msg'],
          setup(props) {
            return { localMsg: props.msg, computedMsg: computed(() => props.msg + ' world') };
          },
        },
      },
    }).$mount();
    const child = vm.$children[0];
    expect(child.localMsg).toBe('hello');
    expect(child.computedMsg).toBe('hello world');
    expect(calls).toBe(0);
    vm.msg = 'hi';
    waitForUpdate(() => {
      expect(child.localMsg).toBe('hello');
      expect(child.computedMsg).toBe('hi world');
      expect(calls).toBe(1);
    }).then(done);
  });

  it('this should be undefined', () => {
    const vm = new Vue({
      template: '<div></div>',
      setup() {
        expect(this).toBe(global);
      },
    }).$mount();
  });

  it('should not make returned non-reactive object reactive', done => {
    const vm = new Vue({
      setup() {
        return {
          form: {
            a: 1,
            b: 2,
          },
        };
      },
      template: '<div>{{ form.a }}, {{ form.b }}</div>',
    }).$mount();
    expect(vm.$el.textContent).toBe('1, 2');

    // should not trigger a re-render
    vm.form.a = 2;
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('1, 2');

      // should trigger a re-render
      vm.form = { a: 2, b: 3 };
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('2, 3');
      })
      .then(done);
  });

  it('current vue should exist in nested setup call', () => {
    const spy = jest.fn();
    new Vue({
      setup() {
        new Vue({
          setup() {
            spy(1);
          },
        });

        spy(2);
      },
    });
    expect(spy.mock.calls.length).toBe(2);
    expect(spy).toHaveBeenNthCalledWith(1, 1);
    expect(spy).toHaveBeenNthCalledWith(2, 2);
  });

  it('inline render function should receive proper params', () => {
    let p, c;
    const vm = new Vue({
      template: `<child msg="foo" a="1" b="2"></child>`,
      components: {
        child: {
          name: 'child',
          props: ['msg'],
          setup() {
            return (props, ctx) => {
              p = props;
              c = ctx;
              return null;
            };
          },
        },
      },
    }).$mount();
    expect(p).toEqual({
      msg: 'foo',
    });
    expect(c).toBeDefined();
    expect(c.root).toBe(vm);
    expect(c.attrs).toEqual({
      a: '1',
      b: '2',
    });
  });

  it('inline render function should work', done => {
    // let createElement;
    const vm = new Vue({
      props: ['msg'],
      template: '<div>1</div>',
      setup() {
        const count = ref(0);
        const increment = () => {
          count.value++;
        };

        return props =>
          h('div', [
            h('span', props.msg),
            h(
              'button',
              {
                on: {
                  click: increment,
                },
              },
              count.value
            ),
          ]);
      },
      propsData: {
        msg: 'foo',
      },
    }).$mount();
    expect(vm.$el.querySelector('span').textContent).toBe('foo');
    expect(vm.$el.querySelector('button').textContent).toBe('0');
    vm.$el.querySelector('button').click();
    waitForUpdate(() => {
      expect(vm.$el.querySelector('button').textContent).toBe('1');
      vm.msg = 'bar';
    })
      .then(() => {
        expect(vm.$el.querySelector('span').textContent).toBe('bar');
      })
      .then(done);
  });
});
