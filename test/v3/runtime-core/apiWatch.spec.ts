import { watch, watchEffect, computed, reactive, ref, set } from '../../../src';
import { nextTick } from '../../helpers/utils';

// reference: https://vue-composition-api-rfc.netlify.com/api.html#watch

describe('api: watch', () => {
  const warnSpy = jest.spyOn(console, 'warn');

  beforeEach(() => {
    warnSpy.mockReset();
  });

  it('effect', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    watchEffect(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    state.count++;
    await nextTick();
    expect(dummy).toBe(1);
  });

  it('watching single source: getter', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount];
        // assert types
        count + 1;
        if (prevCount) {
          prevCount + 1;
        }
      }
    );
    state.count++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
  });

  it('watching single source: ref', async () => {
    const count = ref(0);
    let dummy;
    watch(count, (count, prevCount) => {
      dummy = [count, prevCount];
      // assert types
      count + 1;
      if (prevCount) {
        prevCount + 1;
      }
    });
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
  });

  it('watching single source: computed ref', async () => {
    const count = ref(0);
    const plus = computed(() => count.value + 1);
    let dummy;
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount];
      // assert types
      count + 1;
      if (prevCount) {
        prevCount + 1;
      }
    });
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([2, 1]);
  });

  it('watching primitive with deep: true', async () => {
    const count = ref(0);
    let dummy;
    watch(
      count,
      (c, prevCount) => {
        dummy = [c, prevCount];
      },
      {
        deep: true,
      }
    );
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([1, 0]);
  });

  it('watching multiple sources', async () => {
    const state = reactive({ count: 1 });
    const count = ref(1);
    const plus = computed(() => count.value + 1);

    let dummy;
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals];
      // assert types
      vals.concat(1);
      oldVals.concat(1);
    });

    state.count++;
    count.value++;
    await nextTick();
    expect(dummy).toMatchObject([[2, 2, 3], [1, 1, 2]]);
  });

  it('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 });
    const status = ref(false);

    let dummy;
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals];
      const [count] = vals;
      const [, oldStatus] = oldVals;
      // assert types
      count + 1;
      oldStatus === true;
    });

    state.count++;
    status.value = true;
    await nextTick();
    expect(dummy).toMatchObject([[2, true], [1, false]]);
  });

  it('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    const stop = watchEffect(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    stop();
    state.count++;
    await nextTick();
    // should not update
    expect(dummy).toBe(0);
  });

  it('stopping the watcher (with source)', async () => {
    const state = reactive({ count: 0 });
    let dummy;
    const stop = watch(
      () => state.count,
      count => {
        dummy = count;
      }
    );

    state.count++;
    await nextTick();
    expect(dummy).toBe(1);

    stop();
    state.count++;
    await nextTick();
    // should not update
    expect(dummy).toBe(1);
  });

  it('cleanup registration (effect)', async () => {
    const state = reactive({ count: 0 });
    const cleanup = jest.fn();
    let dummy;
    const stop = watchEffect(onCleanup => {
      onCleanup(cleanup);
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    state.count++;
    await nextTick();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);

    stop();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('cleanup registration (with source)', async () => {
    const count = ref(0);
    const cleanup = jest.fn();
    let dummy;
    const stop = watch(count, (count, prevCount, onCleanup) => {
      onCleanup(cleanup);
      dummy = count;
    });

    count.value++;
    await nextTick();
    expect(cleanup).toHaveBeenCalledTimes(0);
    expect(dummy).toBe(1);

    count.value++;
    await nextTick();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(2);

    stop();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('deep', async () => {
    const state = reactive({
      nested: {
        count: ref(0),
      },
      array: [1, 2, 3],
      map: new Map([['a', 1], ['b', 2]]),
      set: new Set([1, 2, 3]),
    });

    let dummy;
    watch(
      () => state,
      state => {
        dummy = [state.nested.count, state.array[0], state.map.get('a'), state.set.has(1)];
      },
      { deep: true }
    );

    state.nested.count++;
    await nextTick();
    expect(dummy).toEqual([1, 1, 1, true]);

    // nested array mutation
    set(state.array, '0', 2);
    await nextTick();
    expect(dummy).toEqual([1, 2, 1, true]);

    // NOT supported by Vue.observe :(
    // // nested map mutation
    // state.map.set('a', 2);
    // await nextTick();
    // expect(dummy).toEqual([1, 2, 2, true]);

    // // nested set mutation
    // state.set.delete(1);
    // await nextTick();
    // expect(dummy).toEqual([1, 2, 2, false]);
  });

  it('immediate', async () => {
    const count = ref(0);
    const cb = jest.fn();
    watch(count, cb, { immediate: true });
    expect(cb).toHaveBeenCalledTimes(1);
    count.value++;
    await nextTick();
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('immediate: triggers when initial value is null', async () => {
    const state = ref(null);
    const spy = jest.fn();
    watch(() => state.value, spy, { immediate: true });
    expect(spy).toHaveBeenCalled();
  });

  it('immediate: triggers when initial value is undefined', async () => {
    const state = ref();
    const spy = jest.fn();
    watch(() => state.value, spy, { immediate: true });
    expect(spy).toHaveBeenCalled();
    state.value = 3;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    // testing if undefined can trigger the watcher
    state.value = undefined;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
    // it shouldn't trigger if the same value is set
    state.value = undefined;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  // it('warn immediate option when using effect', async () => {
  //   const count = ref(0);
  //   let dummy;
  //   watchEffect(
  //     () => {
  //       dummy = count.value;
  //     },
  //     // @ts-ignore
  //     { immediate: false }
  //   );
  //   expect(dummy).toBe(0);
  //   expect(warnSpy).toHaveBeenCalledWith(`"immediate" option is only respected`);

  //   count.value++;
  //   await nextTick();
  //   expect(dummy).toBe(1);
  // });

  // it('warn and not respect deep option when using effect', async () => {
  //   const arr = ref([1, [2]]);
  //   const spy = jest.fn();
  //   watchEffect(
  //     () => {
  //       spy();
  //       return arr;
  //     },
  //     // @ts-ignore
  //     { deep: true }
  //   );
  //   expect(spy).toHaveBeenCalledTimes(1);
  //   (arr.value[1] as Array<number>)[0] = 3;
  //   await nextTick();
  //   expect(spy).toHaveBeenCalledTimes(1);
  //   expect(warnSpy).toHaveBeenCalledWith(`"deep" option is only respected`);
  // });
});
