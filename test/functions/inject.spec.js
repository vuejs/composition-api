const Vue = require('vue/dist/vue.common.js');
const { inject, provide, value, reactive } = require('../../src');

let injected;
const injectedComp = {
  render() {},
  setup() {
    return {
      foo: inject('foo'),
      bar: inject('bar'),
    };
  },
  created() {
    injected = [this.foo, this.bar];
  },
};

beforeEach(() => {
  injected = null;
});

describe('Hooks provide/inject', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('should work', () => {
    new Vue({
      template: `<child/>`,
      setup() {
        const count = value(1);
        provide({
          foo: count,
        });
        provide('bar', false);
      },
      components: {
        child: {
          template: `<injected-comp/>`,
          components: {
            injectedComp,
          },
        },
      },
    }).$mount();

    expect(injected).toEqual([1, false]);
  });

  it('should work for reactive value', done => {
    const Msg = Symbol();
    const app = new Vue({
      template: `<child/>`,
      setup() {
        provide(Msg, value('hello'));
      },
      components: {
        child: {
          template: `<div>{{ msg }}</div>`,
          setup() {
            return {
              msg: inject(Msg),
            };
          },
        },
      },
    }).$mount();

    app.$children[0].msg = 'bar';
    waitForUpdate(() => {
      expect(app.$el.textContent).toBe('bar');
    }).then(done);
  });

  it('should return wrapper values', done => {
    const State = Symbol();
    let obj;
    const app = new Vue({
      template: `<child/>`,
      setup() {
        provide(State, reactive({ msg: 'foo' }));
      },
      components: {
        child: {
          template: `<div>{{ state.msg }}</div>`,
          setup() {
            obj = inject(State);
            return {
              state: obj,
            };
          },
        },
      },
    }).$mount();
    expect(obj.value.msg).toBe('foo');
    app.$children[0].state.msg = 'bar';
    waitForUpdate(() => {
      expect(app.$el.textContent).toBe('bar');
    }).then(done);
  });

  it('should warn when assign to a injected value', () => {
    const State = Symbol();
    let obj;
    new Vue({
      template: `<child/>`,
      setup() {
        provide(State, { msg: 'foo' });
      },
      components: {
        child: {
          setup() {
            obj = inject(State);
          },
          template: `<div/>`,
        },
      },
    }).$mount();
    expect(obj.value.msg).toBe('foo');
    obj.value = {};
    expect(warn.mock.calls[0][0]).toMatch("[Vue warn]: The injectd value can't be re-assigned");
  });
});
