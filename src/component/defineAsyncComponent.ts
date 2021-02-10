import { isFunction, isObject, warn } from '../utils'
import { VueProxy } from './componentProxy'

type Component = VueProxy<any, any>

export type AsyncComponentResolveResult<T = Component> = T | { default: T } // es modules

export type AsyncComponentLoader<T = any> = () => Promise<
  AsyncComponentResolveResult<T>
>

export interface AsyncComponentOptions<T = any> {
  loader: AsyncComponentLoader<T>
  loadingComponent?: Component
  errorComponent?: Component
  delay?: number
  timeout?: number
  suspensible?: boolean
  onError?: (
    error: Error,
    retry: () => void,
    fail: () => void,
    attempts: number
  ) => any
}

export function defineAsyncComponent<T extends Component>(
  source: AsyncComponentLoader<T> | AsyncComponentOptions<T>
) {
  if (isFunction(source)) {
    source = { loader: source }
  }

  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout, // undefined = never times out
    suspensible = false, // in Vue 3 default is true
    onError: userOnError,
  } = source

  if (__DEV__ && suspensible) {
    warn(
      `The suspensiblbe option for async components is not supported in Vue2. It is ignored.`
    )
  }

  let pendingRequest: Promise<Component> | null = null

  let retries = 0
  const retry = () => {
    retries++
    pendingRequest = null
    return load()
  }

  const load = (): Promise<Component> => {
    let thisRequest: Promise<Component>
    return (
      pendingRequest ||
      (thisRequest = pendingRequest = loader()
        .catch((err) => {
          err = err instanceof Error ? err : new Error(String(err))
          if (userOnError) {
            return new Promise((resolve, reject) => {
              const userRetry = () => resolve(retry())
              const userFail = () => reject(err)
              userOnError(err, userRetry, userFail, retries + 1)
            })
          } else {
            throw err
          }
        })
        .then((comp: any) => {
          if (thisRequest !== pendingRequest && pendingRequest) {
            return pendingRequest
          }
          if (__DEV__ && !comp) {
            warn(
              `Async component loader resolved to undefined. ` +
                `If you are using retry(), make sure to return its return value.`
            )
          }
          // interop module default
          if (
            comp &&
            (comp.__esModule || comp[Symbol.toStringTag] === 'Module')
          ) {
            comp = comp.default
          }
          if (__DEV__ && comp && !isObject(comp) && !isFunction(comp)) {
            throw new Error(`Invalid async component load result: ${comp}`)
          }
          return comp
        }))
    )
  }

  return () => {
    const component = load()

    return {
      component,
      delay,
      timeout,
      error: errorComponent,
      loading: loadingComponent,
    }
  }
}
