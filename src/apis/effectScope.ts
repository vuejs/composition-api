import {
  ComponentInternalInstance,
  getCurrentInstance,
  getVueConstructor,
  withCurrentInstanceTrackingDisabled,
} from '../runtimeContext'
import { defineComponentInstance } from '../utils'
import { warn } from './warn'

let activeEffectScope: EffectScope | undefined
const effectScopeStack: EffectScope[] = []

class EffectScopeImpl {
  active = true
  effects: EffectScope[] = []
  cleanups: (() => void)[] = []

  /**
   * @internal
   **/
  vm: Vue

  constructor(vm: Vue) {
    this.vm = vm
  }

  run<T>(fn: () => T): T | undefined {
    if (this.active) {
      try {
        this.on()
        return fn()
      } finally {
        this.off()
      }
    } else if (__DEV__) {
      warn(`cannot run an inactive effect scope.`)
    }
    return
  }

  on() {
    if (this.active) {
      effectScopeStack.push(this)
      activeEffectScope = this
    }
  }

  off() {
    if (this.active) {
      effectScopeStack.pop()
      activeEffectScope = effectScopeStack[effectScopeStack.length - 1]
    }
  }

  stop() {
    if (this.active) {
      this.vm.$destroy()
      this.effects.forEach((e) => e.stop())
      this.cleanups.forEach((cleanup) => cleanup())
      this.active = false
    }
  }
}

export class EffectScope extends EffectScopeImpl {
  constructor(detached = false) {
    let vm: Vue = undefined!
    withCurrentInstanceTrackingDisabled(() => {
      vm = defineComponentInstance(getVueConstructor())
    })
    super(vm)
    if (!detached) {
      recordEffectScope(this)
    }
  }
}

export function recordEffectScope(
  effect: EffectScope,
  scope?: EffectScope | null
) {
  scope = scope || activeEffectScope
  if (scope && scope.active) {
    scope.effects.push(effect)
    return
  }
  // destory on parent component unmounted
  const vm = getCurrentInstance()?.proxy
  vm && vm.$on('hook:destroyed', () => effect.stop())
}

export function effectScope(detached?: boolean) {
  return new EffectScope(detached)
}

export function getCurrentScope() {
  return activeEffectScope
}

export function onScopeDispose(fn: () => void) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn)
  } else if (__DEV__) {
    warn(
      `onDispose() is called when there is no active effect scope` +
        ` to be associated with.`
    )
  }
}

/**
 * @internal
 **/
export function getCurrentScopeVM() {
  return getCurrentScope()?.vm || getCurrentInstance()?.proxy
}

/**
 * @internal
 **/
export function bindCurrentScopeToVM(
  vm: ComponentInternalInstance
): EffectScope {
  if (!vm.scope) {
    const scope = new EffectScopeImpl(vm.proxy) as EffectScope
    vm.scope = scope
    vm.proxy.$on('hook:destroyed', () => scope.stop())
  }
  return vm.scope
}
