import { set, ref, watchEffect } from '../../../src'

describe('reactivity/set', () => {
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
