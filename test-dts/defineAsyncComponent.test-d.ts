import { AsyncComponent } from 'vue'
import { defineComponent } from '../src/component'
import { defineAsyncComponent, expectType } from './index'

function asyncComponent1() {
  return Promise.resolve().then(() => {
    return defineComponent({})
  })
}

function asyncComponent2() {
  return Promise.resolve().then(() => {
    return {
      template: 'ASYNC',
    }
  })
}

const syncComponent1 = defineComponent({
  template: '',
})

const syncComponent2 = {
  template: '',
}

defineComponent(asyncComponent1)
defineComponent(asyncComponent2)

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

defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve(syncComponent1)
    })
)

defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve(syncComponent2)
    })
)

const component = defineAsyncComponent({
  // The factory function
  loader: asyncComponent1,
  // A component to use while the async component is loading
  loadingComponent: defineComponent({}),
  // A component to use if the load fails
  errorComponent: defineComponent({}),
  // Delay before showing the loading component. Default: 200ms.
  delay: 200,
  // The error component will be displayed if a timeout is
  // provided and exceeded. Default: Infinity.
  timeout: 3000,
  // Defining if component is suspensible. Default: true.
  suspensible: false,
  /**
   *
   * @param {*} error Error message object
   * @param {*} retry A function that indicating whether the async component should retry when the loader promise rejects
   * @param {*} fail  End of failure
   * @param {*} attempts Maximum allowed retries number
   */
  onError(error, retry, fail, attempts) {
    expectType<() => void>(retry)
    expectType<() => void>(fail)
    expectType<number>(attempts)
    expectType<Error>(error)
  },
})

expectType<AsyncComponent>(component)
