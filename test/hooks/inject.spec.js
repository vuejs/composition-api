const Vue = require('vue/dist/vue.common.js');
const { plugin, inject, provide, value } = require('../../src');

Vue.use(plugin);

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
  it('should work', () => {
    new Vue({
      template: `<child/>`,
      setup() {
        provide({
          foo: 1,
          bar: false,
        });
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
    const app = new Vue({
      template: `<child/>`,
      setup() {
        provide({
          msg: value('hello'),
        });
      },
      components: {
        child: {
          template: `<div>{{ msg }}</div>`,
          setup() {
            console.log('ss', inject('msg'));
            return {
              msg: inject('msg'),
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
});
