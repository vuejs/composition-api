import { ref, Ref, reactive, expectType } from './index'

describe('should unwrap tuple correctly', () => {
  const readonlyTuple = [ref(0)] as const
  const reactiveReadonlyTuple = reactive(readonlyTuple)
  expectType<Ref<number>>(reactiveReadonlyTuple[0])

  const tuple: [Ref<number>] = [ref(0)]
  const reactiveTuple = reactive(tuple)
  expectType<Ref<number>>(reactiveTuple[0])
})
