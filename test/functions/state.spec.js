const Vue = require('vue/dist/vue.common.js');
const { plugin, state, value, watch } = require('../../src');

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
        return h('div', [h('span', this.state.count)]);
      },
    }).$mount();

    expect(app.$el.querySelector('span').textContent).toBe('0');
    app.state.count++;
    waitForUpdate(() => {
      expect(app.$el.querySelector('span').textContent).toBe('1');
    }).then(done);
  });
});

describe('reactivity/value', () => {
  it('should hold a value', () => {
    const a = value(1);
    expect(a.value).toBe(1);
    a.value = 2;
    expect(a.value).toBe(2);
  });

  it('should be reactive', () => {
    const a = value(1);
    let dummy;
    watch(a, () => {
      dummy = a.value;
    });
    expect(dummy).toBe(1);
    a.value = 2;
    expect(dummy).toBe(2);
  });

  it('should make nested properties reactive', () => {
    const a = value({
      count: 1,
    });
    let dummy;
    watch(
      a,
      () => {
        dummy = a.value.count;
      },
      { deep: true }
    );
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it('should work like a normal property when nested in an observable(1)', () => {
    const a = value(1);
    const obj = state({
      a,
      b: {
        c: a,
        d: [a],
      },
    });
    let dummy1;
    let dummy2;
    let dummy3;
    watch(
      () => obj,
      () => {
        dummy1 = obj.a;
        dummy2 = obj.b.c;
        dummy3 = obj.b.d[0];
      },
      { deep: true }
    );
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
    expect(dummy3).toBe(1);
    a.value++;
    expect(dummy1).toBe(2);
    expect(dummy2).toBe(2);
    expect(dummy3).toBe(2);
    obj.a++;
    expect(dummy1).toBe(3);
    expect(dummy2).toBe(3);
    expect(dummy3).toBe(3);
  });

  it('should work like a normal property when nested in an observable(2)', () => {
    const count = value(1);
    const count1 = value(1);
    const obj = state({
      a: count,
      b: {
        c: 1,
        d: [count1],
      },
    });

    // let dummy1;
    let dummy2;
    // let dummy3;
    watch(
      () => obj,
      () => {
        dummy1 = obj.a;
        dummy2 = obj.b.c;
        dummy3 = obj.b.d[0];
      },
      { deep: true }
    );
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
    expect(dummy3).toBe(1);
    expect(obj.a).toBe(1);
    expect(obj.b.c).toBe(1);
    expect(obj.b.d[0]).toBe(1);

    obj.a++;
    expect(dummy1).toBe(2);
    expect(dummy2).toBe(1);
    expect(dummy3).toBe(1);
    expect(obj.a).toBe(2);
    expect(count.value).toBe(2);
    expect(count1.value).toBe(1);

    count.value++;
    count1.value++;
    obj.b.d[0]++;
    obj.b.c = 3;
    expect(dummy1).toBe(3);
    expect(dummy2).toBe(3);
    expect(dummy3).toBe(3);
    expect(obj.a).toBe(3);
    expect(count1.value).toBe(3);
    expect(obj.b.c).toBe(3);
    expect(obj.b.d[0]).toBe(3);

    const wrapperC = value(1);
    obj.b.c = wrapperC;
    expect(dummy2).toBe(1);
    expect(obj.b.c).toBe(1);

    obj.b.c++;
    expect(dummy2).toBe(2);
    expect(wrapperC.value).toBe(2);
    expect(obj.b.c).toBe(2);
  });
});
