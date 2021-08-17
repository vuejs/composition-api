import {
  nextTick,
  watch,
  watchEffect,
  reactive,
  EffectScope,
  onScopeDispose,
  computed,
  ref,
  ComputedRef,
  createApp,
  getCurrentScope,
} from '../../../src'
import { mockWarn } from '../../helpers'

describe('reactivity/effect/scope', () => {
  mockWarn(true)

  it('should run', () => {
    const fnSpy = jest.fn(() => {})
    new EffectScope().run(fnSpy)
    expect(fnSpy).toHaveBeenCalledTimes(1)
  })

  it('should accept zero argument', () => {
    const scope = new EffectScope()
    expect(scope.effects.length).toBe(0)
  })

  it('should return run value', () => {
    expect(new EffectScope().run(() => 1)).toBe(1)
  })

  it('should collect the effects', async () => {
    const scope = new EffectScope()
    let dummy = 0
    scope.run(() => {
      const counter = reactive({ num: 0 })
      watchEffect(() => (dummy = counter.num))

      expect(dummy).toBe(0)
      counter.num = 7
    })

    await nextTick()

    expect(dummy).toBe(7)
    // expect(scope.effects.length).toBe(1)
  })

  it('stop', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      watchEffect(() => (dummy = counter.num))
      watchEffect(() => (doubled = counter.num * 2))
    })

    // expect(scope.effects.length).toBe(2)

    expect(dummy).toBe(0)
    counter.num = 7
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()

    counter.num = 6
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('should collect nested scope', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      // nested scope
      new EffectScope().run(() => {
        watchEffect(() => (doubled = counter.num * 2))
      })
      watchEffect(() => (dummy = counter.num))
    })

    // expect(scope.effects.length).toBe(2)
    expect(scope.effects[0]).toBeInstanceOf(EffectScope)

    expect(dummy).toBe(0)
    counter.num = 7
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    // stop the nested scope as well
    scope.stop()

    counter.num = 6
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('nested scope can be escaped', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      watchEffect(() => (dummy = counter.num))
      // nested scope
      new EffectScope(true).run(() => {
        watchEffect(() => (doubled = counter.num * 2))
      })
    })

    expect(scope.effects.length).toBe(0)

    expect(dummy).toBe(0)
    counter.num = 7
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()

    counter.num = 6
    await nextTick()
    expect(dummy).toBe(7)

    // nested scope should not be stoped
    expect(doubled).toBe(12)
  })

  it('able to run the scope', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      watchEffect(() => (dummy = counter.num))
    })

    // expect(scope.effects.length).toBe(1)

    scope.run(() => {
      watchEffect(() => (doubled = counter.num * 2))
    })

    // expect(scope.effects.length).toBe(2)

    counter.num = 7
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()
  })

  it('can not run an inactive scope', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      watchEffect(() => (dummy = counter.num))
    })

    // expect(scope.effects.length).toBe(1)

    scope.stop()

    scope.run(() => {
      watchEffect(() => (doubled = counter.num * 2))
    })

    expect(
      '[Vue warn]: cannot run an inactive effect scope.'
    ).toHaveBeenWarned()

    // expect(scope.effects.length).toBe(1)

    counter.num = 7
    await nextTick()
    expect(dummy).toBe(0)
    expect(doubled).toBe(undefined)
  })

  it('should fire onScopeDispose hook', () => {
    let dummy = 0

    const scope = new EffectScope()
    scope.run(() => {
      onScopeDispose(() => (dummy += 1))
      onScopeDispose(() => (dummy += 2))
    })

    scope.run(() => {
      onScopeDispose(() => (dummy += 4))
    })

    expect(dummy).toBe(0)

    scope.stop()
    expect(dummy).toBe(7)
  })

  it('should warn onScopeDispose() is called when there is no active effect scope', () => {
    const spy = jest.fn()
    const scope = new EffectScope()
    scope.run(() => {
      onScopeDispose(spy)
    })

    expect(spy).toHaveBeenCalledTimes(0)

    onScopeDispose(spy)

    expect(
      '[Vue warn]: onScopeDispose() is called when there is no active effect scope to be associated with.'
    ).toHaveBeenWarned()

    scope.stop()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('test with higher level APIs', async () => {
    const r = ref(1)

    const computedSpy = jest.fn()
    const watchSpy = jest.fn()
    const watchEffectSpy = jest.fn()

    let c: ComputedRef
    const scope = new EffectScope()
    scope.run(() => {
      c = computed(() => {
        computedSpy()
        return r.value + 1
      })

      watch(r, watchSpy)
      watchEffect(() => {
        watchEffectSpy()
        r.value
      })
    })

    c!.value // computed is lazy so trigger collection
    expect(computedSpy).toHaveBeenCalledTimes(1)
    expect(watchSpy).toHaveBeenCalledTimes(0)
    expect(watchEffectSpy).toHaveBeenCalledTimes(1)

    r.value++
    c!.value
    await nextTick()
    expect(computedSpy).toHaveBeenCalledTimes(2)
    expect(watchSpy).toHaveBeenCalledTimes(1)
    expect(watchEffectSpy).toHaveBeenCalledTimes(2)

    scope.stop()

    r.value++
    c!.value
    await nextTick()
    // should not trigger anymore
    expect(computedSpy).toHaveBeenCalledTimes(2)
    expect(watchSpy).toHaveBeenCalledTimes(1)
    expect(watchEffectSpy).toHaveBeenCalledTimes(2)
  })

  it('should stop along with parent component', async () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const root = document.createElement('div')
    const vm = createApp({
      setup() {
        const scope = new EffectScope()
        scope.run(() => {
          watchEffect(() => (dummy = counter.num))
          watchEffect(() => (doubled = counter.num * 2))
        })
      },
    })
    vm.mount(root)

    expect(dummy).toBe(0)
    counter.num = 7
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    vm.unmount()

    counter.num = 6
    await nextTick()
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('component should be a valid scope', async () => {
    let dummy = 0
    let scope

    const root = document.createElement('div')
    const vm = createApp({
      setup() {
        scope = getCurrentScope()
        onScopeDispose(() => (dummy += 1))
        scope?.cleanups.push(() => (dummy += 1))
      },
    })

    vm.mount(root)
    expect(dummy).toBe(0)
    expect(scope).not.toBeFalsy()

    vm.unmount()
    await nextTick()
    expect(dummy).toBe(2)
  })
})
