import Vue from 'vue'
import { currentVM, getCurrentVue } from './runtimeContext'
import { defineComponentInstance } from './helper'
import { warn } from './utils'

type CreateElement = Vue['$createElement']

let fallbackCreateElement: CreateElement

export const createElement = (function createElement(...args: any) {
  if (!currentVM) {
    warn('`createElement()` has been called outside of render function.')
    if (!fallbackCreateElement) {
      fallbackCreateElement = defineComponentInstance(getCurrentVue())
        .$createElement
    }

    return fallbackCreateElement.apply(fallbackCreateElement, args)
  }

  return currentVM.$createElement.apply(currentVM, args)
} as any) as CreateElement
