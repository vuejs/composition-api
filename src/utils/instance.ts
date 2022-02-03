import type { VNode } from 'vue'
import { ComponentInstance } from '../component'
import vmStateManager from './vmStateManager'
import {
  setCurrentInstance,
  getCurrentInstance,
  ComponentInternalInstance,
  InternalSlots,
  SetupContext,
} from '../runtimeContext'
import { Ref, isRef, isReactive } from '../apis'
import { hasOwn, proxy, warn } from './utils'
import { createSlotProxy, resolveSlots } from './helper'
import { reactive } from '../reactivity/reactive'

export function asVmProperty(
  vm: ComponentInstance,
  propName: string,
  propValue: Ref<unknown>
) {
  const props = vm.$options.props
  if (!(propName in vm) && !(props && hasOwn(props, propName))) {
    if (isRef(propValue)) {
      proxy(vm, propName, {
        get: () => propValue.value,
        set: (val: unknown) => {
          propValue.value = val
        },
      })
    } else {
      proxy(vm, propName, {
        get: () => {
          if (isReactive(propValue)) {
            ;(propValue as any).__ob__.dep.depend()
          }
          return propValue
        },
        set: (val: any) => {
          propValue = val
        },
      })
    }

    if (__DEV__) {
      // expose binding to Vue Devtool as a data property
      // delay this until state has been resolved to prevent repeated works
      vm.$nextTick(() => {
        if (Object.keys(vm._data).indexOf(propName) !== -1) {
          return
        }
        if (isRef(propValue)) {
          proxy(vm._data, propName, {
            get: () => propValue.value,
            set: (val: unknown) => {
              propValue.value = val
            },
          })
        } else {
          proxy(vm._data, propName, {
            get: () => propValue,
            set: (val: any) => {
              propValue = val
            },
          })
        }
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

export function afterRender(vm: ComponentInstance) {
  const stack = [(vm as any)._vnode as VNode]
  while (stack.length) {
    const vnode = stack.pop()!
    if (vnode.context) updateTemplateRef(vnode.context)
    if (vnode.children) {
      for (let i = 0; i < vnode.children.length; ++i) {
        stack.push(vnode.children[i])
      }
    }
  }
}

export function updateVmAttrs(vm: ComponentInstance, ctx?: SetupContext) {
  if (!vm) {
    return
  }
  let attrBindings = vmStateManager.get(vm, 'attrBindings')
  if (!attrBindings && !ctx) {
    // fix 840
    return
  }
  if (!attrBindings) {
    const observedData = reactive({})
    attrBindings = { ctx: ctx!, data: observedData }
    vmStateManager.set(vm, 'attrBindings', attrBindings)
    proxy(ctx, 'attrs', {
      get: () => {
        return attrBindings?.data
      },
      set() {
        __DEV__ &&
          warn(
            `Cannot assign to '$attrs' because it is a read-only property`,
            vm
          )
      },
    })
  }

  const source = vm.$attrs
  for (const attr of Object.keys(source)) {
    if (!hasOwn(attrBindings.data, attr)) {
      proxy(attrBindings.data, attr, {
        get: () => {
          // to ensure it always return the latest value
          return vm.$attrs[attr]
        },
      })
    }
  }
}

export function resolveScopedSlots(
  vm: ComponentInstance,
  slotsProxy: InternalSlots
): void {
  const parentVNode = (vm.$options as any)._parentVnode
  if (!parentVNode) return

  const prevSlots = vmStateManager.get(vm, 'slots') || []
  const curSlots = resolveSlots(parentVNode.data.scopedSlots, vm.$slots)
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

export function activateCurrentInstance(
  instance: ComponentInternalInstance,
  fn: (instance: ComponentInternalInstance) => any,
  onError?: (err: Error) => void
) {
  let preVm = getCurrentInstance()
  setCurrentInstance(instance)
  try {
    return fn(instance)
  } catch (
    // FIXME: remove any
    err: any
  ) {
    if (onError) {
      onError(err)
    } else {
      throw err
    }
  } finally {
    setCurrentInstance(preVm)
  }
}
