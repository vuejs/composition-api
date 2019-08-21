const Vue = require('vue/dist/vue.common.js');
const { ref, reactive, watch } = require('../../src');

describe('api/watch', () => {
  let spy;
  beforeEach(() => {
    spy = jest.fn();
  });

  afterEach(() => {
    spy.mockReset();
  });

  it('should work', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, spy);
        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    vm.a = 3;
    expect(spy.mock.calls.length).toBe(1);
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(3, 1);
    }).then(done);
  });

  it('basic usage(value warpper)', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, spy, { flush: 'pre' });

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy.mock.calls.length).toBe(1);
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('basic usage(function)', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(() => a.value, spy);

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy.mock.calls.length).toBe(1);
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('multiple cbs (after option merge)', done => {
    const spy1 = jest.fn();
    const a = ref(1);
    const Test = Vue.extend({
      setup() {
        watch(a, spy1);
      },
    });
    new Test({
      setup() {
        watch(a, spy);
        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    a.value = 2;
    waitForUpdate(() => {
      expect(spy1).toHaveBeenLastCalledWith(2, 1);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('with option: lazy', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, spy, { lazy: true });

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy).not.toHaveBeenCalled();
    vm.a = 2;
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('with option: deep', done => {
    const vm = new Vue({
      setup() {
        const a = ref({ b: 1 });
        watch(a, spy, { lazy: true, deep: true });

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    const oldA = vm.a;
    expect(spy).not.toHaveBeenCalled();
    vm.a.b = 2;
    expect(spy).not.toHaveBeenCalled();
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(vm.a, vm.a);
      vm.a = { b: 3 };
    })
      .then(() => {
        expect(spy).toHaveBeenLastCalledWith(vm.a, oldA);
      })
      .then(done);
  });

  it('should flush after render', done => {
    let rerenderedText;
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal);
            rerenderedText = vm.$el.textContent;
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
    expect(spy).not.toHaveBeenCalled();
    vm.a = 2;
    waitForUpdate(() => {
      expect(rerenderedText).toBe('2');
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('should flush before render', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
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
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('should flush synchronously', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
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
    expect(spy).toHaveBeenLastCalledWith(2, 1);
    vm.a = 3;
    expect(spy).toHaveBeenLastCalledWith(3, 2);
    waitForUpdate(() => {
      expect(spy.mock.calls.length).toBe(2);
    }).then(done);
  });

  it('should support watching unicode paths', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, spy, { lazy: true });

        return {
          数据: a,
        };
      },
      render(h) {
        return h('div', this['数据']);
      },
    }).$mount();
    expect(spy).not.toHaveBeenCalled();
    vm['数据'] = 2;
    expect(spy).not.toHaveBeenCalled();
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('should allow to be triggered in setup', () => {
    new Vue({
      setup() {
        const count = ref(0);
        watch(count, spy, { flush: 'sync' });
        count.value++;
      },
    });
    expect(spy.mock.calls.length).toBe(2);
    expect(spy).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(spy).toHaveBeenNthCalledWith(2, 1, 0);
  });

  describe('autorun', () => {
    let renderedText;
    it('should work', done => {
      const vm = new Vue({
        setup() {
          const count = ref(0);
          watch(() => {
            spy(count.value);
            renderedText = vm.$el.textContent;
          });

          return {
            count,
          };
        },
        render(h) {
          return h('div', this.count);
        },
      }).$mount();
      expect(spy).not.toHaveBeenCalled();
      waitForUpdate(() => {
        expect(renderedText).toBe('0');
        expect(spy).toHaveBeenLastCalledWith(0);
        vm.count++;
      })
        .then(() => {
          expect(renderedText).toBe('1');
          expect(spy).toHaveBeenLastCalledWith(1);
        })
        .then(done);
    });

    it('autorun - sync', () => {
      const vm = new Vue({
        setup() {
          const count = ref(0);
          watch(
            () => {
              spy(count.value);
            },
            {
              flush: 'sync',
            }
          );

          return {
            count,
          };
        },
      });
      expect(spy).toHaveBeenLastCalledWith(0);
      vm.count++;
      expect(spy).toHaveBeenLastCalledWith(1);
    });
  });

  describe('Out of setup', () => {
    it('should work', done => {
      const obj = reactive({ a: 1 });
      watch(() => obj.a, spy);
      expect(spy).toHaveBeenLastCalledWith(1, undefined);
      obj.a = 2;
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith(2, 1);
      }).then(done);
    });
  });
});
