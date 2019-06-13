const Vue = require('vue/dist/vue.common.js');
const { plugin, state, value } = require('../../src');

Vue.use(plugin);

describe('Hooks value', () => {
  it('should proxy and be reactive', done => {
    const vm = new Vue({
      setup() {
        return {
          msg: value('foo'),
        };
      },
      template: '<div>{{ msg }}</div>',
    }).$mount();
    vm.msg = 'bar';
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('bar');
    }).then(done);
  });
});

describe('Hooks state', () => {
  it('should work', done => {
    const app = new Vue({
      setup() {
        return {
          state: state({
            count: 0,
          }),
        };
      },
      render(h) {
        return h('div', [
          h('span', this.state.count),
          h(
            'button',
            {
              on: {
                click: () => {
                  this.state.count++;
                },
              },
            },
            '+'
          ),
        ]);
      },
    }).$mount();

    expect(app.$el.querySelector('span').textContent).toBe('0');
    app.$el.querySelector('button').click();
    waitForUpdate(() => {
      expect(app.$el.querySelector('span').textContent).toBe('1');
    }).then(done);
  });
});
