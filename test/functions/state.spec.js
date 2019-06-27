const Vue = require('vue/dist/vue.common.js');
const { plugin, state, value } = require('../../src');

Vue.use(plugin);

describe('Hooks value', () => {
  it('should proxy and be reactive', done => {
    const vm = new Vue({
      setup() {
        return {
          name: value(null),
          msg: value('foo'),
        };
      },
      template: '<div>{{name}}, {{ msg }}</div>',
    }).$mount();
    vm.name = 'foo';
    vm.msg = 'bar';
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('foo, bar');
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

  it.only('should be unwrapping(nested property inside a reactive object)', () => {
    new Vue({
      setup() {
        const count = value(0);
        const count1 = value(0);
        const obj = state({
          count,
          a: {
            b: count1,
            c: 0,
          },
        });

        expect(obj.count).toBe(0);
        expect(obj.a.b).toBe(0);
        expect(obj.a.c).toBe(0);

        obj.count++;
        expect(obj.count).toBe(1);
        expect(count.value).toBe(1);
        expect(count1.value).toBe(0);

        count.value++;
        count1.value++;
        obj.a.b++;
        obj.a.c = 3;
        expect(obj.count).toBe(2);
        expect(count1.value).toBe(2);
        expect(obj.a.b).toBe(2);
        expect(obj.a.c).toBe(3);
      },
    });
  });
});
