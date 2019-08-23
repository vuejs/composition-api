const Vue = require('vue/dist/vue.common.js');
const { ref, reactive, watch } = require('../../src');

describe('api/watch', () => {
  const anyFn = expect.any(Function);
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
    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined, anyFn);
    vm.a = 2;
    vm.a = 3;
    expect(spy).toBeCalledTimes(1);
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(3, 1, anyFn);
    }).then(done);
  });

  it('basic usage(value wrapper)', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, (n, o) => spy(n, o), { flush: 'pre' });

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy).toBeCalledTimes(1);
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('basic usage(function)', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(() => a.value, (n, o) => spy(n, o));

        return {
          a,
        };
      },
      template: `<div>{{a}}</div>`,
    }).$mount();
    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(1, undefined);
    vm.a = 2;
    expect(spy).toBeCalledTimes(1);
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('multiple cbs (after option merge)', done => {
    const spy1 = jest.fn();
    const a = ref(1);
    const Test = Vue.extend({
      setup() {
        watch(a, (n, o) => spy1(n, o));
      },
    });
    new Test({
      setup() {
        watch(a, (n, o) => spy(n, o));
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
        watch(a, (n, o) => spy(n, o), { lazy: true });

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
        watch(a, (n, o) => spy(n, o), { lazy: true, deep: true });

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
      expect(spy).toBeCalledTimes(1);
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
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(2, 1);
    }).then(done);
  });

  it('should flush synchronously', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, (n, o) => spy(n, o), { lazy: true, flush: 'sync' });
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
      expect(spy).toBeCalledTimes(2);
    }).then(done);
  });

  it('should support watching unicode paths', done => {
    const vm = new Vue({
      setup() {
        const a = ref(1);
        watch(a, (n, o) => spy(n, o), { lazy: true });

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
        watch(count, (n, o) => spy(n, o), { flush: 'sync' });
        count.value++;
      },
    });
    expect(spy).toBeCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(spy).toHaveBeenNthCalledWith(2, 1, 0);
  });

  describe('simple effect', () => {
    let renderedText;
    it('should work', done => {
      let onCleanup;
      const vm = new Vue({
        setup() {
          const count = ref(0);
          watch(_onCleanup => {
            onCleanup = _onCleanup;
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
        expect(onCleanup).toEqual(anyFn);
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

    it('sync=true', () => {
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

  describe('Multiple sources', () => {
    let obj1, obj2;
    it('do not store the intermediate state', done => {
      new Vue({
        setup() {
          obj1 = reactive({ a: 1 });
          obj2 = reactive({ a: 2 });
          watch([() => obj1.a, () => obj2.a], (n, o) => spy(n, o));
          return {
            obj1,
            obj2,
          };
        },
        template: `<div>{{obj1.a}} {{obj2.a}}</div>`,
      }).$mount();
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith([1, 2], undefined);
      obj1.a = 2;
      obj2.a = 3;

      obj1.a = 3;
      obj2.a = 4;
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2);
        expect(spy).toHaveBeenLastCalledWith([3, 4], [1, 2]);
        obj2.a = 5;
        obj2.a = 6;
      })
        .then(() => {
          expect(spy).toBeCalledTimes(3);
          expect(spy).toHaveBeenLastCalledWith([3, 6], [3, 4]);
        })
        .then(done);
    });

    it('basic usage(lazy=false, flush=none-sync)', done => {
      const vm = new Vue({
        setup() {
          const a = ref(1);
          const b = ref(1);
          watch([a, b], (n, o) => spy(n, o), { lazy: false, flush: 'post' });

          return {
            a,
            b,
          };
        },
        template: `<div>{{a}} {{b}}</div>`,
      }).$mount();
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith([1, 1], undefined);
      vm.a = 2;
      expect(spy).toBeCalledTimes(1);
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2);
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
        vm.a = 3;
        vm.b = 3;
      })
        .then(() => {
          expect(spy).toBeCalledTimes(3);
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1]);
        })
        .then(done);
    });

    it('basic usage(lazy=true, flush=none-sync)', done => {
      const vm = new Vue({
        setup() {
          const a = ref(1);
          const b = ref(1);
          watch([a, b], (n, o) => spy(n, o), { lazy: true, flush: 'post' });

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
        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
        vm.a = 3;
        vm.b = 3;
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2);
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1]);
        })
        .then(done);
    });

    it('basic usage(lazy=false, flush=sync)', () => {
      const vm = new Vue({
        setup() {
          const a = ref(1);
          const b = ref(1);
          watch([a, b], (n, o) => spy(n, o), { lazy: false, flush: 'sync' });

          return {
            a,
            b,
          };
        },
      });
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith([1, 1], undefined);
      vm.a = 2;
      expect(spy).toBeCalledTimes(2);
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
          const a = ref(1);
          const b = ref(1);
          watch([a, b], (n, o) => spy(n, o), { lazy: true, flush: 'sync' });

          return {
            a,
            b,
          };
        },
      });
      expect(spy).not.toHaveBeenCalled();
      vm.a = 2;
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1]);
      vm.a = 3;
      vm.b = 3;
      expect(spy).toBeCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(2, [3, 1], [2, 1]);
      expect(spy).toHaveBeenNthCalledWith(3, [3, 3], [3, 1]);
    });
  });

  describe('Out of setup', () => {
    it('should work', done => {
      const obj = reactive({ a: 1 });
      watch(() => obj.a, (n, o) => spy(n, o));
      expect(spy).toHaveBeenLastCalledWith(1, undefined);
      obj.a = 2;
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2);
        expect(spy).toHaveBeenLastCalledWith(2, 1);
      }).then(done);
    });

    it('simple effect', done => {
      const obj = reactive({ a: 1 });
      watch(() => spy(obj.a));
      expect(spy).not.toHaveBeenCalled();
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith(1);
        obj.a = 2;
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2);
          expect(spy).toHaveBeenLastCalledWith(2);
        })
        .then(done);
    });
  });

  describe('cleanup', () => {
    function getAsyncValue(val) {
      let handle;
      let resolve;
      const p = new Promise(_resolve => {
        resolve = _resolve;
        handle = setTimeout(() => {
          resolve(val);
        }, 0);
      });

      p.cancel = () => {
        clearTimeout(handle);
        resolve('canceled');
      };
      return p;
    }

    it('work with a single getter', done => {
      const id = ref(1);
      const promises = [];
      watch(onCleanup => {
        const val = getAsyncValue(id.value);
        promises.push(val);
        onCleanup(() => {
          val.cancel();
        });
      });
      waitForUpdate(() => {
        id.value = 2;
      })
        .thenWaitFor(async next => {
          const values = await Promise.all(promises);
          expect(values).toEqual(['canceled', 2]);
          next();
        })
        .then(done);
    });

    it('should not collect reactive in onCleanup', done => {
      const ref1 = ref(1);
      const ref2 = ref(1);
      watch(onCleanup => {
        spy(ref1.value);
        onCleanup(() => {
          ref2.value = ref2.value + 1;
        });
      });
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith(1);
        ref1.value++;
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2);
          expect(spy).toHaveBeenLastCalledWith(2);
          ref2.value = 10;
        })
        .then(() => {
          expect(spy).toBeCalledTimes(2);
        })
        .then(done);
    });

    it('work with callback ', done => {
      const id = ref(1);
      const promises = [];
      watch(id, (newVal, oldVal, onCleanup) => {
        const val = getAsyncValue(newVal);
        promises.push(val);
        onCleanup(() => {
          val.cancel();
        });
      });
      id.value = 2;
      waitForUpdate()
        .thenWaitFor(async next => {
          const values = await Promise.all(promises);
          expect(values).toEqual(['canceled', 2]);
          next();
        })
        .then(done);
    });
  });
});
