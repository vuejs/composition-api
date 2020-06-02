import { getCurrentVue, getCurrentVM } from '../runtimeContext';
import { createRef, Ref } from '../reactivity';
import { defineComponentInstance } from '../helper';
import { warn } from '../utils';

interface Option<T> {
  get: () => T;
  set: (value: T) => void;
}

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T;
}

export interface WritableComputedRef<T> extends Ref<T> {}

// read-only
export function computed<T>(getter: Option<T>['get']): ComputedRef<T>;
// writable
export function computed<T>(options: Option<T>): WritableComputedRef<T>;
// implement
export function computed<T>(
  options: Option<T>['get'] | Option<T>
): ComputedRef<T> | WritableComputedRef<T> {
  const vm = getCurrentVM();
  let get: Option<T>['get'], set: Option<T>['set'] | undefined;
  if (typeof options === 'function') {
    get = options;
  } else {
    get = options.get;
    set = options.set;
  }

  const computedHost = defineComponentInstance(getCurrentVue(), {
    computed: {
      $$state: {
        get,
        set,
      },
    },
  });

  return createRef<T>({
    get: () => (computedHost as any).$$state,
    set: (v: T) => {
      if (__DEV__ && !set) {
        warn('Computed property was assigned to but it has no setter.', vm!);
        return;
      }

      (computedHost as any).$$state = v;
    },
  });
}
