import { defineAsyncComponent, defineComponent, expectType, h } from './index'

const asyncComponent1 = async () => defineComponent({})

const asyncComponent2 = async () => ({ template: 'ASYNC' })

const syncComponent1 = defineComponent({
  template: '',
})

const syncComponent2 = {
  template: '',
}

defineAsyncComponent(asyncComponent1)
defineAsyncComponent(asyncComponent2)

defineAsyncComponent({
  loader: asyncComponent1,
  delay: 200,
  timeout: 3000,
  errorComponent: syncComponent1,
  loadingComponent: syncComponent1,
})

defineAsyncComponent({
  loader: asyncComponent2,
  delay: 200,
  timeout: 3000,
  errorComponent: syncComponent2,
  loadingComponent: syncComponent2,
})

defineAsyncComponent(async () => syncComponent1)

defineAsyncComponent(async () => syncComponent2)

const component = defineAsyncComponent({
  loader: asyncComponent1,
  loadingComponent: defineComponent({}),
  errorComponent: defineComponent({}),
  delay: 200,
  timeout: 3000,
  suspensible: false,
  onError(error, retry, fail, attempts) {
    expectType<() => void>(retry)
    expectType<() => void>(fail)
    expectType<number>(attempts)
    expectType<Error>(error)
  },
})

h(component)
