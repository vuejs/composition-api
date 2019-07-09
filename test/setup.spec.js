const Vue = require('vue/dist/vue.common.js');
const { plugin, value, computed } = require('../src');

Vue.use(plugin);

describe('setup', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('should be called before `methods` gets resolved(no methods option)', () => {
    const vm = new Vue({
      setup() {
        return {
          a: value(1),
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

  it('should be called before `methods` gets resolved(empty methods option)', () => {
    const vm = new Vue({
      setup() {
        return {
          a: value(1),
        };
      },
      data() {
        return {
          b: this.a,
        };
      },
      methods: {},
    }).$mount();
    expect(vm.a).toBe(1);
    expect(vm.b).toBe(1);
  });

  it('should be called before `methods` gets resolved(multiple methods)', () => {
    const vm = new Vue({
      setup() {
        return {
          a: value(0),
        };
      },
      created() {
        this.m1();
        this.m2();
        this.m3();
      },
      methods: {
        m1() {
          this.a++;
        },
        m2() {
          this.a++;
        },
        m3() {
          this.a++;
        },
      },
    }).$mount();
    expect(vm.a).toBe(3);
  });

  it('should work with `methods` and `data` options', done => {
    let calls = 0;
    const vm = new Vue({
      template: `<div>{{a}}{{b}}{{c}}</div>`,
      setup() {
        return {
          a: value(1),
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

  it('should reveive props as first params', () => {
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

  it('should reveive context second params', done => {
    new Vue({
      setup(_, ctx) {
        expect(ctx).toBeDefined();
        expect('parent' in ctx).toBe(true);
        expect(ctx).toEqual(
          expect.objectContaining({
            root: expect.any(Object),
            refs: expect.any(Object),
            slots: expect.any(Object),
            attrs: expect.any(Object),
            emit: expect.any(Function),
          })
        );
        done();
      },
    });
  });

  it('warn for existing props', () => {
    new Vue({
      props: {
        a: {},
      },
      setup() {
        const a = value();
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
          a: value(),
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
        return { msg: value('hello') };
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

  it('should make returned plain value reactive (value)', done => {
    const vm = new Vue({
      setup() {
        return {
          name: null,
          nested: {
            object: {
              msg: 'foo',
            },
          },
        };
      },
      template: '<div>{{ name }}, {{ nested.object.msg }}</div>',
    }).$mount();
    expect(vm.$el.textContent).toBe(', foo');
    vm.name = 'foo';
    vm.nested.object.msg = 'bar';
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('foo, bar');
    }).then(done);
  });

  it('should make returned plain value reactive (object)', done => {
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
    vm.form = { a: 2, b: 3 };
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('2, 3');
    }).then(done);
  });
});
