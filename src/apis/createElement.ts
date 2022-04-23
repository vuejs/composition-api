import type { CreateElement } from 'vue'
import { getVueConstructor, getCurrentInstance } from '../runtimeContext'
import { defineComponentInstance } from '../utils/helper'
import { warn } from '../utils'
import type { ComponentInternalInstance } from '..'

let fallbackCreateElement: CreateElement

export const createElement = function (
  this: ComponentInternalInstance | undefined,
  ...args: any
) {
  // #804
  const instance = this?.proxy ?? getCurrentInstance()?.proxy
  if (!instance) {
    __DEV__ &&
      warn('`createElement()` has been called outside of render function.')
    if (!fallbackCreateElement) {
      fallbackCreateElement = defineComponentInstance(
        getVueConstructor()
      ).$createElement
    }

    return fallbackCreateElement.apply(fallbackCreateElement, args)
  }

  return instance.$createElement.apply(instance, args)
} as CreateElement
