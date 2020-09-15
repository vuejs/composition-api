import type { VueConstructor, VNode } from 'vue'
import { ComponentInstance, Data } from './component'
import { assert, hasOwn, warn } from './utils'

let vueDependency: VueConstructor | undefined = undefined

try {
  vueDependency = require('vue')
} catch {
  // not available
}

let vueConstructor: VueConstructor | null = null
let currentInstance: ComponentInstance | null = null

const PluginInstalledFlag = '__composition_api_installed__'

export function isPluginInstalled() {
  return !!vueConstructor
}

export function isVueRegistered(Vue: VueConstructor) {
  return hasOwn(Vue, PluginInstalledFlag)
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
    assert(vueConstructor, `No vue dependency found.`)
  }

  return constructor!
}

export function setVueConstructor(Vue: VueConstructor) {
  if (__DEV__ && vueConstructor) {
    warn('Another instance of vue installed')
  }
  vueConstructor = Vue
  Object.defineProperty(Vue, PluginInstalledFlag, {
    configurable: true,
    writable: true,
    value: true,
  })
}

export function getCurrentInternalInstance(): ComponentInstance | null {
  return currentInstance
}

export function setCurrentInstance(vm: ComponentInstance | null) {
  currentInstance?.$scopedSlots
  currentInstance = vm
}

const v3Cache = new WeakMap<ComponentInstance, ComponentInternalInstance>()

export type Slot = (...args: any[]) => VNode[]

export type InternalSlots = {
  [name: string]: Slot | undefined
}

/**
 * We expose a subset of properties on the internal instance as they are
 * useful for advanced external libraries and tools.
 */
export declare interface ComponentInternalInstance {
  uid: number
  // type: ConcreteComponent
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance

  //appContext: AppContext

  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode
  /* Excluded from this release type: next */
  /**
   * Root vnode of this component's own vdom tree
   */
  subTree: VNode // not sure
  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update: Function

  data: Data
  props: Data
  attrs: Data
  refs: Data
  // emit: EmitFn
  emit: Function // todo better typing

  slots: InternalSlots
  emitted: Record<string, boolean> | null

  proxy: ComponentInstance

  // TODO this
  isMounted: boolean
  isUnmounted: boolean
  isDeactivated: boolean
}

const specialProps = ['data', 'props', 'attrs', 'refs', 'emit'] as const

export function getCurrentInstance() {
  const internal = getCurrentInternalInstance()
  if (internal) {
    return getComponentInstanceVue3(internal)
  }
  return null
}

export function getComponentInstanceVue3(
  componentInstance: ComponentInstance
): ComponentInternalInstance {
  if (v3Cache.has(componentInstance)) {
    return v3Cache.get(componentInstance)!
  }

  const o = specialProps.reduce((p, c) => {
    // @ts-ignore
    p[c] = componentInstance[`$${c}`]
    return p
  }, {} as Record<keyof ComponentInternalInstance, any>)

  const instance: ComponentInternalInstance = {
    ...o,
    proxy: componentInstance,

    update: componentInstance.$forceUpdate,

    parent: null,
    root: null as any,

    // TODO
    subTree: null as any,
    vnode: null as any,
    uid: 0,

    emitted: null,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
  }
  v3Cache.set(componentInstance, instance)

  if (componentInstance.$parent) {
    instance.parent = getComponentInstanceVue3(componentInstance.$parent)
  }

  if (componentInstance.$root) {
    instance.root = getComponentInstanceVue3(componentInstance.$root)
  }

  return instance
}
