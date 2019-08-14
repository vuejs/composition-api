import Vue from 'vue';
import { currentVM, getCurrentVue } from './runtimeContext';
import { createComponentInstance } from './helper';

type CreateElement = Vue['$createElement'];

let fallbackCreateElement: CreateElement;

const createElement: CreateElement = function createElement(...args: any[]) {
  if (!currentVM) {
    if (!fallbackCreateElement) {
      fallbackCreateElement = createComponentInstance(getCurrentVue()).$createElement;
    }

    return fallbackCreateElement.apply(null, args as any);
  }

  return currentVM.$createElement.apply(null, args as any);
} as any;

export default createElement;
