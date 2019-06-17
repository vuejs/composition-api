const Vue = require('vue/dist/vue.common.js');
const { plugin, value, state, watch } = require('../../src');

Vue.use(plugin);

describe('Hooks watch', () => {
  let spy;
  beforeEach(() => {
    spy = jest.fn();
  });

  afterEach(() => {
    spy.mockReset();
  });

  it('basic usage(value warpper)', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(a, spy, { flush: 'pre' });

        return {
          a,
        };
      },
    });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy.mock.calls.length).toBe(1);
    waitForWatcherFlush(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('basic usage(function)', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(() => a.value, spy);

        return {
          a,
        };
      },
    });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy.mock.calls.length).toBe(1);
    waitForWatcherFlush(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('basic usage(multiple sources)', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        const b = value(1);
        watch([a, b], spy);

        return {
          a,
          b,
        };
      },
    });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith([1, 1], [undefined, undefined]);
    vm.a = 2;
    expect(spy.mock.calls.length).toBe(1);
    waitForWatcherFlush(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, undefined]);
      vm.a = 3;
      vm.b = 3;
    })
      .then(() => {
        expect(spy.mock.calls.length).toBe(3);
        expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1]);
      })
      .then(done);
  });

  it('multiple cbs (after option merge)', done => {
    const spy1 = jest.fn();
    const obj = state({ a: 1 });
    const Test = Vue.extend({
      setup() {
        watch(() => obj.a, spy1);
      },
    });
    new Test({
      setup() {
        watch(() => obj.a, spy);
      },
    });
    obj.a = 2;
    waitForWatcherFlush(() => {
      expect(spy1).toHaveBeenCalledWith(2, 1);
      expect(spy).toHaveBeenCalledWith(2, 1);
    }).then(done);
  });

  it('with option: lazy', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(a, spy, { lazy: true });

        return {
          a,
        };
      },
    });
    expect(spy).not.toHaveBeenCalled();
    vm.a = 2;
    waitForWatcherFlush(() => {
      expect(spy).toHaveBeenCalledWith(2, 1);
    }).then(done);
  });

  it('with option: deep', done => {
    const vm = new Vue({
      setup() {
        const a = value({ b: 1 });
        watch(a, spy, { lazy: true, deep: true });

        return {
          a,
        };
      },
    });
    const oldA = vm.a;
    expect(spy).not.toHaveBeenCalled();
    vm.a.b = 2;
    expect(spy).not.toHaveBeenCalled();
    waitForWatcherFlush(() => {
      expect(spy).toHaveBeenCalledWith(vm.a, vm.a);
      vm.a = { b: 3 };
    })
      .then(() => {
        expect(spy).toHaveBeenCalledWith(vm.a, oldA);
      })
      .then(done);
  });

  it('should flush after render', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal);
            expect(vm.$el.textContent).toBe('2');
          },
          { lazy: true }
        );
        return {
          a,
        };
      },
      render(h) {
        return h('div', this.a);
      },
    }).$mount();
    vm.a = 2;
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenCalledWith(2, 1);
    }).then(done);
  });

  it('should flush before render', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal);
            expect(vm.$el.textContent).toBe('1');
          },
          { lazy: true, flush: 'pre' }
        );
        return {
          a,
        };
      },
      render(h) {
        return h('div', this.a);
      },
    }).$mount();
    vm.a = 2;
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenCalledWith(2, 1);
    }).then(done);
  });

  it('should flush synchronously', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(a, spy, { lazy: true, flush: 'sync' });
        return {
          a,
        };
      },
      render(h) {
        return h('div', this.a);
      },
    }).$mount();
    expect(spy).not.toHaveBeenCalled();
    vm.a = 2;
    expect(spy).toHaveBeenCalledWith(2, 1);
    vm.a = 3;
    expect(spy).toHaveBeenCalledWith(3, 2);
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
    }).then(done);
  });

  it('should support watching unicode paths', done => {
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(a, spy, { lazy: true });

        return {
          数据: a,
        };
      },
    });
    expect(spy).not.toHaveBeenCalled();
    vm['数据'] = 2;
    expect(spy).not.toHaveBeenCalled();
    waitForWatcherFlush(() => {
      expect(spy).toHaveBeenCalledWith(2, 1);
    }).then(done);
  });
});
