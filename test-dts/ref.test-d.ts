import {
  Ref,
  ref,
  shallowRef,
  isRef,
  unref,
  reactive,
  expectType,
} from './index'

function plainType(arg: number | Ref<number>) {
  // ref coercing
  const coerced = ref(arg)
  expectType<Ref<number>>(coerced)

  // isRef as type guard
  if (isRef(arg)) {
    expectType<Ref<number>>(arg)
  }

  // ref unwrapping
  expectType<number>(unref(arg))

  // ref inner type should be unwrapped
  const nestedRef = ref({
    foo: ref(1),
  })
  expectType<Ref<{ foo: number }>>(nestedRef)
  expectType<{ foo: number }>(nestedRef.value)

  // ref boolean
  const falseRef = ref(false)
  expectType<Ref<boolean>>(falseRef)
  expectType<boolean>(falseRef.value)

  // ref true
  const trueRef = ref<true>(true)
  expectType<Ref<true>>(trueRef)
  expectType<true>(trueRef.value)

  // tuple
  expectType<[number, string]>(unref(ref([1, '1'])))

  interface IteratorFoo {
    [Symbol.iterator]: any
  }

  // with symbol
  expectType<Ref<IteratorFoo | null | undefined>>(
    ref<IteratorFoo | null | undefined>()
  )
}

plainType(1)

function bailType(arg: HTMLElement | Ref<HTMLElement>) {
  // ref coercing
  const coerced = ref(arg)
  expectType<Ref<HTMLElement>>(coerced)

  // isRef as type guard
  if (isRef(arg)) {
    expectType<Ref<HTMLElement>>(arg)
  }

  // ref unwrapping
  expectType<HTMLElement>(unref(arg))

  // ref inner type should be unwrapped
  const nestedRef = ref({ foo: ref(document.createElement('DIV')) })

  expectType<Ref<{ foo: HTMLElement }>>(nestedRef)
  expectType<{ foo: HTMLElement }>(nestedRef.value)
}
const el = document.createElement('DIV')
bailType(el)

function withSymbol() {
  const customSymbol = Symbol()
  const obj = {
    [Symbol.asyncIterator]: ref(1),
    [Symbol.hasInstance]: { a: ref('a') },
    [Symbol.isConcatSpreadable]: { b: ref(true) },
    [Symbol.iterator]: [ref(1)],
    [Symbol.match]: new Set<Ref<number>>(),
    [Symbol.matchAll]: new Map<number, Ref<string>>(),
    [Symbol.replace]: { arr: [ref('a')] },
    [Symbol.search]: { set: new Set<Ref<number>>() },
    [Symbol.species]: { map: new Map<number, Ref<string>>() },
    [Symbol.split]: new WeakSet<Ref<boolean>>(),
    [Symbol.toPrimitive]: new WeakMap<Ref<boolean>, string>(),
    [Symbol.toStringTag]: { weakSet: new WeakSet<Ref<boolean>>() },
    [Symbol.unscopables]: { weakMap: new WeakMap<Ref<boolean>, string>() },
    [customSymbol]: { arr: [ref(1)] },
  }

  const objRef = ref(obj)

  expectType<Ref<number>>(objRef.value[Symbol.asyncIterator])
  expectType<{ a: Ref<string> }>(objRef.value[Symbol.hasInstance])
  expectType<{ b: Ref<boolean> }>(objRef.value[Symbol.isConcatSpreadable])
  expectType<Ref<number>[]>(objRef.value[Symbol.iterator])
  expectType<Set<Ref<number>>>(objRef.value[Symbol.match])
  expectType<Map<number, Ref<string>>>(objRef.value[Symbol.matchAll])
  expectType<{ arr: Ref<string>[] }>(objRef.value[Symbol.replace])
  expectType<{ set: Set<Ref<number>> }>(objRef.value[Symbol.search])
  expectType<{ map: Map<number, Ref<string>> }>(objRef.value[Symbol.species])
  expectType<WeakSet<Ref<boolean>>>(objRef.value[Symbol.split])
  expectType<WeakMap<Ref<boolean>, string>>(objRef.value[Symbol.toPrimitive])
  expectType<{ weakSet: WeakSet<Ref<boolean>> }>(
    objRef.value[Symbol.toStringTag]
  )
  expectType<{ weakMap: WeakMap<Ref<boolean>, string> }>(
    objRef.value[Symbol.unscopables]
  )
  expectType<{ arr: Ref<number>[] }>(objRef.value[customSymbol])
}

withSymbol()

const state = reactive({
  foo: {
    value: 1,
    label: 'bar',
  },
})

expectType<string>(state.foo.label)

type Status = 'initial' | 'ready' | 'invalidating'
const shallowStatus = shallowRef<Status>('initial')
if (shallowStatus.value === 'initial') {
  expectType<Ref<Status>>(shallowStatus)
  expectType<Status>(shallowStatus.value)
  shallowStatus.value = 'invalidating'
}

const refStatus = ref<Status>('initial')
if (refStatus.value === 'initial') {
  expectType<Ref<Status>>(shallowStatus)
  expectType<Status>(shallowStatus.value)
  refStatus.value = 'invalidating'
}
