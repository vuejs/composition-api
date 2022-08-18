import { del, reactive, ref, watch, set, watchEffect } from '../../../src'

// Vue.delete workaround for triggering view updates on object property/array index deletion
describe('reactivity/del', () => {
  it('should not trigger reactivity on native object member deletion', () => {
    const obj = reactive<{ a?: object }>({
      a: {},
    })
    const spy = vi.fn()
    watch(obj, spy, { deep: true, flush: 'sync' })
    delete obj.a // Vue 2 limitation
    expect(spy).not.toHaveBeenCalled()
    expect(obj).toStrictEqual({})
  })

  it('should trigger reactivity when using del on reactive object', () => {
    const obj = reactive<{ a?: object }>({
      a: {},
    })
    const spy = vi.fn()
    watch(obj, spy, { deep: true, flush: 'sync' })
    del(obj, 'a')
    expect(spy).toBeCalledTimes(1)
    expect(obj).toStrictEqual({})
  })

  it('should not remove element on array index and should not trigger reactivity', () => {
    const arr = ref([1, 2, 3])
    const spy = vi.fn()
    watch(arr, spy, { flush: 'sync' })
    delete arr.value[1] // Vue 2 limitation; workaround with .splice()
    expect(spy).not.toHaveBeenCalled()
    expect(arr.value).toEqual([1, undefined, 3])
  })

  it('should trigger reactivity when using del on array', () => {
    const arr = ref([1, 2, 3])
    const spy = vi.fn()
    watch(arr, spy, { flush: 'sync' })
    del(arr.value, 1)
    expect(spy).toBeCalledTimes(1)
    expect(arr.value).toEqual([1, 3])
  })

  it('should trigger reactivity when using del on array to delete index out of valid array length', () => {
    const arr = ref<number[]>([])
    const MAX_VALID_ARRAY_LENGTH = Math.pow(2, 32) - 1
    const NON_VALIDD_INDEX = MAX_VALID_ARRAY_LENGTH + 1
    set(arr.value, NON_VALIDD_INDEX, 0)
    const spy = vi.fn()
    watchEffect(
      () => {
        spy(arr.value)
      },
      { flush: 'sync' }
    )
    expect(spy).toBeCalledTimes(1)
    del(arr.value, NON_VALIDD_INDEX)
    expect(spy).toBeCalledTimes(2)
  })
})
