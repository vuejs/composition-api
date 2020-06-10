const Vue = require('vue/dist/vue.common.js')
const {
  ref,
  computed,
  createElement: h,
  provide,
  inject,
  reactive,
  toRefs,
} = require('../src')

describe('setup', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('should works', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
    }).$mount()
    expect(vm.a).toBe(1)
  })

  it('should work with non reactive null', () => {
    const vm = new Vue({
      setup() {
        return {
          a: null,
        }
      },
    }).$mount()
    expect(vm.a).toBe(null)
  })

  it('should work with non reactive undefined', () => {
    const vm = new Vue({
      setup() {
        return {
          a: undefined,
          b: 'foobar',
        }
      },
    }).$mount()
    expect(vm.a).toBe(undefined)
    expect(vm.b).toBe('foobar')
  })

  it('should be overrided by data option of plain object', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
      data: {
        a: 2,
      },
    }).$mount()
    expect(vm.a).toBe(2)
  })

  it("should access setup's value in data", () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
      data() {
        return {
          b: this.a,
        }
      },
    }).$mount()
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(1)
  })

  it('should work with `methods` and `data` options', (done) => {
    let calls = 0
    const vm = new Vue({
      template: `<div>{{a}}{{b}}{{c}}</div>`,
      setup() {
        return {
          a: ref(1),
        }
      },
      beforeUpdate() {
        calls++
      },
      created() {
        this.m()
      },
      data() {
        return {
          b: this.a,
          c: 0,
        }
      },
      methods: {
        m() {
          this.c = this.a
        },
      },
    }).$mount()
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(1)
    expect(vm.c).toBe(1)
    vm.a = 2
    waitForUpdate(() => {
      expect(calls).toBe(1)
      expect(vm.a).toBe(2)
      expect(vm.b).toBe(1)
      expect(vm.c).toBe(1)
      vm.b = 2
    })
      .then(() => {
        expect(calls).toBe(2)
        expect(vm.a).toBe(2)
        expect(vm.b).toBe(2)
        expect(vm.c).toBe(1)
      })
      .then(done)
  })

  it('should receive props as first params', () => {
    let props
    new Vue({
      props: ['a'],
      setup(_props) {
        props = _props
      },
      propsData: {
        a: 1,
      },
    }).$mount()
    expect(props.a).toBe(1)
  })

  it('warn for existing props', () => {
    new Vue({
      props: {
        a: {},
      },
      setup() {
        const a = ref()
        return {
          a,
        }
      },
    })
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a prop.'
    )
  })

  it('warn for existing instance properties', () => {
    new Vue({
      setup(_, { _vm }) {
        _vm.a = 1
        return {
          a: ref(),
        }
      },
    })
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared.'
    )
  })

  it('should merge result properly', () => {
    const injectKey = Symbol('foo')
    const A = Vue.extend({
      setup() {
        provide(injectKey, 'foo')
        return { a: 1 }
      },
    })
    const Test = Vue.extend({
      extends: A,
      setup() {
        const injectVal = inject(injectKey)
        return {
          injectVal,
        }
      },
    })
    let vm = new Test({
      setup() {
        return { b: 2 }
      },
    })
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(2)
    expect(vm.injectVal).toBe('foo')
    // no instance data
    vm = new Test()
    expect(vm.a).toBe(1)
    // no child-val
    const Extended = Test.extend({})
    vm = new Extended()
    expect(vm.a).toBe(1)
    // recursively merge objects
    const WithObject = Vue.extend({
      setup() {
        return {
          obj: {
            a: 1,
          },
        }
      },
    })
    vm = new WithObject({
      setup() {
        return {
          obj: {
            b: 2,
          },
        }
      },
    })
    expect(vm.obj.a).toBe(1)
    expect(vm.obj.b).toBe(2)
  })

  it('should have access to props', () => {
    const Test = {
      props: ['a'],
      render() {},
      setup(props) {
        return {
          b: props.a,
        }
      },
    }
    const vm = new Vue({
      template: `<test ref="test" :a="1"></test>`,
      components: { Test },
    }).$mount()
    expect(vm.$refs.test.b).toBe(1)
  })

  it('props should not be reactive', (done) => {
    let calls = 0
    const vm = new Vue({
      template: `<child :msg="msg"></child>`,
      setup() {
        return { msg: ref('hello') }
      },
      beforeUpdate() {
        calls++
      },
      components: {
        child: {
          template: `<span>{{ localMsg }}</span>`,
          props: ['msg'],
          setup(props) {
            return {
              localMsg: props.msg,
              computedMsg: computed(() => props.msg + ' world'),
            }
          },
        },
      },
    }).$mount()
    const child = vm.$children[0]
    expect(child.localMsg).toBe('hello')
    expect(child.computedMsg).toBe('hello world')
    expect(calls).toBe(0)
    vm.msg = 'hi'
    waitForUpdate(() => {
      expect(child.localMsg).toBe('hello')
      expect(child.computedMsg).toBe('hi world')
      expect(calls).toBe(1)
    }).then(done)
  })

  it('toRefs(props) should not warn', async () => {
    let a

    const child = {
      template: `<div/>`,

      props: {
        r: Number,
      },
      setup(props) {
        a = toRefs(props).r
      },
    }

    const vm = new Vue({
      template: `<child :r="r"/>`,
      components: {
        child,
      },

      data() {
        return {
          r: 1,
        }
      },
    }).$mount()

    expect(a.value).toBe(1)
    vm.r = 3

    await Vue.nextTick()

    expect(a.value).toBe(3)

    expect(warn).not.toHaveBeenCalled()
  })

  it('Should allow to return Object.freeze', () => {
    const vm = new Vue({
      template: `<div>{{foo.bar}}</div>`,
      setup() {
        const foo = Object.freeze({ bar: 'baz' })
        return {
          foo,
        }
      },
    }).$mount()
    expect(vm.$el.textContent).toBe('baz')
  })

  it('this should be undefined', () => {
    const vm = new Vue({
      template: '<div></div>',
      setup() {
        expect(this).toBe(global)
      },
    }).$mount()
  })

  it('should not make returned non-reactive object reactive', (done) => {
    const vm = new Vue({
      setup() {
        return {
          form: {
            a: 1,
            b: 2,
          },
        }
      },
      template: '<div>{{ form.a }}, {{ form.b }}</div>',
    }).$mount()
    expect(vm.$el.textContent).toBe('1, 2')

    // should not trigger a re-render
    vm.form.a = 2
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('1, 2')

      // should trigger a re-render
      vm.form = { a: 2, b: 3 }
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('2, 3')
      })
      .then(done)
  })

  it("should put a unenumerable '__ob__' for non-reactive object", () => {
    const clone = (obj) => JSON.parse(JSON.stringify(obj))
    const componentSetup = jest.fn((props) => {
      const internalOptions = clone(props.options)
      return { internalOptions }
    })
    const ExternalComponent = {
      props: ['options'],
      setup: componentSetup,
    }
    new Vue({
      components: { ExternalComponent },
      setup: () => ({ options: {} }),
      template: `<external-component :options="options"></external-component>`,
    }).$mount()
    expect(componentSetup).toReturn()
  })

  it('current vue should exist in nested setup call', () => {
    const spy = jest.fn()
    new Vue({
      setup() {
        new Vue({
          setup() {
            spy(1)
          },
        })

        spy(2)
      },
    })
    expect(spy.mock.calls.length).toBe(2)
    expect(spy).toHaveBeenNthCalledWith(1, 1)
    expect(spy).toHaveBeenNthCalledWith(2, 2)
  })

  it('inline render function should receive proper params', () => {
    let p
    const vm = new Vue({
      template: `<child msg="foo" a="1" b="2"></child>`,
      components: {
        child: {
          name: 'child',
          props: ['msg'],
          setup() {
            return (props) => {
              p = props
              return null
            }
          },
        },
      },
    }).$mount()
    expect(p).toBe(undefined)
  })

  it('inline render function should work', (done) => {
    // let createElement;
    const vm = new Vue({
      props: ['msg'],
      template: '<div>1</div>',
      setup(props) {
        const count = ref(0)
        const increment = () => {
          count.value++
        }

        return () =>
          h('div', [
            h('span', props.msg),
            h(
              'button',
              {
                on: {
                  click: increment,
                },
              },
              count.value
            ),
          ])
      },
      propsData: {
        msg: 'foo',
      },
    }).$mount()
    expect(vm.$el.querySelector('span').textContent).toBe('foo')
    expect(vm.$el.querySelector('button').textContent).toBe('0')
    vm.$el.querySelector('button').click()
    waitForUpdate(() => {
      expect(vm.$el.querySelector('button').textContent).toBe('1')
      vm.msg = 'bar'
    })
      .then(() => {
        expect(vm.$el.querySelector('span').textContent).toBe('bar')
      })
      .then(done)
  })

  it('should unwrap on the template', () => {
    const vm = new Vue({
      setup() {
        const r = ref('r')
        const nested = {
          a: ref('a'),
          aa: {
            b: ref('aa'),
            bb: {
              cc: ref('aa'),
              c: 'aa',
            },
          },

          aaa: reactive({
            b: ref('aaa'),
            bb: {
              c: ref('aaa'),
              cc: 'aaa',
            },
          }),

          aaaa: {
            b: [1],
            bb: ref([1]),
            bbb: reactive({
              c: [1],
              cc: ref([1]),
            }),
            bbbb: [ref(1)],
          },
        }

        const refList = ref([ref('1'), ref('2'), ref('3')])
        const list = [ref('a'), ref('b')]

        return {
          r,
          nested,
          refList,
          list,
        }
      },
      template: `<div>
        <p id="r">{{r}}</p>
        <p id="nested">{{nested.a}}</p>
        <p id="list">{{list}}</p>
        <p id="refList">{{refList}}</p>

        <p id="nested_aa_b">{{ nested.aa.b }}</p>
        <p id="nested_aa_bb_c">{{ nested.aa.bb.c }}</p>
        <p id="nested_aa_bb_cc">{{ nested.aa.bb.cc }}</p>

        <p id="nested_aaa_b">{{ nested.aaa.b }}</p>
        <p id="nested_aaa_bb_c">{{ nested.aaa.bb.c }}</p>
        <p id="nested_aaa_bb_cc">{{ nested.aaa.bb.cc }}</p>

        <p id="nested_aaaa_b">{{ nested.aaaa.b }}</p>
        <p id="nested_aaaa_bb_c">{{ nested.aaaa.bb }}</p>
        <p id="nested_aaaa_bbb_cc">{{ nested.aaaa.bbb.c }}</p>
        <p id="nested_aaaa_bbb_cc">{{ nested.aaaa.bbb.cc }}</p>
        <p id="nested_aaaa_bbbb">{{ nested.aaaa.bbbb }}</p>
      </div>`,
    }).$mount()

    expect(vm.$el.querySelector('#r').textContent).toBe('r')
    expect(vm.$el.querySelector('#nested').textContent).toBe('a')

    // shouldn't unwrap arrays
    expect(
      JSON.parse(vm.$el.querySelector('#list').textContent)
    ).toMatchObject([{ value: 'a' }, { value: 'b' }])
    expect(
      JSON.parse(vm.$el.querySelector('#refList').textContent)
    ).toMatchObject([{ value: '1' }, { value: '2' }, { value: '3' }])

    expect(vm.$el.querySelector('#nested_aa_b').textContent).toBe('aa')
    expect(vm.$el.querySelector('#nested_aa_bb_c').textContent).toBe('aa')
    expect(vm.$el.querySelector('#nested_aa_bb_cc').textContent).toBe('aa')

    expect(vm.$el.querySelector('#nested_aaa_b').textContent).toBe('aaa')
    expect(vm.$el.querySelector('#nested_aaa_bb_c').textContent).toBe('aaa')
    expect(vm.$el.querySelector('#nested_aaa_bb_cc').textContent).toBe('aaa')

    expect(
      JSON.parse(vm.$el.querySelector('#nested_aaaa_b').textContent)
    ).toMatchObject([1])
    expect(
      JSON.parse(vm.$el.querySelector('#nested_aaaa_bb_c').textContent)
    ).toMatchObject([1])
    expect(
      JSON.parse(vm.$el.querySelector('#nested_aaaa_bbb_cc').textContent)
    ).toMatchObject([1])
    expect(
      JSON.parse(vm.$el.querySelector('#nested_aaaa_bbb_cc').textContent)
    ).toMatchObject([1])
    expect(
      JSON.parse(vm.$el.querySelector('#nested_aaaa_bbbb').textContent)
    ).toMatchObject([{ value: 1 }])
  })

  describe('Methods', () => {
    it('binds methods when calling with parenthesis', async () => {
      let context = null
      const contextFunction = jest.fn(function () {
        context = this
      })

      const vm = new Vue({
        template: '<div><button @click="contextFunction()"/></div>',
        setup() {
          return {
            contextFunction,
          }
        },
      }).$mount()

      await vm.$el.querySelector('button').click()
      expect(contextFunction).toBeCalled()
      expect(context).toBe(vm)
    })

    it('binds methods when calling without parenthesis', async () => {
      let context = null
      const contextFunction = jest.fn(function () {
        context = this
      })

      const vm = new Vue({
        template: '<div><button @click="contextFunction"/></div>',
        setup() {
          return {
            contextFunction,
          }
        },
      }).$mount()

      await vm.$el.querySelector('button').click()
      expect(contextFunction).toBeCalled()
      expect(context).toBe(vm)
    })
  })
})
