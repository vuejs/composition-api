import Vue, { VNode, ComponentOptions, VueConstructor } from 'vue';
import { ComponentInstance } from './component';
import { currentVue, getCurrentVM } from './runtimeContext';
import { assert, warn } from './utils';

export function ensureCurrentVMInFn(hook: string): ComponentInstance {
  const vm = getCurrentVM();
  if (process.env.NODE_ENV !== 'production') {
    assert(vm, `"${hook}" get called outside of "setup()"`);
  }
  return vm!;
}

export function createComponentInstance<V extends Vue = Vue>(
  Ctor: VueConstructor<V>,
  options: ComponentOptions<V> = {}
) {
  const silent = Ctor.config.silent;
  Ctor.config.silent = true;
  const vm = new Ctor(options);
  Ctor.config.silent = silent;
  return vm;
}

export function isComponentInstance(obj: any) {
  return currentVue && obj instanceof currentVue;
}

export function createSlotProxy(vm: ComponentInstance, slotName: string) {
  return (...args: any) => {
    if (!vm.$scopedSlots[slotName]) {
      return warn(`slots.${slotName}() got called outside of the "render()" scope`, vm);
    }

    return vm.$scopedSlots[slotName]!.apply(vm, args);
  };
}

export function resolveSlots(
  slots: { [key: string]: Function } | void,
  normalSlots: { [key: string]: VNode[] | undefined }
): { [key: string]: true } {
  let res: { [key: string]: true };
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized as any;
  } else {
    res = {};
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = true;
      }
    }
  }

  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = true;
    }
  }

  return res;
}
