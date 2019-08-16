const Vue = require('vue/dist/vue.common.js');
const { reactive, ref, watch, set, toRefs } = require('../../src');

describe('ref', () => {
  it('should work with array', () => {
    let arr;
    new Vue({
      setup() {
        arr = ref([2]);
        arr.value.push(3);
        arr.value.unshift(1);
      },
    });
    expect(arr.value).toEqual([1, 2, 3]);
  });

  it('should hold a value', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
    a.value = 2;
    expect(a.value).toBe(2);
  });

  it('should be reactive', done => {
    const a = ref(1);
    let dummy;
    watch(a, () => {
      dummy = a.value;
    });
    expect(dummy).toBe(1);
    a.value = 2;
    waitForUpdate(() => {
      expect(dummy).toBe(2);
    }).then(done);
  });

  it('should make nested properties reactive', done => {
    const a = ref({
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
    waitForUpdate(() => {
      expect(dummy).toBe(2);
    }).then(done);
  });
});

describe('reactive', () => {
  it('should work', done => {
    const app = new Vue({
      setup() {
        return {
          state: reactive({
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

describe('unwrapping', () => {
  it('should work', () => {
    const obj = reactive({
      a: ref(0),
    });
    const objWrapper = ref(obj);
    let dummy;
    watch(
      () => obj,
      () => {
        dummy = obj.a;
      },
      { deep: true, flush: 'sync' }
    );
    expect(dummy).toBe(0);
    expect(obj.a).toBe(0);
    expect(objWrapper.value.a).toBe(0);
    obj.a++;
    expect(dummy).toBe(1);
    objWrapper.value.a++;
    expect(dummy).toBe(2);
  });

  it('should work like a normal property when nested in an observable(same ref)', () => {
    const a = ref(1);
    const obj = reactive({
      a,
      b: {
        c: a,
      },
    });
    let dummy1;
    let dummy2;
    watch(
      () => obj,
      () => {
        dummy1 = obj.a;
        dummy2 = obj.b.c;
      },
      { deep: true, flush: 'sync' }
    );
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
    a.value++;
    expect(dummy1).toBe(2);
    expect(dummy2).toBe(2);
    obj.a++;
    expect(dummy1).toBe(3);
    expect(dummy2).toBe(3);
  });

  it('should work like a normal property when nested in an observable(different ref)', () => {
    const count = ref(1);
    const count1 = ref(1);
    const obj = reactive({
      a: count,
      b: {
        c: count1,
      },
    });

    let dummy1;
    let dummy2;
    watch(
      () => obj,
      () => {
        dummy1 = obj.a;
        dummy2 = obj.b.c;
      },
      { deep: true, flush: 'sync' }
    );
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
    expect(obj.a).toBe(1);
    expect(obj.b.c).toBe(1);
    obj.a++;
    expect(dummy1).toBe(2);
    expect(dummy2).toBe(1);
    expect(count.value).toBe(2);
    expect(count1.value).toBe(1);
    count.value++;
    expect(dummy1).toBe(3);
    expect(count.value).toBe(3);
    count1.value++;
    expect(dummy2).toBe(2);
    expect(count1.value).toBe(2);
  });

  it('should work like a normal property when nested in an observable(wrapper overwrite)', () => {
    const obj = reactive({
      a: {
        b: 1,
      },
    });

    let dummy;
    watch(
      () => obj,
      () => {
        dummy = obj.a.b;
      },
      { deep: true, lazy: true, flush: 'sync' }
    );
    expect(dummy).toBeUndefined();
    const wrapperC = ref(2);
    obj.a.b = wrapperC;
    expect(dummy).toBe(2);
    obj.a.b++;
    expect(dummy).toBe(3);
  });

  it('should work like a normal property when nested in an observable(new property of object)', () => {
    const count = ref(1);
    const obj = reactive({
      a: {},
      b: [],
    });
    let dummy;
    watch(
      () => obj,
      () => {
        dummy = obj.a.foo;
      },
      { deep: true, flush: 'sync' }
    );
    expect(dummy).toBe(undefined);
    set(obj.a, 'foo', count);
    expect(dummy).toBe(1);
    count.value++;
    expect(dummy).toBe(2);
    obj.a.foo++;
    expect(dummy).toBe(3);
  });
});

describe('toRefs', () => {
  it('should work', () => {
    const state = reactive({
      foo: 1,
      bar: 2,
    });

    const stateAsRefs = toRefs(state);
    expect(stateAsRefs.foo.value).toBe(1);
    expect(stateAsRefs.bar.value).toBe(2);
    state.foo++;
    expect(stateAsRefs.foo.value).toBe(2);

    stateAsRefs.foo.value++;
    expect(state.foo).toBe(3);
  });
});
