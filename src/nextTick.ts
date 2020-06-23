import Vue from 'vue'
import { currentVue } from './runtimeContext'

type NextTick = Vue['$nextTick']

export const nextTick: NextTick = function nextTick(
  this: ThisType<NextTick>,
  ...args: Parameters<NextTick>
) {
  return currentVue?.nextTick.bind(this, args)
} as any
