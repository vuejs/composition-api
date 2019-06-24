const Vue = require('vue/dist/vue.common.js');
const { plugin, value } = require('../src');

Vue.use(plugin);

describe('setup', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('warn for exist property(data)', () => {
    new Vue({
      data() {
        return {
          a: 1,
        };
      },
      setup() {
        const a = value();
        return {
          a,
        };
      },
    });
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a data.'
    );
  });

  it('warn for exist property(prop)', () => {
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

  it('warn for exist property(method)', () => {
    new Vue({
      methods: {
        a() {},
      },
      setup() {
        const a = value();
        return {
          a,
        };
      },
    });
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a method.'
    );
  });

  it('warn for exist property(computed)', () => {
    new Vue({
      computed: {
        a() {},
      },
      setup() {
        const a = value();
        return {
          a,
        };
      },
    });
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a computed.'
    );
  });

  it('warn for exist property', () => {
    new Vue({
      setup() {
        this.a = 1;
        const a = value();
        return {
          a,
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
            return { localMsg: props.msg };
          },
          computed: {
            computedMsg() {
              return this.msg + ' world';
            },
          },
        },
      },
    }).$mount();
    const child = vm.$children[0];
    vm.msg = 'hi';
    waitForUpdate(() => {
      expect(child.localMsg).toBe('hello');
      expect(child.computedMsg).toBe('hi world');
      expect(calls).toBe(1);
    }).then(done);
  });

  it('this should be bind to vm', () => {
    const vm = new Vue({
      template: '<div><child></child></div>',
      provide: { foo: 1 },
      components: {
        child: {
          template: '<span>{{bar}}</span>',
          inject: ['foo'],
          setup() {
            return { bar: 'foo:' + this.foo };
          },
        },
      },
    }).$mount();
    expect(vm.$el.innerHTML).toBe('<span>foo:1</span>');
  });

  it('this should be bind to vm when merged', () => {
    const superComponent = {
      setup() {
        return { ext: 'ext:' + this.foo };
      },
    };
    const mixins = [
      {
        setup() {
          return { mixin1: 'm1:' + this.foo };
        },
      },
      {
        setup() {
          return { mixin2: 'm2:' + this.foo };
        },
      },
    ];
    const vm = new Vue({
      template: '<div><child></child></div>',
      provide: { foo: 1 },
      components: {
        child: {
          extends: superComponent,
          mixins,
          template: '<span>{{bar}}-{{ext}}-{{mixin1}}-{{mixin2}}</span>',
          inject: ['foo'],
          setup() {
            return { bar: 'foo:' + this.foo };
          },
        },
      },
    }).$mount();
    expect(vm.$el.innerHTML).toBe('<span>foo:1-ext:1-m1:1-m2:1</span>');
  });
});
