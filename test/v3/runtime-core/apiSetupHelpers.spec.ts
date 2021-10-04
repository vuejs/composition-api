import {
  createApp,
  defineComponent,
  SetupContext,
  useAttrs,
  useSlots,
} from '../../../src'

describe('SFC <script setup> helpers', () => {
  // test('useSlots / useAttrs (no args)', () => {
  //   let slots: SetupContext['slots'] | undefined
  //   let attrs: SetupContext['attrs'] | undefined
  //   const Comp = {
  //     setup() {
  //       slots = useSlots()
  //       attrs = useAttrs()
  //       return () => {}
  //     }
  //   }
  //   const passedAttrs = { id: 'foo' }
  //   const passedSlots = {
  //     default: () => {},
  //     x: () => {}
  //   }
  //   const root = document.createElement('div')
  //   const vm = createApp(Comp).mount(root)
  //   expect(typeof slots!.default).toBe('function')
  //   expect(typeof slots!.x).toBe('function')
  //   expect(attrs).toMatchObject(passedAttrs)
  // })

  test('useSlots / useAttrs (with args)', () => {
    let slots: SetupContext['slots'] | undefined
    let attrs: SetupContext['attrs'] | undefined
    let ctx: SetupContext | undefined
    const Comp = defineComponent({
      setup(_, _ctx) {
        slots = useSlots()
        attrs = useAttrs()
        ctx = _ctx
        return () => {}
      },
    })
    const root = document.createElement('div')
    createApp(Comp, { foo: 'bar' }).mount(root)
    expect(slots).toBe(ctx!.slots)
    expect(attrs).toBe(ctx!.attrs)
  })
})
