const Vue = require('vue/dist/vue.common.js');
const { plugin, value, computed } = require('../../src');

Vue.use(plugin);

describe('Hooks computed', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('basic usage', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      setup() {
        const a = value(1);
        const b = computed(() => a.value + 1);
        return {
          a,
          b,
        };
      },
    }).$mount();
    expect(vm.b).toBe(2);
    expect(vm.$el.textContent).toBe('2');
    vm.a = 2;
    expect(vm.b).toBe(3);
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3');
    }).then(done);
  });

  it('with setter', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      setup() {
        const a = value(1);
        const b = computed(() => a.value + 1, v => (a.value = v - 1));
        return {
          a,
          b,
        };
      },
    }).$mount();
    expect(vm.b).toBe(2);
    expect(vm.$el.textContent).toBe('2');
    vm.a = 2;
    expect(vm.b).toBe(3);
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3');
      vm.b = 1;
      expect(vm.a).toBe(0);
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('1');
      })
      .then(done);
  });

  it('warn assigning to computed with no setter', () => {
    const vm = new Vue({
      setup() {
        const b = computed(() => 1);
        return {
          b,
        };
      },
    });
    vm.b = 2;
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: Computed property "b" was assigned to but it has no setter.'
    );
  });

  it('watching computed', done => {
    const spy = jest.fn();
    const vm = new Vue({
      setup() {
        const a = value(1);
        const b = computed(() => a.value + 1);
        return {
          a,
          b,
        };
      },
    });
    vm.$watch('b', spy);
    vm.a = 2;
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(3, 2);
    }).then(done);
  });

  it('caching', () => {
    const spy = jest.fn();
    const vm = new Vue({
      setup() {
        const a = value(1);
        const b = computed(() => {
          spy();
          return a.value + 1;
        });
        return {
          a,
          b,
        };
      },
    });
    expect(spy.mock.calls.length).toBe(0);
    vm.b;
    expect(spy.mock.calls.length).toBe(1);
    vm.b;
    expect(spy.mock.calls.length).toBe(1);
  });

  it('as component', done => {
    const Comp = Vue.extend({
      template: `<div>{{ b }} {{ c }}</div>`,
      setup() {
        const a = value(1);
        const b = computed(() => {
          return a.value + 1;
        });
        return {
          a,
          b,
        };
      },
    });

    const vm = new Comp({
      setup() {
        const c = computed(() => {
          return this.b + 1;
        });

        return {
          c,
        };
      },
    }).$mount();
    expect(vm.b).toBe(2);
    expect(vm.c).toBe(3);
    expect(vm.$el.textContent).toBe('2 3');
    vm.a = 2;
    expect(vm.b).toBe(3);
    expect(vm.c).toBe(4);
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3 4');
    }).then(done);
  });

  it('rethrow computed error', () => {
    const vm = new Vue({
      setup() {
        const a = computed(() => {
          throw new Error('rethrow');
        });

        return {
          a,
        };
      },
    });
    expect(() => vm.a).toThrowError('rethrow');
  });
});
