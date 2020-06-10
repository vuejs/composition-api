const Vue = require('vue/dist/vue.common.js')
const { ref, watch, createElement: h } = require('../src')

describe('setupContext', () => {
  it('should have proper properties', () => {
    let context
    const vm = new Vue({
      setup(_, ctx) {
        context = ctx
      },
    })
    expect(context).toBeDefined()
    expect('parent' in context).toBe(true)
    expect(context.root).toBe(vm.$root)
    expect(context.parent).toBe(vm.$parent)
    expect(context.slots).toBeDefined()
    expect(context.attrs).toBe(vm.$attrs)
    expect(context.listeners).toBe(vm.$listeners)

    // CAUTION: this will be removed in 3.0
    expect(context.refs).toBe(vm.$refs)
    expect(typeof context.emit === 'function').toBe(true)
  })

  it('slots should work in render function', () => {
    const vm = new Vue({
      template: `
        <test>
          <template slot="default">
            <span>foo</span>
          </template>
          <template slot="item" slot-scope="props">
            <span>{{ props.text || 'meh' }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          setup(_, { slots }) {
            return () => {
              return h('div', [slots.default(), slots.item()])
            }
          },
        },
      },
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>foo</span><span>meh</span>')
  })

  it('warn for slots calls outside of the render() function', () => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)

    new Vue({
      template: `
        <test>
          <template slot="default">
            <span>foo</span>
          </template>
        </test>
      `,
      components: {
        test: {
          setup(_, { slots }) {
            slots.default()
          },
        },
      },
    }).$mount()
    expect(warn.mock.calls[0][0]).toMatch(
      'slots.default() got called outside of the "render()" scope'
    )
    warn.mockRestore()
  })

  it('staled slots should be removed', () => {
    const Child = {
      template: '<div><slot value="foo"/></div>',
    }
    const vm = new Vue({
      components: { Child },
      template: `
        <child>
          <template slot-scope="{ value }" v-if="value">
            foo {{ value }}
          </template>
        </child>
      `,
    }).$mount()
    expect(vm.$el.textContent).toMatch(`foo foo`)
  })

  it('slots should be synchronized', (done) => {
    let slotKeys
    const Foo = {
      setup(_, { slots }) {
        slotKeys = Object.keys(slots)
        return () => {
          slotKeys = Object.keys(slots)
          return h('div', [
            slots.default && slots.default('from foo default'),
            slots.one && slots.one('from foo one'),
            slots.two && slots.two('from foo two'),
            slots.three && slots.three('from foo three'),
          ])
        }
      },
    }

    const vm = new Vue({
      data: {
        a: 'one',
        b: 'two',
      },
      template: `
        <foo>
          <template #[a]="one">a {{ one }} </template>
          <template v-slot:[b]="two">b {{ two }} </template>
        </foo>
      `,
      components: { Foo },
    }).$mount()
    expect(slotKeys).toEqual(['one', 'two'])
    expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(
      `a from foo one b from foo two`
    )
    vm.a = 'two'
    vm.b = 'three'
    waitForUpdate(() => {
      // expect(slotKeys).toEqual(['one', 'three']);
      expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(
        `a from foo two b from foo three `
      )
    }).then(done)
  })
})
