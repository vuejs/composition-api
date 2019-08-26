import { getCurrentVue, getCurrentVM } from '../runtimeContext';
import { createRef, Ref } from '../reactivity';
import { createComponentInstance } from '../helper';
import { warn } from '../utils';

interface Option<T> {
  get: () => T;
  set: (value: T) => void;
}

// read-only
export function computed<T>(getter: Option<T>['get']): Ref<T>;
// writable
export function computed<T>(options: Option<T>): Ref<T>;
// implement
export function computed<T>(options: Option<T>['get'] | Option<T>): Ref<T> {
  const vm = getCurrentVM();
  let get: Option<T>['get'], set: Option<T>['set'] | undefined;
  if (typeof options === 'function') {
    get = options;
  } else {
    get = options.get;
    set = options.set;
  }

  const computedHost = createComponentInstance(getCurrentVue(), {
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
      if (process.env.NODE_ENV !== 'production' && !set) {
        warn('Computed property was assigned to but it has no setter.', vm!);
        return;
      }

      (computedHost as any).$$state = v;
    },
  });
}
