import type { CreateElement } from 'vue'
import {
  getVueConstructor,
  getCurrentInstance,
  ComponentInternalInstance,
} from '../runtimeContext'
import { defineComponentInstance } from '../utils/helper'
import { warn } from '../utils'
import { AsyncComponent, Component } from 'vue/types/options'
import { VNode, VNodeChildren, VNodeData } from 'vue/types/vnode'

export interface H extends CreateElement {
  (
    this: ComponentInternalInstance | null,
    tag?:
      | string
      | Component<any, any, any, any>
      | AsyncComponent<any, any, any, any>
      | (() => Component),
    children?: VNodeChildren
  ): VNode
  (
    this: ComponentInternalInstance | null,
    tag?:
      | string
      | Component<any, any, any, any>
      | AsyncComponent<any, any, any, any>
      | (() => Component),
    data?: VNodeData,
    children?: VNodeChildren
  ): VNode
}

let fallbackCreateElement: CreateElement

export const createElement = function createElement(this, ...args: any) {
  const instance = this ? this.proxy : getCurrentInstance()?.proxy
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
} as H
