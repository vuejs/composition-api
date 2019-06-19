import { compoundComputed } from '../helper';
import { Wrapper, ComputedWrapper } from '../wrappers';

export function computed<T>(getter: () => T, setter?: (x: T) => void): Wrapper<T> {
  const computedHost = compoundComputed({
    $$state: setter
      ? {
          get: getter,
          set: setter,
        }
      : getter,
  });

  return new ComputedWrapper({
    read: () => computedHost.$$state,
    write: (v: T) => {
      computedHost.$$state = v;
    },
  });
}
