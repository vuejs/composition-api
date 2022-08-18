import Vue from 'vue/dist/vue.common.js'
import { inject, provide, ref, reactive } from '../../src'

let injected
const injectedComp = {
  render() {},
  setup() {
    return {
      foo: inject('foo'),
      bar: inject('bar'),
    }
  },
  created() {
    injected = [this.foo, this.bar]
  },
}

beforeEach(() => {
  injected = null
})

describe('Hooks provide/inject', () => {
  let warn = null

  beforeEach(() => {
    warn = vi.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('should work', () => {
    new Vue({
      template: `<child/>`,
      setup() {
        const count = ref(1)
        provide('foo', count)
        provide('bar', false)
      },
      components: {
        child: {
          template: `<injected-comp/>`,
          components: {
            injectedComp,
          },
        },
      },
    }).$mount()

    expect(injected).toEqual([1, false])
  })

  it('should return a default value when inject not found', () => {
    let injected
    new Vue({
      template: `<child/>`,
      components: {
        child: {
          template: `<div>{{ msg }}</div>`,
          setup() {
            injected = inject('not-existed-inject-key', 'foo')
            return {
              injected,
            }
          },
        },
      },
    }).$mount()

    expect(injected).toBe('foo')
  })

  it('should work for ref value', () =>
    new Promise((done, reject) => {
      done.fail = reject

      const Msg = Symbol()
      const app = new Vue({
        template: `<child/>`,
        setup() {
          provide(Msg, ref('hello'))
        },
        components: {
          child: {
            template: `<div>{{ msg }}</div>`,
            setup() {
              return {
                msg: inject(Msg),
              }
            },
          },
        },
      }).$mount()

      app.$children[0].msg = 'bar'
      waitForUpdate(() => {
        expect(app.$el.textContent).toBe('bar')
      }).then(done)
    }))

  it('should work for reactive value', () =>
    new Promise((done, reject) => {
      done.fail = reject

      const State = Symbol()
      let obj
      const app = new Vue({
        template: `<child/>`,
        setup() {
          provide(State, reactive({ msg: 'foo' }))
        },
        components: {
          child: {
            template: `<div>{{ state.msg }}</div>`,
            setup() {
              obj = inject(State)
              return {
                state: obj,
              }
            },
          },
        },
      }).$mount()
      expect(obj.msg).toBe('foo')
      app.$children[0].state.msg = 'bar'
      waitForUpdate(() => {
        expect(app.$el.textContent).toBe('bar')
      }).then(done)
    }))

  it('should work when combined with 2.x provide option', () => {
    const State = Symbol()
    let obj1
    let obj2
    new Vue({
      template: `<child/>`,
      setup() {
        provide(State, { msg: 'foo' })
      },
      provide: {
        X: { msg: 'bar' },
      },
      components: {
        child: {
          setup() {
            obj1 = inject(State)
            obj2 = inject('X')
          },
          template: `<div/>`,
        },
      },
    }).$mount()
    expect(obj1.msg).toBe('foo')
    expect(obj2.msg).toBe('bar')
  })

  it('should call default value as factory', () => {
    const State = Symbol()
    let fn = vi.fn()
    new Vue({
      template: `<child/>`,
      setup() {},
      provide: {
        X: { msg: 'bar' },
      },
      components: {
        child: {
          setup() {
            inject(State, fn, true)
          },
          template: `<div/>`,
        },
      },
    }).$mount()
    expect(fn).toHaveBeenCalled()
  })
})
