import { VNode, VNodeData, Component, VNodeComponentOptions } from 'vue'
import Vue from 'vue'
import { isArray, isFunction } from '../utils'
import { getCurrentInstance } from '../runtimeContext'

const createEmptyVNode: (text?: string) => VNode = (Vue as any)
  .FunctionalRenderContext.prototype._e

const emptyVNode = createEmptyVNode()

const vNodeConstructor: new (
  tag?: string,
  data?: VNodeData | null,
  children?: Array<VNode> | null,
  text?: string,
  elm?: Node,
  context?: Component | Vue,
  componentOptions?: VNodeComponentOptions,
  asyncFactory?: Function
) => VNode = emptyVNode.constructor as any

const mergeData: (
  parent?: VNodeData,
  childVal?: VNodeData | null,
  vm?: any
) => () => VNodeData = Vue.config.optionMergeStrategies.data

export function isVNode(value: any): value is VNode {
  return value && value.constructor === emptyVNode.constructor
}

export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  // NOTE not sure about HMR
  // https://github.com/vuejs/vue-next/blob/c2d3da9dc41b19d20dfcfaf5a670105010dfa0b4/packages/runtime-core/src/vnode.ts#L238
  return n1.tag === n2.tag && n1.key === n2.key
}

// from https://github.com/vuejs/vue/blob/8ead9d2a0d4ca686eaf5e35526eff4af1b8c79a7/src/core/vdom/vnode.js#L89
// modified for vue-next parity
export function cloneVNode(
  vnode: VNode,
  // note extraProps is actually `extraData`, because vue-next everything is attributes, but in vue2 is different
  extraProps?: VNodeData | null,
  children?: unknown
): VNode {
  const cloned = new vNodeConstructor(
    vnode.tag,
    // VM is not really used besides from validation
    mergeData(vnode.data, extraProps, true)(),
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    // @ts-ignore
    vnode.asyncFactory
  )

  if (children) {
    normalizeChildren(cloned, children)
  }

  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  //@ts-ignore
  cloned.fnContext = vnode.fnContext
  //@ts-ignore
  cloned.fnOptions = vnode.fnOptions
  //@ts-ignore
  cloned.fnScopeId = vnode.fnScopeId
  //@ts-ignore
  cloned.asyncMeta = vnode.asyncMeta
  //@ts-ignore
  cloned.isCloned = true
  return cloned
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  if (children == null) {
    children = null
  } else if (isArray(children)) {
  } else if (typeof children === 'object') {
    // Normalize slot to plain children
    if (
      //   (shapeFlag & ShapeFlags.ELEMENT || shapeFlag & ShapeFlags.TELEPORT) &&
      (children as any).default
    ) {
      normalizeChildren(vnode, (children as any).default())
      return
    }
    // else {
    // //   type = ShapeFlags.SLOTS_CHILDREN
    //   if (!(children as RawSlots)._ && !(InternalObjectKey in children!)) {
    //     // if slots are not normalized, attach context instance
    //     // (compiled / normalized slots already have context)
    //     ;(children as RawSlots)._ctx = currentRenderingInstance
    //   }
    // }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: getCurrentInstance() }
  } else {
    children = [String(children)]
  }
  vnode.children = children as VNode[]
}

export function createVNode(
  type: VNode | string,
  data: VNodeData | null | undefined = null,
  children: unknown = null
): VNode {
  if (isVNode(type)) {
    return cloneVNode(type, data, children)
  }

  const vnode = new vNodeConstructor(
    type,
    // VM is not really used besides from validation
    data,
    children as any
  )

  return vnode
}
