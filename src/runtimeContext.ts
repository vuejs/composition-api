import type { VueConstructor, VNode } from 'vue'
import { bindCurrentScopeToVM, EffectScope } from './apis/effectScope'
import { ComponentInstance, Data } from './component'
import {
  assert,
  hasOwn,
  warn,
  proxy,
  UnionToIntersection,
  isFunction,
} from './utils'
import type Vue$1 from 'vue'

let vueDependency: VueConstructor | undefined = undefined

try {
  const requiredVue = require('vue')
  if (requiredVue && isVue(requiredVue)) {
    vueDependency = requiredVue
  } else if (
    requiredVue &&
    'default' in requiredVue &&
    isVue(requiredVue.default)
  ) {
    vueDependency = requiredVue.default
  }
} catch {
  // not available
}

let vueConstructor: VueConstructor | null = null
let currentInstance: ComponentInternalInstance | null = null
let currentInstanceTracking = true

const PluginInstalledFlag = '__composition_api_installed__'

function isVue(obj: any): obj is VueConstructor {
  return obj && isFunction(obj) && obj.name === 'Vue'
}

export function isPluginInstalled() {
  return !!vueConstructor
}

export function isVueRegistered(Vue: VueConstructor) {
  // resolve issue: https://github.com/vuejs/composition-api/issues/876#issue-1087619365
  return vueConstructor && hasOwn(Vue, PluginInstalledFlag)
}

export function getVueConstructor(): VueConstructor {
  if (__DEV__) {
    assert(
      vueConstructor,
      `must call Vue.use(VueCompositionAPI) before using any function.`
    )
  }

  return vueConstructor!
}

// returns registered vue or `vue` dependency
export function getRegisteredVueOrDefault(): VueConstructor {
  let constructor = vueConstructor || vueDependency

  if (__DEV__) {
    assert(constructor, `No vue dependency found.`)
  }

  return constructor!
}

export function setVueConstructor(Vue: VueConstructor) {
  // @ts-ignore
  if (__DEV__ && vueConstructor && Vue.__proto__ !== vueConstructor.__proto__) {
    warn('[vue-composition-api] another instance of Vue installed')
  }
  vueConstructor = Vue
  Object.defineProperty(Vue, PluginInstalledFlag, {
    configurable: true,
    writable: true,
    value: true,
  })
}

/**
 * For `effectScope` to create instance without populate the current instance
 * @internal
 **/
export function withCurrentInstanceTrackingDisabled(fn: () => void) {
  const prev = currentInstanceTracking
  currentInstanceTracking = false
  try {
    fn()
  } finally {
    currentInstanceTracking = prev
  }
}

export function setCurrentVue2Instance(vm: ComponentInstance | null) {
  if (!currentInstanceTracking) return
  setCurrentInstance(vm ? toVue3ComponentInstance(vm) : vm)
}

export function setCurrentInstance(instance: ComponentInternalInstance | null) {
  if (!currentInstanceTracking) return
  const prev = currentInstance
  prev?.scope.off()
  currentInstance = instance
  currentInstance?.scope.on()
}

export type Slot = (...args: any[]) => VNode[]

export type InternalSlots = {
  [name: string]: Slot | undefined
}

export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>
export type EmitsOptions = ObjectEmitsOptions | string[]

export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
  ReturnType extends void | Vue$1 = void
> = Options extends Array<infer V>
  ? (event: V, ...args: any[]) => ReturnType
  : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
  ? (event: string, ...args: any[]) => ReturnType
  : UnionToIntersection<
      {
        [key in Event]: Options[key] extends (...args: infer Args) => any
          ? (event: key, ...args: Args) => ReturnType
          : (event: key, ...args: any[]) => ReturnType
      }[Event]
    >

export type ComponentRenderEmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
  T extends Vue$1 | void = void
> = EmitFn<Options, Event, T>

export type Slots = Readonly<InternalSlots>

export interface SetupContext<E extends EmitsOptions = {}> {
  attrs: Data
  slots: Slots
  emit: EmitFn<E>
  /**
   * @deprecated not available in Vue 2
   */
  expose: (exposed?: Record<string, any>) => void

  /**
   * @deprecated not available in Vue 3
   */
  readonly parent: ComponentInstance | null

  /**
   * @deprecated not available in Vue 3
   */
  readonly root: ComponentInstance

  /**
   * @deprecated not available in Vue 3
   */
  readonly listeners: { [key in string]?: Function }

  /**
   * @deprecated not available in Vue 3
   */
  readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] }
}

export interface ComponentPublicInstance {}

/**
 * We expose a subset of properties on the internal instance as they are
 * useful for advanced external libraries and tools.
 */
export declare interface ComponentInternalInstance {
  uid: number
  type: Record<string, unknown> // ConcreteComponent
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance

  //appContext: AppContext

  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode
  /**
   * Root vnode of this component's own vdom tree
   */
  // subTree: VNode // does not exist in Vue 2

  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update: Function

  data: Data
  props: Data
  attrs: Data
  refs: Data
  emit: EmitFn

  slots: InternalSlots
  emitted: Record<string, boolean> | null

  proxy: ComponentInstance

  isMounted: boolean
  isUnmounted: boolean
  isDeactivated: boolean

  /**
   * @internal
   */
  scope: EffectScope

  /**
   * @internal
   */
  setupContext: SetupContext | null
}

export function getCurrentInstance() {
  return currentInstance
}

const instanceMapCache = new WeakMap<
  ComponentInstance,
  ComponentInternalInstance
>()

export function toVue3ComponentInstance(
  vm: ComponentInstance
): ComponentInternalInstance {
  if (instanceMapCache.has(vm)) {
    return instanceMapCache.get(vm)!
  }

  const instance: ComponentInternalInstance = {
    proxy: vm,
    update: vm.$forceUpdate,
    type: vm.$options,
    uid: vm._uid,

    // $emit is defined on prototype and it expected to be bound
    emit: vm.$emit.bind(vm),

    parent: null,
    root: null!, // to be immediately set
  } as unknown as ComponentInternalInstance

  bindCurrentScopeToVM(instance)

  // map vm.$props =
  const instanceProps = [
    'data',
    'props',
    'attrs',
    'refs',
    'vnode',
    'slots',
  ] as const

  instanceProps.forEach((prop) => {
    proxy(instance, prop, {
      get() {
        return (vm as any)[`$${prop}`]
      },
    })
  })

  proxy(instance, 'isMounted', {
    get() {
      // @ts-expect-error private api
      return vm._isMounted
    },
  })

  proxy(instance, 'isUnmounted', {
    get() {
      // @ts-expect-error private api
      return vm._isDestroyed
    },
  })

  proxy(instance, 'isDeactivated', {
    get() {
      // @ts-expect-error private api
      return vm._inactive
    },
  })

  proxy(instance, 'emitted', {
    get() {
      // @ts-expect-error private api
      return vm._events
    },
  })

  instanceMapCache.set(vm, instance)

  if (vm.$parent) {
    instance.parent = toVue3ComponentInstance(vm.$parent)
  }

  if (vm.$root) {
    instance.root = toVue3ComponentInstance(vm.$root)
  }

  return instance
}
