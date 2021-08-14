import { set, reactive, ref, watch, watchEffect } from '../../../src'

describe('reactivity/set', () => {
  it('should not trigger reactivity on native object member assignment', () => {
    const obj = reactive<{ a?: number }>({})
    const spy = jest.fn()
    watch(obj, spy, { deep: true, flush: 'sync' })
    obj.a = 1
    expect(spy).not.toHaveBeenCalled()
    expect(obj).toStrictEqual({ a: 1 })
  })

  it('should trigger reactivity when using set on reactive object', () => {
    const obj = reactive<{ a?: number }>({})
    const spy = jest.fn()
    watch(obj, spy, { deep: true, flush: 'sync' })
    set(obj, 'a', 1)
    expect(spy).toBeCalledTimes(1)
    expect(obj).toStrictEqual({ a: 1 })
  })

  it('should trigger watchEffect when using set to change value of array length', () => {
    const arr = ref([1, 2, 3])
    const spy = jest.fn()
    watchEffect(
      () => {
        spy(arr.value)
      },
      { flush: 'sync' }
    )

    expect(spy).toHaveBeenCalledTimes(1)
    set(arr.value, 'length', 1)
    expect(arr.value.length).toBe(1)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
