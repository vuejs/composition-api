import { getCurrentVue } from '../runtimeContext';
import { createComponentInstance } from '../helper';
import { Wrapper, ComputedWrapper } from '../wrappers';

export function computed<T>(getter: () => T, setter?: (x: T) => void): Wrapper<T> {
  const computedHost = createComponentInstance(getCurrentVue(), {
    computed: {
      $$state: {
        get: getter,
        set: setter,
      },
    },
  });

  return new ComputedWrapper({
    read: () => (computedHost as any).$$state,
    ...(setter && {
      write: (v: T) => {
        (computedHost as any).$$state = v;
      },
    }),
  });
}
