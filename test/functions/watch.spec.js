const Vue = require('vue/dist/vue.common.js');
const { value, reactive, watch } = require('../../src');

describe('Hooks watch', () => {
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
        const a = value(1);
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
        const a = value(1);
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
        const a = value(1);
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
    const a = value(1);
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
        const a = value(1);
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
        const a = value({ b: 1 });
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
    let rerenderText;
    const vm = new Vue({
      setup() {
        const a = value(1);
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal);
            rerenderText = vm.$el.textContent;
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
      expect(rerenderText).toBe('2');
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
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
      expect(spy).toHaveBeenLastCalledWith(2, 1);
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
        const a = value(1);
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
        const count = value(0);
        watch(count, spy, { flush: 'sync' });
        count.value++;
      },
    });
    expect(spy.mock.calls.length).toBe(2);
    expect(spy).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(spy).toHaveBeenNthCalledWith(2, 1, 0);
  });

  describe('Multiple sources', () => {
    let obj1, obj2;
    it('do not store the intermediate state', done => {
      new Vue({
        setup() {
          obj1 = reactive({ a: 1 });
          obj2 = reactive({ a: 2 });
          watch([() => obj1.a, () => obj2.a], spy);
          return {
            obj1,
            obj2,
          };
        },
        template: `<div>{{obj1.a}} {{obj2.a}}</div>`,
      }).$mount();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith([1, 2], [undefined, undefined]);
      obj1.a = 2;
      obj2.a = 3;

      obj1.a = 3;
      obj2.a = 4;
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith([3, 4], [1, 2]);
        obj2.a = 5;
        obj2.a = 6;
      })
        .then(() => {
          expect(spy.mock.calls.length).toBe(3);
          expect(spy).toHaveBeenLastCalledWith([3, 6], [3, 4]);
        })
        .then(done);
    });

    it('basic usage(lazy=false, flush=none-sync)', done => {
      const vm = new Vue({
        setup() {
          const a = value(1);
          const b = value(1);
          watch([a, b], spy, { lazy: false, flush: 'post' });

          return {
            a,
            b,
          };
        },
        template: `<div>{{a}} {{b}}</div>`,
      }).$mount();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith([1, 1], [undefined, undefined]);
      vm.a = 2;
      expect(spy.mock.calls.length).toBe(1);
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
        vm.a = 3;
        vm.b = 3;
      })
        .then(() => {
          expect(spy.mock.calls.length).toBe(3);
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1]);
        })
        .then(done);
    });

    it('basic usage(lazy=true, flush=none-sync)', done => {
      const vm = new Vue({
        setup() {
          const a = value(1);
          const b = value(1);
          watch([a, b], spy, { lazy: true, flush: 'post' });

          return {
            a,
            b,
          };
        },
        template: `<div>{{a}} {{b}}</div>`,
      }).$mount();
      vm.a = 2;
      expect(spy).not.toHaveBeenCalled();
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
        vm.a = 3;
        vm.b = 3;
      })
        .then(() => {
          expect(spy.mock.calls.length).toBe(2);
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1]);
        })
        .then(done);
    });

    it('basic usage(lazy=false, flush=sync)', () => {
      const vm = new Vue({
        setup() {
          const a = value(1);
          const b = value(1);
          watch([a, b], spy, { lazy: false, flush: 'sync' });

          return {
            a,
            b,
          };
        },
      });
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith([1, 1], [undefined, undefined]);
      vm.a = 2;
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
      vm.a = 3;
      vm.b = 3;
      expect(spy.mock.calls.length).toBe(4);
      expect(spy).toHaveBeenNthCalledWith(3, [3, 1], [2, 1]);
      expect(spy).toHaveBeenNthCalledWith(4, [3, 3], [3, 1]);
    });

    it('basic usage(lazy=true, flush=sync)', () => {
      const vm = new Vue({
        setup() {
          const a = value(1);
          const b = value(1);
          watch([a, b], spy, { lazy: true, flush: 'sync' });

          return {
            a,
            b,
          };
        },
      });
      expect(spy).not.toHaveBeenCalled();
      vm.a = 2;
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
      vm.a = 3;
      vm.b = 3;
      expect(spy.mock.calls.length).toBe(3);
      expect(spy).toHaveBeenNthCalledWith(2, [3, 1], [2, 1]);
      expect(spy).toHaveBeenNthCalledWith(3, [3, 3], [3, 1]);
    });
  });

  describe('Out of setup', () => {
    it('basic', done => {
      const obj = reactive({ a: 1 });
      watch(() => obj.a, spy);
      expect(spy).toHaveBeenLastCalledWith(1, undefined);
      obj.a = 2;
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith(2, 1);
      }).then(done);
    });

    it('multiple sources', done => {
      const obj1 = reactive({ a: 1 });
      const obj2 = reactive({ a: 2 });
      watch([() => obj1.a, () => obj2.a], spy);
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenLastCalledWith([1, 2], [undefined, undefined]);
      obj1.a = 2;
      obj2.a = 3;
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith([2, 3], [1, 2]);
      }).then(done);
    });
  });
});
