import { VueConstructor } from 'vue'
import {
  ComponentInstance,
  SetupContext,
  SetupFunction,
  Data,
} from './component'
import { Ref, isRef, isReactive, markRaw } from './reactivity'
import { getCurrentVM, setCurrentVM } from './runtimeContext'
import { resolveSlots, createSlotProxy } from './helper'
import { hasOwn, isPlainObject, assert, proxy, warn, isFunction } from './utils'
import { ref } from './apis/state'
import vmStateManager from './vmStateManager'
import { unwrapRefProxy } from './reactivity/unwrap'
import { markReactive } from './reactivity/reactive'

function asVmProperty(
  vm: ComponentInstance,
  propName: string,
  propValue: Ref<unknown>
) {
  const props = vm.$options.props
  if (!(propName in vm) && !(props && hasOwn(props, propName))) {
    proxy(vm, propName, {
      get: () => propValue.value,
      set: (val: unknown) => {
        propValue.value = val
      },
    })

    if (__DEV__) {
      // expose binding to Vue Devtool as a data property
      // delay this until state has been resolved to prevent repeated works
      vm.$nextTick(() => {
        proxy(vm._data, propName, {
          get: () => propValue.value,
          set: (val: unknown) => {
            propValue.value = val
          },
        })
      })
    }
  } else if (__DEV__) {
    if (props && hasOwn(props, propName)) {
      warn(
        `The setup binding property "${propName}" is already declared as a prop.`,
        vm
      )
    } else {
      warn(`The setup binding property "${propName}" is already declared.`, vm)
    }
  }
}

function updateTemplateRef(vm: ComponentInstance) {
  const rawBindings = vmStateManager.get(vm, 'rawBindings') || {}
  if (!rawBindings || !Object.keys(rawBindings).length) return

  const refs = vm.$refs
  const oldRefKeys = vmStateManager.get(vm, 'refs') || []
  for (let index = 0; index < oldRefKeys.length; index++) {
    const key = oldRefKeys[index]
    const setupValue = rawBindings[key]
    if (!refs[key] && setupValue && isRef(setupValue)) {
      setupValue.value = null
    }
  }

  const newKeys = Object.keys(refs)
  const validNewKeys = []
  for (let index = 0; index < newKeys.length; index++) {
    const key = newKeys[index]
    const setupValue = rawBindings[key]
    if (refs[key] && setupValue && isRef(setupValue)) {
      setupValue.value = refs[key]
      validNewKeys.push(key)
    }
  }
  vmStateManager.set(vm, 'refs', validNewKeys)
}

function resolveScopedSlots(
  vm: ComponentInstance,
  slotsProxy: { [x: string]: Function }
): void {
  const parentVode = (vm.$options as any)._parentVnode
  if (!parentVode) return

  const prevSlots = vmStateManager.get(vm, 'slots') || []
  const curSlots = resolveSlots(parentVode.data.scopedSlots, vm.$slots)
  // remove staled slots
  for (let index = 0; index < prevSlots.length; index++) {
    const key = prevSlots[index]
    if (!curSlots[key]) {
      delete slotsProxy[key]
    }
  }

  // proxy fresh slots
  const slotNames = Object.keys(curSlots)
  for (let index = 0; index < slotNames.length; index++) {
    const key = slotNames[index]
    if (!slotsProxy[key]) {
      slotsProxy[key] = createSlotProxy(vm, key)
    }
  }
  vmStateManager.set(vm, 'slots', slotNames)
}

function activateCurrentInstance(
  vm: ComponentInstance,
  fn: (vm_: ComponentInstance) => any,
  onError?: (err: Error) => void
) {
  let preVm = getCurrentVM()
  setCurrentVM(vm)
  try {
    return fn(vm)
  } catch (err) {
    if (onError) {
      onError(err)
    } else {
      throw err
    }
  } finally {
    setCurrentVM(preVm)
  }
}

export function mixin(Vue: VueConstructor) {
  Vue.mixin({
    beforeCreate: functionApiInit,
    mounted(this: ComponentInstance) {
      updateTemplateRef(this)
    },
    updated(this: ComponentInstance) {
      updateTemplateRef(this)
    },
  })

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function functionApiInit(this: ComponentInstance) {
    const vm = this
    const $options = vm.$options
    const { setup, render } = $options

    if (render) {
      // keep currentInstance accessible for createElement
      $options.render = function (...args: any): any {
        return activateCurrentInstance(vm, () => render.apply(this, args))
      }
    }

    if (!setup) {
      return
    }
    if (typeof setup !== 'function') {
      if (__DEV__) {
        warn(
          'The "setup" option should be a function that returns a object in component definitions.',
          vm
        )
      }
      return
    }

    const { data } = $options
    // wrapper the data option, so we can invoke setup before data get resolved
    $options.data = function wrappedData() {
      initSetup(vm, vm.$props)
      return typeof data === 'function'
        ? (data as (
            this: ComponentInstance,
            x: ComponentInstance
          ) => object).call(vm, vm)
        : data || {}
    }
  }

  function initSetup(vm: ComponentInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!
    const ctx = createSetupContext(vm)

    // mark props as reactive
    markReactive(props)

    // resolve scopedSlots and slots to functions
    resolveScopedSlots(vm, ctx.slots)

    let binding: ReturnType<SetupFunction<Data, Data>> | undefined | null
    activateCurrentInstance(vm, () => {
      binding = setup(props, ctx)
    })

    if (!binding) return
    if (isFunction(binding)) {
      // keep typescript happy with the binding type.
      const bindingFunc = binding
      // keep currentInstance accessible for createElement
      vm.$options.render = () => {
        resolveScopedSlots(vm, ctx.slots)
        return activateCurrentInstance(vm, () => bindingFunc())
      }
      return
    }
    if (isPlainObject(binding)) {
      const bindingObj = binding
      vmStateManager.set(vm, 'rawBindings', binding)
      Object.keys(binding).forEach((name) => {
        let bindingValue = bindingObj[name]
        // only make primitive value reactive
        if (!isRef(bindingValue)) {
          if (isReactive(bindingValue)) {
            bindingValue = ref(bindingValue)
          } else {
            // bind function to the vm, this will make `this` = vm
            if (isFunction(bindingValue)) {
              bindingValue = bindingValue.bind(vm)
            }
            // unwrap all ref properties
            const unwrapped = unwrapRefProxy(bindingValue)
            // mark the object as reactive
            markReactive(unwrapped)
            // a non-reactive should not don't get reactivity
            bindingValue = ref(markRaw(unwrapped))
          }
        }
        asVmProperty(vm, name, bindingValue)
      })
      return
    }

    if (__DEV__) {
      assert(
        false,
        `"setup" must return a "Object" or a "Function", got "${Object.prototype.toString
          .call(binding)
          .slice(8, -1)}"`
      )
    }
  }

  function createSetupContext(
    vm: ComponentInstance & { [x: string]: any }
  ): SetupContext {
    const ctx = {
      slots: {},
    } as SetupContext
    const props: Array<string | [string, string]> = [
      'root',
      'parent',
      'refs',
      'attrs',
      'listeners',
      'isServer',
      'ssrContext',
    ]
    const methodReturnVoid = ['emit']
    props.forEach((key) => {
      let targetKey: string
      let srcKey: string
      if (Array.isArray(key)) {
        ;[targetKey, srcKey] = key
      } else {
        targetKey = srcKey = key
      }
      srcKey = `$${srcKey}`
      proxy(ctx, targetKey, {
        get: () => vm[srcKey],
        set() {
          warn(
            `Cannot assign to '${targetKey}' because it is a read-only property`,
            vm
          )
        },
      })
    })
    methodReturnVoid.forEach((key) => {
      const srcKey = `$${key}`
      proxy(ctx, key, {
        get() {
          return (...args: any[]) => {
            const fn: Function = vm[srcKey]
            fn.apply(vm, args)
          }
        },
      })
    })
    if (process.env.NODE_ENV === 'test') {
      ;(ctx as any)._vm = vm
    }
    return ctx
  }
}
