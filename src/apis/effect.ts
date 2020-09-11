import { getVueConstructor } from '../runtimeContext'

type Dep2 = {
  id: number
  depend(): void
  notify(): void

  addSub(sub: WatchLikeTarget): void
  removeSub(sub: WatchLikeTarget): void
}

type VueObserver<T = any> = {
  value: T
  dep: Dep2
  vmCount: number
}

export type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  // type: TrackOpTypes | TriggerOpTypes
  key: any
} & DebuggerEventExtraInfo

export interface DebuggerEventExtraInfo {
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: (job: ReactiveEffect) => void
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
  onStop?: () => void
}

export interface ReactiveEffect<T = any> {
  (): T
  _isEffect: true
  id: number
  active: boolean
  raw: () => T
  deps: Array<Dep>
  options: ReactiveEffectOptions
  target: WatchLikeTarget
}

interface WatchLikeTarget {
  id: number

  update(): void
  addDep(dep: Dep2): void
  cleanupDeps(): void
}

const targetDepMap = new WeakMap<object, { target?: WatchLikeTarget }>()

export function pushTarget(target: WatchLikeTarget) {
  const Vue = getVueConstructor()

  let Dep = targetDepMap.get(Vue)!
  if (!Dep) {
    //@ts-ignore
    Dep = ((Vue.observable({}) as any).__ob__ as VueObserver<{}>).dep.__proto__
      .constructor // todo better way to get the constructor
  }
  Dep.target = target
}

export function popTarget() {
  const Vue = getVueConstructor()
  const Dep = targetDepMap.get(Vue)
  if (Dep) {
    Dep.target = undefined
  }
}

function cleanup(effect: ReactiveEffect) {
  const { deps, target } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }

  target.cleanupDeps()
}

export function stop(effect: ReactiveEffect) {
  if (effect.active) {
    cleanup(effect)
    if (effect.options.onStop) {
      effect.options.onStop()
    }
    effect.active = false
  }
}

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

const effectStack: ReactiveEffect[] = []
let activeEffect: ReactiveEffect | undefined

let shouldTrack = true
const trackStack: boolean[] = []

export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export function enableTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = true
}

export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

let uid = 0

export function isEffect(fn: any): fn is ReactiveEffect {
  return fn && fn._isEffect === true
}

export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}

export function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
): ReactiveEffect<T> {
  --uid

  let depIds = new Set()
  let newDepIds = new Set()
  let newDeps: Dep2[] = []
  let deps: Dep2[] = []
  const target: WatchLikeTarget = {
    id: uid,
    update() {
      effect()
    },
    addDep(dep) {
      const id = dep.id
      if (!newDepIds.has(id)) {
        newDepIds.add(id)
        newDeps.push(dep)
        if (!depIds.has(id)) {
          dep.addSub(this)
        }
      }
    },

    cleanupDeps() {
      let i = deps.length
      while (i--) {
        const dep = deps[i]
        if (!newDepIds.has(dep.id)) {
          dep.removeSub(this)
        }
      }
      let tmp = depIds
      depIds = newDepIds
      newDepIds = tmp
      newDepIds.clear()
      let tmpD = deps
      deps = newDeps
      newDeps = tmpD
      newDeps.length = 0
    },
  }
  pushTarget(target)

  const effect = function reactiveEffect(): any {
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    if (!effectStack.includes(effect)) {
      target.cleanupDeps()
      try {
        pushTarget(target)
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        popTarget()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.id = uid
  effect._isEffect = true
  effect.active = true
  effect.raw = fn
  effect.deps = []
  effect.options = options
  effect.target = target

  return effect
}

export function track(target: object, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        // type,
        key,
      })
    }
  }
}
