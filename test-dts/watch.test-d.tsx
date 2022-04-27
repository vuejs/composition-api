import { ref, computed, watch, expectType } from './index'

const source = ref('foo')
const source2 = computed(() => source.value)
const source3 = () => 1

// lazy watcher will have consistent types for oldValue.
watch(source, (value, oldValue) => {
  expectType<string>(value)
  expectType<string>(oldValue)
})

// spread array
watch(
  [source, source2, source3],
  ([source1, source2, source3], [oldSource1, oldSource2, oldSource3]) => {
    expectType<string>(source1)
    expectType<string>(source2)
    expectType<number>(source3)
    expectType<string>(oldSource1)
    expectType<string>(oldSource2)
    expectType<number>(oldSource3)
  }
)

// const array
watch([source, source2, source3] as const, (values, oldValues) => {
  expectType<Readonly<[string, string, number]>>(values)
  expectType<Readonly<[string, string, number]>>(oldValues)
  expectType<string>(values[0])
  expectType<string>(values[1])
  expectType<number>(values[2])
  expectType<string>(oldValues[0])
  expectType<string>(oldValues[1])
  expectType<number>(oldValues[2])
})

// const spread array
watch(
  [source, source2, source3] as const,
  ([source1, source2, source3], [oldSource1, oldSource2, oldSource3]) => {
    expectType<string>(source1)
    expectType<string>(source2)
    expectType<number>(source3)
    expectType<string>(oldSource1)
    expectType<string>(oldSource2)
    expectType<number>(oldSource3)
  }
)

// immediate watcher's oldValue will be undefined on first run.
watch(
  source,
  (value, oldValue) => {
    expectType<string>(value)
    expectType<string | undefined>(oldValue)
  },
  { immediate: true }
)

watch(
  [source, source2, source3],
  (values, oldValues) => {
    expectType<(string | number)[]>(values)
    expectType<(string | number | undefined)[]>(oldValues)
  },
  { immediate: true }
)

// const array
watch(
  [source, source2, source3] as const,
  (values, oldValues) => {
    expectType<Readonly<[string, string, number]>>(values)
    expectType<
      Readonly<[string | undefined, string | undefined, number | undefined]>
    >(oldValues)
  },
  { immediate: true }
)

// should provide correct ref.value inner type to callbacks
const nestedRefSource = ref({
  foo: ref(1),
})

watch(nestedRefSource, (v, ov) => {
  expectType<{ foo: number }>(v)
  expectType<{ foo: number }>(ov)
})
