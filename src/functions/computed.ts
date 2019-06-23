import { compoundComputed } from '../helper';
import { Wrapper, ComputedWrapper } from '../wrappers';

export function computed<T>(getter: () => T, setter?: (x: T) => void): Wrapper<T> {
  const computedHost = compoundComputed({
    $$state: {
      get: getter,
      set: setter,
    },
  });

  return new ComputedWrapper({
    read: () => computedHost.$$state,
    ...(setter && {
      write: (v: T) => {
        computedHost.$$state = v;
      },
    }),
  });
}
