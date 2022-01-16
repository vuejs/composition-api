import {
  defineComponent,
  describe,
  expectError,
  expectType,
  Ref,
  ref,
} from './index'
import Vue from 'vue'

describe('emits', () => {
  const testComponent = defineComponent({
    emits: {
      click: (n: number) => typeof n === 'number',
      input: (b: string) => b.length > 1,
    },
    setup(props, { emit }) {
      emit('click', 1)
      emit('input', 'foo')
    },
    created() {
      this.$emit('click', 1)
      this.$emit('click', 1).$emit('click', 1)
      this.$emit('input', 'foo')
      this.$emit('input', 'foo').$emit('click', 1)
      expectType<Record<string, string>>(this.$attrs)
      //  @ts-expect-error
      expectError(this.$emit('input', 1).$emit('nope'))
    },
  })

  // interface of vue2's $emit has no generics, notice that untyped types will be "event: string, ...args: any[]) => this" when using vue-class-component.
  // but we can get correct type when we use correct params
  // maybe we need vue 2.7 to fully support emit type
  type VueClass<V> = { new (...args: any[]): V & Vue } & typeof Vue

  function useComponentRef<T extends VueClass<Vue>>() {
    return ref<InstanceType<T>>(undefined!) as Ref<InstanceType<T>>
  }

  const foo = useComponentRef<typeof testComponent>()

  foo.value.$emit('click', 1)
  foo.value.$emit('input', 'foo')
  foo.value.$emit('click', 1).$emit('click', 1)
  //  @ts-expect-error
  expectError(foo.value.$emit('blah').$emit('click', 1))
  //  @ts-expect-error
  expectError(foo.value.$emit('click').$emit('click', 1))
  //  @ts-expect-error
  expectError(foo.value.$emit('blah').$emit('click', 1))
  //  @ts-expect-error
  expectError(foo.value.$emit('blah'))
})
