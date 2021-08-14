import {
  h,
  provide,
  inject,
  InjectionKey,
  ref,
  nextTick,
  Ref,
  reactive,
  defineComponent,
  createApp,
} from '../../../src'
import { mockWarn } from '../../helpers'

describe('api: provide/inject', () => {
  mockWarn(true)
  it('string keys', async () => {
    const Provider = {
      setup() {
        provide('foo', 1)
        return () => h(Middle)
      },
    }

    const Middle = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const foo = inject<number>('foo')
        return () => h('div', foo as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)
  })

  it('symbol keys', () => {
    // also verifies InjectionKey type sync
    const key: InjectionKey<number> = Symbol()

    const Provider = {
      setup() {
        provide(key, 1)
        return () => h(Middle)
      },
    }

    const Middle = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const foo = inject(key) || 1
        return () => h('div', (foo + 1) as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('default values', () => {
    const Provider = {
      setup() {
        provide('foo', 'foo')
        return () => h(Middle)
      },
    }

    const Middle = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        // default value should be ignored if value is provided
        const foo = inject('foo', 'fooDefault')
        // default value should be used if value is not provided
        const bar = inject('bar', 'bar')
        return () => h('div', (foo + bar) as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>foobar</div>`)
  })

  it('bound to instance', () => {
    const Provider = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = defineComponent({
      name: 'Consumer',
      inject: {
        foo: {
          from: 'foo',
          default() {
            return this!.$options.name
          },
        },
      },
      render() {
        return h('div', this.foo as unknown as string)
      },
    })

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>Consumer</div>`)
  })

  it('nested providers', () => {
    const ProviderOne = {
      setup() {
        provide('foo', 'foo')
        provide('bar', 'bar')
        return () => h(ProviderTwo)
      },
    }

    const ProviderTwo = {
      setup() {
        // override parent value
        provide('foo', 'fooOverride')
        provide('baz', 'baz')
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        const baz = inject('baz')
        return () => h('div', [foo, bar, baz].join(',') as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(ProviderOne).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>fooOverride,bar,baz</div>`)
  })

  it('reactivity with refs', async () => {
    const count = ref(1)

    const Provider = {
      setup() {
        provide('count', count)
        return () => h(Middle)
      },
    }

    const Middle = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const count = inject<Ref<number>>('count')!
        return () => h('div', count.value as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    count.value++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('reactivity with objects', async () => {
    const rootState = reactive({ count: 1 })

    const Provider = {
      setup() {
        provide('state', rootState)
        return () => h(Middle)
      },
    }

    const Middle = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const state = inject<typeof rootState>('state')!
        return () => h('div', state.count as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    rootState.count++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('should warn unfound', () => {
    const Provider = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        const foo = inject('foo')
        expect(foo).toBeUndefined()
        return () => h('div', foo as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div></div>`)
    expect(`[Vue warn]: Injection "foo" not found`).toHaveBeenWarned()
  })

  it('should warn unfound w/ injectionKey is undefined', () => {
    const Provider = {
      setup() {
        return () => h(Consumer)
      },
    }

    const Consumer = {
      setup() {
        // The emulation does not use TypeScript
        const foo = inject(undefined as unknown as string)
        expect(foo).toBeUndefined()
        return () => h('div', foo as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Provider).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div></div>`)
    expect(`[Vue warn]: injection "undefined" not found.`).toHaveBeenWarned()
  })

  it('should not self-inject', () => {
    const Comp = {
      setup() {
        provide('foo', 'foo')
        const injection = inject('foo', null)
        return () => h('div', injection as unknown as string)
      },
    }

    const root = document.createElement('div')
    const vm = createApp(Comp).mount(root)
    expect(vm.$el.outerHTML).toBe(`<div>foo</div>`)
  })
})
