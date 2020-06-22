import Vue from 'vue'
import { currentVM, currentVue } from './runtimeContext'

type NextTick = Vue['$nextTick']

export const nextTick: NextTick = function nextTick(...args: any) {
  if (currentVM) {
    return currentVM.$nextTick.apply(currentVM, args)
  } else {
    // @ts-ignore
    return currentVue?.nextTick(...args)
  }
} as any
