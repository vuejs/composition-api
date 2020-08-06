import { VNode } from 'vue'
import { getVueInternalClasses } from '../utils'

export function isVNode(value: any): value is VNode {
  const { VNode: VNodeCtor } = getVueInternalClasses()
  return value instanceof VNodeCtor
}
